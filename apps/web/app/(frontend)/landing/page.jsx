"use client";

import Link from "next/link";
// Step 1: Install lucide-react -> npm install lucide-react
// Import icons to make the feature cards more visually appealing
import { Code, BookHeart, MessageSquareQuote } from "lucide-react";

export default function LandingPage() {
  return (
    // Main container with a sophisticated gradient background for a modern feel
    <div className="min-h-screen bg-[#0a192f] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] text-slate-300">
      <main className="flex flex-col">
        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center px-4 md:px-8 py-20">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
            {/* Left side: Text content */}
            <div className="text-center md:text-left">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-slate-100 mb-6 leading-tight tracking-tight">
                Welcome to <span className="text-[#FF6500]">CODEHUB</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-xl mx-auto md:mx-0">
                The ultimate platform for coding enthusiasts to solve, contribute, and discuss algorithmic problems. Sharpen your skills, challenge yourself, and join a vibrant community.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Link
                  href="/problems"
                  className="bg-[#FF6500] text-white px-8 py-3 rounded-md font-bold text-lg hover:bg-orange-600 transition-all duration-300 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40"
                >
                  Solve Problems
                </Link>
                <Link
                  href="/contribute"
                  className="bg-white/10 border border-slate-700 text-slate-300 px-8 py-3 rounded-md font-bold text-lg backdrop-blur-sm hover:bg-white/20 hover:border-slate-500 transition-all duration-300"
                >
                  Contribute Problem
                </Link>
              </div>
            </div>

            {/* Right side: Visual element */}
            <div className="hidden md:flex justify-center items-center">
              {/* NOTE: I've corrected the image path. Files in /public are served from the root. */}
              {/* For an even better UI, consider an animated or 3D globe here. */}
              <img
                src="/globe.svg" // Corrected path
                alt="Codehub Globe"
                className="w-96 h-96 object-contain animate-pulse-slow drop-shadow-[0_0px_45px_rgba(255,101,0,0.3)]"
              />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 px-4 md:px-8">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-center text-4xl font-bold text-slate-100 mb-4">Everything You Need to Excel</h2>
            <p className="text-center text-slate-400 text-lg mb-12">One platform, endless possibilities.</p>
            
            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature Card 1: Solve */}
              <div className="bg-slate-800/40 p-8 rounded-xl border border-slate-700 backdrop-blur-sm transition-all duration-300 hover:border-orange-500/80 hover:-translate-y-2">
                <div className="bg-orange-500/10 text-[#FF6500] rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                  <Code size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-100 mb-2">Solve</h3>
                <p className="text-slate-400">Tackle a wide range of algorithmic and data structure problems, from easy to hard, and track your progress.</p>
              </div>

              {/* Feature Card 2: Contribute */}
              <div className="bg-slate-800/40 p-8 rounded-xl border border-slate-700 backdrop-blur-sm transition-all duration-300 hover:border-orange-500/80 hover:-translate-y-2">
                <div className="bg-orange-500/10 text-[#FF6500] rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                  <BookHeart size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-100 mb-2">Contribute</h3>
                <p className="text-slate-400">Share your own problems with the community, help others learn, and get recognized for your contributions.</p>
              </div>

              {/* Feature Card 3: Discuss */}
              <div className="bg-slate-800/40 p-8 rounded-xl border border-slate-700 backdrop-blur-sm transition-all duration-300 hover:border-orange-500/80 hover:-translate-y-2">
                <div className="bg-orange-500/10 text-[#FF6500] rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                  <MessageSquareQuote size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-100 mb-2">Discuss</h3>
                <p className="text-slate-400">Engage in discussions, share solutions, and learn new techniques from fellow coders worldwide.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="text-slate-500 text-center py-6 mt-auto border-t border-slate-800">
        © {new Date().getFullYear()} CODEHUB. All rights reserved.
      </footer>
    </div>
  );
}

// Add this to your tailwind.config.js to create the slow pulse animation for the globe
// /** @type {import('tailwindcss').Config} */
// module.exports = {
//   // ... other configs
//   theme: {
//     extend: {
//       animation: {
//         'pulse-slow': 'pulse 6s cubic-bezier(0.4, 0, 0.6, 1) infinite',
//       }
//     },
//   },
//   plugins: [],
// }