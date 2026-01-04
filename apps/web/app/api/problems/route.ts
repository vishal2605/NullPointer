// app/api/problems/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const difficulty = searchParams.get('difficulty')?.toLowerCase() || 'all';
    const start = (page - 1) * limit;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    // Fetch problems from database
    const problems = await prisma.problem.findMany({
      orderBy: {
        id: 'asc' // Sort by ID at database level for efficiency
      }
    });

    if (!problems.length) {
      return NextResponse.json({ problems: [] }, { status: 200 });
    }

    // Transform the data
    let filteredProblems = problems.map((p) => ({
      id: p.id,
      title: p.title,
      difficulty: p.difficulty,
      acceptance: p.acceptance,
      tags: p.relatedTopics,
      solved: true,
    }));

    for(const problem of filteredProblems){
      const submissions = await prisma.submission.findFirst({
        where: {
          problemId: problem.id,
          userId: Number(session?.user?.id),
          status: "PASSED",
        },
      });
      if(submissions){
        problem.solved = true;
      }else{
        problem.solved = false;
      }
    }
    // Apply difficulty filter
    if (difficulty !== 'all') {
      filteredProblems = filteredProblems.filter(problem => 
        problem.difficulty.toLowerCase() === difficulty
      );
    }

    // Calculate pagination after filtering
    const totalFiltered = filteredProblems.length;
    const paginatedProblems = filteredProblems.slice(start, start + limit);
    const hasMore = start + limit < totalFiltered;

    return NextResponse.json({
      problems: paginatedProblems,
      hasMore,
      total: totalFiltered, // Return filtered total, not original total
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
