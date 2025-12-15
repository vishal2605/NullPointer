import { Worker } from "bullmq";
import path from "path";
import * as fs from 'fs';
import { stdin } from "process";
import dotenv from "dotenv";
import axios from 'axios'

// Load environment variables from .env file
// Try multiple possible locations for .env file
const envPaths = [
    path.join(__dirname, "..", "..", "..", ".env"), // From dist folder to root
    path.join(process.cwd(), ".env"), // From current working directory
    path.resolve(".env"), // Relative to current directory
];

for (const envPath of envPaths) {
    const result = dotenv.config({ path: envPath });
    if (!result.error) {
        console.log(`Loaded environment variables from: ${envPath}`);
        break;
    }
}

type TestCaseResult = {
    status: string;
    time: number;
    memory: number;
    compile_output?: string | null;
    stderr?: string | null;
  };

interface SubmissionJobData{
    submissionId : number,
    problemId : number,
    code : string,
    languageId : number,
    slug : string
    judge0Id : number
}

const JUDGE0_STATUS_MAP: { [key: number]: string } = {
    1: "IN_QUEUE",
    2: "PROCESSING",
    3: "PASSED",
    4: "WRONG_ANSWER",
    5: "TIME_LIMIT_EXCEEDED",
    6: "COMPILATION_ERROR",
    7: "RUNTIME_ERROR",
    8: "COMPILATION_ERROR",
    9: "MEMORY_LIMIT_EXCEEDED",
    10: "INTERNAL_ERROR",
    11: "EXECUTABLE_FORMAT_ERROR",
    12: "UNKNOWN_ERROR"
};

const getTestCaseStatus = (judge0StatusId:number)=> {
    return JUDGE0_STATUS_MAP[judge0StatusId] || "UNKNOWN_ERROR";
}

// Validate environment variables at startup
const validateEnvironment = () => {
    if (!process.env.JUDGE0_URL) {
        throw new Error("JUDGE0_URL environment variable is not set. Please set it in your .env file.");
    }
    if (!process.env.WEBHOOK_URL) {
        console.warn("WEBHOOK_URL not set, defaulting to http://localhost:3001");
    }
    if (!process.env.REDIS_URL) {
        console.warn("REDIS_URL not set, using default: redis://localhost:6379");
    }
};

validateEnvironment();

const getWebhookUrl = () => {
    return process.env.WEBHOOK_URL || "http://localhost:3001";
}

const validateJobData = (data: SubmissionJobData)=> {
    if (!data.submissionId || typeof data.submissionId !== 'number') {
        throw new Error("Invalid or missing submissionId");
    }
    if (!data.problemId || typeof data.problemId !== 'number'){
        throw new Error("Invalid or missing problemId");
    }
    if (!data.code || typeof data.code !== 'string'){
        throw new Error("Invalid or missing code");
    }
    if (!data.languageId || typeof data.languageId !== 'number'){
        throw new Error("Invalid or missing languageId");
    }
    if (!data.judge0Id || typeof data.judge0Id !== 'number'){
        throw new Error("Invalid or missing judge0Id")
    }
    if (!data.slug || typeof data.slug !== 'string'){
        throw new Error("Invalid or missing slug")
    }
}

const processTestCase = async (file: string,
    submissionId: number,
    code: string,
    judge0Id: number,
    inputDir: string,
    outputDir: string)=> {
        
    const filePath = path.join(inputDir,file);

    if(!fs.existsSync(filePath)){
        throw new Error("file path doesn't exist");
    }

    const content = fs.readFileSync(filePath,'utf-8');

    let expectedOutput = null;
    const outputFilePath = path.join(outputDir, file);
    if (fs.existsSync(outputFilePath)) {
        expectedOutput = fs.readFileSync(outputFilePath, 'utf-8').trim();
    }
    const judge0Url = process.env.JUDGE0_URL;
    if (!judge0Url) {
        throw new Error("JUDGE0_URL environment variable is not set");
    }

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => {controller.abort()}, 10000);

        try {
            console.log('code',code);
            const response = await fetch(`${judge0Url}/submissions?wait=true`,{
                method : "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body : JSON.stringify({
                    source_code : code,
                    language_id : judge0Id,
                    stdin : content,
                    expected_output : expectedOutput
                }),
                signal: controller.signal
            });
            clearTimeout(timeout);

            if (!response.ok) {
                throw new Error(`Judge0 API error: ${response.statusText}`);
            }
            const result = await response.json();

            const testCaseStatus = getTestCaseStatus(result.status.id);
            const time = result.time ? parseFloat(result.time) : 0;
            console.log('compile_output', result.compile_output);
            console.log('error', result);
            return {
                status: testCaseStatus,
                time: time,
                memory: result.memory,
                compile_output : result.compile_output,
                stderr : result.stderr
            };

        } catch (fetchError) {
            clearTimeout(timeout);
            if ((fetchError as Error).name === 'AbortError') {
                throw new Error('Judge0 request timeout');
            }
            throw fetchError;
        }

    } catch (error) {
        console.error(`Error processing test case ${file}:`, error);
        throw error; // Re-throw to propagate the error
    }

}


const processSubmission = async (data: any)=> {
    const {submissionId, problemId, code, languageId, slug, judge0Id} = data;
    
    console.log(`Processing submission ${submissionId} for problem ${problemId}`);

    const inputDir = path.join(__dirname,"..","..","..","problems",`${slug}`,"tests","input");
    const outputDir = path.join(__dirname,"..","..","..","problems",`${slug}`,"tests","output");

    if(!fs.existsSync(inputDir)){
        throw new Error("inputDir path doesn't exist");
    }
    if(!fs.existsSync(outputDir)){
        throw new Error("outputDir path doesn't exist");
    }

    const files = fs.readdirSync(inputDir).filter(file => file.endsWith('.txt')).sort();

    if(files.length==0){
        throw new Error(`No test case files found in ${inputDir}`);
    }

    let passedCount = 0;
    const testCaseResult = [];
    for(const file of files){
        console.log(`Processing test case: ${file} for submission ${submissionId}`);

        const result = await processTestCase(file, submissionId, code, judge0Id, inputDir, outputDir);
        if(result.status=='PASSED'){
            passedCount++;
        }
        testCaseResult.push(result);
    }

    let submissionStatus = "FAILED";
    if (passedCount === files.length) {
        submissionStatus = "PASSED";
    } else if (passedCount > 0) {
        submissionStatus = "PARTIAL";
    }
    await updateSubmissionStatus(testCaseResult,submissionStatus,passedCount,submissionId);
}

const updateSubmissionStatus = async (
    testCaseResult: TestCaseResult[],
    submissionStatus: string,
    passedCount: number,
    submissionId: number
  ) => {
    try {
        const webhook = getWebhookUrl();
        await axios.post(`${webhook}/npwebhook`, {
            testCaseResult:testCaseResult,
            submissionStatus:submissionStatus,
            passedCount:passedCount,
            submissionId:submissionId
        },{
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: 10000
        });
        console.log(`Webhook sent to ${webhook}`);
    } catch (error) {
        console.error('Failed to send webhook:', error);
    }
}

const handleProcessingError = async (data: any, error: any)=> {
    console.error(`Error processing submission ${data.submissionId}: ${error}`);
}

const worker = new Worker("submissionQueue", async (job) => {

    console.log(`Starting job ${job.id} for submission ${job.data.submissionId}`);

    validateJobData(job.data);
    try {
        const result = await processSubmission(job.data);
        console.log(`Job ${job.id} completed successfully`);
        return result;
    }
    catch (error) {
        await handleProcessingError(job.data, error);
        throw error; 
    }
},{
    connection: {
        url: process.env.REDIS_URL || 'redis://localhost:6379'
    }
})