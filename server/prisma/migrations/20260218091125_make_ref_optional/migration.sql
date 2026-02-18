-- AlterTable
ALTER TABLE "cases" ALTER COLUMN "reference_number" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "cases_reference_number_idx" ON "cases"("reference_number");

-- CreateIndex
CREATE INDEX "cases_support_count_idx" ON "cases"("support_count");
