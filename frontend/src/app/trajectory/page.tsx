"use client";

import { useState } from "react";
import { Search, ArrowLeft, Hourglass, FastForward, CheckCircle2, History, TrendingUp, Code2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import ParticleNetwork from "../../components/ParticleNetwork";

export default function CareerTrajectory() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");

  const analyzeTrajectory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError("Please enter a valid GitHub username");
      return;
    }

    setLoading(true);
    setError("");
    setData(null);

    try {
      const response = await fetch(`http://localhost:8000/api/trajectory`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim() })
      });

      if (!response.ok) throw new Error("Could not analyze career trajectory.");
      const result = await response.json();
      setData(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#050505] text-neutral-200 font-sans selection:bg-purple-500/30 overflow-x-hidden relative">
      <ParticleNetwork />
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/10 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-pink-600/10 blur-[120px] pointer-events-none" />

      <header className="sticky top-0 z-50 bg-[#050505]/70 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 cursor-pointer group">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg shadow-[0_0_15px_rgba(168,85,247,0.4)] group-hover:shadow-[0_0_25px_rgba(168,85,247,0.6)] transition-shadow">
            <ArrowLeft className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white hidden sm:block">Back to Dashboard</span>
        </Link>
      </header>

      <div className="p-6 md:p-12 max-w-5xl mx-auto relative z-10">
        
        {!data && !loading && (
          <div className="flex flex-col items-center justify-center mt-10 md:mt-20">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
              <div className="inline-flex items-center justify-center p-4 bg-purple-500/10 rounded-full mb-6 border border-purple-500/20">
                <History className="w-10 h-10 text-purple-400" />
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                Career Trajectory Timeline
              </h1>
              <p className="text-neutral-400 text-lg max-w-xl mx-auto leading-relaxed">
                Travel back in time. Analyze how a developer's architecture choices, languages, and technical maturity have evolved from their oldest repos to today.
              </p>
            </motion.div>

            <form onSubmit={analyzeTrajectory} className="w-full max-w-xl bg-white/[0.02] border border-white/10 rounded-3xl p-8 backdrop-blur-md shadow-2xl">
              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="GitHub Username"
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white text-lg focus:outline-none focus:border-purple-500/50 transition-colors"
                />
              </div>

              <button 
                type="submit"
                disabled={loading || !username.trim()}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl py-4 transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)]"
              >
                Generate Growth Story
              </button>
              {error && <p className="text-red-400 mt-4 text-sm text-center bg-red-500/10 py-2 rounded-lg border border-red-500/20">{error}</p>}
            </form>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="relative w-24 h-24 mb-8">
              <div className="absolute inset-0 border-4 border-white/5 rounded-full" />
              <div className="absolute inset-0 border-4 border-purple-500 rounded-full border-t-transparent animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Hourglass className="w-8 h-8 text-purple-400 animate-pulse" />
              </div>
            </div>
            <p className="text-purple-400 font-mono text-sm tracking-widest uppercase animate-pulse">Analyzing Time-Series Data...</p>
          </div>
        )}

        {data && !loading && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
            
            <div className="flex flex-col items-center justify-center text-center mb-12">
              <img src={data.avatar_url} alt={data.username} className="w-24 h-24 rounded-full border-4 border-purple-500/30 mb-6 shadow-[0_0_20px_rgba(168,85,247,0.3)]" />
              <h2 className="text-sm font-bold text-purple-400 tracking-widest uppercase mb-2">Evolution of</h2>
              <h1 className="text-4xl md:text-5xl font-black text-white">@{data.username}</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Early Stack */}
              <div className="bg-gradient-to-br from-neutral-800/50 to-neutral-900/50 border border-white/10 rounded-3xl p-8 backdrop-blur-md">
                <p className="text-neutral-400 text-xs uppercase tracking-widest mb-6 flex items-center gap-2">
                  <History className="w-4 h-4" /> The Early Days
                </p>
                <div className="flex flex-wrap gap-2">
                  {data.insights.early_days_stack.map((lang: string, i: number) => (
                    <span key={i} className="bg-neutral-800 border border-neutral-700 text-neutral-300 px-3 py-1 rounded-full text-sm font-bold">
                      {lang}
                    </span>
                  ))}
                  {data.insights.early_days_stack.length === 0 && (
                    <span className="text-neutral-500 text-sm italic">Data not available</span>
                  )}
                </div>
              </div>

              {/* Current Stack */}
              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-3xl p-8 backdrop-blur-md shadow-[0_0_30px_rgba(168,85,247,0.1)]">
                <p className="text-purple-400 text-xs uppercase tracking-widest mb-6 flex items-center gap-2">
                  <FastForward className="w-4 h-4" /> Current Arsenal
                </p>
                <div className="flex flex-wrap gap-2">
                  {data.insights.current_stack.map((lang: string, i: number) => (
                    <span key={i} className="bg-purple-500/20 border border-purple-500/30 text-purple-200 px-3 py-1 rounded-full text-sm font-bold">
                      {lang}
                    </span>
                  ))}
                </div>
              </div>

              {/* Growth Summary */}
              <div className="md:col-span-2 bg-white/[0.02] border border-white/10 rounded-3xl p-8 backdrop-blur-md relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-[80px] group-hover:bg-purple-500/10 transition-colors" />
                <p className="text-purple-400 text-xs uppercase tracking-widest mb-6 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" /> The Growth Story
                </p>
                <p className="text-neutral-300 leading-relaxed text-lg whitespace-pre-line relative z-10 italic border-l-4 border-purple-500/30 pl-6">
                  "{data.insights.growth_summary}"
                </p>
              </div>

            </div>

            {/* Vertical Timeline */}
            <div className="mt-16 relative">
              <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500/50 via-pink-500/50 to-transparent -translate-x-1/2"></div>
              
              <div className="space-y-12">
                {data.insights.milestones.map((milestone: any, i: number) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    key={i} 
                    className={`relative flex items-center justify-between md:justify-normal group ${i % 2 === 0 ? "md:flex-row-reverse" : ""}`}
                  >
                    
                    <div className="absolute left-4 md:left-1/2 w-4 h-4 rounded-full bg-[#050505] border-4 border-purple-500 -translate-x-1/2 shadow-[0_0_10px_rgba(168,85,247,0.5)] group-hover:scale-150 group-hover:bg-purple-500 transition-all z-10"></div>
                    
                    <div className="hidden md:block w-5/12"></div>
                    
                    <div className="w-full pl-12 md:pl-0 md:w-5/12">
                      <div className={`p-6 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-sm hover:bg-white/[0.04] transition-colors ${i % 2 === 0 ? "md:text-right" : "md:text-left"}`}>
                        <span className="text-purple-400 font-black text-xl mb-2 block">{milestone.year}</span>
                        <h3 className="text-white font-bold text-lg mb-2">{milestone.title}</h3>
                        <p className="text-neutral-400 text-sm leading-relaxed">{milestone.description}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

          </motion.div>
        )}
      </div>
    </main>
  );
}
