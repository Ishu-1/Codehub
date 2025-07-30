
"use client";
/**
 * ProblemSolvePage - Main page for solving a coding problem.
 * Handles code editing, language selection, running, and submitting code.
 *
 * Features:
 * - Fetches problem details and boilerplate code
 * - Allows language selection and code editing
 * - Handles code run and submit with polling for results
 * - Displays detailed results and errors
 *
 * Author: [Your Name]
 * Date: 2025-07-30
 */

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import axios from "axios";

const LANGUAGES = [
  { name: "C++", id: 54 },
  { name: "Java", id: 2 },
  { name: "Python", id: 3 },
];

function decodeBase64(str) {
  if (!str) return "";
  try { return atob(str); } catch { return str; }
}

function TestCaseResult({ testCase, result }) {
  return (
    <div className="bg-[#0B192C] p-3 rounded border border-[#FF6500] mb-2">
      <div>
        <span className="text-[#FF6500] font-bold">Input:</span>
        <pre className="text-gray-200 whitespace-pre-wrap">{testCase.input}</pre>
      </div>
      <div>
        <span className="text-[#FF6500] font-bold">Expected Output:</span>
        <pre className="text-gray-200 whitespace-pre-wrap">{testCase.output}</pre>
      </div>
      <div>
        <span className="text-[#FF6500] font-bold">Status:</span>
        <span className="ml-2 font-bold"
          style={{
            color:
              result?.statusId === 3
                ? "#22c55e"
                : result?.statusId === 6
                ? "#f59e42"
                : result?.statusId
                ? "#ef4444"
                : "#eab308",
          }}
        >
          {result?.statusDescription || "Processing"}
        </span>
      </div>
      {result?.stdout && (
        <div>
          <span className="text-[#FF6500] font-bold">Output:</span>
          <pre className="text-gray-200 whitespace-pre-wrap">{decodeBase64(result.stdout)}</pre>
        </div>
      )}
      {result?.stderr && (
        <div>
          <span className="text-[#FF6500] font-bold">Stderr:</span>
          <pre className="text-red-400 whitespace-pre-wrap">{decodeBase64(result.stderr)}</pre>
        </div>
      )}
      {result?.compileOutput && (
        <div>
          <span className="text-[#FF6500] font-bold">Compile Output:</span>
          <pre className="text-yellow-400 whitespace-pre-wrap">{decodeBase64(result.compileOutput)}</pre>
        </div>
      )}
      {result?.message && (
        <div>
          <span className="text-[#FF6500] font-bold">Message:</span>
          <pre className="text-yellow-400 whitespace-pre-wrap">{decodeBase64(result.message)}</pre>
        </div>
      )}
      {result?.time && (
        <div>
          <span className="text-[#FF6500] font-bold">Time:</span>
          <span className="ml-2">{result.time} s</span>
        </div>
      )}
      {result?.memory && (
        <div>
          <span className="text-[#FF6500] font-bold">Memory:</span>
          <span className="ml-2">{result.memory} KB</span>
        </div>
      )}
    </div>
  );
}

export default function ProblemSolvePage() {
  const { problemId } = useParams();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLang, setSelectedLang] = useState(LANGUAGES[0]);
  const [code, setCode] = useState("");
  const [runResult, setRunResult] = useState(null);
  const [runTestCases, setRunTestCases] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const pollingRef = useRef();

  useEffect(() => {
    setLoading(true);
    axios
      .get(`/api/problems/${problemId}`)
      .then((res) => {
        setProblem(res.data);
        const defaultBoiler = res.data.boilerplates.find(
          (b) => b.language.name.toLowerCase() === selectedLang.name.toLowerCase()
        );
        setCode(defaultBoiler ? defaultBoiler.code : "");
        setLoading(false);
      })
      .catch((err) => {
        setError("Problem not found");
        setLoading(false);
      });
  }, [problemId]);

  useEffect(() => {
    if (!problem) return;
    const boiler = problem.boilerplates.find(
      (b) => b.language.name.toLowerCase() === selectedLang.name.toLowerCase()
    );
    setCode(boiler ? boiler.code : "");
  }, [selectedLang]);

  // --- Poll for run result ---
  const pollRun = (runId, testCases) => {
    let timeoutId;
    setRunTestCases(testCases);
    pollingRef.current = setInterval(async () => {
      try {
        const res = await axios.get(`/api/run/${runId}`);
        if (res.data.status === "Completed" || res.data.results) {
          clearInterval(pollingRef.current);
          clearTimeout(timeoutId);
          setRunResult({ ...res.data });
          setIsRunning(false);
        }
      } catch (err) {
        setRunResult({ error: "Run failed" });
        setIsRunning(false);
      }
    }, 3000);
    timeoutId = setTimeout(() => {
      clearInterval(pollingRef.current);
      setRunResult({ error: "Time Limit Exceeded" });
      setIsRunning(false);
    }, 30000);
  };

  // --- Poll for submit result ---
  const pollSubmit = (submitId) => {
    let timeoutId;
    pollingRef.current = setInterval(async () => {
      try {
        const res = await axios.get(`/api/submit/${submitId}`);
        if (res.data.statusId === 3 || res.data.statusId === 4) {
          clearInterval(pollingRef.current);
          clearTimeout(timeoutId);
          setSubmitResult(res.data);
          setIsSubmitting(false);
        }
      } catch (err) {
        setSubmitResult({ error: "Submit failed" });
        setIsSubmitting(false);
      }
    }, 3000);
    timeoutId = setTimeout(() => {
      clearInterval(pollingRef.current);
      setSubmitResult({ error: "Time Limit Exceeded" });
      setIsSubmitting(false);
    }, 600000);
  };

  // --- Handle code run ---
  const handleRun = async () => {
    setIsRunning(true);
    setRunResult(null);
    setRunTestCases(null);
    try {
      const langBoiler = problem.boilerplates.find(
        (b) => b.language.name.toLowerCase() === selectedLang.name.toLowerCase()
      );
      const res = await axios.post("/api/run", {
        userId: "1",
        problemSlug: problemId,
        languageId: langBoiler.language.id,
        code,
      });
      pollRun(res.data.runId, res.data.testCases);
    } catch (e) {
      setRunResult({ error: "Run failed" });
      setIsRunning(false);
    }
  };

  // --- Handle code submit ---
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitResult(null);
    try {
      const langBoiler = problem.boilerplates.find(
        (b) => b.language.name.toLowerCase() === selectedLang.name.toLowerCase()
      );
      const res = await axios.post("/api/submit", {
        userId: "1",
        problemSlug: problemId,
        languageId: langBoiler.language.id,
        code,
      });
      pollSubmit(res.data.submissionId);
    } catch (e) {
      setSubmitResult({ error: "Submit failed" });
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="text-white p-8">Loading...</div>;
  if (error) return <div className="text-red-500 p-8">{error}</div>;

  // --- Render Run Results ---
  const renderRunResults = () => {
    if (!runResult) return null;
    if (runResult.error) return <div className="text-red-400">{runResult.error}</div>;
    if (!runTestCases) return null;
    return (
      <div>
        {runTestCases.map(tc => {
          const result = runResult.results?.find(r => r.id === tc.submissionTestCaseResultsId);
          return <TestCaseResult key={tc.submissionTestCaseResultsId} testCase={tc} result={result} />;
        })}
      </div>
    );
  };

  // --- Render Submit Results ---
  const renderSubmitResults = () => {
    if (!submitResult) return null;
    if (submitResult.error) return <div className="text-red-400">{submitResult.error}</div>;
    return (
      <div>
        <div className="mb-4">
          <span className="font-bold text-lg">Overall Status: </span>
          <span
            className="font-bold"
            style={{
              color:
                submitResult.statusId === 3
                  ? "#22c55e"
                  : submitResult.statusId === 6
                  ? "#f59e42"
                  : submitResult.statusId
                  ? "#ef4444"
                  : "#eab308",
            }}
          >
            {submitResult.statusDescription || "Processing"}
          </span>
          <span className="ml-4 text-sm text-gray-300">
            ({submitResult.passedCount} / {submitResult.totalTestCases} Passed)
          </span>
        </div>
        {submitResult.testCaseResults?.map(tc =>
          <TestCaseResult key={tc.id} testCase={{ input: "", output: "" }} result={tc} />
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0B192C] flex flex-col md:flex-row">
      <div className="md:w-1/2 w-full p-8 bg-[#1E3E62] text-white flex flex-col gap-4 border-r border-[#0B192C]">
        <h1 className="text-3xl font-bold text-[#FF6500]">{problem.title}</h1>
        <div className="flex gap-2 mb-2">
          <span
            className={`px-2 py-1 rounded text-xs font-bold ${
              problem.difficulty === "EASY"
                ? "bg-green-600"
                : problem.difficulty === "MEDIUM"
                ? "bg-yellow-600"
                : "bg-red-600"
            }`}
          >
            {problem.difficulty}
          </span>
        </div>
        <div className="text-base whitespace-pre-line mb-2">{problem.description}</div>
        <div>
          <span className="font-semibold text-[#FF6500]">Input Format:</span>
          <div className="ml-2 text-gray-200 whitespace-pre-line">{problem.inputFormat}</div>
        </div>
        <div>
          <span className="font-semibold text-[#FF6500]">Output Format:</span>
          <div className="ml-2 text-gray-200 whitespace-pre-line">{problem.outputFormat}</div>
        </div>
        <div>
          <span className="font-semibold text-[#FF6500]">Constraints:</span>
          <div className="ml-2 text-gray-200 whitespace-pre-line">{problem.constraints}</div>
        </div>
      </div>

      <div className="md:w-1/2 w-full p-8 flex flex-col gap-4 bg-[#0B192C]">
        <div className="flex gap-4 items-center mb-2">
          <label className="text-[#FF6500] font-semibold">Language:</label>
          <select
            className="bg-[#1E3E62] text-white px-3 py-2 rounded border border-[#FF6500]"
            value={selectedLang.name}
            onChange={(e) =>
              setSelectedLang(LANGUAGES.find((l) => l.name === e.target.value))
            }
          >
            {LANGUAGES.map((l) => (
              <option key={l.id} value={l.name}>
                {l.name}
              </option>
            ))}
          </select>
        </div>


        <textarea
          className="w-full h-72 bg-[#1E3E62] text-white rounded p-4 font-mono text-base border border-[#FF6500] focus:outline-none"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <div className="flex gap-4 mt-2">
          <button
            className="bg-[#FF6500] text-[#0B192C] px-6 py-2 rounded font-bold hover:bg-[#ff7f32] transition disabled:opacity-60"
            onClick={handleRun}
            disabled={isRunning || isSubmitting}
          >
            {isRunning ? "Running..." : "Run"}
          </button>
          <button
            className="border-2 border-[#FF6500] text-[#FF6500] px-6 py-2 rounded font-bold hover:bg-[#FF6500] hover:text-[#0B192C] transition disabled:opacity-60"
            onClick={handleSubmit}
            disabled={isSubmitting || isRunning}
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </div>

        {runResult && (
          <div className="mt-4 bg-[#1E3E62] p-4 rounded text-white">
            <h3 className="font-bold text-[#FF6500] mb-2">Run Result</h3>
            {renderRunResults()}
          </div>
        )}

        {submitResult && (
          <div className="mt-4 bg-[#1E3E62] p-4 rounded text-white">
            <h3 className="font-bold text-[#FF6500] mb-2">Submit Result</h3>
            {renderSubmitResults()}
          </div>
        )}
      </div>
    </div>
  );
}
