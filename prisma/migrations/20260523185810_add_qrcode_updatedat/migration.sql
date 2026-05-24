/*
  Warnings:

  - A unique constraint covering the columns `[qrCode]` on the table `Object` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `Object` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Object" ADD COLUMN     "qrCode" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Object_qrCode_key" ON "Object"("qrCode");
