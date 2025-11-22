
import { NextRequest, NextResponse } from "next/server";
import { Queue } from "bullmq";
import { prisma } from "@repo/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

const submissionQueue = new Queue('submissionQueue', {
    connection: {
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    }
  });
export async function POST(request: NextRequest, response: NextResponse){
    try {
        const data = await request.json();
        const session = await getServerSession(authOptions);
        if (!session?.user?.username) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.log(session.user);
        // Validate and convert user ID
        const userId = parseInt(session.user.id);
        if (isNaN(userId)) {
            return NextResponse.json(
                { error: 'Invalid user ID format' }, 
                { status: 400 }
            );
        }

        // Validate all required fields with proper types
        if (!data.languageId || !data.problemId || !data.code) {
            return NextResponse.json(
                { error: 'Missing required fields: languageId, problemId, code' }, 
                { status: 400 }
            );
        }

        // Convert IDs to numbers
        const languageId = parseInt(data.languageId);
        const problemId = parseInt(data.problemId);

        if (isNaN(languageId) || isNaN(problemId)) {
            return NextResponse.json(
                { error: 'Invalid languageId or problemId format' }, 
                { status: 400 }
            );
        }

        console.log('Parsed IDs - userId:', userId, 'languageId:', languageId, 'problemId:', problemId);

        const language = await prisma.language.findFirst({
            where :{
                id: data.languageId
            }
        });
        const problem = await prisma.problem.findFirst({
            where: {
                id : data.problemId
            }
        })
        if(!problem){
            return NextResponse.json({
                msg : "problem doesn't exist"
            })
        }
        const defaultCode = await prisma.defaultCode.findFirst({
            where: {
                problemId: data.problemId,
                languageId: language?.id
            }
        });
        if(!defaultCode){
            return NextResponse.json({
                msg : "default code doesn't exist"
            })
        }
        console.log('default code : ',defaultCode);
        const submission = await prisma.submission.create({
            data:{
                problemId: problem.id,
                userId: parseInt(session.user.id),
                languageId: data.languageId,
                status: "PENDING"
            }
        });
        for(let i = 0; i < problem.numberOfTestcases; i++){
            await prisma.testcase.create({
                data:{
                    submissionId : submission.id,
                    status : "PENDING",
                    time : 0,
                    output : ""
                }
            })
        }
        console.log('submission : ',submission)
        const fullCode = defaultCode.fullCode.replace("//USER_CODE_HERE",data.code);
        console.log(fullCode);

        await submissionQueue.add('processSubmisson',{
            submissionId : submission.id,
            problemId: data.problemId,
            code : fullCode,
            languageId : language?.id,
            slug : problem.slug,
            judge0Id : language?.judge0Id
        })
        const queueCounts = await submissionQueue.getJobCounts();
        console.log('📊 Queue counts after adding:', queueCounts);

        return NextResponse.json({
            submissionId : submission.id,
            msg : "Submission received and queued for processing"
        })
        
    } catch (error) {
        return NextResponse.json({
            error : error
        }, {
            status : 500
        });
    }
}