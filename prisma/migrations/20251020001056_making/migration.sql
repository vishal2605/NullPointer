/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Problem` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Problem_slug_key" ON "Problem"("slug");
