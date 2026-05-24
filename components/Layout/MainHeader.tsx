"use client";

import React from "react";
import { Menu, ChevronRight, Database, Play, Loader2, MousePointer2, BrainCircuit, Edit3, Settings, Command } from "lucide-react";

type MainHeaderProps = {
  activeTab: string;
  activeFile: string | null;
  currentRepo: string | null;
  setActiveTab: (tab: string) => void;
  setIsCommandPaletteOpen: (val: boolean) => void;
  handleSaveVFS: () => void;
  handleRunCode: () => void;
  isRunning: boolean;
  isEditMode: boolean;
  setIsEditMode: (val: boolean) => void;
  handleRefactorAnalysis: () => void;
  isAnalyzing: boolean;
  refactorPreview: any;
  setSelectedLines: (val: number[]) => void;
  setRefactorPreview: (val: any) => void;
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
             {activeTab === "files" ? "Explorer" : activeTab === "settings" ? "Settings" : activeTab === "git" ? "VCS / Git" : activeTab === "preview" ? "Live Preview" : activeTab === "graph" ? "Dep Graph" : activeTab === "plugins" ? "Marketplace" : activeTab === "tasks" ? "Task Board" : "Terminal"}
           </span>
           <button onClick={() => setIsCommandPaletteOpen(true)} className="absolute right-0 p-1.5 bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors">
              <Command className="w-4 h-4" />
           </button>
        </div>
      )}
    </header>
  );
};
