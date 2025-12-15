import { NextRequest, NextResponse } from "next/server";
import { Queue } from "bullmq";
import { prisma } from "@repo/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const submissionQueue = new Queue("submissionQueue", {
  connection: {
    url: process.env.REDIS_URL || "redis://localhost:6379",
  },
});

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validate session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = Number(session.user.id);
    if (isNaN(userId)) {
      return NextResponse.json(
        { error: "Invalid user ID" },
        { status: 400 }
      );
    }

    // Validate input
    if (!data.languageId || !data.problemId || !data.code) {
      return NextResponse.json(
        { error: "Missing languageId, problemId, or code" },
        { status: 400 }
      );
    }

    const languageId = Number(data.languageId);
    const problemId = Number(data.problemId);

    if (isNaN(languageId) || isNaN(problemId)) {
      return NextResponse.json(
        { error: "Invalid languageId or problemId format" },
        { status: 400 }
      );
    }

    // Fetch language
    const language = await prisma.language.findFirst({
      where: { id: languageId },
    });

    if (!language) {
      return NextResponse.json({ error: "Language not found" }, { status: 404 });
    }

    // Fetch problem
    const problem = await prisma.problem.findFirst({
      where: { id: problemId },
    });

    if (!problem) {
      return NextResponse.json(
        { error: "Problem does not exist" },
        { status: 404 }
      );
    }

    // Fetch default code template
    const defaultCode = await prisma.defaultCode.findFirst({
      where: {
        problemId: problemId,
        languageId: languageId,
      },
    });

    if (!defaultCode) {
      return NextResponse.json(
        { error: "Default code template missing" },
        { status: 404 }
      );
    }

    // Create submission entry
    const submission = await prisma.submission.create({
      data: {
        problemId: problem.id,
        userId: userId,
        languageId: languageId,
        status: "PENDING",
      },
    });

    // Create testcases with order
    for (let i = 0; i < problem.numberOfTestcases; i++) {
      await prisma.testcase.create({
        data: {
          submissionId: submission.id,
          status: "PENDING",
          time: 0,
          output: "",
          index: i,
        },
      });
    }
    let cleanedUserCode = data.code;

    if (language.name === "java") {
      cleanedUserCode = cleanedUserCode.replace(/System\.out\.println/g, "// System.out.println");
    } 
    else if (language.name === "cpp") {
      cleanedUserCode = cleanedUserCode.replace(/\bcout\b/g, "// cout");
    } 
    else if (language.name === "python") {
      cleanedUserCode = cleanedUserCode.replace(/\bprint\s*\(/g, "# print(");
    } 
    else if (language.name === "javascript") {
      cleanedUserCode = cleanedUserCode.replace(/\bconsole\.log/g, "// console.log");
    }

    // Final merged code
    const userCodeToken = language.name === "python" ? "#USER_CODE_HERE" : "//USER_CODE_HERE";
    const fullCode = defaultCode.fullCode.replace(userCodeToken, cleanedUserCode);

    // Queue job
    await submissionQueue.add("processSubmission", {
      submissionId: submission.id,
      problemId,
      code: fullCode,
      languageId,
      slug: problem.slug,
      judge0Id: language.judge0Id,
    });

    return NextResponse.json({
      submissionId: submission.id,
      msg: "Submission queued successfully",
    });
  } catch (error) {
    console.error("Submission error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}
