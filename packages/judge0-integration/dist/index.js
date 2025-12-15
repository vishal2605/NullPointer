"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bullmq_1 = require("bullmq");
const path_1 = __importDefault(require("path"));
const fs = __importStar(require("fs"));
const dotenv_1 = __importDefault(require("dotenv"));
const axios_1 = __importDefault(require("axios"));
// Load environment variables from .env file
// Try multiple possible locations for .env file
const envPaths = [
    path_1.default.join(__dirname, "..", "..", "..", ".env"), // From dist folder to root
    path_1.default.join(process.cwd(), ".env"), // From current working directory
    path_1.default.resolve(".env"), // Relative to current directory
];
for (const envPath of envPaths) {
    const result = dotenv_1.default.config({ path: envPath });
    if (!result.error) {
        console.log(`Loaded environment variables from: ${envPath}`);
        break;
    }
}
const JUDGE0_STATUS_MAP = {
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
const getTestCaseStatus = (judge0StatusId) => {
    return JUDGE0_STATUS_MAP[judge0StatusId] || "UNKNOWN_ERROR";
};
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
};
const validateJobData = (data) => {
    if (!data.submissionId || typeof data.submissionId !== 'number') {
        throw new Error("Invalid or missing submissionId");
    }
    if (!data.problemId || typeof data.problemId !== 'number') {
        throw new Error("Invalid or missing problemId");
    }
    if (!data.code || typeof data.code !== 'string') {
        throw new Error("Invalid or missing code");
    }
    if (!data.languageId || typeof data.languageId !== 'number') {
        throw new Error("Invalid or missing languageId");
    }
    if (!data.judge0Id || typeof data.judge0Id !== 'number') {
        throw new Error("Invalid or missing judge0Id");
    }
    if (!data.slug || typeof data.slug !== 'string') {
        throw new Error("Invalid or missing slug");
    }
};
const processTestCase = async (file, submissionId, code, judge0Id, inputDir, outputDir) => {
    const filePath = path_1.default.join(inputDir, file);
    if (!fs.existsSync(filePath)) {
        throw new Error("file path doesn't exist");
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    let expectedOutput = null;
    const outputFilePath = path_1.default.join(outputDir, file);
    if (fs.existsSync(outputFilePath)) {
        expectedOutput = fs.readFileSync(outputFilePath, 'utf-8').trim();
    }
    const judge0Url = process.env.JUDGE0_URL;
    if (!judge0Url) {
        throw new Error("JUDGE0_URL environment variable is not set");
    }
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => { controller.abort(); }, 10000);
        try {
            console.log('code', code);
            const response = await fetch(`${judge0Url}/submissions?wait=true`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    source_code: code,
                    language_id: judge0Id,
                    stdin: content,
                    expected_output: expectedOutput
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
                compile_output: result.compile_output,
                stderr: result.stderr
            };
        }
        catch (fetchError) {
            clearTimeout(timeout);
            if (fetchError.name === 'AbortError') {
                throw new Error('Judge0 request timeout');
            }
            throw fetchError;
        }
    }
    catch (error) {
        console.error(`Error processing test case ${file}:`, error);
        throw error; // Re-throw to propagate the error
    }
};
const processSubmission = async (data) => {
    const { submissionId, problemId, code, languageId, slug, judge0Id } = data;
    console.log(`Processing submission ${submissionId} for problem ${problemId}`);
    const inputDir = path_1.default.join(__dirname, "..", "..", "..", "problems", `${slug}`, "tests", "input");
    const outputDir = path_1.default.join(__dirname, "..", "..", "..", "problems", `${slug}`, "tests", "output");
    if (!fs.existsSync(inputDir)) {
        throw new Error("inputDir path doesn't exist");
    }
    if (!fs.existsSync(outputDir)) {
        throw new Error("outputDir path doesn't exist");
    }
    const files = fs.readdirSync(inputDir).filter(file => file.endsWith('.txt')).sort();
    if (files.length == 0) {
        throw new Error(`No test case files found in ${inputDir}`);
    }
    let passedCount = 0;
    const testCaseResult = [];
    for (const file of files) {
        console.log(`Processing test case: ${file} for submission ${submissionId}`);
        const result = await processTestCase(file, submissionId, code, judge0Id, inputDir, outputDir);
        if (result.status == 'PASSED') {
            passedCount++;
        }
        testCaseResult.push(result);
    }
    let submissionStatus = "FAILED";
    if (passedCount === files.length) {
        submissionStatus = "PASSED";
    }
    else if (passedCount > 0) {
        submissionStatus = "PARTIAL";
    }
    await updateSubmissionStatus(testCaseResult, submissionStatus, passedCount, submissionId);
};
const updateSubmissionStatus = async (testCaseResult, submissionStatus, passedCount, submissionId) => {
    try {
        const webhook = getWebhookUrl();
        await axios_1.default.post(`${webhook}/npwebhook`, {
            testCaseResult: testCaseResult,
            submissionStatus: submissionStatus,
            passedCount: passedCount,
            submissionId: submissionId
        }, {
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: 10000
        });
        console.log(`Webhook sent to ${webhook}`);
    }
    catch (error) {
        console.error('Failed to send webhook:', error);
    }
};
const handleProcessingError = async (data, error) => {
    console.error(`Error processing submission ${data.submissionId}: ${error}`);
};
const worker = new bullmq_1.Worker("submissionQueue", async (job) => {
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
}, {
    connection: {
        url: process.env.REDIS_URL || 'redis://localhost:6379'
    }
});
