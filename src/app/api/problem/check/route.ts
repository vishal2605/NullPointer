import { prisma } from "@repo/db";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

export async function GET(request: NextRequest) {
  try {

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


    const submissionId = Number(request.nextUrl.searchParams.get("submissionId"));
    
    // Input validation
    if (!submissionId || isNaN(submissionId) || submissionId <= 0) {
      return NextResponse.json(
        { error: "Valid submissionId is required" },
        { status: 400 }
      );
    }

    // Single database query with relation inclusion
    const submission = await prisma.submission.findFirst({
      where: {
        id: submissionId,
      },
      include: {
        Testcase: {
          select: {
            status: true,
            index: true,   
          },
          orderBy: {
            index: "asc",  
          },
        },
      },
    });
    

    // Check if submission exists
    if (!submission) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      );
    }

    // If pending, return early without processing testcases
    if (submission.status === 'PENDING') {
      return NextResponse.json({
        state: 'PENDING',
        testcases: [] // Consistent response structure
      });
    }

    // For non-pending submissions, return status and testcases
    return NextResponse.json({
      state: submission.status,
      testcases: submission.Testcase.map(test => test.status)
    });

  } catch (error) {
    console.error("Error fetching submission:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}