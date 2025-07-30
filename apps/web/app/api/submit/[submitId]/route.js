/**
 * @fileoverview API endpoint to poll the status and results of a code submission.
 * Route: /api/submit/[submitId]
 * Method: GET
 * 
 * The frontend calls this endpoint with a submission ID to check for the final result.
 * Returns processing status, or final result with test case details.
 */

import { NextResponse } from 'next/server';
import prisma from "@repo/db/client";

/**
 * GET /api/submit/[submitId]
 * Polls the status and results of a submission.
 */
export async function GET(req, context) {
  try {
    const { submitId } = await context.params;
    const numericId = parseInt(submitId, 10);
    console.log(`[GET] /api/submit/${submitId} - Polling for submission ID: ${numericId}`);

    if (isNaN(numericId)) {
      return NextResponse.json({ error: 'Invalid submission ID' }, { status: 400 });
    }

    // Fetch the submission and its related test case results
    const submission = await prisma.submission.findUnique({
      where: { id: numericId },
      include: { results: true }, // 'results' is the relation to submissionTestCaseResults
    });

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    // Check if all test cases have been processed (i.e., are no longer -1)
    const allFinished = submission.results.every((r) => r.passed !== -1);

    if (!allFinished) {
      const finishedCount = submission.results.filter(r => r.passed !== -1).length;
      return NextResponse.json({
        statusId: 2, // "Processing"
        message: 'Submission is still being processed.',
        finishedCount,
        totalTestCases: submission.results.length,
      }, { status: 200 });
    }

    // If all results are in, calculate the final status and update the DB if needed
    if (submission.statusId === 2) { // Still "Processing"
      const passedCount = submission.results.filter(r => r.passed === 1).length;
      const allPassed = passedCount === submission.results.length;
      const finalStatusId = allPassed ? 3 : 4; // 3: Accepted, 4: Wrong Answer

      const finalSubmission = await prisma.submission.update({
        where: { id: numericId },
        data: { statusId: finalStatusId },
        include: { results: true },
      });

      console.log(`[GET] /api/submit/${submitId} - Finalized submission. Status: ${finalStatusId === 3 ? 'Accepted' : 'Wrong Answer'}`);
      return NextResponse.json({
        ...finalSubmission,
        passedCount,
        totalTestCases: submission.results.length,
      }, { status: 200 });
    } else {
      // If the status is already updated, just return the final submission data
      const passedCount = submission.results.filter(r => r.passed === 1).length;
      return NextResponse.json({
        ...submission,
        passedCount,
        totalTestCases: submission.results.length,
      }, { status: 200 });
    }

  } catch (error) {
    console.error('[GET] /api/submit/[submitId] - Polling Error:', error);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}