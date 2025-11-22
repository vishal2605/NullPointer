/*
  Warnings:

  - You are about to drop the column `name` on the `DefaultCode` table. All the data in the column will be lost.
  - Added the required column `code` to the `DefaultCode` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fullCode` to the `DefaultCode` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `Problem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DefaultCode" DROP COLUMN "name",
ADD COLUMN     "code" TEXT NOT NULL,
ADD COLUMN     "fullCode" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Problem" ADD COLUMN     "slug" TEXT NOT NULL;
