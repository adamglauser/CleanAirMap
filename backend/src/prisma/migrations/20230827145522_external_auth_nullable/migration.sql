-- AlterTable
ALTER TABLE "User" ALTER COLUMN "externalAuthId" DROP NOT NULL,
ALTER COLUMN "externalAuthType" DROP NOT NULL;
