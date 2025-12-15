import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@repo/db";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user.id) {
      return NextResponse.json(
        { msg: "you are not authenticated" },
        { status: 401 }
      );
    }
    const userId = Number(session.user.id);
    console.log("userId", userId);

    const submissions = await prisma.submission.findMany({
    where: {
        userId: userId,
        status: "PASSED",
    },
    distinct: ["problemId"],
    select: {
        problemId: true,
    },
    });

      

    const problemIds = submissions.map((s) => s.problemId);

    if (problemIds.length === 0) {
      return NextResponse.json({
        totalCount: 0,
        easyCount: 0,
        mediumCount: 0,
        hardCount: 0,
        streak: 0,
      });
    }

    // 2. Fetch all matching problems
    const problems = await prisma.problem.findMany({
      where: {
        id: { in: problemIds },
      },
      select: {
        id: true,
        difficulty: true,
      },
    });

    // 3. Count difficulty
    let easyCount = 0;
    let mediumCount = 0;
    let hardCount = 0;

    for (const p of problems) {
      if (p.difficulty === "Easy") easyCount++;
      else if (p.difficulty === "Medium") mediumCount++;
      else if (p.difficulty === "Hard") hardCount++;
    }

    const allPassed = await prisma.submission.findMany({
      where: {
        userId : userId,
        status: "PASSED",
      },
      select: {
        submittedTime: true,
      },
      orderBy: {
        submittedTime: "desc",
      },
    });

    const uniqueDates = Array.from(
      new Set(
        allPassed.map((s) =>
          s.submittedTime.toISOString().slice(0, 10) 
        )
      )
    ).sort((a, b) => (a < b ? 1 : -1));

    let streak = 0;

    const today = new Date();
    let currentCheckDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    for (let i = 0; i < uniqueDates.length; i++) {
      const solvedDate = new Date(uniqueDates[i]);

      if (solvedDate.getTime() === currentCheckDate.getTime()) {
        streak++;
        // Move to previous day
        currentCheckDate.setDate(currentCheckDate.getDate() - 1);
      } else {
        break;
      }
    }

    // ---------------------------------------

    return NextResponse.json({
      totalCount: problems.length,
      easyCount,
      mediumCount,
      hardCount,
      streak,
    });
  } catch (error) {
    console.error("Error in /api/stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
