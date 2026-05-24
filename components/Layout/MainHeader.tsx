"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Menu, ChevronRight, Database, Play, Loader2, MousePointer2, 
  BrainCircuit, Edit3, Settings, Command, X, Shield, Cpu, ExternalLink 
} from "lucide-react";
import { useNexusStore } from "@/lib/store";
import { useSession, signIn, signOut } from "next-auth/react";

export const MainHeader = () => {
  const store = useNexusStore();
  const { data: session } = useSession();
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);

  return (
    <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 z-40 bg-[#050505]/50 backdrop-blur-xl sticky top-0">
      {store.activeTab === "editor" && store.activeFile ? (
        <>
          <div className="flex items-center gap-4 w-full max-w-[50%] overflow-hidden">
            <button onClick={() => store.setActiveTab("files")} className="p-2.5 text-gray-400 hover:text-white rounded-xl bg-white/5 hover:bg-white/10 transition-all active:scale-95 border border-white/5">
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex flex-col overflow-hidden">
              <div className="flex items-center gap-2 mb-0.5">
                <Shield className="w-3 h-3 text-emerald-500" />
                <span className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">Secured Cluster</span>
              </div>
              <div className="flex items-center gap-2 truncate">
                 <span className="text-[14px] text-gray-100 font-bold tracking-tight truncate max-w-[200px]">{store.activeFile.split('/').pop()}</span>
                 <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-mono border border-indigo-500/20 uppercase tracking-tighter">Read/Write</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-black/40 p-1.5 rounded-2xl border border-white/5 shadow-inner">
             <button onClick={store.saveFile} className="p-2 justify-center items-center rounded-xl transition-all text-gray-400 hover:bg-emerald-500/20 hover:text-emerald-400 active:scale-95 group relative">
                <Database className="w-4 h-4" />
             </button>

             <button onClick={store.runCode} disabled={store.isRunning} className={`p-2 justify-center items-center rounded-xl transition-all ${store.isRunning ? 'text-indigo-400' : 'text-gray-400 hover:bg-indigo-500/20 hover:text-indigo-400'} active:scale-95`}>
                {store.isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}     
             </button>

             <div className="w-px h-6 bg-white/5 mx-1" />

             <button onClick={() => store.setIsEditMode(false)} className={`p-2.5 rounded-xl transition-all ${!store.isEditMode ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                <MousePointer2 className="w-4 h-4" />
             </button>

             <button onClick={() => store.setIsEditMode(true)} className={`p-2.5 rounded-xl transition-all ${store.isEditMode ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                <Edit3 className="w-4 h-4" />
             </button>
          </div>
        </>
      ) : (
        <div className="w-full flex items-center justify-between">
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-lg shadow-indigo-500/20 border border-white/20">
                <BrainCircuit className="w-6 h-6 text-white" />
              </div>
              <h1 className="font-display font-bold text-white text-[18px] tracking-tight hidden sm:block">Nexus<span className="text-indigo-500">Code</span> <span className="text-[10px] ml-2 text-gray-500 font-mono tracking-tighter align-top">v0.1.0-IND</span></h1>
           </div>

           <div className="flex items-center gap-3">
              <div className="relative">
                {session?.user ? (
                  <button onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)} className="p-1 rounded-full border-2 border-indigo-500/30 hover:border-indigo-500 transition-colors">
                    <img src={session.user.image || ""} className="w-8 h-8 rounded-full" alt="User" />        
                  </button>
                ) : (
                  <button onClick={() => signIn('github')} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-full text-white text-[11px] font-bold uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20 active:scale-95">Link Github</button>
                )}
              </div>
           </div>
        </div>
      )}
    </header>
  );
};
