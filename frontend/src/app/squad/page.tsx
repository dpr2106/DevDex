"use client";

import { useState } from "react";
import { Users, Search, Activity, Target, BrainCircuit, AlertTriangle, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import ParticleNetwork from "../../components/ParticleNetwork";

export default function SquadMode() {
  const [usernames, setUsernames] = useState<string[]>(["", "", ""]);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");

  const updateUsername = (index: number, value: string) => {
    const newUsernames = [...usernames];
    newUsernames[index] = value;
    setUsernames(newUsernames);
  };

  const addField = () => {
    if (usernames.length < 5) setUsernames([...usernames, ""]);
  };

  const removeField = (index: number) => {
    if (usernames.length > 2) {
      setUsernames(usernames.filter((_, i) => i !== index));
    }
  };

  const analyzeSquad = async (e: React.FormEvent) => {
    e.preventDefault();
    const validUsernames = usernames.filter(u => u.trim() !== "");
    if (validUsernames.length < 2) {
      setError("Please enter at least 2 usernames to form a squad.");
      return;
    }

    setLoading(true);
    setError("");
    setData(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/squad`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usernames: validUsernames })
      });

      if (!response.ok) throw new Error("Could not analyze this squad. Please check the usernames.");
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
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" />

      <header className="sticky top-0 z-50 bg-[#050505]/70 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 cursor-pointer group">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-[0_0_15px_rgba(59,130,246,0.4)] group-hover:shadow-[0_0_25px_rgba(59,130,246,0.6)] transition-shadow">
            <ArrowLeft className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white hidden sm:block">Back to Dashboard</span>
        </Link>
      </header>

      <div className="p-6 md:p-12 max-w-5xl mx-auto relative z-10">
        
        {!data && !loading && (
          <div className="flex flex-col items-center justify-center mt-10 md:mt-20">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
              <div className="inline-flex items-center justify-center p-4 bg-blue-500/10 rounded-full mb-6 border border-blue-500/20">
                <Users className="w-10 h-10 text-blue-400" />
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4 bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
                Team Synergy Analyzer
              </h1>
              <p className="text-neutral-400 text-lg max-w-xl mx-auto leading-relaxed">
                Build your engineering dream team. Enter up to 5 GitHub usernames to discover their collective strengths, missing technical gaps, and how their skills complement each other.
              </p>
            </motion.div>

            <form onSubmit={analyzeSquad} className="w-full max-w-xl bg-white/[0.02] border border-white/10 rounded-3xl p-8 backdrop-blur-md shadow-2xl">
              <div className="space-y-4 mb-6">
                <AnimatePresence>
                  {usernames.map((uname, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-3"
                    >
                      <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                        <input
                          type="text"
                          value={uname}
                          onChange={(e) => updateUsername(idx, e.target.value)}
                          placeholder={`Team Member ${idx + 1} (GitHub Username)`}
                          className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
                        />
                      </div>
                      {usernames.length > 2 && (
                        <button type="button" onClick={() => removeField(idx)} className="p-3 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-xl transition-colors">
                          ✕
                        </button>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {usernames.length < 5 && (
                <button type="button" onClick={addField} className="w-full py-3 mb-6 border border-dashed border-white/20 text-neutral-400 rounded-xl hover:border-blue-500/50 hover:text-blue-400 transition-colors text-sm font-bold flex items-center justify-center gap-2">
                  + Add Another Member
                </button>
              )}

              <button 
                type="submit"
                disabled={loading || usernames.filter(u => u.trim()).length < 2}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl py-4 transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)]"
              >
                Analyze Team Synergy
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
                <Users className="w-8 h-8 text-blue-400 animate-pulse" />
              </div>
            </div>
            <p className="text-blue-400 font-mono text-sm tracking-widest uppercase animate-pulse">Calculating Team Dynamics...</p>
          </div>
        )}

        {data && !loading && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            
            <div className="text-center mb-10">
              <h2 className="text-sm font-bold text-blue-400 tracking-widest uppercase mb-2">Team Overview</h2>
              <h1 className="text-4xl md:text-5xl font-black text-white">{data.insights.team_name}</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              <div className="md:col-span-12 flex flex-wrap justify-center gap-4 bg-white/[0.02] border border-white/10 rounded-3xl p-6 backdrop-blur-sm">
                {data.roster.map((member: string, i: number) => (
                  <div key={i} className="flex items-center gap-3 bg-[#0a0a0a] border border-white/5 px-4 py-2 rounded-full">
                    <img src={`https://github.com/${member}.png`} alt={member} className="w-8 h-8 rounded-full border border-blue-500/30" />
                    <span className="font-bold text-sm text-neutral-200">@{member}</span>
                  </div>
                ))}
              </div>

              <div className="md:col-span-8 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-3xl p-8 backdrop-blur-md relative overflow-hidden group">
                <p className="text-blue-400 text-xs uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Activity className="w-4 h-4" /> AI Synergy Report
                </p>
                <div className="flex items-center gap-4 mb-6">
                  <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                    {data.insights.synergy_score}
                  </div>
                  <div className="text-xs font-bold uppercase tracking-widest text-neutral-500">Synergy<br/>Score</div>
                </div>
                <p className="text-neutral-300 leading-relaxed text-sm whitespace-pre-line relative z-10">
                  {data.insights.synergy_report}
                </p>
              </div>

              <div className="md:col-span-4 space-y-6">
                <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-3xl p-8 backdrop-blur-md h-full">
                  <p className="text-red-400 text-xs uppercase tracking-widest mb-6 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> Missing Skills
                  </p>
                  <div className="space-y-3">
                    {data.insights.missing_skills.map((skill: string, i: number) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                        <Target className="w-4 h-4 text-red-400" />
                        <span className="text-sm font-bold text-red-200">{skill}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="md:col-span-12 bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20 rounded-3xl p-8 backdrop-blur-md">
                <p className="text-emerald-400 text-xs uppercase tracking-widest mb-8 flex items-center gap-2">
                  <BrainCircuit className="w-4 h-4" /> Combined Skill Matrix
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {data.insights.combined_skill_matrix.map((skill: any, i: number) => (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-3">
                        <span className="font-bold text-white">{skill.skill}</span>
                        <span className="text-emerald-300 font-mono bg-emerald-500/20 px-2 py-0.5 rounded-md text-[10px]">{skill.level}%</span>
                      </div>
                      <div className="w-full bg-emerald-500/10 rounded-full h-2 overflow-hidden border border-emerald-500/20">
                        <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" style={{ width: `${skill.level}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </div>
    </main>
  );
}
