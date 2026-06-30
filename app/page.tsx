"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePulse } from "@/lib/pulse-store";
import { Service, Incident, Status } from "@/lib/pulse-types";
import { 
  Activity, 
  Brain, 
  Cpu, 
  Sparkles, 
  Atom, 
  Zap, 
  Search, 
  CloudLightning, 
  CloudOff, 
  Cloud, 
  Database, 
  CloudRain, 
  Globe, 
  Wind, 
  ShieldAlert, 
  CreditCard, 
  Wallet, 
  Coins, 
  Banknote, 
  Github, 
  Gitlab, 
  Triangle, 
  Spline, 
  Terminal, 
  Layers, 
  Slack,
  MessageSquare, 
  Video, 
  Smartphone, 
  Users, 
  Hash, 
  Route, 
  Eye, 
  MessageCircle, 
  Rss, 
  Camera, 
  Youtube, 
  Settings, 
  AlertTriangle, 
  HeartPulse, 
  RefreshCw, 
  Play, 
  CheckCircle, 
  Server, 
  TrendingUp, 
  Network, 
  X, 
  Radio,
  ArrowRight,
  Sliders,
  Calendar,
  Layers3,
  ExternalLink,
  ChevronRight,
  CornerDownRight,
  ShieldCheck,
  ZapOff
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Lucide mapping engine to escape raw symbol reference issues
const ICON_MAP: Record<string, any> = {
  Brain, Cpu, Sparkles, Atom, Zap, 
  CloudLightning, CloudOff, Cloud, Database, CloudRain, 
  Globe, Wind, ShieldAlert, CreditCard, Wallet, Coins, Banknote, 
  Github, Gitlab, Triangle, Spline, Terminal, Layers, 
  SlackSymbol: Slack, MessageSquare, Video, Smartphone, Users, 
  Hash, Route, Activity, Eye, MessageCircle, TwitterSymbol: Radio, LinkedIn: Users, 
  Rss, Camera, Youtube, Settings, AlertTriangle, HeartPulse, RefreshCw
};

export default function IPulseMainWindow() {
  const {
    services,
    incidents,
    activityLogs,
    historyPoints,
    ipi,
    lastUpdated,
    activeView,
    setActiveView,
    searchQuery,
    setSearchQuery,
    triggerScenario,
    repairAll,
    toggleMockFetch,
    useLiveFetching,
    manualUpdate
  } = usePulse();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDependencyNode, setSelectedDependencyNode] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("all"); // for search categorization
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);

  // Auto-scroll logic for live ledger ticker
  const logContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = 0; // maintain newest at top
    }
  }, [activityLogs]);

  const CATEGORIES = [
    { name: "AI", icon: "Brain", count: services.filter(s => s.category === "AI").length },
    { name: "Cloud", icon: "Cloud", count: services.filter(s => s.category === "Cloud").length },
    { name: "CDN & Edge", icon: "Globe", count: services.filter(s => s.category === "CDN & Edge").length },
    { name: "Payments", icon: "CreditCard", count: services.filter(s => s.category === "Payments").length },
    { name: "Developer", icon: "Terminal", count: services.filter(s => s.category === "Developer").length },
    { name: "Communication", icon: "MessageSquare", count: services.filter(s => s.category === "Communication").length },
    { name: "DNS", icon: "Hash", count: services.filter(s => s.category === "DNS").length },
    { name: "Social", icon: "Rss", count: services.filter(s => s.category === "Social").length },
  ];

  // Map category to color
  const getStatusColor = (status: Status) => {
    switch (status) {
      case "operational": return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
      case "degraded": return "text-amber-400 bg-amber-500/10 border-amber-500/20";
      case "outage": return "text-rose-400 bg-rose-500/10 border-rose-500/20";
      case "maintenance": return "text-sky-400 bg-sky-500/10 border-sky-500/20";
      default: return "text-gray-400 bg-gray-500/10 border-gray-500/20";
    }
  };

  const getStatusDotColor = (status: Status) => {
    switch (status) {
      case "operational": return "bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.5)]";
      case "degraded": return "bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.5)]";
      case "outage": return "bg-rose-500 shadow-[0_0_12px_rgba(239,68,68,0.65)]";
      case "maintenance": return "bg-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.5)]";
      default: return "bg-gray-400";
    }
  };

  const getSlaColor = (uptime: number) => {
    if (uptime >= 99.9) return "text-emerald-400";
    if (uptime >= 99.7) return "text-amber-400";
    return "text-rose-400";
  };

  const getCategoryStatusEmoji = (categoryName: string) => {
    const catServices = services.filter(s => s.category === categoryName);
    const hasOutage = catServices.some(s => s.status === "outage");
    const hasDegraded = catServices.some(s => s.status === "degraded");
    if (hasOutage) return "🔴";
    if (hasDegraded) return "🟡";
    return "🟢";
  };

  // Helper to resolve dynamically mapped Lucide icons safely
  const renderLucide = (name: string, className = "w-5 h-5") => {
    const Component = ICON_MAP[name];
    if (Component) return <Component className={className} />;
    return <Activity className={className} />;
  };

  // Extract filtered service lists
  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          service.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          service.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? service.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  const activeOutages = services.filter(s => s.status === "outage");
  const activeDegraded = services.filter(s => s.status === "degraded");

  return (
    <div className="relative min-h-screen bg-black text-gray-200 flex flex-col lg:flex-row pb-20 lg:pb-0">
      
      {/* GLOWING AURORAS IN BACKDROP */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#6C5CE7]/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[45%] h-[45%] bg-[#00B8FF]/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[35%] left-[30%] w-[40%] h-[40%] bg-pink-500/5 rounded-full blur-[180px] pointer-events-none" />

      {/* --- SIDEBAR NAV (DESKTOP) --- */}
      <aside className="hidden lg:flex flex-col w-72 bg-black/40 backdrop-blur-3xl border-r border-white/5 p-6 h-screen sticky top-0 shrink-0 justify-between z-30">
        <div className="flex flex-col gap-8 overflow-y-auto pr-1">
          {/* Logo Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setActiveView("dashboard"); setSelectedCategory(null); }}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 p-[1.5px] shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-black rounded-[10px] flex items-center justify-center">
                <HeartPulse className="w-5 h-5 text-indigo-400 animate-pulse" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold font-display tracking-tight text-white flex items-center gap-1.5 leading-none">
                iPulse <span className="text-[9px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-500/20 uppercase tracking-widest">LIVE</span>
              </h1>
              <p className="text-[10px] text-gray-400 font-mono tracking-tighter">GLOBAL INTEL GRID v1.0</p>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="flex flex-col gap-1.5">
            <p className="text-[10px] font-mono font-semibold text-gray-500 tracking-wider mb-2 uppercase">Core Engine</p>
            
            <button 
              onClick={() => { setActiveView("dashboard"); setSelectedCategory(null); }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${activeView === "dashboard" ? "bg-white/5 border border-white/10 text-white shadow-lg shadow-black/30" : "text-gray-400 hover:text-white hover:bg-white/[0.02] border border-transparent"}`}
            >
              <div className="flex items-center gap-3">
                <Server className="w-4 h-4 text-indigo-400" />
                <span>Overview Deck</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-40" />
            </button>

            <button 
              onClick={() => setActiveView("incidents")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${activeView === "incidents" ? "bg-white/5 border border-white/10 text-white shadow-lg shadow-black/30" : "text-gray-400 hover:text-white hover:bg-white/[0.02] border border-transparent"}`}
            >
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Incident Office</span>
                {incidents.length > 0 && (
                  <span className="text-[10px] bg-rose-500 text-white px-2 py-0.5 rounded-full font-bold animate-pulse">
                    {incidents.length}
                  </span>
                )}
              </div>
              <ChevronRight className="w-4 h-4 opacity-40" />
            </button>

            <button 
              onClick={() => setActiveView("visualizer")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${activeView === "visualizer" ? "bg-white/5 border border-white/10 text-white shadow-lg shadow-black/30" : "text-gray-400 hover:text-white hover:bg-white/[0.02] border border-transparent"}`}
            >
              <div className="flex items-center gap-3">
                <Network className="w-4 h-4 text-sky-400" />
                <span>Dependency Map</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-40" />
            </button>

            <button 
              onClick={() => setActiveView("settings")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${activeView === "settings" ? "bg-white/5 border border-white/10 text-white shadow-lg shadow-black/30" : "text-gray-400 hover:text-white hover:bg-white/[0.02] border border-transparent"}`}
            >
              <div className="flex items-center gap-3">
                <Settings className="w-4 h-4 text-gray-400" />
                <span>Control Console</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-40" />
            </button>
          </nav>

          {/* Category Tree Navigation Quick Links */}
          <div className="flex flex-col gap-1.5 mt-2">
            <p className="text-[10px] font-mono font-semibold text-gray-500 tracking-wider mb-2 uppercase">Category Filters</p>
            <div className="grid grid-cols-2 gap-1.5">
              {CATEGORIES.map(cat => {
                const isActive = selectedCategory === cat.name;
                const getStatusIndicator = () => {
                  const catServices = services.filter(s => s.category === cat.name);
                  if (catServices.some(s => s.status === "outage")) return "border-rose-500/40 text-rose-400";
                  if (catServices.some(s => s.status === "degraded")) return "border-amber-500/40 text-amber-400";
                  return "border-emerald-500/20 text-emerald-400";
                };

                return (
                  <button
                    key={cat.name}
                    onClick={() => {
                      setSelectedCategory(isActive ? null : cat.name);
                      if (activeView !== "dashboard") setActiveView("dashboard");
                    }}
                    className={`text-left p-2.5 rounded-lg border text-xs font-medium transition-all duration-150 ${
                      isActive 
                        ? "bg-indigo-600/20 border-indigo-500/40 text-white" 
                        : `bg-white/[0.01] hover:bg-white/[0.03] text-gray-400 hover:text-gray-200 ${getStatusIndicator()}`
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 truncate">
                      {renderLucide(cat.icon, "w-3.5 h-3.5")}
                      <span className="truncate">{cat.name}</span>
                    </div>
                    <span className="text-[9px] text-gray-500 font-mono">
                      {cat.count} endpoints
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Global Stats Footer */}
        <div className="pt-4 border-t border-white/5">
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-gray-400 font-mono">NODE NET</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                SECURE EDGE
              </span>
            </div>
            <div className="h-[2px] w-full bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-500"
                style={{ width: `${ipi}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono text-gray-500 mt-1">
              <span>IPI HEURISTIC</span>
              <span>{ipi}%</span>
            </div>
          </div>
        </div>
      </aside>

      {/* --- FLOATING CONTROLS BOTTOM NAV (MOBILE) --- */}
      <nav className="fixed bottom-0 left-0 right-0 lg:hidden bg-black/60 backdrop-blur-md border-t border-white/10 px-4 py-2 flex items-center justify-around z-40">
        <button 
          onClick={() => { setActiveView("dashboard"); setSelectedCategory(null); }}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-xs font-medium ${activeView === "dashboard" ? "text-indigo-400" : "text-gray-400"}`}
        >
          <Server className="w-5 h-5" />
          <span>Overview</span>
        </button>
        <button 
          onClick={() => setActiveView("incidents")}
          className={`relative flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-xs font-medium ${activeView === "incidents" ? "text-indigo-400" : "text-gray-400"}`}
        >
          <AlertTriangle className="w-5 h-5" />
          <span>Incidents</span>
          {incidents.length > 0 && (
            <span className="absolute top-0 right-2 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center animate-pulse">
              {incidents.length}
            </span>
          )}
        </button>
        <button 
          onClick={() => setActiveView("visualizer")}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-xs font-medium ${activeView === "visualizer" ? "text-indigo-400" : "text-gray-400"}`}
        >
          <Network className="w-5 h-5" />
          <span>Map</span>
        </button>
        <button 
          onClick={() => setActiveView("settings")}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-xs font-medium ${activeView === "settings" ? "text-indigo-400" : "text-gray-400"}`}
        >
          <Sliders className="w-5 h-5" />
          <span>Console</span>
        </button>
      </nav>

      {/* --- MAIN DASHBOARD CONTENT AREA --- */}
      <main className="flex-1 flex flex-col px-4 pb-4 pt-0 md:px-8 md:pb-8 md:pt-0 max-w-7xl mx-auto w-full">
        
        {/* TOP STATUS HEADER BAR */}
        <header className="sticky top-0 z-30 flex flex-col md:flex-row md:items-center justify-between gap-3 py-3 mb-6 backdrop-blur-3xl backdrop-saturate-[1.8] bg-gradient-to-b from-white/[0.05] via-black/40 to-black/60 border-b border-white/[0.08] shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] -mx-4 px-4 md:-mx-8 md:px-8 transition-all duration-300">
          <div className="flex items-center gap-3">
            {/* Mobile Brand */}
            <div className="lg:hidden w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center shrink-0">
              <HeartPulse className="w-3 h-3 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="relative flex h-1 w-1">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${ipi > 95 ? "bg-emerald-400" : ipi > 80 ? "bg-amber-400" : "bg-rose-400"}`}></span>
                  <span className={`relative inline-flex rounded-full h-1 w-1 ${ipi > 95 ? "bg-emerald-500" : ipi > 80 ? "bg-amber-500" : "bg-rose-500"}`}></span>
                </span>
                <p className="text-[8px] uppercase font-mono tracking-[0.25em] text-[#00B8FF] font-bold">Internet Health Oracle</p>
                <span className="text-[8px] bg-white/5 border border-white/10 px-1 py-0.2 rounded text-gray-400 font-mono scale-90 origin-left">
                  v1.0.4
                </span>
              </div>
              <h2 className="text-sm md:text-base font-bold font-display tracking-tight text-white flex items-center gap-2 mt-0.5">
                {activeView === "dashboard" && (selectedCategory ? `${selectedCategory} Infrastructure` : "Global Infrastructure Matrix")}
                {activeView === "incidents" && "Incident Control Office"}
                {activeView === "visualizer" && "Global Dependency Netmap"}
                {activeView === "settings" && "Chaos & Simulator Console"}
                {activeView.startsWith("service-") && "Provider Health Diagnostic"}
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Engine Pin */}
            <div className="relative w-full sm:w-48 md:w-52">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                <Search className="h-3 w-3 text-gray-500" />
              </div>
              <input
                type="text"
                placeholder="Search endpoints, pings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-7.5 pr-2.5 py-1 bg-white/[0.02] hover:bg-white/[0.04] focus:bg-white/[0.06] border border-white/5 focus:border-indigo-500/30 rounded text-[11px] text-gray-200 placeholder-gray-500 focus:outline-none transition-all duration-150 font-mono"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute inset-y-0 right-0 pr-2 flex items-center text-gray-500 hover:text-white">
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            {/* Raw Diagnostic Ticks Trigger */}
            <button 
              onClick={manualUpdate}
              className="flex items-center justify-center gap-1.5 px-2.5 py-1 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/20 text-indigo-300 font-mono text-[10px] rounded transition-all duration-150 active:scale-95 cursor-pointer"
            >
              <RefreshCw className="w-2.5 h-2.5 text-indigo-400" />
              <span>TEST LATENCY</span>
            </button>

            {/* Quick Overrides */}
            {services.some(s => s.status !== "operational") && (
              <button 
                onClick={repairAll}
                className="flex items-center justify-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 font-mono text-[10px] rounded transition-all duration-150 cursor-pointer"
              >
                <ShieldCheck className="w-2.5 h-2.5" />
                <span>REPAIR</span>
              </button>
            )}

            {/* Quick Chaos panel toggle */}
            <button 
              onClick={() => setIsSimulatorOpen(prev => !prev)}
              className="flex items-center justify-center gap-1.5 px-2.5 py-1 bg-white/[0.02] hover:bg-white/[0.04] active:bg-white/[0.06] border border-white/5 group text-gray-300 font-mono text-[10px] rounded transition-all duration-150 cursor-pointer"
            >
              <Sliders className="w-2.5 h-2.5 text-indigo-400 group-hover:rotate-12 transition-transform duration-150" />
              <span className="hidden sm:inline">CHAOS ENG</span>
            </button>
          </div>
        </header>

        {/* --- DYNAMIC SUB-VIEWS ROUTER --- */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView + (selectedCategory || "")}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-8"
          >
            {/* VIEW 1: OVERVIEW DASHBOARD */}
            {activeView === "dashboard" && (
              <>
                {/* SECTION 1: INTERNET HEALTH HERO */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                  
                  {/* Huge Circular Indicator Dial (VisionOS styled glass canvas) */}
                  <div className="lg:col-span-7 bg-white/[0.03] border border-white/5 rounded-[28px] p-6 backdrop-blur-3xl shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center gap-8 justify-between">
                    {/* Tiny visual mesh */}
                    <div className="absolute inset-0 bg-radial-grid opacity-10 pointer-events-none" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/10 rounded-full blur-[60px] pointer-events-none" />

                    {/* Radial Ring */}
                    <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        {/* Track ring */}
                        <circle
                          cx="88"
                          cy="88"
                          r="76"
                          className="stroke-white/[0.03] fill-none"
                          strokeWidth="11"
                        />
                        {/* Dynamic colorful indicator with gradient */}
                        <circle
                          cx="88"
                          cy="88"
                          r="76"
                          className="fill-none transition-all duration-1000 ease-out"
                          stroke={ipi > 95 ? "#00E676" : ipi > 80 ? "#FFB020" : "#FF4D6D"}
                          strokeWidth="11"
                          strokeDasharray={2 * Math.PI * 76}
                          strokeDashoffset={2 * Math.PI * 76 * (1 - ipi / 100)}
                          strokeLinecap="round"
                        />
                      </svg>
                      
                      {/* Inner percentage Text */}
                      <div className="absolute flex flex-col items-center justify-center text-center">
                        <span className="text-4xl md:text-5xl font-black font-display text-white italic leading-none flex items-baseline">
                          {ipi}
                          <span className="text-sm font-bold text-gray-400 ml-0.5">%</span>
                        </span>
                        <span className="text-[10px] font-mono text-gray-400 font-bold uppercase tracking-wider mt-1">Global IPI</span>
                        <span className={`text-[9px] px-2 py-0.5 mt-1 rounded font-bold uppercase ${ipi > 95 ? "bg-emerald-500/20 text-emerald-400" : ipi > 80 ? "bg-amber-500/20 text-amber-400" : "bg-rose-500/20 text-rose-400 animate-pulse"}`}>
                          {ipi > 95 ? "EXCELLENT" : ipi > 80 ? "DEGRADED" : "CRITICAL OUTAGE"}
                        </span>
                      </div>
                    </div>

                    {/* Metrics Panel Column */}
                    <div className="flex-1 flex flex-col gap-4 w-full">
                      <div>
                        <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#00B8FF] font-bold uppercase tracking-widest mb-1">
                          <span className="w-1.5 h-1.5 bg-[#00B8FF] rounded-full animate-pulse" />
                          iPulse Realtime Summary
                        </div>
                        <h3 className="text-2xl font-bold font-display text-white leading-tight">
                          Is the Internet healthy right now?
                        </h3>
                        <p className="text-sm text-gray-400 max-w-sm mt-1">
                          {ipi > 95 
                            ? "All major global cloud pipelines, Anycast DNS grids, and payment handlers are delivering responses inside SLA targets." 
                            : `Cascading stress detected due to ${activeOutages.length} active outages. Upstream CDN systems are triggering performance lags.`}
                        </p>
                      </div>

                      {/* Micro Statistics Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t border-white/5 font-mono">
                        <div>
                          <div className="text-[10px] text-gray-500">MONITORED</div>
                          <div className="text-md font-bold text-white flex items-end gap-1">
                            8.5K+
                            <span className="text-[9px] text-gray-400 font-normal">nodes</span>
                          </div>
                        </div>

                        <div>
                          <div className="text-[10px] text-gray-500">INCIDENTS</div>
                          <div className="text-md font-bold text-white flex items-center gap-1.5">
                            {incidents.length}
                            {incidents.length > 0 && (
                              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                            )}
                          </div>
                        </div>

                        <div>
                          <div className="text-[10px] text-gray-500">MAJOR DOWNS</div>
                          <div className="text-md font-bold text-rose-400 flex items-center gap-1.5 font-bold">
                            {activeOutages.length}
                            {activeOutages.length > 0 && (
                              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse animate-duration-500" />
                            )}
                          </div>
                        </div>

                        <div>
                          <div className="text-[10px] text-gray-500">REFRESHES</div>
                          <div className="text-md font-bold text-indigo-400 truncate text-[11px]">
                            {lastUpdated}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 24-Hour Historical Mini Graph Sparkline (Interactive SVG) */}
                  <div className="lg:col-span-5 bg-white/[0.03] border border-white/5 rounded-[28px] p-6 backdrop-blur-3xl shadow-2xl flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="text-[10px] font-mono uppercase tracking-wider text-gray-500">Index Record</div>
                        <h4 className="text-md font-semibold font-display text-white">24h History Timeline</h4>
                      </div>
                      <span className="text-xs bg-white/5 text-gray-400 px-2 py-0.5 rounded font-mono">
                        Avg: {(historyPoints.reduce((acc, curr) => acc + curr.ipi, 0) / historyPoints.length).toFixed(1)}%
                      </span>
                    </div>

                    {/* SVG Sparkline Area */}
                    <div className="relative h-28 w-full mt-2">
                      <svg className="w-full h-full overflow-visible" viewBox="0 0 100 40" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#6C5CE7" stopOpacity="0.45" />
                            <stop offset="100%" stopColor="#6C5CE7" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>

                        {/* Chart Grid Lines */}
                        <line x1="0" y1="10" x2="100" y2="10" stroke="rgba(255,255,255,0.02)" strokeWidth="0.5" />
                        <line x1="0" y1="20" x2="100" y2="20" stroke="rgba(255,255,255,0.02)" strokeWidth="0.5" />
                        <line x1="0" y1="30" x2="100" y2="30" stroke="rgba(255,255,255,0.02)" strokeWidth="0.5" />

                        {/* Interactive Curve Path */}
                        {historyPoints.length > 1 && (() => {
                          const pointsString = historyPoints.map((point, index) => {
                            const x = (index / (historyPoints.length - 1)) * 100;
                            // map ipi 90-100 to y 38-2 (higher is better on top)
                            const clampedIpi = Math.max(88, Math.min(100, point.ipi));
                            const y = 35 - ((clampedIpi - 88) / 12) * 32;
                            return `${x},${y}`;
                          });

                          return (
                            <>
                              {/* Filled Glowing Path underneath */}
                              <path
                                d={`M 0,40 L ${pointsString.map(ps => ps.split(',')).map(xy => `${xy[0]},${xy[1]}`).join(' L ')} L 100,40 Z`}
                                fill="url(#chartGlow)"
                              />
                              {/* Drawing line */}
                              <path
                                d={`M ${pointsString.join(' L ')}`}
                                fill="none"
                                stroke="#6C5CE7"
                                strokeWidth="2.0"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              
                              {/* Glowing Laser Dot on newest */}
                              {(() => {
                                const lastX = 100;
                                const lastPoint = historyPoints[historyPoints.length - 1];
                                const lastClamped = Math.max(88, Math.min(100, lastPoint.ipi));
                                const lastY = 35 - ((lastClamped - 88) / 12) * 32;
                                return (
                                  <circle
                                    cx={lastX}
                                    cy={lastY}
                                    r="2.5"
                                    fill="#00E676"
                                    className="animate-ping"
                                    style={{ transformOrigin: `${lastX}px ${lastY}px` }}
                                  />
                                );
                              })()}
                            </>
                          );
                        })()}
                      </svg>
                    </div>

                    {/* Timeline Bottom Labels */}
                    <div className="flex justify-between items-center text-[9px] text-gray-500 font-mono mt-2">
                      <span>24h ago</span>
                      <span>12h ago</span>
                      <span>Live ticker</span>
                    </div>
                  </div>
                </div>

                {/* SECTION 2: GLOBAL OUTAGE RADAR GRID HEATMAP */}
                <section className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-indigo-400 font-mono tracking-wider font-semibold uppercase">Realtime Heatmap</p>
                      <h4 className="text-lg font-bold font-display text-white">Global Infrastructure Status Heatmap</h4>
                    </div>
                    {selectedCategory && (
                      <button 
                        onClick={() => setSelectedCategory(null)}
                        className="text-xs text-indigo-400 hover:text-white flex items-center gap-1 bg-white/5 border border-white/5 px-2.5 py-1 rounded-lg"
                      >
                        Reset Filter <X className="w-3" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {CATEGORIES.map(category => {
                      const isActive = selectedCategory === category.name;
                      const catServices = services.filter(s => s.category === category.name);
                      
                      const operationalCount = catServices.filter(s => s.status === "operational").length;
                      const degradedCount = catServices.filter(s => s.status === "degraded").length;
                      const downCount = catServices.filter(s => s.status === "outage").length;
                      const maintCount = catServices.filter(s => s.status === "maintenance").length;

                      const calculatedPercent = parseFloat(
                        ((operationalCount + maintCount + degradedCount * 0.5) / catServices.length * 100).toFixed(0)
                      );

                      // Determine overall visual health gradient glow
                      let colorBorderClass = "hover:border-emerald-500/20";
                      if (downCount > 0) colorBorderClass = "hover:border-rose-500/35 border-rose-500/10";
                      else if (degradedCount > 0) colorBorderClass = "hover:border-amber-500/35 border-amber-500/10";

                      return (
                        <div
                          key={category.name}
                          onClick={() => setSelectedCategory(isActive ? null : category.name)}
                          className={`cursor-pointer p-4 rounded-2xl border backdrop-blur-3xl transition-all duration-200 group relative overflow-hidden ${
                            isActive
                              ? "bg-indigo-600/15 border-indigo-500/40 shadow-lg shadow-indigo-500/5 text-white"
                              : `bg-white/[0.015] border-white/5 ${colorBorderClass} text-gray-300 hover:bg-white/[0.04] shadow-md`
                          }`}
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{getCategoryStatusEmoji(category.name)}</span>
                              <div className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-indigo-300">
                                {renderLucide(category.icon, "w-4 h-4")}
                              </div>
                              <h5 className="font-semibold text-sm font-display tracking-tight text-white group-hover:text-indigo-300 transition-colors duration-150">
                                {category.name}
                              </h5>
                            </div>
                            <span className="text-xs font-mono font-bold text-gray-400">
                              {calculatedPercent}%
                            </span>
                          </div>

                          {/* Interactive status indicators blocks for sub-services */}
                          <div className="flex flex-wrap gap-1 mt-3">
                            {catServices.map(subS => {
                              let innerCol = getStatusDotColor(subS.status);
                              return (
                                <span
                                  key={subS.id}
                                  title={`${subS.name}: ${subS.status} (${subS.latency}ms)`}
                                  className={`w-3.5 h-3.5 rounded border border-white/5 flex items-center justify-center cursor-pointer hover:scale-125 transition-transform duration-100 ${innerCol}`}
                                />
                              );
                            })}
                          </div>

                          <div className="flex items-center justify-between text-[9px] font-mono text-gray-500 mt-4 pt-2 border-t border-white/5">
                            <span className="truncate">{catServices.length} endpoints</span>
                            <span>{operationalCount}/{catServices.length} OK</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>

                {/* MULTI SECTION COMBINED GRID (Outages + Service Nodes + Live Feed) */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                  
                  {/* LEFT PANELS: ACTIVE OUTAGES CARDS & SERVICE DIRECTORY */}
                  <div className="xl:col-span-8 flex flex-col gap-6">
                    
                    {/* SECTION 3: RECENT MAJOR OUTAGES */}
                    <section className="flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                          <h4 className="text-md font-bold font-display text-white">Critical Systems Degradation Reports</h4>
                        </div>
                        <span className="text-xs text-gray-500 font-mono">Real-time threat feed</span>
                      </div>

                      <AnimatePresence mode="popLayout">
                        {incidents.length === 0 ? (
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-6 text-center backdrop-blur-2xl"
                          >
                            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-3">
                              <ShieldCheck className="w-6 h-6 text-emerald-400" />
                            </div>
                            <h5 className="text-emerald-400 font-bold font-display text-md">Global Architecture Sovereign Nominal</h5>
                            <p className="text-xs text-emerald-300/60 max-w-sm mx-auto mt-1 font-mono">
                              No outages or severe packet losses reported. All Anycast nameservers, database queries, and Edge gateways operating inside 99.98% SLA boundaries.
                            </p>
                          </motion.div>
                        ) : (
                          <div className="flex flex-col gap-3.5">
                            {incidents.map(inc => (
                              <motion.div
                                key={inc.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white/[0.02] border border-[#FF4D6D]/45 hover:border-[#FF4D6D]/75 rounded-2xl p-5 backdrop-blur-3xl relative overflow-hidden group transition-all duration-200"
                              >
                                <div className="absolute top-0 right-0 p-3 flex gap-2">
                                  <span className="text-[10px] uppercase font-mono bg-rose-500/15 border border-rose-500/30 text-rose-400 px-2 py-0.5 rounded">
                                    {inc.severity.toUpperCase()}
                                  </span>
                                  <span className="text-[10px] uppercase font-mono bg-white/5 text-gray-400 px-2 py-0.5 rounded">
                                    {inc.status.toUpperCase()}
                                  </span>
                                </div>

                                <div className="flex items-start gap-3.5 pr-24">
                                  <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
                                    <ZapOff className="w-5 h-5" />
                                  </div>
                                  <div>
                                    <h5 className="font-bold text-sm text-white group-hover:text-rose-300 transition-colors duration-150">
                                      {inc.title}
                                    </h5>
                                    <p className="text-xs text-rose-300/40 font-mono mt-0.5">
                                      Provider: {inc.serviceName} &bull; Started: {inc.startedAt}
                                    </p>
                                    <p className="text-xs text-gray-300 mt-2.5 leading-relaxed">
                                      {inc.description}
                                    </p>
                                  </div>
                                </div>

                                {/* Custom nested diagnostic logs updates */}
                                {inc.timeline.length > 0 && (
                                  <div className="mt-4 pt-3 border-t border-white/5 bg-white/[0.01] rounded-lg p-3">
                                    <div className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest mb-1.5 font-bold">
                                      LATEST CORRECTION LOG
                                    </div>
                                    <div className="flex items-start gap-2">
                                      <CornerDownRight className="w-3.5 h-3.5 text-gray-500 shrink-0 mt-0.5" />
                                      <div className="text-xs">
                                        <span className="font-mono text-gray-500 mr-2">[{inc.timeline[0].time}]</span>
                                        <span className="text-gray-300">{inc.timeline[0].message}</span>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </motion.div>
                            ))}
                          </div>
                        )}
                      </AnimatePresence>
                    </section>

                    {/* SECTION 4: SERVICE DETAILED DIRECTORY GRID */}
                    <section className="flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-md font-bold font-display text-white">Monitored Endpoints Grid</h4>
                          <p className="text-xs text-gray-500">
                            Showing {filteredServices.length} endpoints
                          </p>
                        </div>
                        {selectedCategory && (
                          <span className="text-xs font-semibold text-indigo-300 border border-indigo-500/20 bg-indigo-500/5 px-2.5 py-1 rounded-xl">
                            Category: {selectedCategory}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                        {filteredServices.map(service => {
                          const hasIncident = incidents.some(i => i.serviceId === service.id);
                          return (
                            <div
                              key={service.id}
                              onClick={() => setActiveView(`service-${service.id}`)}
                              className={`bg-white/[0.02] border hover:border-white/15 rounded-xl p-4 cursor-pointer hover:bg-white/[0.04] transition-all duration-200 relative group overflow-hidden`}
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex items-center gap-2.5 truncate">
                                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${getStatusColor(service.status)}`}>
                                    {renderLucide(service.icon, "w-4 h-4")}
                                  </div>
                                  <div className="truncate">
                                    <h5 className="font-bold text-sm text-white group-hover:text-indigo-300 transition-colors duration-150 leading-tight">
                                      {service.name}
                                    </h5>
                                    <span className="text-[9px] font-mono text-gray-500 uppercase tracking-wider">
                                      {service.category}
                                    </span>
                                  </div>
                                </div>

                                <div className="text-right">
                                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded uppercase leading-none ${getStatusColor(service.status)}`}>
                                    {service.status}
                                  </span>
                                </div>
                              </div>

                              <p className="text-xs text-gray-400 mt-3 truncate">
                                {service.description}
                              </p>

                              {/* Performance metrics display */}
                              <div className="flex items-center justify-between text-[11px] font-mono mt-4 pt-3 border-t border-white/5 text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Activity className="w-3.5 h-3.5 text-gray-500" />
                                  Ping: <strong className="text-white">{service.latency}ms</strong>
                                </span>
                                <span className="flex items-center gap-1">
                                  Uptime: <strong className={getSlaColor(service.uptime)}>{service.uptime}%</strong>
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  </div>

                  {/* RIGHT PANEL: LIVE SYSTEM ACTIVITY LEDGER & DEPENDENCY PREVIEW */}
                  <div className="xl:col-span-4 flex flex-col gap-6">
                    
                    {/* SYSTEM LIVE TICKER */}
                    <div className="bg-white/[0.02] border border-white/5 rounded-[28px] p-5 backdrop-blur-3xl shadow-xl flex flex-col h-[400px]">
                      <div className="flex items-center justify-between mb-3 shrink-0">
                        <div className="flex items-center gap-2">
                          <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                          <h4 className="text-sm font-bold font-display text-white">Live Operations Ledger</h4>
                        </div>
                        <span className="text-[10px] bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded font-mono">
                          LIVE PING
                        </span>
                      </div>

                      <div 
                        ref={logContainerRef}
                        className="flex-1 overflow-y-auto font-mono text-xs flex flex-col gap-2.5 pr-1 scrollbar-thin overflow-x-hidden"
                      >
                        {activityLogs.map(log => {
                          const getLogStatusStyle = () => {
                            if (log.status === "success") return "text-emerald-400";
                            if (log.status === "warning") return "text-amber-400";
                            if (log.status === "error") return "text-rose-400 animate-pulse";
                            return "text-sky-400";
                          };

                          return (
                            <div key={log.id} className="p-2 rounded bg-white/[0.01] border border-white/[0.02] flex flex-col gap-0.5 hover:bg-white/[0.03]">
                              <div className="flex items-center justify-between text-[9px]">
                                <span className="text-gray-500">[{log.time}]</span>
                                <span className="font-bold uppercase tracking-widest text-[8px] opacity-60 text-indigo-300">
                                  {log.serviceName}
                                </span>
                              </div>
                              <p className={`text-[11px] leading-snug break-words ${getLogStatusStyle()}`}>
                                {log.message}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* MINI ADVANCED VISUALIZER PREVIEW CARD */}
                    <div 
                      onClick={() => setActiveView("visualizer")} 
                      className="bg-white/[0.02] border border-white/5 rounded-[28px] p-5 hover:border-indigo-500/30 cursor-pointer backdrop-blur-3xl shadow-xl relative overflow-hidden group"
                    >
                      <div className="absolute top-0 right-0 p-3">
                        <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-indigo-400 transition-colors duration-150" />
                      </div>
                      <div className="text-[10px] text-indigo-400 font-mono tracking-wider font-bold mb-1 uppercase">GRID TOPOLOGY PREVIEW</div>
                      <h4 className="text-sm font-bold font-display text-white mb-2">Live ISP Routing Interconnect Map</h4>
                      
                      {/* Cool graphic SVG illustration of failure cascade */}
                      <div className="h-32 bg-black/50 rounded-xl border border-white/5 relative flex items-center justify-center overflow-hidden mt-3">
                        <svg className="w-full h-full" viewBox="0 0 100 50">
                          {/* Paths connecting items */}
                          <path d="M 15,25 Q 50,5 85,15" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                          <path d="M 15,25 Q 50,45 85,35" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                          <path d="M 15,25 Q 50,25 85,25" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
                          
                          {/* Nodes */}
                          <circle cx="15" cy="25" r="4" className="fill-indigo-500" />
                          <circle cx="50" cy="15" r="3.5" className="fill-emerald-400" />
                          <circle cx="50" cy="35" r="3.5" className="fill-amber-400" />
                          <circle cx="85" cy="15" r="4" className="fill-sky-400 animate-pulse" />
                          <circle cx="85" cy="35" r="4" className="fill-indigo-300" />

                          {/* Laser light pulse on active line */}
                          <circle cx="15" cy="25" r="2" fill="#00E676">
                            <animateMotion 
                              path="M 15,25 Q 50,5 85,15" 
                              dur="3s" 
                              repeatCount="indefinite" 
                            />
                          </circle>
                          
                          <circle cx="15" cy="25" r="2" fill="#FFB020">
                            <animateMotion 
                              path="M 15,25 Q 50,25 85,25" 
                              dur="2s" 
                              repeatCount="indefinite" 
                            />
                          </circle>
                        </svg>

                        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
                        <span className="absolute bottom-2 left-3 text-[9px] font-mono text-gray-500 uppercase">
                          40 Interconnect pathways
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* VIEW 2: INCIDENTS OFFICE / COMMAND OVERVIEW */}
            {activeView === "incidents" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Outage listings */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                  <div className="bg-white/[0.03] border border-white/5 rounded-[28px] p-6 backdrop-blur-3xl shadow-2xl">
                    <h3 className="text-xl font-bold font-display text-white mb-4">Historical Incidents Control Desk</h3>
                    
                    <div className="flex flex-col gap-4">
                      {incidents.length === 0 ? (
                        <div className="text-center py-10">
                          <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                          <h4 className="text-md font-bold text-white font-display">No ongoing issues identified</h4>
                          <p className="text-xs text-gray-400 max-w-xs mx-auto mt-1">
                            Everything is running smoothly. Use the simulator panel on the right side of this screen to test cascading failures!
                          </p>
                        </div>
                      ) : (
                        incidents.map(inc => (
                          <div key={inc.id} className="bg-white/[0.01] border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-colors duration-150">
                            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                              <span className="text-xs bg-indigo-500/15 text-indigo-300 px-2 py-0.5 rounded font-mono border border-indigo-500/20">
                                {inc.serviceName.toUpperCase()} MODULE
                              </span>
                              <div className="flex gap-2">
                                <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${inc.severity === "critical" ? "bg-rose-500/20 text-rose-400" : "bg-amber-500/20 text-amber-400"}`}>
                                  {inc.severity.toUpperCase()}
                                </span>
                                <span className="text-[10px] bg-white/5 text-gray-400 px-2 py-0.5 rounded font-mono">
                                  {inc.status.toUpperCase()}
                                </span>
                              </div>
                            </div>

                            <h4 className="text-md font-bold text-white font-display">{inc.title}</h4>
                            <p className="text-xs text-gray-450 mt-1 font-mono text-gray-450 text-[11px]">
                              Identified: {inc.startedAt} &bull; Updated: {inc.updatedAt}
                            </p>
                            <p className="text-xs text-gray-300 mt-2">{inc.description}</p>

                            {/* Detailed Step logs for incidents */}
                            <div className="mt-4 pt-4 border-t border-white/5 flex flex-col gap-3">
                              <h5 className="text-[10px] font-mono text-indigo-400 tracking-wider font-bold">HISTORICAL INCIDENT STEPS</h5>
                              {inc.timeline.map((step, sIdx) => (
                                <div key={sIdx} className="flex gap-3">
                                  <div className="w-1 h-auto bg-indigo-500/25 relative rounded-full">
                                    <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-indigo-400" />
                                  </div>
                                  <div className="flex-1 pb-2">
                                    <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono">
                                      <span>{step.time}</span>
                                      <span className="bg-white/5 text-gray-400 px-1.5 py-0.2 rounded uppercase">
                                        {step.status}
                                      </span>
                                    </div>
                                    <p className="text-xs text-gray-350 mt-1">
                                      {step.message}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Simulated Scenarios sidebar directly inside incident dashboard */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                  <div className="bg-white/[0.03] border border-white/5 rounded-[28px] p-6 backdrop-blur-3xl shadow-2xl">
                    <div className="flex items-center gap-2 mb-4">
                      <Sliders className="w-4 h-4 text-indigo-400" />
                      <h4 className="text-sm font-bold font-display text-white">Disaster Drills Simulator</h4>
                    </div>
                    <p className="text-xs text-gray-400 mb-4 font-mono leading-relaxed">
                      Simulate massive real-life BGP route leaks and server lockouts to test global cascading failures on dependencies.
                    </p>

                    <div className="flex flex-col gap-2">
                      <button 
                        onClick={() => triggerScenario("cloudflare")}
                        className="w-full text-left p-3.5 bg-rose-500/5 hover:bg-rose-500/10 active:scale-95 border border-rose-500/20 hover:border-rose-500/40 text-rose-300 rounded-xl text-xs font-semibold flex items-center justify-between group transition-all duration-150 cursor-pointer"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Globe className="w-4 h-4 text-rose-400" />
                          <div className="truncate">
                            <span className="block font-bold">Cloudflare Anycast Route Leak</span>
                            <span className="block text-[10px] text-rose-400/65 font-normal">Disrupts CDN, Vercel, Discord, GPT API</span>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-rose-400 group-hover:translate-x-1 transition-transform" />
                      </button>

                      <button 
                        onClick={() => triggerScenario("aws")}
                        className="w-full text-left p-3.5 bg-amber-500/5 hover:bg-amber-500/10 active:scale-95 border border-amber-500/20 hover:border-amber-500/40 text-amber-300 rounded-xl text-xs font-semibold flex items-center justify-between group transition-all duration-150 cursor-pointer"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <CloudLightning className="w-4 h-4 text-amber-400" />
                          <div className="truncate">
                            <span className="block font-bold">AWS S3 Allocator Failure</span>
                            <span className="block text-[10px] text-amber-400/65 font-normal">Degrades GitHub, Render, Stripe</span>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-amber-400 group-hover:translate-x-1 transition-transform" />
                      </button>

                      <button 
                        onClick={() => triggerScenario("stripe")}
                        className="w-full text-left p-3.5 bg-rose-500/5 hover:bg-rose-500/10 active:scale-95 border border-rose-500/20 hover:border-rose-500/40 text-rose-300 rounded-xl text-xs font-semibold flex items-center justify-between group transition-all duration-150 cursor-pointer"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <CreditCard className="w-4 h-4 text-rose-400" />
                          <div className="truncate">
                            <span className="block font-bold">Global Stripe API Timeout</span>
                            <span className="block text-[10px] text-rose-400/65 font-normal">Crashes global financial pipelines</span>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-rose-400 group-hover:translate-x-1 transition-transform" />
                      </button>

                      <button 
                        onClick={() => triggerScenario("gemini")}
                        className="w-full text-left p-3.5 bg-indigo-500/5 hover:bg-indigo-500/10 active:scale-95 border border-indigo-500/20 hover:border-indigo-500/40 text-indigo-300 rounded-xl text-xs font-semibold flex items-center justify-between group transition-all duration-150 cursor-pointer"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Sparkles className="w-4 h-4 text-indigo-400" />
                          <div className="truncate">
                            <span className="block font-bold">Gemini Inference API Spike</span>
                            <span className="block text-[10px] text-indigo-400/65 font-normal">Triggers +1.2s latent lag on TPU clusters</span>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-indigo-400 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>

                    <button 
                      onClick={repairAll}
                      className="w-full py-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-bold rounded-xl mt-4 cursor-pointer"
                    >
                      CLEAR ANOMALIES & RESTORE
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW 3: INTERACTIVE NODE DEPENDENCY MAP */}
            {activeView === "visualizer" && (
              <div className="bg-white/[0.03] border border-white/5 rounded-[28px] p-6 backdrop-blur-3xl shadow-2xl overflow-hidden relative">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold font-display text-white">Live Node Topology Mesh and Blast Radius Chart</h3>
                    <p className="text-xs text-gray-400 max-w-xl mt-1">
                      Explore interconnections, API bridges, caching lanes, and upstream dependencies. If a major provider experiences degraded operations, connections will immediately cascade highlighted statuses dynamically.
                    </p>
                  </div>
                  <div className="hidden sm:flex gap-3 text-[10px] font-mono">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500" /> core router</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" /> operational</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500" /> outage cascade</span>
                  </div>
                </div>

                <div className="h-[520px] bg-neutral-950/50 backdrop-blur-3xl border border-white/5 rounded-2xl p-4 overflow-hidden relative flex items-center justify-center">
                  
                  {/* SVG Map Layout */}
                  <svg className="w-full h-full min-w-[650px]" viewBox="0 0 1000 500">
                    <defs>
                      <marker id="arrow" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(255,255,255,0.15)" />
                      </marker>
                      <marker id="arrow-down" viewBox="0 0 10 10" refX="20" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(255,255,255,0.08)" />
                      </marker>
                    </defs>

                    {/* Nodes Matrix Coordinate list */}
                    {(() => {
                      const NODE_COORDS: Record<string, { x: number; y: number; label: string; type: string; cat: string }> = {
                        "aws": { x: 140, y: 150, label: "Amazon Web Services", type: "cloud", cat: "Cloud" },
                        "azure": { x: 140, y: 350, label: "Microsoft Azure", type: "cloud", cat: "Cloud" },
                        "gcp": { x: 140, y: 250, label: "Google Cloud", type: "cloud", cat: "Cloud" },
                        
                        "cloudflare": { x: 380, y: 120, label: "Cloudflare Edge", type: "cdn", cat: "CDN & Edge" },
                        "fastly": { x: 380, y: 380, label: "Fastly Transit", type: "cdn", cat: "CDN & Edge" },
                        
                        "openai": { x: 620, y: 160, label: "OpenAI ChatGPT API", type: "ai", cat: "AI" },
                        "anthropic": { x: 620, y: 80, label: "Anthropic Claude AI", type: "ai", cat: "AI" },
                        "gemini": { x: 620, y: 240, label: "Google Gemini AI", type: "ai", cat: "AI" },
                        "stripe": { x: 620, y: 320, label: "Stripe Checkout", type: "payments", cat: "Payments" },
                        "github": { x: 620, y: 400, label: "GitHub Core Hosting", type: "dev", cat: "Developer" },
                        
                        "vercel": { x: 860, y: 180, label: "Vercel Serverless Hosting", type: "dev", cat: "Developer" },
                        "discord": { x: 860, y: 280, label: "Discord Client Servers", type: "comm", cat: "Communication" },
                      };

                      // Dependency linkages definition for lines plotting
                      const LINKS = [
                        { from: "aws", to: "cloudflare" },
                        { from: "aws", to: "stripe" },
                        { from: "aws", to: "github" },
                        { from: "aws", to: "vercel" },
                        { from: "aws", to: "discord" },
                        { from: "aws", to: "anthropic" },
                        
                        { from: "gcp", to: "gemini" },
                        { from: "gcp", to: "discord" },
                        
                        { from: "azure", to: "github" },
                        { from: "azure", to: "openai" },
                        
                        { from: "cloudflare", to: "openai" },
                        { from: "cloudflare", to: "vercel" },
                        { from: "cloudflare", to: "discord" },
                        { from: "cloudflare", to: "stripe" },
                        
                        { from: "fastly", to: "github" },
                        { from: "fastly", to: "vercel" },
                        
                        { from: "openai", to: "vercel" },
                        { from: "openai", to: "discord" },
                        { from: "github", to: "vercel" },
                      ];

                      return (
                        <>
                          {/* LINK DRAWS */}
                          {LINKS.map((lk, lkIdx) => {
                            const nFrom = NODE_COORDS[lk.from];
                            const nTo = NODE_COORDS[lk.to];
                            if (!nFrom || !nTo) return null;

                            // Core status checking of link for cascade warnings
                            const fromServ = services.find(s => s.id === lk.from);
                            const toServ = services.find(s => s.id === lk.to);
                            
                            const isLinkCritical = fromServ?.status === "outage";
                            const isLinkDegraded = fromServ?.status === "degraded" || toServ?.status === "outage";
                            
                            let strokeColor = "rgba(255,255,255,0.06)";
                            let strokeWidth = "1.5";
                            if (isLinkCritical) {
                              strokeColor = "rgba(239,68,68,0.7)";
                              strokeWidth = "2.5";
                            } else if (isLinkDegraded) {
                              strokeColor = "rgba(251,191,36,0.5)";
                              strokeWidth = "2.0";
                            }

                            // Dynamic interactive highlights hover selections
                            const isHighlighted = selectedDependencyNode === lk.from || selectedDependencyNode === lk.to;
                            if (selectedDependencyNode && isHighlighted) {
                              strokeColor = "#6C5CE7";
                              strokeWidth = "3.0";
                            }

                            return (
                              <g key={lkIdx}>
                                <path
                                  d={`M ${nFrom.x},${nFrom.y} L ${nTo.x},${nTo.y}`}
                                  fill="none"
                                  stroke={strokeColor}
                                  strokeWidth={strokeWidth}
                                  markerEnd="url(#arrow)"
                                  className="transition-all duration-300"
                                />
                                
                                {/* Bullet path light indicators flowing downward on critical routes */}
                                {(isLinkCritical || isLinkDegraded || isHighlighted) && (
                                  <circle r="3" fill={isLinkCritical ? "#FF4D6D" : isLinkDegraded ? "#FFB020" : "#00B8FF"}>
                                    <animateMotion
                                      path={`M ${nFrom.x},${nFrom.y} L ${nTo.x},${nTo.y}`}
                                      dur="2.5s"
                                      repeatCount="indefinite"
                                    />
                                  </circle>
                                )}
                              </g>
                            );
                          })}

                          {/* NODE BINDINGS DRAWS */}
                          {Object.entries(NODE_COORDS).map(([id, nd]) => {
                            const servInfo = services.find(s => s.id === id);
                            const name = servInfo ? servInfo.name : nd.label;
                            const status = servInfo ? servInfo.status : "operational";
                            const category = servInfo ? servInfo.category : nd.cat;
                            const latency = servInfo ? servInfo.latency : 50;

                            const isCurrentSelected = id === selectedDependencyNode;

                            return (
                              <g 
                                key={id} 
                                transform={`translate(${nd.x}, ${nd.y})`}
                                className="cursor-pointer group"
                                onClick={() => setSelectedDependencyNode(selectedDependencyNode === id ? null : id)}
                              >
                                {/* Circle outer aura ring for active/failures checks */}
                                <circle 
                                  cx="0" 
                                  cy="0" 
                                  r={isCurrentSelected ? "32" : "22"} 
                                  fill="rgba(5, 8, 22, 0.9)"
                                  stroke={status === "outage" ? "#FF4D6D" : status === "degraded" ? "#FFB020" : isCurrentSelected ? "#6C5CE7" : "rgba(255,255,255,0.08)"}
                                  strokeWidth="1.5"
                                  className="transition-all duration-300 shadow-2xl"
                                />

                                {/* Interactive inner small circle status indicator */}
                                <circle 
                                  cx="0" 
                                  cy="0" 
                                  r="16" 
                                  fill="rgba(255,255,255,0.02)"
                                />

                                {/* Miniature center micro LED light */}
                                <circle 
                                  cx="0" 
                                  cy="0" 
                                  r="4.5" 
                                  className={`transition-all duration-300 ${getStatusDotColor(status)}`}
                                />

                                {/* Hover tooltip text card overlays */}
                                <g transform="translate(0, 38)">
                                  <rect
                                    x="-65"
                                    y="-12"
                                    width="130"
                                    height="28"
                                    rx="6"
                                    fill="#000000"
                                    stroke="rgba(255,255,255,0.08)"
                                    strokeWidth="1"
                                    className="filter drop-shadow-xl"
                                  />
                                  <text
                                    className="font-mono"
                                    textAnchor="middle"
                                    fontSize="9.5"
                                    fill="#FFFFFF"
                                    fontWeight="bold"
                                    y="0.5"
                                  >
                                    {name}
                                  </text>
                                  <text
                                    className="font-mono opacity-60"
                                    textAnchor="middle"
                                    fontSize="7.5"
                                    fill="rgba(255,255,255,0.6)"
                                    y="10.5"
                                  >
                                    Ping: {latency}ms &bull; {status}
                                  </text>
                                </g>
                              </g>
                            );
                          })}
                        </>
                      );
                    })()}
                  </svg>

                  {/* HUD controls floating on Graph */}
                  <div className="absolute bottom-4 left-4 bg-black/90 border border-white/5 p-3 rounded-xl font-mono text-[10px] flex flex-col gap-1 backdrop-blur-3xl">
                    <span className="text-gray-500 font-bold">TOPOLOGIC INTERACTION</span>
                    <span className="text-gray-300">Click individual nodes to isolate upstream dependencies.</span>
                    {selectedDependencyNode && (
                      <span className="text-indigo-400 mt-1 flex items-center gap-1.5 font-bold">
                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping" />
                        Selected target: {selectedDependencyNode.toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* VIEW 4: DETAILED INDIVIDUAL INTEGRATION HEALTH PAGES */}
            {activeView.startsWith("service-") && (() => {
              const servId = activeView.split("service-")[1];
              const serv = services.find(s => s.id === servId);
              if (!serv) return <div className="text-white">Endpoint data corrupted.</div>;

              return (
                <div className="flex flex-col gap-6">
                  
                  {/* Detailed service Header block */}
                  <div className="bg-white/[0.03] border border-white/5 rounded-[28px] p-6 backdrop-blur-3xl shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="absolute top-0 right-0 p-4 font-mono text-[10px] text-gray-500">
                      INDEX PIN: {serv.id.toUpperCase()}
                    </div>
                    
                    <div className="flex items-start md:items-center gap-4">
                      {/* Heavy Icon banner */}
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border-2 ${getStatusColor(serv.status)}`}>
                        {renderLucide(serv.icon, "w-7 h-7")}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-2xl font-bold font-display text-white">{serv.name}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded font-mono font-bold uppercase ${getStatusColor(serv.status)}`}>
                            {serv.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-450 italic text-gray-400">{serv.description}</p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto shrink-0 font-mono">
                      <div className="bg-white/[0.01] border border-white/5 rounded-xl p-3 text-center sm:text-left shrink-0">
                        <span className="text-[10px] text-gray-500 block">SLA ROUTE HEURISTICS</span>
                        <strong className={`text-lg font-bold ${getSlaColor(serv.uptime)}`}>{serv.uptime}%</strong>
                      </div>
                      
                      <div className="bg-white/[0.01] border border-white/5 rounded-xl p-3 text-center sm:text-left shrink-0">
                        <span className="text-[10px] text-gray-500 block">LAST LATENCY QUERY</span>
                        <strong className="text-lg font-bold text-white">{serv.latency} ms</strong>
                      </div>

                      <button 
                        onClick={() => setActiveView("dashboard")}
                        className="px-4 py-3 bg-white/5 hover:bg-white/10 text-gray-300 font-semibold text-xs rounded-xl flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" /> Close Diagnosis
                      </button>
                    </div>
                  </div>

                  {/* DIAGNOSTIC GRAPH SUB GROUPS GRID */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    
                    {/* Components check status block */}
                    <div className="lg:col-span-4 bg-white/[0.03] border border-white/5 rounded-[28px] p-6 backdrop-blur-3xl shadow-xl flex flex-col gap-4">
                      <h4 className="text-sm font-bold font-display text-white border-b border-white/5 pb-2">
                        Sub-Component Gateway Handlers
                      </h4>
                      <div className="flex flex-col gap-3">
                        {serv.components.map(comp => (
                          <div key={comp.id} className="flex items-center justify-between p-2.5 rounded bg-white/[0.01] border border-white/[0.02]">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono text-gray-500 uppercase">SYS_NODE</span>
                              <span className="text-xs text-gray-200 font-medium">{comp.name}</span>
                            </div>
                            <span className={`text-[9px] font-mono px-2 py-0.5 rounded uppercase font-bold ${getStatusColor(comp.status)}`}>
                              {comp.status}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Dependent list upstream & down */}
                      <div className="mt-4 pt-4 border-t border-white/5 flex flex-col gap-3">
                        <h4 className="text-xs font-mono font-bold text-gray-500 uppercase tracking-wider">
                          Topology Path Cascade
                        </h4>
                        
                        <div className="flex flex-col gap-2">
                          <span className="text-[10px] font-mono font-bold text-indigo-400">UPSTREAM DEPENDENCIES</span>
                          {serv.dependencies.length === 0 ? (
                            <span className="text-xs text-gray-500 italic">No cloud parent system depends on this edge node.</span>
                          ) : (
                            <div className="flex flex-wrap gap-1.5">
                              {serv.dependencies.map(dep => (
                                <span 
                                  key={dep} 
                                  onClick={() => setActiveView(`service-${dep}`)}
                                  className="text-[10px] font-mono hover:text-indigo-300 bg-white/5 border border-white/5 px-2 py-0.5 rounded cursor-pointer"
                                >
                                  {dep.toUpperCase()}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-2 mt-2">
                          <span className="text-[10px] font-mono font-bold text-[#00B8FF]">DOWNSTREAM IMPACT RADIUS</span>
                          {(() => {
                            const matchingDownstreams = services.filter(s => s.dependencies.includes(serv.id));
                            if (matchingDownstreams.length === 0) {
                              return <span className="text-xs text-gray-500 italic">No secondary services depend downstream of this provider.</span>;
                            }
                            return (
                              <div className="flex flex-wrap gap-1.5">
                                {matchingDownstreams.map(down => (
                                  <span 
                                    key={down.id} 
                                    onClick={() => setActiveView(`service-${down.id}`)}
                                    className="text-[10px] font-mono hover:text-sky-300 bg-white/5 border border-white/5 px-2 py-0.5 rounded cursor-pointer"
                                  >
                                    {down.name.toUpperCase()}
                                  </span>
                                ))}
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    </div>

                    {/* Latency and simulation charts panel */}
                    <div className="lg:col-span-8 flex flex-col gap-6">
                      
                      {/* Latency Live Fluctuations Chart */}
                      <div className="bg-white/[0.03] border border-white/5 rounded-[28px] p-6 backdrop-blur-3xl shadow-xl flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h4 className="text-md font-bold font-display text-white">Live Edge Microsecond Response Time Latency</h4>
                            <p className="text-xs text-gray-400">Updated realtime on iPulse handshake checks.</p>
                          </div>
                          <span className="text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded font-mono font-bold">
                            Current: {serv.latency}ms
                          </span>
                        </div>

                        {/* Beautiful live fluctuating latency line */}
                        <div className="h-44 w-full bg-black/50 border border-white/5 rounded-xl p-4 overflow-hidden relative flex items-center justify-center">
                          {/* We draw a simulated dynamic random latency wave sparkline */}
                          <svg className="w-full h-full overflow-visible" viewBox="0 0 100 40" preserveAspectRatio="none">
                            <defs>
                              <linearGradient id="latencyGlow" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#00B8FF" stopOpacity="0.3" />
                                <stop offset="100%" stopColor="#00B8FF" stopOpacity="0.0" />
                              </linearGradient>
                            </defs>
                            
                            {/* Horizontal grid guide rails */}
                            <line x1="0" y1="10" x2="100" y2="10" stroke="rgba(255,255,255,0.02)" strokeWidth="0.5" />
                            <line x1="0" y1="20" x2="100" y2="20" stroke="rgba(255,255,255,0.02)" strokeWidth="0.5" />
                            <line x1="0" y1="30" x2="100" y2="30" stroke="rgba(255,255,255,0.02)" strokeWidth="0.5" />

                            {(() => {
                              // We generate 12 steps matching serv.latency
                              const seedPoints: number[] = [];
                              for (let i = 0; i < 15; i++) {
                                // fluctuate near serv.latency deterministically to prevent hydration mismatch
                                const delta = Math.sin(i * 1.5) * 15 + Math.cos(i * 2.2) * 4;
                                seedPoints.push(Math.max(12, serv.latency + delta));
                              }

                              const pointsString = seedPoints.map((val, idx) => {
                                const x = (idx / (seedPoints.length - 1)) * 100;
                                // map val 0-250 to 38-2
                                const y = 35 - (Math.min(250, val) / 250) * 32;
                                return `${x},${y}`;
                              });

                              return (
                                <>
                                  <path
                                    d={`M 0,40 L ${pointsString.map(ps => ps.split(',')).map(xy => `${xy[0]},${xy[1]}`).join(' L ')} L 100,40 Z`}
                                    fill="url(#latencyGlow)"
                                  />
                                  <path
                                    d={`M ${pointsString.join(' L ')}`}
                                    fill="none"
                                    stroke="#00B8FF"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                  <circle cx="100" cy={35 - (serv.latency / 250) * 32} r="2" fill="#00B8FF" className="animate-pulse" />
                                </>
                              );
                            })()}
                          </svg>

                          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent pointer-events-none" />
                        </div>
                      </div>

                      {/* SLA metrics days block */}
                      <div className="bg-white/[0.03] border border-white/5 rounded-[28px] p-6 backdrop-blur-3xl shadow-xl">
                        <h4 className="text-sm font-bold font-display text-white mb-3">Service SLA Uptime Node Matrix</h4>
                        
                        {/* Elegant 30 green small blocks illustrating uptime days */}
                        <div className="grid grid-cols-10 sm:grid-cols-15 md:grid-cols-30 gap-1.5">
                          {Array.from({ length: 30 }).map((_, idx) => {
                            // Inject simulated error on some days if status degraded
                            const showIncident = (idx === 14 && serv.status !== "operational") || (idx === 7 && serv.status === "outage");
                            let col = "bg-emerald-500";
                            let lbl = "Nominal Uptime";
                            if (showIncident) {
                              col = serv.status === "outage" ? "bg-rose-500 animate-pulse" : "bg-amber-500";
                              lbl = "Incident Reported";
                            }
                            return (
                              <div
                                key={idx}
                                title={`Day ${idx + 1}: ${lbl}`}
                                className={`h-8 rounded cursor-pointer hover:scale-110 transition-transform ${col}`}
                              />
                            );
                          })}
                        </div>
                        
                        <div className="flex justify-between items-center text-[10px] font-mono text-gray-500 mt-3 pt-2">
                          <span>30 days ago</span>
                          <span className="text-xs text-indigo-400 font-bold">100% Core Target Match</span>
                          <span>Today</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* VIEW 5: CONFIG SETTINGS CONSOLE */}
            {activeView === "settings" && (
              <div className="bg-white/[0.03] border border-white/5 rounded-[28px] p-6 backdrop-blur-3xl shadow-2xl overflow-hidden max-w-2xl mx-auto w-full">
                <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-3">
                  <Sliders className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-xl font-bold font-display text-white">iPulse Core Sovereignty overrides</h3>
                </div>

                <div className="flex flex-col gap-6 font-mono text-sm">
                  <div className="p-4 bg-white/[0.01] border border-white/5 rounded-xl flex flex-col gap-2">
                    <span className="text-indigo-400 font-bold text-xs uppercase">1. Active Fetching Engine</span>
                    <p className="text-xs text-gray-400 leading-snug">
                      Toggle live polling on CORS-accessible Statuspage API pipelines. If CORS limits apply, we seamlessly fall back immediately to highly resilient edge simulation.
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-gray-300">Live Status Polling</span>
                      <button 
                        onClick={toggleMockFetch}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer ${useLiveFetching ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-white/5 text-gray-400"}`}
                      >
                        {useLiveFetching ? "ENABLED" : "DISABLED"}
                      </button>
                    </div>
                  </div>

                  <div className="p-4 bg-white/[0.01] border border-white/5 rounded-xl flex flex-col gap-2">
                    <span className="text-[#00B8FF] font-bold text-xs uppercase">2. Chaos Test Protocol Override</span>
                    <p className="text-xs text-gray-400 leading-snug">
                      Disrupt global DNS caches or payment routing pipelines instantly.
                    </p>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <button 
                        onClick={() => triggerScenario("cloudflare")}
                        className="py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-xs font-bold rounded-lg cursor-pointer"
                      >
                        Inject CF Outage
                      </button>
                      <button 
                        onClick={() => triggerScenario("aws")}
                        className="py-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 text-xs font-bold rounded-lg cursor-pointer"
                      >
                        Inject AWS Outage
                      </button>
                    </div>
                  </div>

                  <div className="p-4 bg-white/[0.01] border border-white/5 rounded-xl flex flex-col gap-2">
                    <span className="text-emerald-400 font-bold text-xs uppercase">3. Corrective Restoration Override</span>
                    <p className="text-xs text-gray-400 leading-snug">
                      Instantly reverse all incident metrics, latency surges, and cascading loops to recover 100% global operations.
                    </p>
                    <button 
                      onClick={repairAll}
                      className="py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-bold rounded-lg cursor-pointer"
                    >
                      RESET ENGINE & REPAIR ALL
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* --- DRILLS CHAOS ENGINEERING SIMULATOR FLOATING DRAWER (Universal Slider) --- */}
      <AnimatePresence>
        {isSimulatorOpen && (
          <>
            {/* Backdrop cover */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSimulatorOpen(false)}
              className="fixed inset-0 bg-black z-40"
            />
            {/* Drawer body */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed top-0 right-0 bottom-0 w-80 bg-black/95 border-l border-white/10 z-50 p-6 backdrop-blur-3xl flex flex-col justify-between"
            >
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-indigo-400 animate-spin" style={{ animationDuration: '20s' }} />
                    <h3 className="text-md font-bold text-white font-display">Chaos Drills Desk</h3>
                  </div>
                  <button onClick={() => setIsSimulatorOpen(false)} className="text-gray-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <p className="text-xs text-gray-400 leading-relaxed font-mono">
                  Dispatch synthetic threat incidents to observe real time routing stress, latency surges, and connection cascades on dependent endpoints.
                </p>

                <div className="flex flex-col gap-3 font-mono">
                  <button 
                    onClick={() => { triggerScenario("cloudflare"); setIsSimulatorOpen(false); }}
                    className="p-3 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl text-left text-xs font-bold"
                  >
                    Cloudflare BGP Leak Leak
                    <span className="block text-[8px] text-rose-400/60 font-normal mt-0.5">Impacts CDN, Vercel, Discord, ChatGPT</span>
                  </button>

                  <button 
                    onClick={() => { triggerScenario("aws"); setIsSimulatorOpen(false); }}
                    className="p-3 bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded-xl text-left text-xs font-bold"
                  >
                    AWS S3 Allocator Failure
                    <span className="block text-[8px] text-amber-400/60 font-normal mt-0.5">Impacts Actions CI/CD Write, Render, Stripe</span>
                  </button>

                  <button 
                    onClick={() => { triggerScenario("stripe"); setIsSimulatorOpen(false); }}
                    className="p-3 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl text-left text-xs font-bold"
                  >
                    Gateway Stripe payment lock
                    <span className="block text-[8px] text-rose-400/60 font-normal mt-0.5">Crashes SaaS checkout handlers</span>
                  </button>

                  <button 
                    onClick={() => { triggerScenario("gemini"); setIsSimulatorOpen(false); }}
                    className="p-3 bg-indigo-500/5 hover:bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 rounded-xl text-left text-xs font-bold"
                  >
                    Gemini TPU Capacity spike
                    <span className="block text-[8px] text-indigo-400/60 font-normal mt-0.5">Cascades api model response latency</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button 
                  onClick={() => { repairAll(); setIsSimulatorOpen(false); }}
                  className="w-full py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-bold rounded-lg"
                >
                  REPAIR SYSTEM nominal
                </button>
                <button 
                  onClick={() => setIsSimulatorOpen(false)}
                  className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-gray-400 text-xs font-mono rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
