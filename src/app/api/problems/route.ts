// app/api/problems/route.ts
import { prisma } from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_: NextRequest) {
  try {
    const problems = await prisma.problem.findMany({
      select: {
        id: true,
        title: true,
        difficulty: true,
        relatedTopics: true,
        acceptance: true,
      },
    });

    if (!problems.length)
      return NextResponse.json({ problems: [] }, { status: 200 });

    // normalise shape for the frontend
    const payload = problems.map((p) => ({
      id: p.id,
      title: p.title,
      difficulty: p.difficulty,
      acceptance: p.acceptance,
      tags: p.relatedTopics,
      solved: false, // Default to false for now
    }));

    return NextResponse.json({ problems: payload });
  } catch (error) {
    console.error("[api/problems]", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}