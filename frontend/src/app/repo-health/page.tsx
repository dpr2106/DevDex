"use client";

import { useState } from "react";
import { Activity, Search, ShieldAlert, Cpu, CheckCircle2, ArrowLeft, GitMerge } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import ParticleNetwork from "../../components/ParticleNetwork";

export default function RepoHealth() {
  const [repoPath, setRepoPath] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");

  const analyzeRepo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoPath.trim() || !repoPath.includes("/")) {
      setError("Please enter a valid format: owner/repository (e.g. facebook/react)");
      return;
    }

    setLoading(true);
    setError("");
    setData(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/repo-health`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repo_path: repoPath.trim() })
      });

      if (!response.ok) throw new Error("Could not analyze repository. Ensure it exists and is public.");
      const result = await response.json();
      setData(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 50) return "text-amber-400";
    return "text-red-400";
  };

  return (
    <main className="min-h-screen bg-[#050505] text-neutral-200 font-sans selection:bg-emerald-500/30 overflow-x-hidden relative">
      <ParticleNetwork />
      <div className="fixed top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-600/10 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-teal-600/10 blur-[120px] pointer-events-none" />

      <header className="sticky top-0 z-50 bg-[#050505]/70 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 cursor-pointer group">
          <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.4)] group-hover:shadow-[0_0_25px_rgba(16,185,129,0.6)] transition-shadow">
            <ArrowLeft className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white hidden sm:block">Back to Dashboard</span>
        </Link>
      </header>

      <div className="p-6 md:p-12 max-w-5xl mx-auto relative z-10">
        
        {!data && !loading && (
          <div className="flex flex-col items-center justify-center mt-10 md:mt-20">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
              <div className="inline-flex items-center justify-center p-4 bg-emerald-500/10 rounded-full mb-6 border border-emerald-500/20">
                <Activity className="w-10 h-10 text-emerald-400" />
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4 bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
                Repository Health Scanner
              </h1>
              <p className="text-neutral-400 text-lg max-w-xl mx-auto leading-relaxed">
                Evaluate a project's architecture, technical debt, and production readiness. Enter any public GitHub repository to generate an AI-powered health report.
              </p>
            </motion.div>

            <form onSubmit={analyzeRepo} className="w-full max-w-xl bg-white/[0.02] border border-white/10 rounded-3xl p-8 backdrop-blur-md shadow-2xl">
              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400" />
                <input
                  type="text"
                  value={repoPath}
                  onChange={(e) => setRepoPath(e.target.value)}
                  placeholder="owner/repo (e.g. facebook/react)"
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white text-lg focus:outline-none focus:border-emerald-500/50 transition-colors"
                />
              </div>

              <button 
                type="submit"
                disabled={loading || !repoPath.trim()}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl py-4 transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]"
              >
                Scan Architecture
              </button>
              {error && <p className="text-red-400 mt-4 text-sm text-center bg-red-500/10 py-2 rounded-lg border border-red-500/20">{error}</p>}
            </form>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="relative w-24 h-24 mb-8">
              <div className="absolute inset-0 border-4 border-white/5 rounded-full" />
              <div className="absolute inset-0 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <GitMerge className="w-8 h-8 text-emerald-400 animate-pulse" />
              </div>
            </div>
            <p className="text-emerald-400 font-mono text-sm tracking-widest uppercase animate-pulse">Scanning Codebase Architecture...</p>
          </div>
        )}

        {data && !loading && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            
            <div className="text-center mb-10">
              <h2 className="text-sm font-bold text-emerald-400 tracking-widest uppercase mb-2">Repository Audit</h2>
              <h1 className="text-4xl md:text-5xl font-black text-white">{data.repository}</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Production Readiness Score */}
              <div className="md:col-span-4 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-3xl p-8 backdrop-blur-md flex flex-col items-center justify-center text-center">
                <p className="text-emerald-400 text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Production Readiness
                </p>
                <div className={`text-7xl font-black ${getScoreColor(data.insights.production_readiness_score)}`}>
                  {data.insights.production_readiness_score}
                </div>
                <div className="text-sm text-neutral-400 mt-2 uppercase tracking-widest">Score / 100</div>
              </div>

              {/* Maintainability Index */}
              <div className="md:col-span-8 bg-white/[0.02] border border-white/10 rounded-3xl p-8 backdrop-blur-md">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`text-4xl font-black ${getScoreColor(data.insights.maintainability_index.score)}`}>
                    {data.insights.maintainability_index.score}
                  </div>
                  <div>
                    <h3 className="text-white font-bold">Maintainability Index</h3>
                    <p className="text-neutral-400 text-sm">{data.insights.maintainability_index.reasoning}</p>
                  </div>
                </div>
                <div className="w-full bg-white/5 rounded-full h-2 mt-4 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2 rounded-full" 
                    style={{ width: `${data.insights.maintainability_index.score}%` }}
                  />
                </div>
              </div>

              {/* Architecture Summary */}
              <div className="md:col-span-6 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 border border-blue-500/20 rounded-3xl p-8 backdrop-blur-md">
                <p className="text-blue-400 text-xs uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Cpu className="w-4 h-4" /> Architecture Summary
                </p>
                <p className="text-neutral-300 leading-relaxed text-sm whitespace-pre-line">
                  {data.insights.architecture_summary}
                </p>
              </div>

              {/* Tech Debt Warning */}
              <div className="md:col-span-6 bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-3xl p-8 backdrop-blur-md">
                <p className="text-red-400 text-xs uppercase tracking-widest mb-6 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4" /> Tech Debt & Risks
                </p>
                <p className="text-red-200 leading-relaxed text-sm whitespace-pre-line">
                  {data.insights.tech_debt_warning}
                </p>
              </div>

            </div>
          </motion.div>
        )}
      </div>
    </main>
  );
}
