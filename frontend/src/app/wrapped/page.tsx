"use client";

import { useState } from "react";
import { Search, ArrowLeft, Flame, Play, Volume2, Star, GitCommit, Code2, Headphones } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import ParticleNetwork from "../../components/ParticleNetwork";

export default function GithubWrapped() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);

  const generateWrapped = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError("Please enter a valid GitHub username");
      return;
    }

    setLoading(true);
    setError("");
    setData(null);
    setCurrentSlide(0);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/wrapped`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim() })
      });

      if (!response.ok) throw new Error("Could not generate Wrapped. Ensure the user exists.");
      const result = await response.json();
      setData(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = () => {
    if (currentSlide < 4) setCurrentSlide(currentSlide + 1);
  };

  const prevSlide = () => {
    if (currentSlide > 0) setCurrentSlide(currentSlide - 1);
  };

  return (
    <main className="min-h-screen bg-[#050505] text-neutral-200 font-sans selection:bg-pink-500/30 overflow-x-hidden relative flex flex-col">
      <ParticleNetwork />

      {/* Spotify-esque Gradient Blobs */}
      <div className="fixed top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-pink-600/20 blur-[150px] pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-600/10 blur-[150px] pointer-events-none" />
      <div className="fixed top-[40%] left-[20%] w-[30%] h-[30%] rounded-full bg-purple-600/10 blur-[120px] pointer-events-none" />

      <header className="sticky top-0 z-50 bg-[#050505]/70 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 cursor-pointer group">
          <div className="p-2 bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg shadow-[0_0_15px_rgba(236,72,153,0.4)] group-hover:shadow-[0_0_25px_rgba(236,72,153,0.6)] transition-shadow">
            <ArrowLeft className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white hidden sm:block">Back to Dashboard</span>
        </Link>
      </header>

      <div className="flex-grow flex items-center justify-center p-6 md:p-12 relative z-10 w-full max-w-7xl mx-auto">

        {!data && !loading && (
          <div className="w-full max-w-2xl flex flex-col items-center justify-center">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center mb-12">
              <div className="inline-flex items-center justify-center p-5 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-full mb-6 border border-pink-500/30 shadow-[0_0_30px_rgba(236,72,153,0.2)]">
                <Headphones className="w-12 h-12 text-pink-400" />
              </div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4 bg-gradient-to-r from-emerald-400 via-pink-500 to-purple-500 bg-clip-text text-transparent drop-shadow-sm">
                GitHub Wrapped
              </h1>
              <p className="text-neutral-400 text-lg md:text-xl font-medium max-w-xl mx-auto leading-relaxed">
                Relive your year in code!!
              </p>
            </motion.div>

            <form onSubmit={generateWrapped} className="w-full bg-white/[0.03] border border-white/10 rounded-3xl p-8 backdrop-blur-md shadow-2xl">
              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-pink-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter GitHub Username"
                  className="w-full bg-black/50 border border-white/10 rounded-2xl py-5 pl-14 pr-4 text-white text-xl font-medium focus:outline-none focus:border-pink-500/50 transition-colors placeholder:text-neutral-600"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !username.trim()}
                className="w-full flex items-center justify-center gap-3 bg-white text-black font-black uppercase tracking-widest rounded-2xl py-5 transition-all disabled:opacity-50 hover:bg-neutral-200 hover:scale-[1.02] active:scale-95"
              >
                <Play className="w-5 h-5 fill-black" /> Play Your Wrapped
              </button>
              {error && <p className="text-red-400 mt-4 text-sm font-medium text-center bg-red-500/10 py-3 rounded-xl border border-red-500/20">{error}</p>}
            </form>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="relative w-32 h-32 mb-8">
              <div className="absolute inset-0 border-8 border-white/5 rounded-full" />
              <div className="absolute inset-0 border-8 border-pink-500 rounded-full border-t-transparent animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Volume2 className="w-10 h-10 text-pink-400 animate-pulse" />
              </div>
            </div>
            <p className="text-pink-400 font-black text-xl tracking-widest uppercase animate-pulse">Compiling Your Playlist...</p>
          </div>
        )}

        {data && !loading && (
          <div className="w-full h-[70vh] max-h-[800px] max-w-md mx-auto relative rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(236,72,153,0.3)] bg-[#121212] flex flex-col">

            {/* Progress Bars */}
            <div className="absolute top-4 left-4 right-4 flex gap-1 z-20">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="h-1 flex-grow bg-white/20 rounded-full overflow-hidden">
                  <div className={`h-full bg-white transition-all duration-300 ${i < currentSlide ? 'w-full' : i === currentSlide ? 'w-full animate-pulse' : 'w-0'}`} />
                </div>
              ))}
            </div>

            {/* Click Navigation Areas */}
            <div className="absolute inset-y-0 left-0 w-1/3 z-10 cursor-pointer" onClick={prevSlide} />
            <div className="absolute inset-y-0 right-0 w-2/3 z-10 cursor-pointer" onClick={nextSlide} />

            {/* Slides */}
            <AnimatePresence mode="wait">
              {currentSlide === 0 && (
                <motion.div
                  key="slide0"
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-gradient-to-br from-emerald-600 to-teal-900 p-8 flex flex-col justify-center items-center text-center"
                >
                  <img src={data.avatar_url} className="w-40 h-40 rounded-full mb-8 shadow-2xl border-4 border-white" alt="Avatar" />
                  <h2 className="text-5xl font-black text-white mb-4 tracking-tighter">Ready, {data.username}?</h2>
                  <p className="text-xl text-emerald-100 font-medium">Let's look back at your year in code.</p>
                  <p className="absolute bottom-8 text-white/50 text-sm font-bold tracking-widest uppercase animate-pulse">Tap right to continue</p>
                </motion.div>
              )}

              {currentSlide === 1 && (
                <motion.div
                  key="slide1"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="absolute inset-0 bg-gradient-to-br from-pink-600 to-rose-900 p-8 flex flex-col justify-center"
                >
                  <p className="text-pink-200 text-lg font-bold tracking-widest uppercase mb-4">The Vibe Check</p>
                  <h2 className="text-4xl font-black text-white leading-tight mb-8">
                    "{data.insights.vibe_check}"
                  </h2>
                  <div className="flex gap-4">
                    <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md">
                      <Star className="w-8 h-8 text-pink-300 mb-2" />
                      <p className="text-3xl font-black text-white">{data.stats.total_stars}</p>
                      <p className="text-xs text-pink-200 uppercase font-bold tracking-wider">Total Stars</p>
                    </div>
                    <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md">
                      <GitCommit className="w-8 h-8 text-pink-300 mb-2" />
                      <p className="text-3xl font-black text-white">{data.stats.total_commits}</p>
                      <p className="text-xs text-pink-200 uppercase font-bold tracking-wider">Total KB Written</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {currentSlide === 2 && (
                <motion.div
                  key="slide2"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="absolute inset-0 bg-gradient-to-br from-purple-600 to-indigo-900 p-8 flex flex-col justify-center"
                >
                  <p className="text-purple-200 text-lg font-bold tracking-widest uppercase mb-4">Your Top Track (Language)</p>
                  <div className="text-7xl font-black text-white mb-6 uppercase tracking-tighter">
                    {Object.keys(data.stats.languages)[0] || "Unknown"}
                  </div>
                  <h2 className="text-3xl font-black text-white leading-tight bg-black/20 p-6 rounded-3xl border border-white/10 backdrop-blur-md">
                    "{data.insights.top_language_roast}"
                  </h2>
                </motion.div>
              )}

              {currentSlide === 3 && (
                <motion.div
                  key="slide3"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-900 p-8 flex flex-col justify-center"
                >
                  <p className="text-orange-200 text-lg font-bold tracking-widest uppercase mb-4">Work/Life Balance</p>
                  <h2 className="text-4xl font-black text-white leading-tight mb-8">
                    "{data.insights.work_life_balance}"
                  </h2>
                  <div className="bg-white/10 p-6 rounded-3xl backdrop-blur-md border border-white/10">
                    <Code2 className="w-10 h-10 text-orange-300 mb-4" />
                    <p className="text-5xl font-black text-white mb-2">{data.stats.total_repos}</p>
                    <p className="text-sm text-orange-200 uppercase font-bold tracking-wider">Public Repositories</p>
                  </div>
                </motion.div>
              )}

              {currentSlide === 4 && (
                <motion.div
                  key="slide4"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-[#0a0a0a] p-8 flex flex-col justify-center items-center text-center border-4 border-emerald-500"
                >
                  <p className="text-emerald-400 text-sm font-bold tracking-widest uppercase mb-4">2026 Developer Persona</p>
                  <h2 className="text-6xl font-black text-white mb-8 bg-gradient-to-b from-white to-neutral-500 bg-clip-text text-transparent">
                    {data.insights.final_verdict}
                  </h2>
                  <div className="flex flex-wrap gap-2 justify-center mb-12">
                    {Object.keys(data.stats.languages).slice(0, 4).map((lang, i) => (
                      <span key={i} className="px-4 py-2 bg-emerald-500/20 text-emerald-300 rounded-full text-sm font-bold">
                        {lang}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => { setData(null); setCurrentSlide(0); }}
                    className="bg-white text-black font-black uppercase tracking-widest px-8 py-4 rounded-full hover:scale-105 transition-transform"
                  >
                    Wrap Again
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </main>
  );
}
