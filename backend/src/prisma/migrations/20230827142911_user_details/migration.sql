/*
  Warnings:

  - Added the required column `email` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `externalAuthId` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `externalAuthType` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "externalAuthId" TEXT NOT NULL,
ADD COLUMN     "externalAuthType" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_created_id_fkey" FOREIGN KEY ("created_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
