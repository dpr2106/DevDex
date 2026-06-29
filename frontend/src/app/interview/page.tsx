"use client";

import { useState } from "react";
import { Search, ArrowLeft, Terminal, Cpu, FileCode2, ChevronDown, ChevronUp, UserCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import ParticleNetwork from "../../components/ParticleNetwork";

export default function TailoredInterview() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");
  const [expandedQ, setExpandedQ] = useState<number | null>(null);

  const generateInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError("Please enter a valid GitHub username");
      return;
    }

    setLoading(true);
    setError("");
    setData(null);
    setExpandedQ(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/interview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim() })
      });

      if (!response.ok) throw new Error("Could not generate interview. Ensure the user exists.");
      const result = await response.json();
      setData(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#050505] text-neutral-200 font-sans selection:bg-blue-500/30 overflow-x-hidden relative">
      <ParticleNetwork />
      <div className="fixed top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-600/10 blur-[120px] pointer-events-none" />

      <header className="sticky top-0 z-50 bg-[#050505]/70 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 cursor-pointer group">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg shadow-[0_0_15px_rgba(59,130,246,0.4)] group-hover:shadow-[0_0_25px_rgba(59,130,246,0.6)] transition-shadow">
            <ArrowLeft className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white hidden sm:block">Back to Dashboard</span>
        </Link>
      </header>

      <div className="p-6 md:p-12 max-w-5xl mx-auto relative z-10 pb-32">
        
        {!data && !loading && (
          <div className="flex flex-col items-center justify-center mt-10 md:mt-20">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
              <div className="inline-flex items-center justify-center p-4 bg-blue-500/10 rounded-full mb-6 border border-blue-500/20">
                <FileCode2 className="w-10 h-10 text-blue-400" />
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4 bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent">
                Tailored Interview Generator
              </h1>
              <p className="text-neutral-400 text-lg max-w-xl mx-auto leading-relaxed">
                Generate highly specific, brutal technical interview questions based exactly on a candidate's GitHub repositories and architectural choices.
              </p>
            </motion.div>

            <form onSubmit={generateInterview} className="w-full max-w-xl bg-white/[0.02] border border-white/10 rounded-3xl p-8 backdrop-blur-md shadow-2xl">
              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Candidate's GitHub Username"
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white text-lg focus:outline-none focus:border-blue-500/50 transition-colors"
                />
              </div>

              <button 
                type="submit"
                disabled={loading || !username.trim()}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-xl py-4 transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)]"
              >
                Generate Interview Kit
              </button>
              {error && <p className="text-red-400 mt-4 text-sm text-center bg-red-500/10 py-2 rounded-lg border border-red-500/20">{error}</p>}
            </form>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="relative w-24 h-24 mb-8">
              <div className="absolute inset-0 border-4 border-white/5 rounded-full" />
              <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Cpu className="w-8 h-8 text-blue-400 animate-pulse" />
              </div>
            </div>
            <p className="text-blue-400 font-mono text-sm tracking-widest uppercase animate-pulse">Analyzing Codebase Context...</p>
          </div>
        )}

        {data && !loading && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
            
            {/* Candidate Summary Header */}
            <div className="flex flex-col md:flex-row items-center gap-8 bg-gradient-to-br from-blue-900/20 to-transparent border border-blue-500/20 rounded-3xl p-8 backdrop-blur-md relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px]" />
              
              <img src={data.avatar_url} alt={data.username} className="w-32 h-32 rounded-full border-4 border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.3)] relative z-10" />
              
              <div className="text-center md:text-left relative z-10">
                <p className="text-blue-400 text-xs uppercase tracking-widest mb-2 flex items-center justify-center md:justify-start gap-2">
                  <UserCheck className="w-4 h-4" /> Candidate Profile
                </p>
                <h1 className="text-4xl font-black text-white mb-4">@{data.username}</h1>
                <p className="text-neutral-300 leading-relaxed text-lg italic border-l-4 border-blue-500/50 pl-4">
                  "{data.insights.candidate_summary}"
                </p>
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-6">
              <h2 className="text-2xl font-black text-white flex items-center gap-3">
                <Terminal className="w-6 h-6 text-blue-400" />
                Technical Interview Questions
              </h2>
              
              {data.insights.questions.map((q: any, i: number) => (
                <div key={i} className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm hover:border-white/20 transition-colors">
                  
                  {/* Question Header (Always Visible) */}
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center font-black text-lg border border-blue-500/30">
                        {i + 1}
                      </div>
                      <div className="flex-grow">
                        <h3 className="text-xl font-bold text-white mb-2 leading-snug">{q.question}</h3>
                        <p className="text-neutral-400 text-sm italic">Why ask this: {q.why_ask_this}</p>
                      </div>
                    </div>
                  </div>

                  {/* Toggle Button */}
                  <button 
                    onClick={() => setExpandedQ(expandedQ === i ? null : i)}
                    className="w-full bg-blue-900/20 hover:bg-blue-900/40 border-t border-white/5 py-3 flex items-center justify-center gap-2 text-blue-400 text-sm font-bold uppercase tracking-widest transition-colors"
                  >
                    {expandedQ === i ? (
                      <><ChevronUp className="w-4 h-4" /> Hide Expected Answer</>
                    ) : (
                      <><ChevronDown className="w-4 h-4" /> Show Expected Answer</>
                    )}
                  </button>

                  {/* Expected Answer (Hidden by default) */}
                  <AnimatePresence>
                    {expandedQ === i && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-[#0a0a0a] border-t border-white/5 overflow-hidden"
                      >
                        <div className="p-6 pl-20">
                          <p className="text-emerald-400 text-xs uppercase tracking-widest mb-2 font-bold">What to listen for:</p>
                          <p className="text-neutral-300 leading-relaxed text-sm whitespace-pre-line border-l-2 border-emerald-500/50 pl-4">
                            {q.expected_answer_concepts}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>
              ))}
            </div>

          </motion.div>
        )}
      </div>
    </main>
  );
}
