-- AlterTable
ALTER TABLE "Refund" ALTER COLUMN "reason" DROP NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'pending';

-- CreateIndex
CREATE INDEX "Refund_subscriptionId_idx" ON "Refund"("subscriptionId");
