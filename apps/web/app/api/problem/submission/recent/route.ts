import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@repo/db";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const userId = Number(session.user.id);

    const submissions = await prisma.submission.findMany({
      where: { userId: userId },
      orderBy: { submittedTime: "desc" },
      select: {
        id: true,
        problem: {
          select: {
            id: true,
            title: true,
          }
        },
        status: true,
        language: true,
        submittedTime: true,
      }
    });

    return NextResponse.json({ submissions });
  } catch (error) {
    console.error("Error fetching recent submissions", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
