import { prisma } from "@repo/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const problemId = Number(params.id);
    const userId = Number(request.nextUrl.searchParams.get("userId"));

    if (!problemId || !userId) {
      return NextResponse.json(
        { error: "Missing problemId or userId" },
        { status: 400 }
      );
    }

    // Fetch all submissions
    const submissions = await prisma.submission.findMany({
      where: { problemId, userId },
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
          language : language?.name,
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
