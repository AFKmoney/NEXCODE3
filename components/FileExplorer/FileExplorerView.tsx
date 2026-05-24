"use client";

import React from "react";
import { motion } from "motion/react";
import { FolderTree, FolderPlus, Github, Folder, FileCode2, Trash2, FilePlus, Lock, Search, ChevronRight } from "lucide-react";

type FileExplorerViewProps = {
  githubConnected: boolean;
  setGithubConnected: (val: boolean) => void;
  currentRepo: string | null;
  setCurrentRepo: (val: string) => void;
  files: Record<string, string>;
  setFiles: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setOriginalFiles: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  activeFile: string | null;
  setActiveFile: (val: string | null) => void;
  setActiveTab: (val: string) => void;
  loadFileContent: (path: string) => void;
  pageVariants: any;
};

export const FileExplorerView = ({
  githubConnected,
  setGithubConnected,
  currentRepo,
  setCurrentRepo,
  files,
  setFiles,
  setOriginalFiles,
  activeFile,
  setActiveFile,
  setActiveTab,
  loadFileContent,
  pageVariants
}: FileExplorerViewProps) => {
  return (
    <motion.div key="files" variants={pageVariants} initial="initial" animate="animate" exit="exit" 
      className="absolute inset-0 overflow-y-auto scrollbar-hide flex flex-col w-full h-full pb-32">
      
      {!githubConnected ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 gap-12 relative overflow-hidden nexus-gradient-bg">
          {/* Animated Background Orbs */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
             <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full animate-pulse" />
             <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full animate-pulse" />
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-indigo-500/20 rounded-[3rem] blur-3xl group-hover:bg-indigo-500/40 transition-all duration-700" />
            <div className="w-32 h-32 glass-morphism rounded-[3rem] flex items-center justify-center relative z-10 border-white/20 shadow-2xl">
              <FolderTree className="w-14 h-14 text-indigo-400 drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
            </div>
          </div>

          <div className="space-y-4 max-w-md relative z-10">
            <h2 className="text-4xl font-display font-bold tracking-tight text-white leading-tight">Neural <span className="text-indigo-500">Workspace</span></h2>
            <p className="text-gray-400 font-medium text-sm leading-relaxed">
              Orchestrate your codebase through a secure virtual filesystem. Link your repositories to enable deep causal analysis.
            </p>
          </div>
          
          <div className="w-full max-w-xs space-y-4 relative z-10">
            <button onClick={() => { setGithubConnected(true); setCurrentRepo("Local Project"); setFiles({}); setOriginalFiles({}); }} className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-sm tracking-widest transition-all shadow-[0_15px_30px_rgba(79,70,229,0.3)] flex items-center justify-center gap-3 active:scale-95 border border-indigo-400/20">
              <FolderPlus className="w-5 h-5" /> NEW ARCHITECTURE
            </button>
            <button onClick={() => { setGithubConnected(true); setCurrentRepo("Imported GitHub"); setFiles({}); setOriginalFiles({}); }} className="w-full py-4 glass-morphism hover:bg-white/5 text-white rounded-2xl font-bold text-sm tracking-widest transition-all flex items-center justify-center gap-3 active:scale-95 border-white/10">
              <Github className="w-5 h-5 text-gray-400" /> IMPORT MODULE
            </button>
          </div>

          <div className="flex items-center gap-3 px-6 py-2.5 glass-morphism rounded-full border-white/5 shadow-inner">
             <Lock className="w-3.5 h-3.5 text-emerald-500" />
             <span className="text-[10px] text-gray-500 font-bold tracking-[0.2em] uppercase">AES-256-GCM Encrypted</span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col h-full bg-[#050505]">
          {/* Header */}
          <div className="p-6 border-b border-white/5 bg-black/20 backdrop-blur-md sticky top-0 z-20">
            <div className="flex justify-between items-center mb-6">
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                    <FolderTree className="w-4 h-4 text-indigo-400" />
                  </div>
                  <h3 className="text-[13px] font-bold text-gray-200 tracking-wider uppercase">{currentRepo || "Local System"}</h3>
               </div>
               <div className="flex items-center gap-2">
                  <button onClick={() => { setGithubConnected(false); setFiles({}); setOriginalFiles({}); setCurrentRepo(""); setActiveFile(""); }} className="p-2 glass-morphism rounded-lg text-gray-500 hover:text-red-400 transition-colors" title="Disconnect">
                    <Trash2 className="w-4 h-4" />
                  </button>
               </div>
            </div>

            <div className="relative group">
               <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-indigo-500 transition-colors" />
               <input type="text" placeholder="Filter project modules..." className="w-full bg-white/[0.03] border border-white/5 rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.05] transition-all" />
            </div>
          </div>

          {/* Action Bar */}
          <div className="px-6 py-4 flex gap-3 overflow-x-auto scrollbar-hide border-b border-white/5">
             <button onClick={() => { 
                const name = prompt("Module name:");
                if (name) setFiles(p => ({...p, [name + "/.keep"]: ""})); 
             }} className="px-4 py-2 glass-morphism rounded-xl text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-white flex items-center gap-2 shrink-0">
                <FolderPlus className="w-3.5 h-3.5" /> Module
             </button>
             <button onClick={() => {
                const name = prompt("File name (e.g. main.rs):");
                if (name) {
                   setFiles(p => ({...p, [name]: "// Nexus Module Initialized\n"}));
                   setActiveFile(name);
                   setActiveTab("editor");
                }
             }} className="px-4 py-2 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/20 rounded-xl text-[10px] font-bold uppercase tracking-widest text-indigo-400 flex items-center gap-2 shrink-0 transition-all">
                <FilePlus className="w-3.5 h-3.5" /> New File
             </button>
          </div>

          {/* List */}
          <div className="flex-1 p-4 space-y-2">
            {Object.keys(files).length === 0 ? (
               <div className="h-64 flex flex-col items-center justify-center gap-4 opacity-20">
                  <div className="w-px h-12 bg-gradient-to-b from-transparent via-gray-500 to-transparent" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em]">Empty Cluster</p>
                  <div className="w-px h-12 bg-gradient-to-b from-transparent via-gray-500 to-transparent" />
               </div>
            ) : (
              Object.keys(files).sort().map((f) => (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }} 
                  animate={{ opacity: 1, x: 0 }}
                  key={f} 
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer group relative overflow-hidden ${activeFile === f ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-white/10'}`}
                  onClick={() => loadFileContent(f)}
                >
                  {activeFile === f && <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500" />}
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`p-2.5 rounded-xl ${activeFile === f ? 'bg-indigo-500/20' : 'bg-black/40'} group-hover:scale-110 transition-transform`}>
                      <FileCode2 className={`w-5 h-5 ${activeFile === f ? 'text-indigo-400' : 'text-gray-500'}`} />
                    </div>
                    <div className="flex flex-col">
                      <span className={`text-[14px] font-bold tracking-tight ${activeFile === f ? 'text-white' : 'text-gray-300'}`}>{f.split('/').pop()}</span>
                      <span className="text-[10px] text-gray-500 font-mono tracking-tighter opacity-60">cluster://{f}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Decommission ${f}?`)) {
                          setFiles(p => { const nv = {...p}; delete nv[f]; return nv; });
                          if (activeFile === f) setActiveFile(null);
                        }
                      }}
                      className="p-2 rounded-lg hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <ChevronRight className="w-4 h-4 text-gray-700" />
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};
