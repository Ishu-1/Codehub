
/**
 * Express route for problem boilerplate generation.
 * Handles validation, file upload, and delegates to handleGeneration service.
 *
 * Author: [Your Name]
 * Date: [Current Date]
 */

import express from "express";
import { z } from "zod";
import { handleGeneration } from "../services/boilerplateService.js";

const router = express.Router();

const payloadSchema = z.object({
  title: z.string(),
  description: z.string(),
  structure: z.string(),
  inputFormat: z.string(),
  outputFormat: z.string(),
  constraints: z.string(),
  sampleInput: z.string(),
  sampleOutput: z.string(),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
  tags: z.array(z.string())
});

router.post("/", async (req, res) => {
  try {
    console.log("[generateRoute] Received POST /generate request");
    console.log("[generateRoute] req.body.json:", req.body?.json);
    let parsed;
    try {
      parsed = payloadSchema.parse(JSON.parse(req.body.json));
    } catch (e) {
      console.error("[generateRoute] Failed to parse payload or schema:", e);
      return res.status(400).json({ error: "Invalid payload: " + e.message });
    }
    console.log("[generateRoute] Parsed payload:", parsed);
    const inputOutputFile = req.files?.input_output?.[0];
    console.log("[generateRoute] inputOutputFile present:", !!inputOutputFile);
    if (!inputOutputFile) {
      return res.status(400).json({ error: "Input file is required." });
    }

    const result = await handleGeneration(parsed, inputOutputFile);
    console.log(`[generateRoute] Problem created with id: ${result.id}`);
    res.status(201).json({ message: "Problem created", problemId: result.id });
  } catch (error) {
    console.error("[generateRoute] ❌ Error generating problem:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
