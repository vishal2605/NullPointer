-- CreateEnum
CREATE TYPE "ProblemStatus" AS ENUM ('TODO', 'ATTEMPTED', 'SOLVED');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Problem" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "acceptance" DOUBLE PRECISION NOT NULL,
    "slug" TEXT NOT NULL,
    "numberOfTestcases" INTEGER NOT NULL DEFAULT 0,
    "companies" TEXT[],
    "relatedTopics" TEXT[],

    CONSTRAINT "Problem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Submission" (
    "id" SERIAL NOT NULL,
    "problemId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "languageId" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "submittedTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Testcase" (
    "id" SERIAL NOT NULL,
    "index" INTEGER NOT NULL DEFAULT 0,
    "submissionId" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "time" DOUBLE PRECISION,
    "output" TEXT NOT NULL,

    CONSTRAINT "Testcase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DefaultCode" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "fullCode" TEXT NOT NULL,
    "languageId" INTEGER NOT NULL,
    "problemId" INTEGER NOT NULL,

    CONSTRAINT "DefaultCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Language" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "judge0Id" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Language_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Problem_title_key" ON "Problem"("title");

-- CreateIndex
CREATE UNIQUE INDEX "Problem_slug_key" ON "Problem"("slug");

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

-- AddForeignKey
ALTER TABLE "DefaultCode" ADD CONSTRAINT "DefaultCode_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
