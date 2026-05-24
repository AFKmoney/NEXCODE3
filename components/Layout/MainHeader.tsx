"use client";

import React from "react";
import { Menu, ChevronRight, Database, Play, Loader2, MousePointer2, BrainCircuit, Edit3, Settings, Command } from "lucide-react";

import { useSession, signIn, signOut } from "next-auth/react";

type MainHeaderProps = {
  // ... rest of props ...
};

export const MainHeader = ({
  activeTab,
  activeFile,
  currentRepo,
  setActiveTab,
  setIsCommandPaletteOpen,
  handleSaveVFS,
  handleRunCode,
  isRunning,
  isEditMode,
  setIsEditMode,
  handleRefactorAnalysis,
  isAnalyzing,
  refactorPreview,
  setSelectedLines,
  setRefactorPreview
}: MainHeaderProps) => {
  const { data: session } = useSession();

  return (
    <header className="h-14 border-b border-white/5 flex items-center justify-between px-4 z-40 bg-transparent backdrop-blur-md">
      {activeTab === "editor" && activeFile ? (
        <>
          <div className="flex items-center gap-3 w-full">
            <button onClick={() => setActiveTab("files")} className="p-1.5 text-gray-400 hover:text-white rounded-full bg-white/5 transition-colors">
              <Menu className="w-4 h-4" />
            </button>
            <div className="flex flex-col flex-1 overflow-hidden">
              <span className="text-[10px] text-gray-400 font-medium tracking-wide flex items-center gap-1 uppercase">
                <span className="cursor-pointer hover:text-white transition-colors" onClick={() => setActiveTab("files")}>{currentRepo || "Local"}</span>
                <ChevronRight className="w-3 h-3" />
                <span className="cursor-pointer hover:text-white transition-colors" onClick={() => setIsCommandPaletteOpen(true)}>main</span>
              </span>
              <span className="text-sm text-gray-100 font-semibold tracking-tight truncate flex items-center gap-2 cursor-pointer hover:text-indigo-300 transition-colors" onClick={() => setIsCommandPaletteOpen(true)}>
                {activeFile.split('/').pop()}
              </span>
            </div>
          </div>
          <div className="flex gap-2 bg-white/5 rounded-full p-1 border border-white/5 shadow-sm absolute right-4">
            {session?.user && (
              <div className="flex items-center gap-2 mr-2 pr-2 border-r border-white/10">
                <img src={session.user.image || ""} className="w-5 h-5 rounded-full border border-white/10" alt="Avatar" />
                <span className="text-[10px] font-bold text-gray-400 hidden sm:block">{session.user.name}</span>
              </div>
            )}
            <button onClick={handleSaveVFS} className="p-1.5 justify-center items-center rounded-full transition-all text-gray-400 hover:bg-emerald-500/20 hover:text-emerald-400 group relative">
              <Database className="w-4 h-4" />
            </button>
            <button onClick={handleRunCode} disabled={isRunning} className={`p-1.5 justify-center items-center rounded-full transition-all ${isRunning ? 'text-green-500/50' : 'text-gray-400 hover:bg-green-500/20 hover:text-green-400'}`}>
              {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            </button>
            <div className="w-px h-5 my-auto bg-gray-700/50 mx-0.5" />
            <button onClick={() => setIsEditMode(false)} className={`p-1.5 justify-center items-center rounded-full transition-all ${!isEditMode && !refactorPreview ? 'bg-indigo-500 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}>
              <MousePointer2 className="w-4 h-4" />
            </button>
            <button onClick={handleRefactorAnalysis} disabled={isAnalyzing} className={`p-1.5 justify-center items-center rounded-full transition-all ${refactorPreview || isAnalyzing ? 'bg-purple-500/20 text-purple-400 shadow-sm' : 'text-gray-400 hover:text-purple-400'}`}>
              {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <BrainCircuit className="w-4 h-4" />}
            </button>
            <button onClick={() => { setIsEditMode(true); setSelectedLines([]); setRefactorPreview(null); }} className={`p-1.5 justify-center items-center rounded-full transition-all ${isEditMode ? 'bg-indigo-500 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}>
              <Edit3 className="w-4 h-4" />
            </button>
          </div>
        </>
      ) : (
        <div className="w-full flex items-center justify-center relative">
           <button onClick={() => setActiveTab("settings")} className="absolute left-0 p-1.5 bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors">
              <Settings className="w-4 h-4" />
           </button>
           <span className="text-[14px] font-display font-medium tracking-widest text-white uppercase">
             {activeTab === "files" ? "Explorer" : activeTab === "settings" ? "Settings" : activeTab === "git" ? "VCS / Git" : activeTab === "preview" ? "Live Preview" : activeTab === "graph" ? "Dep Graph" : activeTab === "plugins" ? "Marketplace" : activeTab === "tasks" ? "Task Board" : activeTab === "devops" ? "Orchestration" : "Terminal"}
           </span>
           <div className="absolute right-0 flex items-center gap-2">
             {session?.user ? (
               <button onClick={() => signOut()} className="flex items-center gap-2 p-1.5 bg-white/5 rounded-full border border-white/5 hover:bg-red-500/10 transition-colors group">
                 <img src={session.user.image || ""} className="w-5 h-5 rounded-full" alt="User" />
                 <X className="w-3 h-3 text-transparent group-hover:text-red-400 absolute right-1 top-1" />
               </button>
             ) : (
               <button onClick={() => signIn('github')} className="p-1.5 bg-white/10 rounded-full text-white text-[10px] font-bold uppercase tracking-widest px-4 hover:bg-white/20 transition-all">Sign In</button>
             )}
             <button onClick={() => setIsCommandPaletteOpen(true)} className="p-1.5 bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors">
                <Command className="w-4 h-4" />
             </button>
           </div>
        </div>
      )}
    </header>
  );
};
