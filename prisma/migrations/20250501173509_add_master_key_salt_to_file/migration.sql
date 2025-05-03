-- AlterTable
ALTER TABLE "File" ADD COLUMN     "encryptedFileKey" TEXT,
ADD COLUMN     "fileKeyIv" TEXT,
ADD COLUMN     "keyVersion" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "masterKeySalt" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "encryptedMasterKey" TEXT,
ADD COLUMN     "masterKeyIv" TEXT,
ADD COLUMN     "masterKeySalt" TEXT,
ADD COLUMN     "recoveryEnabled" BOOLEAN NOT NULL DEFAULT false;
