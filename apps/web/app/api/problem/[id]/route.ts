

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";

export async function GET(request : NextRequest,{ params }: { params: Promise<{ id: string }> }){
    try {
        const { id: idParam } = await params;
        const id = parseInt(idParam);
        const problem = await prisma.problem.findUnique({
            where:{id}
        });


        const defaultCode = await prisma.defaultCode.findMany({
            where: { problemId: id }
          });
        
        const language = await prisma.language.findMany();
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
            language: language,
            defaultCode: defaultCode,
            related_topics: problem.relatedTopics
        });
    } catch (error) {
        return NextResponse.json(error);
    }
}