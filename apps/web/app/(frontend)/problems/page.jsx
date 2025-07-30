"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import axios from "axios";
// Import icons for a better UI
import { ChevronLeft, ChevronRight, TriangleAlert, SearchX } from "lucide-react";

// A single problem row component with enhanced styling and animation
const ProblemRow = ({ problem, index }) => {
  // Enhanced styling for difficulty badges
  const difficultyStyles = {
    EASY: {
      text: "text-green-400",
      bg: "bg-green-500/10",
      border: "border-green-500/20",
    },
    MEDIUM: {
      text: "text-yellow-400",
      bg: "bg-yellow-500/10",
      border: "border-yellow-500/20",
    },
    HARD: {
      text: "text-red-400",
      bg: "bg-red-500/10",
      border: "border-red-500/20",
    },
  };
  const style = difficultyStyles[problem.difficulty] || {};

  return (
    <Link href={`/problems/${problem.slug}`} passHref>
      {/* The 'group' class allows child elements to react to the parent's hover state */}
      <div
        className="group grid cursor-pointer grid-cols-12 items-center gap-4 rounded-lg border border-slate-700/80 bg-slate-800/40 p-4 transition-all duration-300 hover:border-slate-600 hover:bg-slate-800/80 animate-fade-in"
        // Stagger the animation for a nice effect
        style={{ animationDelay: `${index * 50}ms` }}
      >
        {/* Column 1: Title & Tags */}
        <div className="col-span-12 md:col-span-8">
          <p className="font-semibold text-slate-200 transition-colors group-hover:text-[#FF6500] group-hover:underline">
            {problem.title}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {problem.tags.map((tag) => (
              <span key={tag} className="rounded-md bg-slate-700 px-2 py-0.5 text-xs font-medium text-slate-300">
                {tag}
              </span>
            ))}
          </div>
        </div>
        {/* Column 2: Difficulty */}
        <div className="col-span-12 md:col-span-4 md:text-right">
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${style.text} ${style.bg}`}>
                {problem.difficulty}
            </span>
        </div>
      </div>
    </Link>
  );
};

// A skeleton loader to improve perceived performance
const SkeletonLoader = () => (
  <div className="space-y-4">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="h-24 animate-pulse rounded-lg border border-slate-700/80 bg-slate-800/40 p-4">
        <div className="mb-4 h-6 w-3/4 rounded bg-slate-700"></div>
        <div className="flex gap-2">
          <div className="h-4 w-20 rounded bg-slate-700"></div>
          <div className="h-4 w-24 rounded bg-slate-700"></div>
        </div>
      </div>
    ))}
  </div>
);

export default function ProblemsListPage() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTag, setSelectedTag] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(15);

  const fetchProblems = useCallback(() => {
    setLoading(true);
    setError(null);
    axios.get("/api/problems/getAllProblem")
      .then((res) => {
        setProblems(res.data);
      })
      .catch((err) => {
        setError("Failed to fetch problems. Please try again later.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchProblems();
  }, [fetchProblems]);

  const handleTagChange = (tag) => {
    setSelectedTag(tag);
    setPage(1);
  };

  const allTags = Array.from(new Set(problems.flatMap((p) => p.tags || [])));
  const filtered = selectedTag ? problems.filter((p) => p.tags.includes(selectedTag)) : problems;
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(filtered.length / pageSize);

  const renderContent = () => {
    if (loading) {
      return <SkeletonLoader />;
    }
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center rounded-lg bg-slate-800/60 p-10 text-center">
          <TriangleAlert className="mb-4 h-12 w-12 text-red-500" />
          <h3 className="text-xl font-semibold text-slate-100">An Error Occurred</h3>
          <p className="text-red-400">{error}</p>
          <button
            onClick={fetchProblems}
            className="mt-6 rounded-md bg-[#FF6500] px-5 py-2 font-semibold text-white transition-transform hover:scale-105"
          >
            Try Again
          </button>
        </div>
      );
    }
    if (paginated.length > 0) {
      return (
        <>
            {/* Header for the list - hidden on mobile */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-4 mb-2 text-sm font-semibold text-slate-500">
                <div className="col-span-8">TITLE</div>
                <div className="col-span-4 text-right">DIFFICULTY</div>
            </div>
            <div className="space-y-4">
                {paginated.map((problem, index) => (
                    <ProblemRow key={problem.id} problem={problem} index={index} />
                ))}
            </div>
        </>
      );
    }
    return (
      <div className="flex flex-col items-center justify-center rounded-lg bg-slate-800/60 p-10 text-center">
        <SearchX className="mb-4 h-12 w-12 text-slate-500" />
        <h3 className="text-xl font-semibold text-slate-100">No Problems Found</h3>
        <p className="text-slate-400">Try selecting a different filter or clear the current one.</p>
        <button
            onClick={() => handleTagChange("")}
            className="mt-6 rounded-md bg-slate-700 px-5 py-2 font-semibold text-white transition-transform hover:scale-105"
        >
            Clear Filter
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0a192f] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] px-4 py-12 text-slate-300 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-100 md:text-5xl">Problem Set</h1>
        <p className="mt-4 text-lg text-slate-400">Filter by topic to find your next challenge.</p>
        
        {/* Filter Tags */}
        <div className="my-8 flex flex-wrap gap-2">
          <button
            onClick={() => handleTagChange("")}
            className={`cursor-pointer rounded-full px-4 py-1.5 text-sm font-semibold transition-all duration-300 ${!selectedTag ? "bg-[#FF6500] text-white shadow-md shadow-orange-500/20" : "bg-slate-800/60 text-slate-300 hover:bg-slate-700/80"}`}
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => handleTagChange(tag)}
              className={`cursor-pointer rounded-full px-4 py-1.5 text-sm font-semibold transition-all duration-300 ${selectedTag === tag ? "bg-[#FF6500] text-white shadow-md shadow-orange-500/20" : "bg-slate-800/60 text-slate-300 hover:bg-slate-700/80"}`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        {renderContent()}

        {/* Pagination */}
        {totalPages > 1 && !loading && !error && (
            <div className="mt-10 flex items-center justify-center gap-4">
            <button
                className="flex cursor-pointer items-center gap-2 rounded-md bg-slate-800/60 px-4 py-2 font-semibold text-slate-300 transition-all hover:bg-slate-700/80 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
            >
                <ChevronLeft size={16} />
                Prev
            </button>
            <span className="font-medium text-slate-400">
                Page {page} of {totalPages}
            </span>
            <button
                className="flex cursor-pointer items-center gap-2 rounded-md bg-slate-800/60 px-4 py-2 font-semibold text-slate-300 transition-all hover:bg-slate-700/80 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
            >
                Next
                <ChevronRight size={16} />
            </button>
            </div>
        )}
      </div>
    </div>
  );
}