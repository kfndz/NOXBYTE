-- AlterTable
ALTER TABLE "Product"
ADD COLUMN "availability" TEXT NOT NULL DEFAULT 'UNKNOWN',
ADD COLUMN "externalProductId" TEXT,
ADD COLUMN "priceCheckedAt" TIMESTAMP(3);
