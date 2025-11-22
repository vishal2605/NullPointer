/*
  Warnings:

  - You are about to drop the `UserProblem` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."UserProblem" DROP CONSTRAINT "UserProblem_problemId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserProblem" DROP CONSTRAINT "UserProblem_userId_fkey";

-- DropTable
DROP TABLE "public"."UserProblem";

-- CreateTable
CREATE TABLE "Submission" (
    "id" SERIAL NOT NULL,
    "problemId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "languageId" INTEGER NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Testcase" (
    "id" SERIAL NOT NULL,
    "submissionId" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "time" DOUBLE PRECISION,

    CONSTRAINT "Testcase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DefaultCode" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "languageId" INTEGER NOT NULL,

    CONSTRAINT "DefaultCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Language" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Language_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Testcase" ADD CONSTRAINT "Testcase_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DefaultCode" ADD CONSTRAINT "DefaultCode_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
