-- DropForeignKey
ALTER TABLE "submissionTestCaseResults" DROP CONSTRAINT "submissionTestCaseResults_submissionId_fkey";

-- AddForeignKey
ALTER TABLE "submissionTestCaseResults" ADD CONSTRAINT "submissionTestCaseResults_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
