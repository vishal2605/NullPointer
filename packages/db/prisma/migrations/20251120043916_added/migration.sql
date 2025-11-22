/*
  Warnings:

  - Added the required column `output` to the `Testcase` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Problem" ADD COLUMN     "numberOfTestcases" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Testcase" ADD COLUMN     "output" TEXT NOT NULL;
