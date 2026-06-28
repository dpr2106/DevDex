"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2, Printer, Code2, Award, Briefcase, FileCode2, Terminal, User, Link as LinkIcon, Activity } from "lucide-react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";
import { GitHubCalendar } from "react-github-calendar";
import QRCode from "react-qr-code";

const TwitterIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
  </svg>
);

const GithubIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.2c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
    <path d="M9 18c-4.51 2-5-2-7-2"/>
  </svg>
);

export default function ResumePage() {
  const params = useParams();
  const username = params.username as string;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [customExp, setCustomExp] = useState("");
  const [customEdu, setCustomEdu] = useState("");
  const [enhancingExp, setEnhancingExp] = useState(false);
  const [enhancingEdu, setEnhancingEdu] = useState(false);
  const [resumeMode, setResumeMode] = useState<'ai' | 'traditional'>('ai');
  
  const [showBuilder, setShowBuilder] = useState(false);
  const [builderData, setBuilderData] = useState({
    fullName: "",
    role: "",
    email: "",
    phone: "",
    linkedIn: "",
    summary: "",
    skills: ""
  });

  const [showCoverLetter, setShowCoverLetter] = useState(false);
  const [coverLetterCompany, setCoverLetterCompany] = useState("");
  const [coverLetterTargetRole, setCoverLetterTargetRole] = useState("");
  const [coverLetterText, setCoverLetterText] = useState("");
  const [generatingCoverLetter, setGeneratingCoverLetter] = useState(false);

  const handleGenerateCoverLetter = async () => {
    if (!coverLetterCompany || !coverLetterTargetRole) return;
    setGeneratingCoverLetter(true);
    try {
      const response = await fetch("http://localhost:8000/api/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          target_role: coverLetterTargetRole,
          company_name: coverLetterCompany
        })
      });
      if (response.ok) {
        const result = await response.json();
        setCoverLetterText(result.cover_letter);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setGeneratingCoverLetter(false);
    }
  };

  const handleEnhance = async (text: string, section: string, setFunc: (val: string) => void, setLoad: (val: boolean) => void) => {
    if (!text) return;
    setLoad(true);
    try {
      const response = await fetch("http://localhost:8000/api/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, section })
      });
      if (response.ok) {
        const result = await response.json();
        if (result.enhanced_text) setFunc(result.enhanced_text);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoad(false);
    }
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`http://localhost:8000/api/analyze/${username}`);
        if (!response.ok) throw new Error("Could not fetch profile.");
        const result = await response.json();
        setData(result);
        setBuilderData({
          fullName: result.raw_profile?.name || username,
          role: result.dna_type ? `${result.dna_type} Developer` : "Software Engineer",
          email: result.raw_profile?.email || "",
          phone: "",
          linkedIn: "",
          summary: result.ai_summary || "",
          skills: Object.keys(result.developer_wrapped?.raw_stats?.top_languages || {}).slice(0, 10).join(', ')
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">
        <Loader2 className="w-10 h-10 animate-spin text-purple-500" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-red-400">
        Error loading resume: {error || "No data"}
      </div>
    );
  }

  const profile = data.raw_profile || {};
  const stats = data.developer_wrapped?.raw_stats || {};
  const recruiter = data.recruiter_mode || {};
  const repos = data.raw_repos || [];
  const events = data.raw_events || [];

  // Calculate stats for Radar Chart
  const impactScore = data.developer_wrapped?.coding_demon_level || 50;
  const radarData = [
    { subject: 'Complexity', A: Math.min(100, impactScore + 20), fullMark: 100 },
    { subject: 'Velocity', A: Math.max(10, impactScore - 10), fullMark: 100 },
    { subject: 'Consistency', A: 85, fullMark: 100 },
    { subject: 'Impact', A: Math.min(100, impactScore + 10), fullMark: 100 },
    { subject: 'Clean Code', A: Math.max(20, 100 - impactScore), fullMark: 100 },
  ];

  return (
    <div className="min-h-screen font-sans selection:bg-pink-500/30 flex justify-center py-10 bg-zinc-900" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
      
      {/* Print Controls & Control Panel (Hidden on Print) */}
      <div className="fixed top-8 right-8 flex flex-col gap-4 print:hidden z-50 w-80">
        <div className="bg-white p-5 rounded-2xl shadow-2xl border border-neutral-200 flex flex-col gap-5">
          <h3 className="font-black text-neutral-900 text-lg border-b border-neutral-100 pb-2">Resume Controls</h3>
          
          <div className="flex bg-neutral-100 rounded-lg p-1">
            <button 
              onClick={() => setResumeMode('ai')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${resumeMode === 'ai' ? 'bg-white shadow text-pink-600' : 'text-neutral-500 hover:text-neutral-700'}`}
            >
              🚀 AI Mode
            </button>
            <button 
              onClick={() => setResumeMode('traditional')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${resumeMode === 'traditional' ? 'bg-white shadow text-neutral-900' : 'text-neutral-500 hover:text-neutral-700'}`}
            >
              📄 Traditional
            </button>
          </div>
          
          <button 
            onClick={() => setShowBuilder(true)}
            className="w-full py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 font-bold rounded-xl text-sm transition-colors flex justify-center items-center gap-2"
          >
            ✏️ Edit Resume Details
          </button>
          
          <button 
            onClick={() => {
               setCoverLetterTargetRole(builderData.role || "Software Engineer");
               setShowCoverLetter(true);
            }}
            className="w-full py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-bold rounded-xl text-sm transition-colors flex justify-center items-center gap-2"
          >
            ✉️ Write Cover Letter
          </button>
          
          <button 
            onClick={() => window.print()}
            className="mt-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-black py-3 px-6 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
          >
            <Printer className="w-5 h-5" /> Print to PDF
          </button>
        </div>
      </div>

      {showBuilder && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm print:hidden">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 border border-neutral-200">
            <div className="flex justify-between items-center mb-6 border-b border-neutral-100 pb-4">
              <h2 className="text-2xl font-black text-neutral-900">✏️ Build Your Resume</h2>
              <button onClick={() => setShowBuilder(false)} className="text-neutral-500 hover:text-neutral-900 font-bold p-2 bg-neutral-100 rounded-lg transition-colors">Close</button>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block mb-1">Full Name</label>
                  <input type="text" value={builderData.fullName} onChange={e => setBuilderData({...builderData, fullName: e.target.value})} className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-neutral-900" />
                </div>
                <div>
                  <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block mb-1">Target Role</label>
                  <input type="text" value={builderData.role} onChange={e => setBuilderData({...builderData, role: e.target.value})} className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-neutral-900" />
                </div>
                <div>
                  <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block mb-1">Email</label>
                  <input type="email" value={builderData.email} onChange={e => setBuilderData({...builderData, email: e.target.value})} className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-neutral-900" />
                </div>
                <div>
                  <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block mb-1">Phone</label>
                  <input type="text" value={builderData.phone} onChange={e => setBuilderData({...builderData, phone: e.target.value})} className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-neutral-900" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block mb-1">LinkedIn / Portfolio URL</label>
                  <input type="text" value={builderData.linkedIn} onChange={e => setBuilderData({...builderData, linkedIn: e.target.value})} className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-neutral-900" />
                </div>
              </div>
              
              <div>
                <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block mb-1">Professional Summary</label>
                <textarea value={builderData.summary} onChange={e => setBuilderData({...builderData, summary: e.target.value})} className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm h-32 resize-y text-neutral-900" />
              </div>

              <div>
                <div className="flex justify-between items-end mb-2">
                  <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block">Work Experience</label>
                  <button 
                    onClick={() => handleEnhance(customExp, "Work Experience", setCustomExp, setEnhancingExp)} 
                    disabled={enhancingExp || !customExp} 
                    className="px-3 py-1.5 bg-pink-100 text-pink-600 hover:bg-pink-200 hover:text-pink-700 hover:-translate-y-0.5 active:translate-y-0 transition-all rounded-lg text-xs font-bold shadow-sm disabled:opacity-50 disabled:hover:translate-y-0 flex items-center gap-1.5"
                  >
                    {enhancingExp ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "✨"} AI Enhance
                  </button>
                </div>
                <textarea value={customExp} onChange={e => setCustomExp(e.target.value)} placeholder="Type rough bullets, then hit AI Enhance..." className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm h-28 resize-y text-neutral-900 focus:ring-2 focus:ring-pink-500 outline-none transition-all" />
              </div>

              <div>
                <div className="flex justify-between items-end mb-2">
                  <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block">Education</label>
                  <button 
                    onClick={() => handleEnhance(customEdu, "Education", setCustomEdu, setEnhancingEdu)} 
                    disabled={enhancingEdu || !customEdu} 
                    className="px-3 py-1.5 bg-cyan-100 text-cyan-700 hover:bg-cyan-200 hover:text-cyan-800 hover:-translate-y-0.5 active:translate-y-0 transition-all rounded-lg text-xs font-bold shadow-sm disabled:opacity-50 disabled:hover:translate-y-0 flex items-center gap-1.5"
                  >
                    {enhancingEdu ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "✨"} AI Enhance
                  </button>
                </div>
                <textarea value={customEdu} onChange={e => setCustomEdu(e.target.value)} placeholder="E.g. BS in Computer Science..." className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm h-20 resize-y text-neutral-900 focus:ring-2 focus:ring-cyan-500 outline-none transition-all" />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block mb-1">Skills (comma separated)</label>
                <textarea value={builderData.skills} onChange={e => setBuilderData({...builderData, skills: e.target.value})} className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm h-24 resize-y text-neutral-900" />
              </div>
              
              <div className="pt-4 border-t border-neutral-100 flex justify-end">
                <button onClick={() => setShowBuilder(false)} className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-black rounded-xl shadow-lg transition-all">Save & Preview</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCoverLetter && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm print:hidden">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 border border-neutral-200 flex flex-col">
            <div className="flex justify-between items-center mb-6 border-b border-neutral-100 pb-4 shrink-0">
              <h2 className="text-2xl font-black text-neutral-900">✉️ AI Cover Letter</h2>
              <button onClick={() => setShowCoverLetter(false)} className="text-neutral-500 hover:text-neutral-900 font-bold p-2 bg-neutral-100 rounded-lg transition-colors">Close</button>
            </div>
            
            <div className="space-y-4 shrink-0">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block mb-1">Company Name</label>
                  <input type="text" value={coverLetterCompany} onChange={e => setCoverLetterCompany(e.target.value)} placeholder="e.g. OpenAI" className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-neutral-900 focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block mb-1">Target Role</label>
                  <input type="text" value={coverLetterTargetRole} onChange={e => setCoverLetterTargetRole(e.target.value)} placeholder="e.g. Frontend Engineer" className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-neutral-900 focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
              </div>
              <button 
                onClick={handleGenerateCoverLetter} 
                disabled={generatingCoverLetter || !coverLetterCompany || !coverLetterTargetRole}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl shadow-lg transition-all disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {generatingCoverLetter ? <Loader2 className="w-5 h-5 animate-spin" /> : "✨"} Generate Cover Letter
              </button>
            </div>
            
            {coverLetterText && (
              <div className="mt-6 flex-1 flex flex-col min-h-0">
                <div className="flex justify-between items-end mb-2">
                  <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block">Generated Cover Letter</label>
                  <button 
                    onClick={() => navigator.clipboard.writeText(coverLetterText)}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                  >
                    📋 Copy to Clipboard
                  </button>
                </div>
                <textarea 
                  value={coverLetterText} 
                  onChange={e => setCoverLetterText(e.target.value)} 
                  className="w-full flex-1 min-h-[250px] p-4 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-neutral-900 resize-y outline-none focus:ring-2 focus:ring-indigo-500" 
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* A4 Paper Container */}
      <div className={`w-[210mm] min-h-[297mm] p-12 print:shadow-none print:p-0 print:w-[210mm] relative overflow-hidden ${resumeMode === 'ai' ? 'bg-[#0d0914] text-neutral-300 border border-purple-500/20 shadow-[0_0_50px_rgba(236,72,153,0.15)]' : 'bg-white text-neutral-900 shadow-xl'}`}>
        
        {/* Decorative Header Bar */}
        {resumeMode === 'ai' && <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500" />}
        {resumeMode === 'traditional' && <div className="absolute top-0 left-0 right-0 h-2 bg-neutral-800" />}

        {resumeMode === 'traditional' ? (
          <div className="font-sans text-neutral-900 mt-4 max-w-[190mm] mx-auto">
            <header className="border-b-[3px] border-neutral-900 pb-5 mb-6 flex flex-col items-center text-center">
              <h1 className="text-4xl font-serif font-black text-neutral-900 uppercase tracking-wide">{builderData.fullName}</h1>
              <div className="text-neutral-700 mt-2 font-medium text-sm flex gap-3 flex-wrap justify-center">
                <span>{builderData.role}</span>
                {builderData.email && <><span className="text-neutral-300">•</span><span>{builderData.email}</span></>}
                {builderData.phone && <><span className="text-neutral-300">•</span><span>{builderData.phone}</span></>}
                {builderData.linkedIn && <><span className="text-neutral-300">•</span><span>{builderData.linkedIn}</span></>}
                <><span className="text-neutral-300">•</span><span>github.com/{username}</span></>
              </div>
            </header>

            <div className="space-y-6">
              {builderData.summary && (
                <section>
                  <h2 className="text-[13px] font-bold uppercase tracking-widest border-b border-neutral-900 mb-3 pb-1 text-neutral-900">Professional Summary</h2>
                  <p className="text-sm leading-relaxed text-neutral-800 text-justify">{builderData.summary}</p>
                </section>
              )}

              {builderData.skills && (
                <section>
                  <h2 className="text-[13px] font-bold uppercase tracking-widest border-b border-neutral-900 mb-3 pb-1 text-neutral-900">Technical Skills</h2>
                  <p className="text-sm leading-relaxed text-neutral-800">
                    <strong>Technologies:</strong> {builderData.skills}
                  </p>
                </section>
              )}

              {customExp && (
                <section>
                  <h2 className="text-[13px] font-bold uppercase tracking-widest border-b border-neutral-900 mb-3 pb-1 text-neutral-900">Experience</h2>
                  <ul className="list-[square] list-outside text-sm space-y-2 ml-4 text-neutral-800 marker:text-neutral-400">
                    {customExp.split('\n').map((line, i) => line.trim() ? (
                      <li key={i} className="leading-relaxed pl-1">{line.replace(/^-/, '').trim()}</li>
                    ) : null)}
                  </ul>
                </section>
              )}

              {customEdu && (
                <section>
                  <h2 className="text-[13px] font-bold uppercase tracking-widest border-b border-neutral-900 mb-3 pb-1 text-neutral-900">Education</h2>
                  <ul className="list-[square] list-outside text-sm space-y-2 ml-4 text-neutral-800 marker:text-neutral-400">
                    {customEdu.split('\n').map((line, i) => line.trim() ? (
                      <li key={i} className="leading-relaxed pl-1">{line.replace(/^-/, '').trim()}</li>
                    ) : null)}
                  </ul>
                </section>
              )}

              <section>
                <h2 className="text-[13px] font-bold uppercase tracking-widest border-b border-neutral-900 mb-3 pb-1 text-neutral-900">Notable Projects</h2>
                <div className="space-y-4">
                  {repos.slice(0, 4).map((repo: any) => (
                    <div key={repo.id}>
                      <div className="flex justify-between items-baseline">
                        <h3 className="font-bold text-[15px] text-neutral-900">{repo.name}</h3>
                        <span className="text-xs text-neutral-500 font-mono italic">{repo.language}</span>
                      </div>
                      <p className="text-[13.5px] mt-1 text-neutral-700 leading-snug">{repo.description || "No description provided."}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        ) : (
          <>
        {/* Header */}
        <header className="flex items-start justify-between border-b border-purple-500/20 pb-8 mt-6">
          <div className="flex items-center gap-6">
            <img src={profile.avatar_url} alt="Avatar" className="w-28 h-28 rounded-2xl shadow-[0_0_20px_rgba(236,72,153,0.3)] border-2 border-pink-500/50" />
            <div>
              <h1 className="text-5xl font-black tracking-tight text-white mb-2">{profile.name || username}</h1>
              <p className="text-neutral-400 mb-3 max-w-md text-sm">{profile.bio}</p>
              <div className="flex items-center gap-4 text-cyan-400 font-medium text-sm">
                <span className="flex items-center gap-1"><GithubIcon className="w-4 h-4" /> @{username}</span>
                {profile.location && <span className="flex items-center gap-1">📍 {profile.location}</span>}
                {profile.blog && <span className="flex items-center gap-1"><LinkIcon className="w-4 h-4" /> {profile.blog.replace(/^https?:\/\//, '')}</span>}
                {profile.twitter_username && <span className="flex items-center gap-1"><TwitterIcon className="w-4 h-4" /> @{profile.twitter_username}</span>}
              </div>
              <p className="mt-4 font-black px-4 py-1.5 rounded-lg inline-block text-sm uppercase tracking-wider bg-pink-500/20 text-pink-400 border border-pink-500/30">
                {data.dna_type} Developer
              </p>
            </div>
          </div>
          
          <div className="flex gap-6 items-start">
            <div className="text-right space-y-1 text-sm font-mono p-4 rounded-xl border bg-[#1a1125] border-purple-500/30 text-cyan-400 shadow-[0_0_15px_rgba(168,85,247,0.1)]">
              <div className="flex justify-between gap-4"><span className="text-neutral-500">Stars:</span> <span className="font-bold text-white">{stats.total_stars_received || 0}</span></div>
              <div className="flex justify-between gap-4"><span className="text-neutral-500">Forks:</span> <span className="font-bold text-white">{stats.total_forks_received || 0}</span></div>
              <div className="flex justify-between gap-4"><span className="text-neutral-500">Followers:</span> <span className="font-bold text-white">{profile.followers || 0}</span></div>
              <div className="flex justify-between gap-4"><span className="text-neutral-500">Joined:</span> <span className="font-bold text-white">{new Date(profile.created_at).getFullYear()}</span></div>
            </div>
            
            {/* Live QR Code linking to GitHub */}
            <div className="p-2 rounded-xl bg-white border border-pink-500/50 shadow-[0_0_20px_rgba(236,72,153,0.4)]">
              <QRCode 
                value={`https://github.com/${profile.username || username}`}
                size={80}
                bgColor="#ffffff"
                fgColor="#0d0914"
              />
              <p className="text-[8px] text-center mt-1 text-black font-black uppercase tracking-widest">Scan Me</p>
            </div>
          </div>
        </header>

        <main className="mt-8 grid grid-cols-3 gap-10">
          {/* Main Column (2/3 width) */}
          <div className="col-span-2 space-y-8">
            
            <section>
              <h2 className="flex items-center gap-2 text-2xl font-black border-b border-purple-500/20 pb-2 mb-4 text-white">
                <User className="w-6 h-6 text-purple-400" /> Professional Summary
              </h2>
              <p className="text-neutral-300 leading-relaxed text-sm">
                {data.ai_summary}
              </p>
            </section>

            <section>
              <h2 className="flex items-center gap-2 text-2xl font-black border-b border-purple-500/20 pb-2 mb-4 text-white">
                <Award className="w-6 h-6 text-emerald-400" /> Core Strengths & Value
              </h2>
              <ul className="space-y-3">
                {recruiter.biggest_strength && (
                  <li className="flex items-start gap-3 text-sm text-neutral-300">
                    <span className="text-emerald-400 font-black mt-0.5">✦</span>
                    <span><strong className="text-white">Technical Strength:</strong> {recruiter.biggest_strength}</span>
                  </li>
                )}
                {data.developer_wrapped?.biggest_strength && (
                  <li className="flex items-start gap-3 text-sm text-neutral-300">
                    <span className="text-emerald-400 font-black mt-0.5">✦</span>
                    <span><strong className="text-white">Developer Trait:</strong> {data.developer_wrapped.biggest_strength}</span>
                  </li>
                )}
                {data.developer_wrapped?.favorite_language && (
                  <li className="flex items-start gap-3 text-sm text-neutral-300">
                    <span className="text-emerald-400 font-black mt-0.5">✦</span>
                    <span><strong className="text-white">Primary Weapon:</strong> Master of {data.developer_wrapped.favorite_language}</span>
                  </li>
                )}
              </ul>
            </section>

            {/* Custom Experience Section if provided */}
            {customExp && (
              <section>
                <h2 className="flex items-center gap-2 text-2xl font-black border-b border-purple-500/20 pb-2 mb-4 text-white">
                  <Briefcase className="w-6 h-6 text-pink-400" /> Work Experience
                </h2>
                <ul className="space-y-2">
                  {customExp.split('\n').map((line, i) => line.trim() ? (
                    <li key={i} className="flex items-start gap-3 text-sm text-neutral-300">
                      <span className="text-pink-500 font-bold mt-0.5 shrink-0">❖</span>
                      <span className="leading-relaxed">{line.replace(/^-/, '').trim()}</span>
                    </li>
                  ) : null)}
                </ul>
              </section>
            )}

            {/* Custom Education Section if provided */}
            {customEdu && (
              <section>
                <h2 className="flex items-center gap-2 text-2xl font-black border-b border-purple-500/20 pb-2 mb-4 text-white">
                  <Award className="w-6 h-6 text-cyan-400" /> Education
                </h2>
                <ul className="space-y-2">
                  {customEdu.split('\n').map((line, i) => line.trim() ? (
                    <li key={i} className="flex items-start gap-3 text-sm text-neutral-300">
                      <span className="text-cyan-500 font-bold mt-0.5 shrink-0">❖</span>
                      <span className="leading-relaxed">{line.replace(/^-/, '').trim()}</span>
                    </li>
                  ) : null)}
                </ul>
              </section>
            )}

            <section>
              <h2 className="flex items-center gap-2 text-2xl font-black border-b border-purple-500/20 pb-2 mb-4 text-white">
                <Briefcase className="w-6 h-6 text-blue-400" /> Notable Projects (Top 4)
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {repos.slice(0, 4).map((repo: any) => (
                  <div key={repo.id} className="border border-purple-500/30 rounded-xl p-4 bg-[#1a1125] hover:border-purple-400 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-md text-white flex items-center gap-2 truncate">
                        <FileCode2 className="w-4 h-4 text-blue-400 shrink-0" /> <span className="truncate">{repo.name}</span>
                      </h3>
                    </div>
                    <p className="text-xs text-neutral-400 line-clamp-2 mb-3 h-8">{repo.description || "No description provided."}</p>
                    <div className="flex justify-between items-center">
                      {repo.language ? (
                        <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-1 rounded-md font-bold uppercase tracking-wider border border-blue-500/30">
                          {repo.language}
                        </span>
                      ) : <span />}
                      <div className="flex gap-2 text-xs font-mono font-medium text-neutral-500">
                        <span>⭐ {repo.stargazers_count}</span>
                        <span>🍴 {repo.forks_count}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="flex items-center gap-2 text-2xl font-black border-b border-purple-500/20 pb-2 mb-4 text-white">
                <Activity className="w-6 h-6 text-pink-400" /> Commit Activity Graph
              </h2>
              <div className="w-full flex justify-center py-4 rounded-xl border bg-[#0d0914] border-purple-500/30">
                <GitHubCalendar username={username} colorScheme="dark" blockSize={12} blockMargin={4} fontSize={12} />
              </div>
            </section>
            
          </div>

          {/* Sidebar (1/3 width) */}
          <div className="col-span-1 space-y-8 bg-[#1a1125] p-6 rounded-2xl border border-purple-500/20 shadow-[0_0_20px_rgba(168,85,247,0.05)]">
            
            <section>
              <h2 className="flex items-center gap-2 text-lg font-black border-b border-purple-500/20 pb-2 mb-4 text-white">
                <Code2 className="w-5 h-5 text-purple-400" /> Languages
              </h2>
              <div className="flex flex-wrap gap-2">
                {Object.entries(stats.top_languages || {}).slice(0, 10).map(([lang, bytes]: [string, any]) => (
                  <span key={lang} className="bg-purple-500/10 border border-purple-500/30 text-purple-300 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm">
                    {lang}
                  </span>
                ))}
                {(!stats.top_languages || Object.keys(stats.top_languages).length === 0) && <span className="text-sm text-neutral-500">No language data</span>}
              </div>
            </section>

            <section>
              <h2 className="flex items-center gap-2 text-lg font-black border-b border-purple-500/20 pb-2 mb-4 text-white">
                <Terminal className="w-5 h-5 text-orange-400" /> Dev Persona
              </h2>
              <div className="h-48 w-full -ml-4 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid stroke="#3b2856" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#a855f7', fontSize: 10 }} />
                    <Radar name="Stats" dataKey="A" stroke="#ec4899" strokeWidth={2} fill="#ec4899" fillOpacity={0.2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] text-pink-500 uppercase font-black tracking-widest mb-1">Architecture</p>
                  <p className="text-sm text-neutral-200 font-medium">{data.repo_intelligence?.[0]?.architecture_pattern || "Monolithic / Hybrid"}</p>
                </div>
                <div>
                  <p className="text-[10px] text-cyan-500 uppercase font-black tracking-widest mb-1">Coding Style</p>
                  <p className="text-sm text-neutral-200 font-medium">{data.consistency_analysis?.habit_summary || "Consistent Contributor"}</p>
                </div>
                <div>
                  <p className="text-[10px] text-orange-500 uppercase font-black tracking-widest mb-1">Weaknesses</p>
                  <p className="text-sm text-neutral-400 leading-relaxed mt-1">
                    {recruiter.biggest_weakness || "None identified."}
                  </p>
                </div>
              </div>
            </section>
            
            {data.commit_roast && (
              <section className="mt-8 pt-8 border-t border-purple-500/20">
                <h2 className="flex items-center gap-2 text-lg font-black pb-2 mb-4 text-pink-500">
                  <Terminal className="w-5 h-5" /> AI Roast
                </h2>
                <div className="bg-pink-500/10 border border-pink-500/30 p-4 rounded-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-pink-500/20 blur-xl" />
                  <p className="text-xs text-pink-200 leading-relaxed relative z-10 italic">
                    "{data.commit_roast}"
                  </p>
                </div>
              </section>
            )}
          </div>
        </main>
        </>
        )}
        
        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-purple-500/20 text-center text-xs text-purple-500/50 font-mono">
          Generated automatically by GitScope AI | Data powered by GitHub & AI
        </footer>
      </div>
    </div>
  );
}
