"use client";

import { useState, useEffect } from "react";
import { Search, Activity, Code, Code2, Star, Trophy, GitCommit, Terminal, Target, LineChart, BrainCircuit, BarChart3, ChevronRight, Flame, Swords, Users } from "lucide-react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import Link from "next/link";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, Tooltip, ResponsiveContainer } from "recharts";
import { GitHubCalendar } from "react-github-calendar";
import ParticleNetwork from "../components/ParticleNetwork";

const GithubIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.2c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
    <path d="M9 18c-4.51 2-5-2-7-2"/>
  </svg>
);

export default function Home() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const springX = useSpring(mouseX, { stiffness: 100, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 100, damping: 20 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX - 250);
      mouseY.set(e.clientY - 250);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  const analyzeProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setLoading(true);
    setError("");
    setData(null);

    try {
      const response = await fetch(`http://localhost:8000/api/analyze/${username}`);
      if (!response.ok) throw new Error("Could not fetch or analyze this profile.");
      const result = await response.json();
      
      const impactScore = result.developer_wrapped?.coding_demon_level || 50;
      result.radarData = [
        { subject: 'Complexity', A: Math.min(100, impactScore + 20), fullMark: 100 },
        { subject: 'Velocity', A: Math.max(10, impactScore - 10), fullMark: 100 },
        { subject: 'Consistency', A: 85, fullMark: 100 },
        { subject: 'Impact', A: Math.min(100, impactScore + 10), fullMark: 100 },
        { subject: 'Clean Code', A: Math.max(20, 100 - impactScore), fullMark: 100 },
      ];

      setData(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#050505] text-neutral-200 font-sans selection:bg-purple-500/30 overflow-x-hidden relative">
      
      {/* Vibrant Ambient Glows */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/10 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />
      <div className="fixed top-[40%] left-[60%] w-[30%] h-[30%] rounded-full bg-emerald-600/5 blur-[120px] pointer-events-none" />

      {/* Interactive Background */}
      <ParticleNetwork />

      {/* Animated Gradient Spotlight (Mouse Follower) */}
      <motion.div 
        className="fixed top-0 left-0 w-[500px] h-[500px] rounded-full pointer-events-none z-0 blur-[150px] opacity-40 mix-blend-screen bg-gradient-to-r from-purple-600/40 via-pink-600/30 to-blue-600/40"
        style={{
          x: springX,
          y: springY,
        }}
      />

      {/* Sleek Minimal Navbar */}
      <header className="sticky top-0 z-50 bg-[#050505]/70 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div 
          className="flex items-center gap-3 cursor-pointer group" 
          onClick={() => { setData(null); setUsername(""); setError(""); }}
        >
          <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg shadow-[0_0_15px_rgba(168,85,247,0.4)] group-hover:shadow-[0_0_25px_rgba(168,85,247,0.6)] transition-shadow">
            <GithubIcon className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white hidden sm:block">GitScope AI</span>
        </div>

        <div className="flex items-center gap-4">
          {data && (
            <>
              <form onSubmit={analyzeProfile} className="hidden md:flex items-center bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2 w-80 focus-within:border-purple-500/50 focus-within:shadow-[0_0_15px_rgba(168,85,247,0.2)] transition-all">
                <Search className="w-4 h-4 text-purple-400 mr-3" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Search another developer..."
                  className="bg-transparent border-none text-sm text-white focus:outline-none w-full placeholder:text-neutral-600"
                />
              </form>
              <Link href={`/resume/${data.github_username || data.raw_profile?.login || username}`} target="_blank" className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black uppercase tracking-widest rounded-xl px-4 py-2 transition-all text-xs shadow-[0_0_15px_rgba(16,185,129,0.4)] hover:shadow-[0_0_25px_rgba(16,185,129,0.6)] transform hover:scale-105">
                📄 Export Resume
              </Link>
            </>
          )}
          <Link href="/matchmaker" className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white font-black uppercase tracking-widest rounded-xl px-4 py-2 transition-all text-xs shadow-[0_0_15px_rgba(249,115,22,0.4)] hover:shadow-[0_0_25px_rgba(249,115,22,0.6)] transform hover:scale-105">
            <Users className="w-4 h-4" /> OSS Matchmaker
          </Link>
          <Link href="/interview" className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-black uppercase tracking-widest rounded-xl px-4 py-2 transition-all text-xs shadow-[0_0_15px_rgba(59,130,246,0.4)] hover:shadow-[0_0_25px_rgba(59,130,246,0.6)] transform hover:scale-105">
            <Code2 className="w-4 h-4" /> Tech Interview
          </Link>
          <Link href="/trajectory" className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 text-white font-black uppercase tracking-widest rounded-xl px-4 py-2 transition-all text-xs shadow-[0_0_15px_rgba(168,85,247,0.4)] hover:shadow-[0_0_25px_rgba(168,85,247,0.6)] transform hover:scale-105">
            <LineChart className="w-4 h-4" /> Career Timeline
          </Link>
          <Link href="/repo-health" className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black uppercase tracking-widest rounded-xl px-4 py-2 transition-all text-xs shadow-[0_0_15px_rgba(16,185,129,0.4)] hover:shadow-[0_0_25px_rgba(16,185,129,0.6)] transform hover:scale-105">
            <Activity className="w-4 h-4" /> Repo Health
          </Link>
          <Link href="/squad" className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-500 hover:to-indigo-400 text-white font-black uppercase tracking-widest rounded-xl px-4 py-2 transition-all text-xs shadow-[0_0_15px_rgba(59,130,246,0.4)] hover:shadow-[0_0_25px_rgba(59,130,246,0.6)] transform hover:scale-105">
            <Users className="w-4 h-4" /> Squad Mode
          </Link>
          <Link href="/battle" className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white font-black uppercase tracking-widest rounded-xl px-4 py-2 transition-all text-xs shadow-[0_0_15px_rgba(239,68,68,0.4)] hover:shadow-[0_0_25px_rgba(239,68,68,0.6)] transform hover:scale-105">
            <Swords className="w-4 h-4" /> Battle Mode
          </Link>
        </div>
      </header>

      {/* Main Content Wrapper */}
      <div className="p-6 md:p-12 max-w-7xl mx-auto relative z-10">
        
        {/* Empty State / Hero */}
        {!data && !loading && (
          <div className="flex flex-col items-center justify-center mt-20 md:mt-32 relative">
            
            {/* Floating Tech Icons */}
            <motion.div animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} className="absolute -left-12 md:left-10 top-10 opacity-40 blur-[1px]">
              <Code className="w-16 h-16 text-blue-400" />
            </motion.div>
            <motion.div animate={{ y: [0, 25, 0], rotate: [0, -15, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="absolute -right-12 md:right-10 top-20 opacity-30 blur-[2px]">
              <Terminal className="w-20 h-20 text-emerald-400" />
            </motion.div>
            <motion.div animate={{ y: [0, -15, 0], rotate: [0, 20, 0] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }} className="absolute left-10 md:left-32 -bottom-20 opacity-20 blur-[3px]">
              <BrainCircuit className="w-24 h-24 text-purple-400" />
            </motion.div>
            <motion.div animate={{ y: [0, 20, 0], rotate: [0, -10, 0] }} transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }} className="absolute right-10 md:right-32 -bottom-10 opacity-40 blur-[1px]">
              <Target className="w-16 h-16 text-pink-400" />
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="text-center mb-12 relative z-10">
              <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 bg-gradient-to-br from-white to-neutral-400 bg-clip-text text-transparent">
                Understand Developers.<br/><span className="bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">Instantly.</span>
              </h1>
              <p className="text-neutral-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                Enter any GitHub username to instantly generate a comprehensive AI-powered developer dossier, architectural profile, and recruiter assessment.
              </p>
            </motion.div>

            <form onSubmit={analyzeProfile} className="w-full max-w-2xl relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
              <div className="relative flex items-center bg-[#0a0a0a] border border-white/10 rounded-2xl p-2 shadow-2xl">
                <Search className="text-purple-400 w-6 h-6 ml-4" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter GitHub username..."
                  className="w-full bg-transparent border-none py-4 px-4 text-white text-lg placeholder:text-neutral-600 focus:outline-none"
                />
                <button 
                  type="submit"
                  disabled={loading || !username.trim()}
                  className="bg-white text-black hover:bg-neutral-200 font-bold rounded-xl px-8 py-3 transition-colors disabled:opacity-50 text-md shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                >
                  Analyze
                </button>
              </div>
              {error && <p className="text-red-400 mt-6 text-sm text-center bg-red-500/10 py-2 rounded-lg border border-red-500/20">{error}</p>}
            </form>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="relative w-24 h-24 mb-8">
              <div className="absolute inset-0 border-4 border-white/5 rounded-full" />
              <div className="absolute inset-0 border-4 border-purple-500 rounded-full border-t-transparent animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Code className="w-8 h-8 text-purple-400 animate-pulse" />
              </div>
            </div>
            <p className="text-purple-400 font-mono text-sm tracking-widest uppercase animate-pulse">Extracting Code Intelligence...</p>
          </div>
        )}

        {/* The Colored Bento Box Dashboard */}
        <AnimatePresence>
          {data && !loading && (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, type: "spring", bounce: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-12 gap-6"
            >
              {/* Box 1: Profile (Span 3) - Amber Theme */}
              <div className="md:col-span-3 bg-gradient-to-br from-amber-500/10 to-transparent backdrop-blur-md border border-amber-500/20 rounded-3xl p-8 flex flex-col items-center text-center hover:border-amber-500/40 hover:shadow-[0_0_30px_rgba(217,119,6,0.15)] transition-all relative overflow-hidden group">
                <img src={data.raw_profile?.avatar_url || "/api/placeholder/100/100"} alt="Avatar" className="w-28 h-28 rounded-full mb-5 border-4 border-amber-500/30 shadow-[0_0_20px_rgba(217,119,6,0.2)] relative z-10" />
                <h2 className="text-2xl font-black text-white leading-tight mb-1">{data.raw_profile?.name || data.raw_profile?.username || data.github_username}</h2>
                <p className="text-amber-400 font-mono text-xs mb-5">@{data.raw_profile?.username || data.github_username}</p>
                <p className="text-sm text-neutral-300 mb-8 leading-relaxed">{data.raw_profile?.bio || "A mysterious developer."}</p>
                
                <div className="flex justify-between w-full border-t border-amber-500/20 pt-6 mt-auto">
                  <div className="text-center flex-1">
                    <p className="text-xl text-white font-bold">{data.raw_profile?.followers || 0}</p>
                    <p className="text-[10px] uppercase tracking-widest text-amber-500/70 mt-1">Followers</p>
                  </div>
                  <div className="text-center flex-1 border-l border-amber-500/20">
                    <p className="text-xl text-white font-bold">{data.raw_profile?.public_repos || 0}</p>
                    <p className="text-[10px] uppercase tracking-widest text-amber-500/70 mt-1">Repos</p>
                  </div>
                </div>
              </div>

              {/* Box 2: Developer DNA (Span 6) - Purple/Blue Theme */}
              <div className="md:col-span-6 bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 backdrop-blur-md border border-purple-500/20 rounded-3xl p-8 hover:border-purple-500/40 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] transition-all flex flex-col relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/20 blur-[60px]" />
                <p className="text-purple-400 text-xs uppercase tracking-widest mb-3 flex items-center gap-2 relative z-10">
                  <Activity className="w-4 h-4" /> AI Executive Summary
                </p>
                <h3 className="text-4xl font-black bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-6 relative z-10">{data.dna_type}</h3>
                <p className="text-neutral-200 leading-relaxed text-sm mb-8 flex-1 relative z-10">{data.ai_summary}</p>
                
                <div className="flex flex-wrap gap-3 mt-auto pt-6 border-t border-purple-500/20 relative z-10">
                  {data.developer_wrapped?.badges?.map((badge: string, i: number) => (
                    <span key={i} className="px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-xl text-xs font-bold text-purple-200 shadow-lg flex items-center gap-2">
                      <Flame className="w-3 h-3 text-purple-400" /> {badge}
                    </span>
                  ))}
                </div>
              </div>

              {/* Box 3: Skill Matrix (Span 3) - Pink Theme */}
              <div className="md:col-span-3 bg-gradient-to-br from-pink-500/10 to-transparent backdrop-blur-md border border-pink-500/20 rounded-3xl p-8 hover:border-pink-500/40 hover:shadow-[0_0_30px_rgba(236,72,153,0.15)] transition-all flex flex-col min-h-[300px]">
                <p className="text-pink-400 text-xs uppercase tracking-widest mb-6 flex items-center gap-2">
                  <LineChart className="w-4 h-4" /> Skill Matrix
                </p>
                <div className="flex-1 w-full relative -ml-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data.radarData}>
                      <PolarGrid stroke="rgba(236,72,153,0.1)" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(236,72,153,0.6)', fontSize: 10 }} />
                      <Radar name="Stats" dataKey="A" stroke="#ec4899" strokeWidth={2} fill="#ec4899" fillOpacity={0.2} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Box 4: Recruiter View (Span 4) - Emerald Theme */}
              <div className="md:col-span-4 bg-gradient-to-br from-emerald-500/10 to-transparent backdrop-blur-md border border-emerald-500/20 rounded-3xl p-8 hover:border-emerald-500/40 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] transition-all flex flex-col">
                <p className="text-emerald-400 text-xs uppercase tracking-widest mb-8 flex items-center gap-2">
                  <Target className="w-4 h-4" /> Recruiter Verdict
                </p>
                <div className="mb-8">
                  <span className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold border ${data.recruiter_mode?.shortlist ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]" : "bg-neutral-900 border-neutral-800 text-neutral-400"}`}>
                    <Trophy className="w-4 h-4" /> {data.recruiter_mode?.shortlist ? "Shortlist Candidate" : "Requires Polish"}
                  </span>
                </div>
                <div className="mb-6">
                  <p className="text-emerald-500/70 text-[10px] uppercase tracking-widest mb-2">Core Strength</p>
                  <p className="text-sm text-neutral-200 leading-relaxed font-medium">{data.recruiter_mode?.biggest_strength}</p>
                </div>
                <div>
                  <p className="text-emerald-500/70 text-[10px] uppercase tracking-widest mb-2">Area for Growth</p>
                  <p className="text-sm text-neutral-400 leading-relaxed">{data.recruiter_mode?.biggest_weakness}</p>
                </div>
              </div>

              {/* Box 5: Top Repositories (Span 4) - Blue Theme */}
              <div className="md:col-span-4 bg-gradient-to-br from-blue-500/10 to-transparent backdrop-blur-md border border-blue-500/20 rounded-3xl p-8 hover:border-blue-500/40 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] transition-all flex flex-col">
                <p className="text-blue-400 text-xs uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Code className="w-4 h-4" /> Top Repositories
                </p>
                <div className="space-y-5 overflow-y-auto max-h-[350px] pr-4 custom-scrollbar flex-1">
                  {data.raw_repos?.slice(0, 5).map((repo: any, i: number) => (
                    <div key={i} className="pb-5 border-b border-blue-500/10 last:border-0 last:pb-0">
                      <div className="flex justify-between items-start mb-2">
                        <a href={`https://github.com/${data.raw_profile?.username || data.github_username}/${repo.name}`} target="_blank" rel="noreferrer" className="font-bold text-white hover:text-blue-400 transition-colors text-sm flex items-center gap-1">
                          {repo.name} <ChevronRight className="w-3 h-3 text-blue-500/50" />
                        </a>
                        <span className="flex items-center gap-1 text-[10px] font-mono text-blue-300 bg-blue-500/20 border border-blue-500/30 px-2 py-0.5 rounded-full"><Star className="w-3 h-3 text-yellow-500" /> {repo.stargazers_count}</span>
                      </div>
                      <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">{repo.description || "No description provided."}</p>
                      {repo.language && <span className="text-[10px] text-blue-400/80 mt-2 block font-medium">{repo.language}</span>}
                    </div>
                  ))}
                  {(!data.raw_repos || data.raw_repos.length === 0) && <p className="text-neutral-500 text-sm">No repositories found.</p>}
                </div>
              </div>

              {/* Box 6: Activity Feed (Span 4) - Green Theme */}
              <div className="md:col-span-4 bg-gradient-to-br from-green-500/10 to-transparent backdrop-blur-md border border-green-500/20 rounded-3xl p-8 hover:border-green-500/40 hover:shadow-[0_0_30px_rgba(34,197,94,0.15)] transition-all flex flex-col">
                <p className="text-green-400 text-xs uppercase tracking-widest mb-6 flex items-center gap-2">
                  <GitCommit className="w-4 h-4" /> Activity Timeline
                </p>
                <div className="space-y-6 overflow-y-auto max-h-[350px] pr-4 custom-scrollbar flex-1 relative">
                  <div className="absolute left-[7px] top-2 bottom-0 w-px bg-green-500/20 z-0" />
                  {data.raw_events?.slice(0, 6).map((event: any, i: number) => (
                    <div key={i} className="flex gap-4 relative z-10">
                      <div className="mt-1 bg-[#050505] p-0.5 rounded-full"><div className="w-2.5 h-2.5 rounded-full border-2 border-green-400 bg-green-500/30 shadow-[0_0_10px_rgba(34,197,94,0.5)]" /></div>
                      <div>
                        <p className="text-xs text-neutral-300 leading-relaxed">
                          <span className="font-bold text-white">{event.type === 'PushEvent' ? 'Pushed' : event.type === 'CreateEvent' ? 'Created' : 'Opened PR'}</span> in <span className="text-green-300">{event.repo.name.split('/')[1]}</span>
                        </p>
                        {event.type === 'PushEvent' && event.payload.commits?.length > 0 && (
                          <p className="text-[11px] text-neutral-400 mt-2 italic bg-green-500/5 p-2 rounded-lg border border-green-500/10">"{event.payload.commits[0].message}"</p>
                        )}
                        <p className="text-[9px] text-green-500/60 mt-2 font-mono">{new Date(event.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                  {(!data.raw_events || data.raw_events.length === 0) && <p className="text-neutral-500 text-sm">No recent activity.</p>}
                </div>
              </div>

              {/* Box 7: Repository Intelligence (Span 4) - Indigo Theme */}
              <div className="md:col-span-4 bg-gradient-to-br from-indigo-500/10 to-transparent backdrop-blur-md border border-indigo-500/20 rounded-3xl p-8 hover:border-indigo-500/40 hover:shadow-[0_0_30px_rgba(99,102,241,0.15)] transition-all flex flex-col">
                <p className="text-indigo-400 text-xs uppercase tracking-widest mb-6 flex items-center gap-2">
                  <BrainCircuit className="w-4 h-4" /> Deep Repository Intelligence
                </p>
                <div className="space-y-4">
                  {data.repo_intelligence?.slice(0, 3).map((repo: any, i: number) => (
                    <div key={i} className="bg-indigo-500/5 rounded-2xl p-5 border border-indigo-500/10 group hover:bg-indigo-500/10 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <span className="font-bold text-white text-sm">{repo.name}</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-300 bg-indigo-500/20 px-2 py-1 rounded-md">{repo.complexity}</span>
                      </div>
                      <p className="text-indigo-200/70 text-xs leading-relaxed line-clamp-2 group-hover:text-indigo-100 transition-colors">
                        {repo.insight}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Box 8: Language Distribution (Span 4) - Orange Theme */}
              <div className="md:col-span-4 bg-gradient-to-br from-orange-500/10 to-transparent backdrop-blur-md border border-orange-500/20 rounded-3xl p-8 hover:border-orange-500/40 hover:shadow-[0_0_30px_rgba(249,115,22,0.15)] transition-all flex flex-col">
                <p className="text-orange-400 text-xs uppercase tracking-widest mb-8 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" /> Language Distribution
                </p>
                <div className="space-y-6 flex-1 flex flex-col justify-center">
                  {data.developer_wrapped?.raw_stats?.top_languages && Object.entries(data.developer_wrapped.raw_stats.top_languages).slice(0, 4).map(([lang, count]: any, i) => {
                    const total = Object.values(data.developer_wrapped.raw_stats.top_languages).reduce((a:any, b:any) => a+b, 0) as number;
                    const pct = Math.round((count / total) * 100);
                    return (
                      <div key={i}>
                        <div className="flex justify-between text-xs mb-3">
                          <span className="font-bold text-white">{lang}</span>
                          <span className="text-orange-300 font-mono bg-orange-500/20 px-2 py-0.5 rounded-md text-[10px]">{pct}%</span>
                        </div>
                        <div className="w-full bg-orange-500/10 rounded-full h-2 overflow-hidden border border-orange-500/20">
                          <div className="bg-gradient-to-r from-orange-500 to-amber-400 h-2 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.5)]" style={{ width: `${pct}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Box 10: GitHub Contribution Heatmap (Span 12) - Classic Green Theme */}
              <div className="md:col-span-12 bg-gradient-to-br from-emerald-500/5 to-transparent backdrop-blur-md border border-emerald-500/20 rounded-3xl p-8 hover:border-emerald-500/40 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] transition-all flex flex-col">
                <p className="text-emerald-400 text-xs uppercase tracking-widest mb-6 flex items-center gap-2">
                  <GitCommit className="w-4 h-4" /> Contribution Graph
                </p>
                <div className="w-full overflow-x-auto custom-scrollbar pb-4 flex justify-center">
                  <div className="bg-[#0d1117]/80 p-6 rounded-2xl border border-white/5 shadow-inner">
                    <GitHubCalendar 
                      username={data.raw_profile?.username || data.github_username} 
                      colorScheme="dark"
                      theme={{
                        dark: ['#0d1117', '#0e4429', '#006d32', '#26a641', '#39d353'],
                      }}
                      fontSize={12}
                      blockSize={12}
                      blockMargin={4}
                    />
                  </div>
                </div>
              </div>
              
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
