import { prisma } from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";


export async function GET(request : NextRequest,{ params }: { params: { id: string } }){
    try {
        const id = parseInt(params.id);
        const problem = await prisma.problem.findUnique({
            where:{id}
        });

        if(!problem){
            return NextResponse.json({
                msg : "problem doesn't exist"
            })
        }
        return NextResponse.json({
            id: problem.id,
            title: problem.title,
            description: problem.description,
            difficulty: problem.difficulty,
            acceptance: problem.acceptance,
            companies: problem.companies,
            related_topics: problem.relatedTopics
        });
    } catch (error) {
        return NextResponse.json(error);
    }
}