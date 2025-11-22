// app/api/problems/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";
export async function GET(request: NextRequest) {
  try {
    const {searchParams} = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const difficulty = searchParams.get('difficulty') || 'all';
    const start = (page-1)*limit;

    const problems = await prisma.problem.findMany();

    if (!problems.length)
      return NextResponse.json({ problems: [] }, { status: 200 });

    let filteredProblem = problems.map((p) => ({
        id: p.id,
        title: p.title,
        difficulty: p.difficulty,
        acceptance: p.acceptance,
        tags: p.relatedTopics,
        solved: false,
      }));

    if(difficulty!='all'){
        filteredProblem=filteredProblem.filter(problem => problem.difficulty.toLowerCase()===difficulty);
    }
    filteredProblem = filteredProblem.slice(start, start+limit);
    const hasMore = start + limit < problems.length

    return NextResponse.json({
        problems: filteredProblem,
        hasMore,
        total: problems.length,
        page,
        limit
      });
  } catch (error) {
    console.error("[api/problems]", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}