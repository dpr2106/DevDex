"use client";

import { useState } from "react";
import { Search, Swords, Trophy, Skull, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const GithubIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.2c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
    <path d="M9 18c-4.51 2-5-2-7-2"/>
  </svg>
);

export default function Battle() {
  const [user1, setUser1] = useState("");
  const [user2, setUser2] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");

  const startBattle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user1.trim() || !user2.trim()) return;

    setLoading(true);
    setError("");
    setData(null);

    try {
      const response = await fetch(`http://localhost:8000/api/battle/${user1}/${user2}`);
      if (!response.ok) throw new Error("Could not fetch or analyze these profiles.");
      const result = await response.json();
      setData(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#050505] text-neutral-200 font-sans selection:bg-red-500/30 overflow-x-hidden relative">
      
      {/* Fiery Ambient Glows */}
      <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-red-600/10 blur-[150px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-orange-600/10 blur-[150px] pointer-events-none" />

      {/* Sleek Minimal Navbar */}
      <header className="sticky top-0 z-50 bg-[#050505]/70 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 cursor-pointer group">
          <div className="p-2 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg shadow-[0_0_15px_rgba(239,68,68,0.4)] group-hover:shadow-[0_0_25px_rgba(239,68,68,0.6)] transition-shadow">
            <Swords className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white hidden sm:block">GitScope AI Battles</span>
        </Link>
        <Link href="/" className="text-neutral-400 hover:text-white flex items-center gap-2 text-sm transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </header>

      <div className="p-6 md:p-12 max-w-7xl mx-auto relative z-10">
        
        {/* Battle Setup */}
        {!data && !loading && (
          <div className="flex flex-col items-center justify-center mt-20 md:mt-32">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="text-center mb-16">
              <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-6 bg-gradient-to-br from-white to-neutral-400 bg-clip-text text-transparent uppercase italic">
                Developer <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">Kombat</span>
              </h1>
              <p className="text-neutral-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                Pit two developers against each other in a ruthless AI analysis of their codebase, complexity, and commit habits.
              </p>
            </motion.div>

            <form onSubmit={startBattle} className="w-full max-w-4xl relative">
              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 items-center">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-red-900 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
                  <div className="relative flex items-center bg-[#0a0a0a] border border-white/10 rounded-2xl p-2 shadow-2xl">
                    <Search className="text-red-400 w-6 h-6 ml-4" />
                    <input
                      type="text"
                      value={user1}
                      onChange={(e) => setUser1(e.target.value)}
                      placeholder="Player 1 GitHub..."
                      className="w-full bg-transparent border-none py-4 px-4 text-white text-lg placeholder:text-neutral-600 focus:outline-none"
                    />
                  </div>
                </div>
                
                <div className="flex justify-center">
                  <span className="text-4xl font-black text-white/20 italic uppercase">VS</span>
                </div>

                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-orange-900 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
                  <div className="relative flex items-center bg-[#0a0a0a] border border-white/10 rounded-2xl p-2 shadow-2xl">
                    <Search className="text-orange-400 w-6 h-6 ml-4" />
                    <input
                      type="text"
                      value={user2}
                      onChange={(e) => setUser2(e.target.value)}
                      placeholder="Player 2 GitHub..."
                      className="w-full bg-transparent border-none py-4 px-4 text-white text-lg placeholder:text-neutral-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-12 flex justify-center">
                <button 
                  type="submit"
                  disabled={loading || !user1.trim() || !user2.trim()}
                  className="bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white font-black uppercase tracking-widest rounded-xl px-12 py-4 transition-all disabled:opacity-50 text-lg shadow-[0_0_30px_rgba(239,68,68,0.4)] hover:shadow-[0_0_50px_rgba(239,68,68,0.6)] transform hover:scale-105"
                >
                  FIGHT!
                </button>
              </div>
              {error && <p className="text-red-400 mt-8 text-sm text-center bg-red-500/10 py-3 rounded-lg border border-red-500/20">{error}</p>}
            </form>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="relative w-32 h-32 mb-8">
              <div className="absolute inset-0 border-4 border-white/5 rounded-full" />
              <div className="absolute inset-0 border-4 border-red-500 rounded-full border-t-transparent animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Swords className="w-12 h-12 text-red-500 animate-pulse" />
              </div>
            </div>
            <p className="text-red-400 font-black text-xl tracking-widest uppercase animate-pulse">Analyzing Combatants...</p>
          </div>
        )}

        {/* Battle Results */}
        <AnimatePresence>
          {data && !loading && (() => {
            const winnerStr = (data.battle?.winner || "").toLowerCase();
            const p1Username = (data.player1?.github_username || "").toLowerCase();
            const p1Name = (data.player1?.raw_profile?.name || "").toLowerCase();
            const p2Username = (data.player2?.github_username || "").toLowerCase();
            const p2Name = (data.player2?.raw_profile?.name || "").toLowerCase();
            
            const isP1Winner = winnerStr && (winnerStr === p1Username || winnerStr === p1Name);
            const isP2Winner = winnerStr && (winnerStr === p2Username || winnerStr === p2Name);

            return (
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
              className="w-full"
            >
              {/* Verdict Header */}
              <div className="text-center mb-16 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-40 bg-red-600/30 blur-[120px] z-0 animate-pulse" />
                <h2 className="text-[5rem] md:text-[7rem] font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-red-300 to-red-600 uppercase italic tracking-tighter drop-shadow-[0_0_25px_rgba(239,68,68,1)] relative z-10 animate-pulse">
                  {data.battle.verdict_title}
                </h2>
                <div className="mt-8 inline-block bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-6 max-w-3xl relative z-10">
                  <p className="text-neutral-200 text-lg leading-relaxed">
                    {data.battle.battle_summary}
                  </p>
                </div>
              </div>

              {/* Split Screen Fighters */}
              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-8 items-stretch">
                
                {/* Player 1 */}
                <div className={`bg-gradient-to-br ${isP1Winner ? 'from-amber-500/20 border-amber-500/50 shadow-[0_0_50px_rgba(245,158,11,0.2)]' : 'from-red-900/20 border-red-900/50 grayscale opacity-70'} to-transparent backdrop-blur-md border rounded-3xl p-8 flex flex-col items-center text-center transition-all relative overflow-hidden`}>
                  {isP1Winner ? (
                    <Trophy className="absolute top-6 right-6 w-8 h-8 text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
                  ) : (
                    <Skull className="absolute top-6 right-6 w-8 h-8 text-neutral-600" />
                  )}
                  <img src={data.player1.raw_profile?.avatar_url || "/api/placeholder/150/150"} alt="P1 Avatar" className="w-32 h-32 rounded-full mb-6 border-4 border-white/10 shadow-2xl relative z-10" />
                  <h3 className="text-3xl font-black text-white mb-2">{data.player1.raw_profile?.name || data.player1.github_username}</h3>
                  <p className="text-neutral-400 font-mono mb-8">@{data.player1.github_username}</p>
                  
                  <div className="w-full bg-black/60 rounded-xl p-5 border border-red-500/20 mb-6 relative overflow-hidden group">
                    {isP1Winner && <div className="absolute inset-0 bg-red-600/10 animate-pulse" />}
                    <p className="text-[10px] text-red-500/80 font-mono tracking-[0.3em] mb-2 relative z-10">COMBAT RATING</p>
                    <div className="text-6xl font-black text-white relative z-10 font-mono tracking-tighter drop-shadow-[0_0_20px_rgba(239,68,68,0.5)] group-hover:scale-105 transition-transform">
                      {isP1Winner ? data.battle.winner_power_level : data.battle.loser_power_level}
                    </div>
                  </div>

                  <div className="w-full text-left bg-black/40 rounded-xl p-5 border border-white/5 mt-auto">
                    <p className={`text-[10px] font-mono tracking-widest mb-2 ${isP1Winner ? 'text-amber-400' : 'text-neutral-500'}`}>
                      {isP1Winner ? 'SIGNATURE MOVE' : 'FATAL FLAW'}
                    </p>
                    <p className="text-sm text-neutral-300 font-mono leading-relaxed">{isP1Winner ? (data.battle.stat_comparison?.winner_advantage || "Superior coding habits") : (data.battle.stat_comparison?.loser_weakness || "Skill issue")}</p>
                  </div>
                </div>

                {/* VS Divider */}
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="w-px h-full bg-gradient-to-b from-transparent via-red-500/80 to-transparent" />
                  <div className="bg-[#050505] p-5 rounded-full border border-red-500/40 z-10 my-4 shadow-[0_0_30px_rgba(239,68,68,0.4)] animate-pulse">
                    <Swords className="w-10 h-10 text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,1)]" />
                  </div>
                  <div className="w-px h-full bg-gradient-to-b from-transparent via-red-500/80 to-transparent" />
                </div>

                {/* Player 2 */}
                <div className={`bg-gradient-to-br ${isP2Winner ? 'from-amber-500/20 border-amber-500/50 shadow-[0_0_50px_rgba(245,158,11,0.2)]' : 'from-red-900/20 border-red-900/50 grayscale opacity-70'} to-transparent backdrop-blur-md border rounded-3xl p-8 flex flex-col items-center text-center transition-all relative overflow-hidden`}>
                  {isP2Winner ? (
                    <Trophy className="absolute top-6 right-6 w-8 h-8 text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
                  ) : (
                    <Skull className="absolute top-6 right-6 w-8 h-8 text-neutral-600" />
                  )}
                  <img src={data.player2.raw_profile?.avatar_url || "/api/placeholder/150/150"} alt="P2 Avatar" className="w-32 h-32 rounded-full mb-6 border-4 border-white/10 shadow-2xl relative z-10" />
                  <h3 className="text-3xl font-black text-white mb-2">{data.player2.raw_profile?.name || data.player2.github_username}</h3>
                  <p className="text-neutral-400 font-mono mb-8">@{data.player2.github_username}</p>
                  
                  <div className="w-full bg-black/60 rounded-xl p-5 border border-red-500/20 mb-6 relative overflow-hidden group">
                    {isP2Winner && <div className="absolute inset-0 bg-red-600/10 animate-pulse" />}
                    <p className="text-[10px] text-red-500/80 font-mono tracking-[0.3em] mb-2 relative z-10">COMBAT RATING</p>
                    <div className="text-6xl font-black text-white relative z-10 font-mono tracking-tighter drop-shadow-[0_0_20px_rgba(239,68,68,0.5)] group-hover:scale-105 transition-transform">
                      {isP2Winner ? data.battle.winner_power_level : data.battle.loser_power_level}
                    </div>
                  </div>

                  <div className="w-full text-left bg-black/40 rounded-xl p-5 border border-white/5 mt-auto">
                    <p className={`text-[10px] font-mono tracking-widest mb-2 ${isP2Winner ? 'text-amber-400' : 'text-neutral-500'}`}>
                      {isP2Winner ? 'SIGNATURE MOVE' : 'FATAL FLAW'}
                    </p>
                    <p className="text-sm text-neutral-300 font-mono leading-relaxed">{isP2Winner ? (data.battle.stat_comparison?.winner_advantage || "Superior coding habits") : (data.battle.stat_comparison?.loser_weakness || "Skill issue")}</p>
                  </div>
                </div>

              </div>

              {/* Fatal Blow Footer */}
              <div className="mt-16 text-center">
                <p className="text-purple-400 font-black text-xl uppercase tracking-widest mb-4">MATCH VERDICT</p>
                <p className="text-3xl text-neutral-300 italic">"{data.battle.fatal_blow}"</p>
              </div>

              <div className="mt-16 flex justify-center pb-12">
                <button 
                  onClick={() => setData(null)}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl px-8 py-3 transition-colors text-sm"
                >
                  Battle Again
                </button>
              </div>

              <footer className="py-4 mt-8 text-center text-xs text-neutral-500 font-mono w-full border-t border-white/5 bg-transparent">
                ⚠️ Note: These comparisons are generated by AI and are for informational purposes only. They may not be 100% accurate.
              </footer>
            </motion.div>
            );
          })()}
        </AnimatePresence>
      </div>
    </main>
  );
}
