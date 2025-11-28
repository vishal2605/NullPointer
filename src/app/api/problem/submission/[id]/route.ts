import { prisma } from "@repo/db";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get session with authOptions
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { 
          error: "Authentication required",
          message: "Please sign in to access this resource"
        },
        { status: 401 }
      );
    }

    const problemId = Number(params.id);
    const userId = Number(session.user.id);

    if (!problemId || isNaN(problemId)) {
      return NextResponse.json(
        { error: "Valid problemId is required" },
        { status: 400 }
      );
    }

    if (!userId || isNaN(userId)) {
      return NextResponse.json(
        { error: "Invalid user session" },
        { status: 400 }
      );
    }

    // Fetch submissions only for the authenticated user
    const submissions = await prisma.submission.findMany({
      where: { 
        problemId, 
        userId // This ensures users can only see their own submissions
      },
      orderBy: { id: "desc" },
    });

    const response = await Promise.all(
      submissions.map(async (entity) => {
        const testcases = await prisma.testcase.findMany({
          where: { submissionId: entity.id },
        });

        const passedCount = testcases.filter(
          (test) => test.status === "PASSED"
        ).length;

        const totalTime = testcases.reduce(
          (acc, t) => acc + (Number(t.time) || 0),
          0
        );

        const language = await prisma.language.findUnique({
          where: { id: entity.languageId },
        });

        return {
          id: entity.id,
          status: entity.status,
          passedCount,
          totalTime,
          submittedTime: entity.submittedTime,
          language: language?.name,
        };
      })
    );

    return NextResponse.json({
      submissions: response,
    });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}