/**
 * @fileoverview Express-compatible webhook route handler for Judge0 callbacks.
 * Handles PUT requests to /webhook?submissionTestCaseResultsId=...
 * Updates the test case result in the database based on Judge0 status.
 */

import express from "express";
import { z } from "zod";
import prisma from "@repo/db/client";
const router = express.Router();

// Zod schema to validate Judge0 callback
const judge0CallbackSchema = z.object({
  status: z.object({
    id: z.number(),
  }),
  stdout: z.string().nullable(),
  stderr: z.string().nullable(),
  token: z.string(),
});

// PUT /webhook?submissionTestCaseResultsId=...
router.put("/", async (req, res) => {
  const submissionTestCaseResultsId = req.query.submissionTestCaseResultsId;

  if (!submissionTestCaseResultsId) {
    console.error("[Webhook] Missing submissionTestCaseResultsId");
    return res.status(400).json({ error: "Missing submissionTestCaseResultsId" });
  }

  const numericId = parseInt(submissionTestCaseResultsId, 10);
  if (isNaN(numericId)) {
    console.error("[Webhook] Invalid ID format:", submissionTestCaseResultsId);
    return res.status(400).json({ error: "Invalid ID format" });
  }

  try {
    const parsed = judge0CallbackSchema.safeParse(req.body);
    if (!parsed.success) {
      console.error("[Webhook] Invalid Judge0 body:", parsed.error);
      return res.status(400).json({ error: "Invalid callback body" });
    }

    const { status } = parsed.data;
    // 3 = Accepted, anything else = Wrong Answer
    const passed = status.id === 3 ? 1 : 0;

    await prisma.submissionTestCaseResults.update({
      where: { id: numericId },
      data: { passed },
    });

    console.log(`[Webhook] Processed: ID ${numericId}, Result: ${passed === 1 ? "Accepted" : "Wrong Answer"}`);
    return res.status(200).json({ message: "Webhook received successfully." });
  } catch (error) {
    console.error("[Webhook] Internal server error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;