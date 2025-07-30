/**
 * @fileoverview Entry point for the webhook server.
 * Starts an Express server to handle Judge0 webhook callbacks.
 * All webhooks should POST to /webhook?submissionTestCaseResultsId=...
 */

import express from "express";
import webhookRoute from "./app/api/webhook/route.js"; // Express-compatible router

const app = express();
app.use(express.json());

// Route for handling Judge0 webhooks
app.use("/webhook", webhookRoute);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Webhook server running on port ${PORT}`);
});