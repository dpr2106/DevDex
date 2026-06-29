"use client";

import { useState } from "react";
import { Search, ArrowLeft, Users, Network, TerminalSquare, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import ParticleNetwork from "../../components/ParticleNetwork";

const GithubIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.2c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
    <path d="M9 18c-4.51 2-5-2-7-2"/>
  </svg>
);

export default function OSSMatchmaker() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");

  const generateMatches = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError("Please enter a valid GitHub username");
      return;
    }

    setLoading(true);
    setError("");
    setData(null);

    try {
      const response = await fetch(`http://localhost:8000/api/matchmaker`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim() })
      });

      if (!response.ok) throw new Error("Could not generate matches. Ensure the user exists.");
      const result = await response.json();
      setData(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#050505] text-neutral-200 font-sans selection:bg-orange-500/30 overflow-x-hidden relative">
      <ParticleNetwork />
      <div className="fixed top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-orange-600/10 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-amber-600/10 blur-[120px] pointer-events-none" />

      <header className="sticky top-0 z-50 bg-[#050505]/70 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 cursor-pointer group">
          <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg shadow-[0_0_15px_rgba(249,115,22,0.4)] group-hover:shadow-[0_0_25px_rgba(249,115,22,0.6)] transition-shadow">
            <ArrowLeft className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white hidden sm:block">Back to Dashboard</span>
        </Link>
      </header>

      <div className="p-6 md:p-12 max-w-5xl mx-auto relative z-10 pb-32">
        
        {!data && !loading && (
          <div className="flex flex-col items-center justify-center mt-10 md:mt-20">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
              <div className="inline-flex items-center justify-center p-4 bg-orange-500/10 rounded-full mb-6 border border-orange-500/20">
                <Network className="w-10 h-10 text-orange-400" />
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4 bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">
                OSS Matchmaker
              </h1>
              <p className="text-neutral-400 text-lg max-w-xl mx-auto leading-relaxed">
                Discover the perfect open-source projects for you. We analyze your tech stack and coding habits to match you with active, high-quality repositories that need your skills.
              </p>
            </motion.div>

            <form onSubmit={generateMatches} className="w-full max-w-xl bg-white/[0.02] border border-white/10 rounded-3xl p-8 backdrop-blur-md shadow-2xl">
              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Your GitHub Username"
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white text-lg focus:outline-none focus:border-orange-500/50 transition-colors"
                />
              </div>

              <button 
                type="submit"
                disabled={loading || !username.trim()}
                className="w-full bg-gradient-to-r from-orange-600 to-amber-600 text-white font-bold rounded-xl py-4 transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_30px_rgba(249,115,22,0.5)]"
              >
                Find My OSS Matches
              </button>
              {error && <p className="text-red-400 mt-4 text-sm text-center bg-red-500/10 py-2 rounded-lg border border-red-500/20">{error}</p>}
            </form>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="relative w-24 h-24 mb-8">
              <div className="absolute inset-0 border-4 border-white/5 rounded-full" />
              <div className="absolute inset-0 border-4 border-orange-500 rounded-full border-t-transparent animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Users className="w-8 h-8 text-orange-400 animate-pulse" />
              </div>
            </div>
            <p className="text-orange-400 font-mono text-sm tracking-widest uppercase animate-pulse">Scouring the Open-Source Ecosystem...</p>
          </div>
        )}

        {data && !loading && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
            
            {/* Matchmaker Summary Header */}
            <div className="flex flex-col md:flex-row items-center gap-8 bg-gradient-to-br from-orange-900/20 to-transparent border border-orange-500/20 rounded-3xl p-8 backdrop-blur-md relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-[80px]" />
              
              <img src={data.avatar_url} alt={data.username} className="w-32 h-32 rounded-full border-4 border-orange-500/30 shadow-[0_0_20px_rgba(249,115,22,0.3)] relative z-10" />
              
              <div className="text-center md:text-left relative z-10">
                <p className="text-orange-400 text-xs uppercase tracking-widest mb-2 flex items-center justify-center md:justify-start gap-2">
                  <Network className="w-4 h-4" /> Match Analysis
                </p>
                <h1 className="text-4xl font-black text-white mb-4">@{data.username}</h1>
                <p className="text-neutral-300 leading-relaxed text-lg italic border-l-4 border-orange-500/50 pl-4">
                  "{data.insights.match_reasoning}"
                </p>
              </div>
            </div>

            {/* Recommendations List */}
            <div className="space-y-6">
              <h2 className="text-2xl font-black text-white flex items-center gap-3">
                <TerminalSquare className="w-6 h-6 text-orange-400" />
                Your Recommended Projects
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {data.insights.recommendations.map((rec: any, i: number) => (
                  <div key={i} className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm hover:border-orange-500/30 transition-colors flex flex-col h-full group">
                    
                    <div className="p-6 flex-grow">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <GithubIcon className="w-5 h-5 text-neutral-400" />
                          <p className="text-xs font-mono text-neutral-400 uppercase tracking-widest">{rec.language}</p>
                        </div>
                        <div className="w-8 h-8 bg-orange-500/10 rounded-full flex items-center justify-center border border-orange-500/20 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                          <ChevronRight className="w-4 h-4 text-orange-400 group-hover:text-white" />
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-bold text-white mb-3 break-all">{rec.project_name}</h3>
                      <p className="text-neutral-400 text-sm mb-6 line-clamp-3">{rec.description}</p>
                      
                      <div className="bg-[#0a0a0a] rounded-xl p-4 border border-white/5">
                        <p className="text-[10px] text-orange-400 uppercase tracking-widest mb-2 font-bold">Why you're a fit</p>
                        <p className="text-sm text-neutral-300 italic">"{rec.why_you}"</p>
                      </div>
                    </div>

                    <div className="p-4 bg-orange-900/20 border-t border-white/5 text-center">
                      <a 
                        href={`https://github.com/${rec.project_name}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-orange-400 text-sm font-bold tracking-widest uppercase hover:text-orange-300 transition-colors flex items-center justify-center gap-2"
                      >
                        View Repository
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </motion.div>
        )}
      </div>
    </main>
  );
}
