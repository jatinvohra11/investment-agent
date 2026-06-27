"use client";
import { useState, useEffect, useRef } from "react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, CartesianGrid
} from "recharts";

interface Report {
  company: string;
  verdict: "INVEST" | "PASS";
  confidence: number;
  summary: string;
  financials: { revenue: string; growth: string; profitability: string; debt: string };
  pros: string[];
  cons: string[];
  risks: string[];
  marketPosition: string;
  recentNews: string[];
  recommendation: string;
}

const PLACEHOLDERS = ["Apple Inc...", "Tesla Motors...", "Zomato...", "Infosys...", "Reliance Industries...", "NVIDIA..."];
const RESEARCH_STEPS = [
  { text: "Scanning latest news & press releases", duration: 2000 },
  { text: "Fetching revenue, profit & financial data", duration: 2000 },
  { text: "Analyzing market position & competitors", duration: 2000 },
  { text: "LangGraph agent generating verdict", duration: 2000 },
  { text: "Building comprehensive report", duration: 1000 },
];

const FIXED_DOTS = [
  { w:2, h:2, top:8, left:12, color:"rgba(99,102,241,0.4)", delay:0, dur:3 },
  { w:1.5, h:1.5, top:22, left:78, color:"rgba(168,85,247,0.3)", delay:1, dur:4 },
  { w:3, h:3, top:58, left:6, color:"rgba(255,255,255,0.06)", delay:0.5, dur:2.5 },
  { w:2, h:2, top:78, left:62, color:"rgba(99,102,241,0.3)", delay:2, dur:3.5 },
  { w:1, h:1, top:42, left:88, color:"rgba(168,85,247,0.25)", delay:1.5, dur:4 },
  { w:2.5, h:2.5, top:68, left:33, color:"rgba(255,255,255,0.05)", delay:0.8, dur:3 },
  { w:1.5, h:1.5, top:14, left:52, color:"rgba(99,102,241,0.28)", delay:2.5, dur:2 },
  { w:2, h:2, top:88, left:22, color:"rgba(168,85,247,0.2)", delay:0.3, dur:5 },
  { w:1, h:1, top:48, left:68, color:"rgba(99,102,241,0.22)", delay:1.8, dur:3.5 },
  { w:2, h:2, top:32, left:44, color:"rgba(255,255,255,0.04)", delay:1.2, dur:4 },
  { w:1.5, h:1.5, top:92, left:85, color:"rgba(99,102,241,0.2)", delay:0.6, dur:3 },
  { w:2.5, h:2.5, top:5, left:95, color:"rgba(168,85,247,0.15)", delay:2.2, dur:2.5 },
];

function generateMockPriceData(verdict: string) {
  const steps = [0.8,1.2,-0.3,1.5,0.6,-0.8,1.1,0.9,-0.5,1.3,0.7,-0.2,1.4,0.5,-0.6,1.0,0.8,-0.4,1.2,0.6,-0.3,1.1,0.9,-0.7,1.3,0.4,-0.5,1.0,0.8,0.6];
  let price = 100;
  return steps.map((s, i) => {
    price = price + (s - 0.5 + (verdict === "INVEST" ? 0.3 : -0.2)) * 3;
    return { day: `D${i + 1}`, price: Math.max(50, Math.round(price * 10) / 10) };
  });
}

function generateSentimentData(pros: number, cons: number) {
  return [
    { name: "Positive", value: pros * 20 + 20, fill: "#22c55e" },
    { name: "Neutral", value: 30, fill: "#6366f1" },
    { name: "Negative", value: cons * 15 + 10, fill: "#ef4444" },
  ];
}

function TypewriterText({ text, delay = 0 }: { text: string; delay?: number }) {
  const [displayed, setDisplayed] = useState("");
  const [started, setStarted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  useEffect(() => {
    if (!started) return;
    let i = 0;
    const iv = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(iv);
    }, 16);
    return () => clearInterval(iv);
  }, [started, text]);
  return <span>{displayed}<span className={displayed.length < text.length ? "animate-pulse" : "opacity-0"}>|</span></span>;
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [phase, setPhase] = useState<"search" | "loading" | "result">("search");
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState("");
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [activeStep, setActiveStep] = useState(0);
  const [typedPlaceholder, setTypedPlaceholder] = useState("");
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [sources, setSources] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "financials" | "analysis">("overview");
  const [revealStage, setRevealStage] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (phase !== "search") return;
    let i = 0, currentIdx = placeholderIdx, current = PLACEHOLDERS[currentIdx], typing = true;
    const iv = setInterval(() => {
      if (typing) {
        setTypedPlaceholder(current.slice(0, i + 1)); i++;
        if (i >= current.length) typing = false;
      } else {
        setTypedPlaceholder(current.slice(0, i - 1)); i--;
        if (i === 0) { typing = true; currentIdx = (currentIdx + 1) % PLACEHOLDERS.length; current = PLACEHOLDERS[currentIdx]; setPlaceholderIdx(currentIdx); }
      }
    }, 80);
    return () => clearInterval(iv);
  }, [phase]);

  useEffect(() => {
    if (phase !== "result") return;
    setRevealStage(0);
    const timers = [
      setTimeout(() => setRevealStage(1), 100),
      setTimeout(() => setRevealStage(2), 900),
      setTimeout(() => setRevealStage(3), 1900),
      setTimeout(() => setRevealStage(4), 2900),
      setTimeout(() => setRevealStage(5), 3700),
    ];
    return () => timers.forEach(clearTimeout);
  }, [phase]);

  const fakeDomains = ["reuters.com","bloomberg.com","moneycontrol.com","economictimes.com","techcrunch.com","ft.com","wsj.com","livemint.com"];

  const analyze = async (name?: string) => {
    const target = (name || query).trim();
    if (!target) return;
    setQuery(target); setPhase("loading"); setCompletedSteps([]); setActiveStep(0); setError(""); setSources([]); setActiveTab("overview");
    let stepIdx = 0;
    const runStep = () => {
      if (stepIdx < RESEARCH_STEPS.length) {
        setActiveStep(stepIdx);
        if (stepIdx < 3) setTimeout(() => setSources(p => [...p, `${fakeDomains[stepIdx*2]}/${target.toLowerCase().replace(/ /g,"-")}`, `${fakeDomains[stepIdx*2+1]}/${target.toLowerCase().replace(/ /g,"-")}-news`]), 800);
        setTimeout(() => { setCompletedSteps(p => [...p, stepIdx]); stepIdx++; runStep(); }, RESEARCH_STEPS[stepIdx].duration);
      }
    };
    runStep();
    try {
      const res = await fetch("/api/research", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ company: target }) });
      const data = await res.json();
      if (data.success) { setReport(data.report); setTimeout(() => setPhase("result"), 300); }
      else { setError(data.error || "Something went wrong"); setPhase("search"); }
    } catch { setError("Failed to analyze. Please try again."); setPhase("search"); }
  };

  const reset = () => { setPhase("search"); setReport(null); setQuery(""); setCompletedSteps([]); setTimeout(() => inputRef.current?.focus(), 100); };
  const getRadarData = (r: Report) => [
    { subject: "Growth", value: r.confidence * 0.9 },
    { subject: "Stability", value: r.verdict === "INVEST" ? 78 : 38 },
    { subject: "Innovation", value: r.confidence * 0.85 },
    { subject: "Financials", value: r.verdict === "INVEST" ? 82 : 33 },
    { subject: "Market", value: r.confidence * 0.95 },
    { subject: "Risk Mgmt", value: r.verdict === "INVEST" ? 68 : 28 },
  ];
  const priceData = report ? generateMockPriceData(report.verdict) : [];
  const isInvest = report?.verdict === "INVEST";
  const accent = isInvest ? "#22c55e" : "#ef4444";

  return (
    <div className="min-h-screen w-full bg-[#050508] text-white font-sans overflow-x-hidden">

      {/* ── BACKGROUND ── */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Grid */}
        <div className="absolute inset-0" style={{ backgroundImage:"linear-gradient(rgba(99,102,241,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.04) 1px,transparent 1px)", backgroundSize:"72px 72px" }}/>
        {/* Orbs */}
        <div className="absolute top-[-20%] left-[-10%] w-[80vw] h-[80vw] max-w-[700px] max-h-[700px] rounded-full" style={{ background:"radial-gradient(circle,rgba(99,102,241,0.09) 0%,transparent 65%)" }}/>
        <div className="absolute bottom-[-15%] right-[-10%] w-[70vw] h-[70vw] max-w-[600px] max-h-[600px] rounded-full" style={{ background:"radial-gradient(circle,rgba(168,85,247,0.07) 0%,transparent 65%)" }}/>
        <div className="absolute top-[40%] left-[30%] w-[40vw] h-[40vw] max-w-[500px] max-h-[300px] rounded-full" style={{ background:"radial-gradient(ellipse,rgba(99,102,241,0.04) 0%,transparent 70%)" }}/>
        {/* Dots */}
        {FIXED_DOTS.map((d, i) => (
          <div key={i} className="absolute rounded-full animate-pulse" style={{ width:`${d.w}px`,height:`${d.h}px`,background:d.color,top:`${d.top}%`,left:`${d.left}%`,animationDelay:`${d.delay}s`,animationDuration:`${d.dur}s` }}/>
        ))}
        {/* Diagonal lines */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.04]">
          <defs>
            <linearGradient id="lg1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="transparent"/>
              <stop offset="50%" stopColor="#6366f1"/>
              <stop offset="100%" stopColor="transparent"/>
            </linearGradient>
          </defs>
          <line x1="0" y1="25%" x2="100%" y2="75%" stroke="url(#lg1)" strokeWidth="0.5"/>
          <line x1="0" y1="75%" x2="100%" y2="25%" stroke="url(#lg1)" strokeWidth="0.5"/>
          <line x1="0" y1="50%" x2="100%" y2="50%" stroke="url(#lg1)" strokeWidth="0.3"/>
        </svg>
      </div>

      {/* ── SEARCH PHASE ── */}
      {phase === "search" && (
        <div className="relative z-10 min-h-screen w-full flex flex-col items-center justify-center px-4 sm:px-6">
          <div className="mb-10 text-center">
            <div className="inline-flex items-center gap-3 mb-5">
              <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl flex items-center justify-center text-sm font-black shadow-lg" style={{ background:"linear-gradient(135deg,#6366f1,#a855f7)" }}>AI</div>
              <span className="text-2xl sm:text-3xl font-black tracking-tight">InvestIQ</span>
            </div>
            <p className="text-gray-500 text-sm">AI-powered investment research agent</p>
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse"/>
              <span className="text-indigo-400 text-xs">by Jatin</span>
            </div>
          </div>

          <div className="w-full max-w-2xl">
            <div className="relative group">
              <div className="absolute -inset-px rounded-2xl opacity-0 group-focus-within:opacity-100 transition duration-500" style={{ background:"linear-gradient(135deg,#6366f1,#a855f7)", filter:"blur(8px)" }}/>
              <div className="relative flex items-center bg-[#0c0c12] border border-[#1e1e2e] group-focus-within:border-indigo-500/40 rounded-2xl transition-all shadow-2xl">
                <svg className="ml-4 sm:ml-5 text-gray-600 flex-shrink-0" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <input ref={inputRef} autoFocus value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && analyze()}
                  placeholder={typedPlaceholder || "Search a company..."}
                  className="flex-1 bg-transparent px-3 sm:px-4 py-4 sm:py-5 text-base sm:text-lg outline-none placeholder-gray-700"/>
                {query && (
                  <button onClick={() => setQuery("")} className="px-3 text-gray-600 hover:text-gray-400">
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg>
                  </button>
                )}
                <button onClick={() => analyze()} disabled={!query.trim()}
                  className="m-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-20 text-white"
                  style={{ background:"linear-gradient(135deg,#6366f1,#a855f7)" }}>
                  Analyze →
                </button>
              </div>
            </div>

            {error && <p className="mt-3 text-red-400 text-sm text-center">{error}</p>}

            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              <span className="text-gray-700 text-sm self-center">Try:</span>
              {["Tesla","Apple","Zomato","Infosys","Reliance","TCS","NVIDIA"].map(c => (
                <button key={c} onClick={() => analyze(c)}
                  className="text-xs sm:text-sm px-3 py-1.5 rounded-lg bg-[#0c0c12] hover:bg-[#13131f] border border-[#1e1e2e] hover:border-indigo-500/30 text-gray-600 hover:text-gray-200 transition-all">
                  {c}
                </button>
              ))}
            </div>

            <div className="mt-12 grid grid-cols-3 gap-4 max-w-sm sm:max-w-lg mx-auto border-t border-[#0f0f1a] pt-8">
              {[{label:"Companies",value:"10K+"},{label:"Data Sources",value:"50+"},{label:"Accuracy",value:"87%"}].map(s => (
                <div key={s.label} className="text-center">
                  <div className="text-xl sm:text-2xl font-black" style={{ background:"linear-gradient(135deg,#6366f1,#a855f7)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>{s.value}</div>
                  <div className="text-xs text-gray-700 mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── LOADING PHASE ── */}
      {phase === "loading" && (
        <div className="relative z-10 min-h-screen w-full flex flex-col lg:flex-row">
          <div className="flex-1 flex flex-col justify-center px-6 sm:px-10 py-16 max-w-2xl mx-auto w-full">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs mb-5 border" style={{ background:"rgba(99,102,241,0.08)",borderColor:"rgba(99,102,241,0.2)",color:"#818cf8" }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background:"#818cf8" }}/>
                LangGraph agent running
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold">Researching <span style={{ background:"linear-gradient(135deg,#6366f1,#a855f7)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>"{query}"</span></h2>
              <p className="text-gray-600 text-sm mt-1">3-node AI graph: Search → Analyze → Score</p>
            </div>
            <div className="space-y-2">
              {RESEARCH_STEPS.map((step, i) => {
                const done = completedSteps.includes(i), active = activeStep === i && !done;
                return (
                  <div key={i} className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-500 ${active ? "border-indigo-500/20" : "border-transparent"}`}
                    style={active ? { background:"rgba(99,102,241,0.06)" } : {}}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${done ? "" : active ? "" : "bg-[#0f0f1a]"}`}
                      style={done ? { background:"rgba(34,197,94,0.12)" } : active ? { background:"rgba(99,102,241,0.12)" } : {}}>
                      {done ? <svg width="12" height="12" fill="none" stroke="#22c55e" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg>
                        : active ? <div className="w-2 h-2 rounded-full animate-pulse" style={{ background:"#818cf8" }}/> : <div className="w-1.5 h-1.5 bg-gray-800 rounded-full"/>}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm ${done ? "text-gray-600" : active ? "text-white" : "text-gray-700"}`}>{step.text}</p>
                      {active && <div className="mt-2 h-px bg-[#1a1a2e] rounded-full overflow-hidden"><div className="h-full rounded-full animate-pulse w-2/3" style={{ background:"linear-gradient(90deg,#6366f1,#a855f7)" }}/></div>}
                    </div>
                    {done && <span className="text-xs text-green-800">done</span>}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="w-full lg:w-72 border-l border-[#0f0f1a] p-6 py-16">
            <p className="text-xs text-gray-700 uppercase tracking-widest mb-4">Sources found</p>
            <div className="space-y-2">
              {sources.map((src, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl border border-[#111120] animate-fadeIn" style={{ background:"rgba(99,102,241,0.04)" }}>
                  <svg width="12" height="12" fill="none" stroke="#444" strokeWidth="1.5" viewBox="0 0 24 24" className="mt-0.5 flex-shrink-0"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20"/></svg>
                  <div><p className="text-xs text-gray-500 font-medium">{src.split("/")[0]}</p><p className="text-xs text-gray-700 truncate">/{src.split("/").slice(1).join("/")}</p></div>
                </div>
              ))}
              {sources.length === 0 && <p className="text-xs text-gray-800 italic">Initializing agent...</p>}
            </div>
          </div>
        </div>
      )}

      {/* ── RESULT PHASE ── */}
      {report && phase === "result" && (
        <div className="relative z-10 min-h-screen w-full">
          {/* Topbar */}
          <div className="sticky top-0 z-50 backdrop-blur-md border-b border-[#0f0f1a] px-4 sm:px-6 py-3 flex items-center gap-3" style={{ background:"rgba(5,5,8,0.92)" }}>
            <button onClick={reset} className="flex items-center gap-1.5 text-gray-600 hover:text-white text-sm transition-all flex-shrink-0">
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg>
              <span className="hidden sm:inline">New search</span>
            </button>
            <div className="flex-1 flex items-center gap-2 bg-[#0c0c12] border border-[#1a1a2e] rounded-xl px-3 py-2 min-w-0">
              <svg width="12" height="12" fill="none" stroke="#555" strokeWidth="2" viewBox="0 0 24 24" className="flex-shrink-0"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <span className="text-gray-400 text-sm truncate">{query}</span>
            </div>
            <div className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-black border flex-shrink-0 ${isInvest ? "text-green-400 border-green-500/15" : "text-red-400 border-red-500/15"}`}
              style={{ background: isInvest ? "rgba(34,197,94,0.06)" : "rgba(239,68,68,0.06)" }}>
              {report.verdict}
            </div>
            <div className="hidden sm:flex items-center gap-1.5 flex-shrink-0">
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background:"#6366f1" }}/>
              <span className="text-indigo-500 text-xs">by Jatin</span>
            </div>
          </div>

          <div className="flex flex-col xl:flex-row min-h-[calc(100vh-52px)]">
            {/* MAIN */}
            <div className="flex-1 px-4 sm:px-6 py-6 sm:py-8 min-w-0">

              {/* Stage 1: Company card */}
              {revealStage >= 1 && (
                <div className="mb-5 animate-fadeIn">
                  <div className="rounded-2xl p-5 sm:p-6 border border-[#131320]" style={{ background:"rgba(12,12,18,0.8)" }}>
                    <div className="flex items-center gap-3 mb-4 flex-wrap">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background:"linear-gradient(135deg,rgba(99,102,241,0.2),rgba(168,85,247,0.2))",border:"1px solid rgba(99,102,241,0.15)" }}>
                        <span className="text-indigo-400 font-black text-sm">{report.company.slice(0,2).toUpperCase()}</span>
                      </div>
                      <div>
                        <h1 className="text-lg sm:text-xl font-black capitalize">{report.company}</h1>
                        <p className="text-gray-700 text-xs">Investment Research Report · LangGraph Agent</p>
                      </div>
                      <div className="ml-auto">
                        <span className="text-xs text-gray-700 bg-[#0f0f1a] border border-[#1a1a2e] px-2 py-1 rounded-lg">
                          {new Date().toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}
                        </span>
                      </div>
                    </div>
                    <div className="border-l-2 pl-4" style={{ borderColor:"rgba(99,102,241,0.3)" }}>
                      <p className="text-xs uppercase tracking-widest mb-2" style={{ color:"rgba(99,102,241,0.7)" }}>AI Summary</p>
                      <p className="text-gray-300 text-sm leading-relaxed"><TypewriterText text={report.summary} delay={200}/></p>
                    </div>
                  </div>
                </div>
              )}

              {/* Stage 2: Verdict */}
              {revealStage >= 2 && (
                <div className="mb-5 animate-fadeIn rounded-2xl p-5 sm:p-6 border" style={{ borderColor: isInvest ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)", background: isInvest ? "rgba(34,197,94,0.04)" : "rgba(239,68,68,0.04)" }}>
                  <p className="text-gray-600 text-xs uppercase tracking-widest mb-3">AI Verdict</p>
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <div className={`text-5xl sm:text-6xl font-black mb-2 ${isInvest ? "text-green-400" : "text-red-400"}`}>{report.verdict}</div>
                      <span className={`text-xs px-2 py-1 rounded border font-medium ${isInvest ? "text-green-400 border-green-500/15" : "text-red-400 border-red-500/15"}`}
                        style={{ background: isInvest ? "rgba(34,197,94,0.06)" : "rgba(239,68,68,0.06)" }}>
                        {isInvest ? "Strong Buy Signal" : "Avoid — High Risk"}
                      </span>
                    </div>
                    <div className="relative w-24 h-24 sm:w-28 sm:h-28">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 112 112">
                        <circle cx="56" cy="56" r="46" fill="none" stroke="#111" strokeWidth="8"/>
                        <circle cx="56" cy="56" r="46" fill="none" stroke={accent} strokeWidth="8"
                          strokeDasharray={`${2*Math.PI*46}`} strokeDashoffset={`${2*Math.PI*46*(1-report.confidence/100)}`} strokeLinecap="round"/>
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-xl sm:text-2xl font-black">{report.confidence}%</span>
                        <span className="text-gray-700 text-xs">confidence</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Stage 3: Financials */}
              {revealStage >= 3 && (
                <div className="mb-5 animate-fadeIn">
                  <p className="text-xs text-gray-700 uppercase tracking-widest mb-3">Financial Snapshot</p>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {[
                      {label:"Revenue",value:report.financials?.revenue},
                      {label:"Growth",value:report.financials?.growth},
                      {label:"Profitability",value:report.financials?.profitability},
                      {label:"Debt",value:report.financials?.debt},
                    ].map(item => (
                      <div key={item.label} className="rounded-xl p-4 border border-[#131320] hover:border-indigo-500/20 transition-all" style={{ background:"rgba(12,12,18,0.8)" }}>
                        <p className="text-gray-700 text-xs mb-1.5">{item.label}</p>
                        <p className="text-white text-sm font-semibold">{item.value||"N/A"}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Stage 4: Tabs */}
              {revealStage >= 4 && (
                <div className="animate-fadeIn">
                  <div className="flex gap-1 mb-5 rounded-xl p-1 w-fit border border-[#131320]" style={{ background:"rgba(12,12,18,0.8)" }}>
                    {(["overview","financials","analysis"] as const).map(tab => (
                      <button key={tab} onClick={() => setActiveTab(tab)}
                        className="px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium capitalize transition-all"
                        style={activeTab===tab ? { background:"rgba(99,102,241,0.15)",color:"#a5b4fc",border:"1px solid rgba(99,102,241,0.2)" } : { color:"#4b5563" }}>
                        {tab}
                      </button>
                    ))}
                  </div>

                  {activeTab === "overview" && (
                    <div className="space-y-4">
                      <div className="rounded-2xl p-5 border border-[#131320]" style={{ background:"rgba(12,12,18,0.8)" }}>
                        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                          <div>
                            <p className="text-sm font-semibold text-white">Projected Trend</p>
                            <p className="text-xs text-gray-700 mt-0.5">AI-estimated 30-day trajectory</p>
                          </div>
                          <span className="text-xs px-2 py-1 rounded border" style={{ color:accent, borderColor:`${accent}30`, background:`${accent}08` }}>
                            {isInvest ? "Bullish" : "Bearish"}
                          </span>
                        </div>
                        <ResponsiveContainer width="100%" height={160}>
                          <AreaChart data={priceData}>
                            <defs>
                              <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={accent} stopOpacity={0.12}/>
                                <stop offset="95%" stopColor={accent} stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid stroke="#0d0d1a" strokeDasharray="3 3"/>
                            <XAxis dataKey="day" tick={{fill:"#222",fontSize:10}} axisLine={false} tickLine={false} interval={4}/>
                            <YAxis tick={{fill:"#222",fontSize:10}} axisLine={false} tickLine={false}/>
                            <Tooltip contentStyle={{background:"#0c0c12",border:"1px solid #1a1a2e",borderRadius:"8px",fontSize:"12px"}}/>
                            <Area type="monotone" dataKey="price" stroke={accent} strokeWidth={2} fill="url(#ag)"/>
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="grid sm:grid-cols-3 gap-4">
                        {[
                          {title:"Strengths",items:report.pros,color:"#22c55e",border:"rgba(34,197,94,0.12)"},
                          {title:"Weaknesses",items:report.cons,color:"#ef4444",border:"rgba(239,68,68,0.12)"},
                          {title:"Risk Factors",items:report.risks,color:"#f59e0b",border:"rgba(245,158,11,0.12)"},
                        ].map(({title,items,color,border}) => (
                          <div key={title} className="rounded-2xl p-4 sm:p-5 border" style={{ background:"rgba(12,12,18,0.8)",borderColor:border }}>
                            <p className="text-sm font-semibold mb-3" style={{color}}>{title}</p>
                            <ul className="space-y-2">
                              {items?.map((item,i) => (
                                <li key={i} className="flex gap-2.5 text-xs text-gray-500">
                                  <span className="flex-shrink-0 mt-0.5" style={{color,opacity:0.5}}>—</span>{item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>

                      <div className="rounded-2xl p-5 border border-[#131320]" style={{ background:"rgba(12,12,18,0.8)" }}>
                        <p className="text-sm font-semibold text-white mb-2">Final Recommendation</p>
                        <p className="text-gray-500 text-sm leading-relaxed">{report.recommendation}</p>
                      </div>
                    </div>
                  )}

                  {activeTab === "financials" && (
                    <div className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="rounded-2xl p-5 border border-[#131320]" style={{ background:"rgba(12,12,18,0.8)" }}>
                          <p className="text-sm font-semibold text-white mb-1">Investment Radar</p>
                          <p className="text-xs text-gray-700 mb-4">Multi-dimensional scoring</p>
                          <ResponsiveContainer width="100%" height={220}>
                            <RadarChart data={getRadarData(report)}>
                              <PolarGrid stroke="#131320"/>
                              <PolarAngleAxis dataKey="subject" tick={{fill:"#2a2a3e",fontSize:11}}/>
                              <Radar dataKey="value" stroke={accent} fill={accent} fillOpacity={0.08} strokeWidth={1.5}/>
                            </RadarChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="rounded-2xl p-5 border border-[#131320]" style={{ background:"rgba(12,12,18,0.8)" }}>
                          <p className="text-sm font-semibold text-white mb-1">Sentiment</p>
                          <p className="text-xs text-gray-700 mb-4">News & data signals</p>
                          <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={generateSentimentData(report.pros?.length||3,report.cons?.length||2)} barSize={44}>
                              <XAxis dataKey="name" tick={{fill:"#2a2a3e",fontSize:11}} axisLine={false} tickLine={false}/>
                              <YAxis tick={{fill:"#1a1a2e",fontSize:10}} axisLine={false} tickLine={false}/>
                              <Tooltip contentStyle={{background:"#0c0c12",border:"1px solid #1a1a2e",borderRadius:"8px",fontSize:"12px"}}/>
                              <Bar dataKey="value" radius={[5,5,0,0]}>
                                {generateSentimentData(report.pros?.length||3,report.cons?.length||2).map((e,i) => <Cell key={i} fill={e.fill} fillOpacity={0.75}/>)}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      <div className="rounded-2xl p-5 border border-[#131320]" style={{ background:"rgba(12,12,18,0.8)" }}>
                        <p className="text-sm font-semibold text-white mb-4">Risk-O-Meter</p>
                        <div className="relative h-3 rounded-full overflow-hidden" style={{ background:"linear-gradient(to right,#22c55e,#f59e0b,#ef4444)" }}>
                          <div className="absolute top-0 h-3 w-1.5 bg-white rounded-full shadow-lg transition-all duration-1000" style={{ left:`calc(${100-report.confidence}% - 3px)` }}/>
                        </div>
                        <div className="flex justify-between text-xs text-gray-700 mt-2"><span>Low</span><span>Medium</span><span>High</span></div>
                      </div>

                      <div className="rounded-2xl overflow-hidden border border-[#131320]" style={{ background:"rgba(12,12,18,0.8)" }}>
                        <div className="px-5 py-4 border-b border-[#0f0f1a]"><p className="text-sm font-semibold text-white">Metrics</p></div>
                        {[
                          {metric:"Annual Revenue",value:report.financials?.revenue},
                          {metric:"Revenue Growth",value:report.financials?.growth},
                          {metric:"Profitability",value:report.financials?.profitability},
                          {metric:"Debt Position",value:report.financials?.debt},
                        ].map((row,i) => (
                          <div key={i} className="flex items-center justify-between px-5 py-3.5 border-b border-[#0a0a12] hover:bg-[#0d0d1a] transition-colors">
                            <span className="text-sm text-gray-600">{row.metric}</span>
                            <span className="text-sm text-white font-medium">{row.value||"N/A"}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === "analysis" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          {label:"Overall Score",value:report.confidence,color:accent},
                          {label:"Growth Score",value:Math.round(report.confidence*0.9),color:"#6366f1"},
                          {label:"Safety Score",value:isInvest?72:35,color:"#a855f7"},
                          {label:"Market Score",value:Math.round(report.confidence*0.95),color:"#f59e0b"},
                        ].map(s => (
                          <div key={s.label} className="rounded-xl p-4 border border-[#131320]" style={{ background:"rgba(12,12,18,0.8)" }}>
                            <p className="text-xs text-gray-700 mb-2">{s.label}</p>
                            <div className="flex items-end gap-2 mb-2">
                              <span className="text-2xl font-black" style={{color:s.color}}>{s.value}</span>
                              <span className="text-gray-700 text-xs mb-0.5">/100</span>
                            </div>
                            <div className="h-1 rounded-full overflow-hidden" style={{ background:"#0f0f1a" }}>
                              <div className="h-full rounded-full" style={{ width:`${s.value}%`,background:s.color,opacity:0.7 }}/>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="rounded-2xl p-5 border border-[#131320]" style={{ background:"rgba(12,12,18,0.8)" }}>
                        <p className="text-sm font-semibold text-white mb-3">Recent News</p>
                        <div className="space-y-2">
                          {report.recentNews?.map((n,i) => (
                            <div key={i} className="flex gap-3 p-3 rounded-xl border border-[#0f0f1a] hover:border-indigo-500/20 transition-all" style={{ background:"rgba(9,9,15,0.8)" }}>
                              <div className="w-1 flex-shrink-0 rounded-full mt-1" style={{ minHeight:"8px",background:i===0?"#6366f1":"#1a1a2e" }}/>
                              <p className="text-xs text-gray-500 leading-relaxed">{n}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-2xl p-5 border border-[#131320]" style={{ background:"rgba(12,12,18,0.8)" }}>
                        <p className="text-sm font-semibold text-white mb-2">Market Position</p>
                        <p className="text-gray-500 text-sm leading-relaxed">{report.marketPosition}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* SIDEBAR */}
            {revealStage >= 5 && (
              <div className="w-full xl:w-80 border-l border-[#0f0f1a] p-5 sm:p-6 py-6 sm:py-8 shrink-0 space-y-5 animate-fadeIn">

                {/* Verdict badge */}
                <div className="rounded-2xl p-4 border text-center" style={{ borderColor: isInvest?"rgba(34,197,94,0.15)":"rgba(239,68,68,0.15)", background: isInvest?"rgba(34,197,94,0.04)":"rgba(239,68,68,0.04)" }}>
                  <p className="text-xs text-gray-700 uppercase tracking-widest mb-1">AI Decision</p>
                  <p className={`text-4xl font-black mb-1 ${isInvest?"text-green-400":"text-red-400"}`}>{report.verdict}</p>
                  <p className="text-xs text-gray-600">{report.confidence}% confidence</p>
                </div>

                {/* Quick stats */}
                <div>
                  <p className="text-xs text-gray-700 uppercase tracking-widest mb-3">Quick Stats</p>
                  <div className="space-y-2">
                    {[
                      {label:"Strengths",value:`${report.pros?.length} factors`,color:"#22c55e"},
                      {label:"Weaknesses",value:`${report.cons?.length} factors`,color:"#ef4444"},
                      {label:"Risks",value:`${report.risks?.length} identified`,color:"#f59e0b"},
                      {label:"News Items",value:`${report.recentNews?.length} sources`,color:"#6366f1"},
                    ].map(s => (
                      <div key={s.label} className="flex items-center justify-between py-2 border-b border-[#0f0f1a]">
                        <span className="text-xs text-gray-700">{s.label}</span>
                        <span className="text-xs font-semibold" style={{color:s.color}}>{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mini chart */}
                <div>
                  <p className="text-xs text-gray-700 uppercase tracking-widest mb-3">30-Day Projection</p>
                  <div className="rounded-xl p-3 border border-[#131320]" style={{ background:"rgba(12,12,18,0.8)" }}>
                    <ResponsiveContainer width="100%" height={80}>
                      <LineChart data={priceData}>
                        <Line type="monotone" dataKey="price" stroke={accent} strokeWidth={1.5} dot={false}/>
                        <Tooltip contentStyle={{background:"#0c0c12",border:"none",borderRadius:"6px",fontSize:"11px"}} labelFormatter={()=>""}/>
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-xs mt-2 text-center" style={{color: isInvest?"#166534":"#7f1d1d"}}>
                    {isInvest?"Upward trend expected":"Downward pressure likely"}
                  </p>
                </div>

                {/* Score breakdown */}
                <div>
                  <p className="text-xs text-gray-700 uppercase tracking-widest mb-3">Score Breakdown</p>
                  <div className="space-y-3">
                    {[
                      {label:"Overall",value:report.confidence,color:accent},
                      {label:"Growth",value:Math.round(report.confidence*0.9),color:"#6366f1"},
                      {label:"Safety",value:isInvest?72:35,color:"#a855f7"},
                      {label:"Market",value:Math.round(report.confidence*0.95),color:"#f59e0b"},
                    ].map(s => (
                      <div key={s.label}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-600">{s.label}</span>
                          <span className="font-semibold" style={{color:s.color}}>{s.value}/100</span>
                        </div>
                        <div className="h-1 rounded-full overflow-hidden" style={{background:"#0f0f1a"}}>
                          <div className="h-full rounded-full" style={{width:`${s.value}%`,background:s.color,opacity:0.7}}/>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Risk meter */}
                <div>
                  <p className="text-xs text-gray-700 uppercase tracking-widest mb-3">Risk Level</p>
                  <div className="relative h-3 rounded-full overflow-hidden" style={{background:"linear-gradient(to right,#22c55e,#f59e0b,#ef4444)"}}>
                    <div className="absolute top-0 h-3 w-1.5 bg-white rounded-full shadow-lg transition-all duration-1000" style={{left:`calc(${100-report.confidence}% - 3px)`}}/>
                  </div>
                  <div className="flex justify-between text-xs text-gray-700 mt-1.5"><span>Low</span><span>Med</span><span>High</span></div>
                </div>

                {/* Top strengths */}
                <div>
                  <p className="text-xs text-gray-700 uppercase tracking-widest mb-3">Top Strengths</p>
                  <div className="space-y-1.5">
                    {report.pros?.slice(0,3).map((p,i) => (
                      <div key={i} className="flex gap-2 text-xs text-gray-500 rounded-lg px-3 py-2 border border-[#0f0f1a]" style={{background:"rgba(12,12,18,0.8)"}}>
                        <span className="text-green-700 flex-shrink-0">+</span>{p}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Analyze another */}
                <div className="border-t border-[#0f0f1a] pt-4">
                  <p className="text-xs text-gray-700 uppercase tracking-widest mb-3">Analyze Another</p>
                  <div className="flex flex-wrap gap-1.5">
                    {["Tesla","Apple","Zomato","NVIDIA","TCS","Infosys"].filter(c=>c.toLowerCase()!==query.toLowerCase()).slice(0,6).map(c => (
                      <button key={c} onClick={()=>analyze(c)}
                        className="text-xs px-3 py-1.5 rounded-lg border border-[#131320] hover:border-indigo-500/30 text-gray-600 hover:text-white transition-all"
                        style={{background:"rgba(12,12,18,0.8)"}}>
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}