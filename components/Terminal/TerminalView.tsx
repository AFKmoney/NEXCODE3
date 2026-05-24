"use client";

import React from "react";
import { motion } from "motion/react";
import { TerminalSquare, FilePlus, Activity, ChevronRight } from "lucide-react";

type TerminalTab = { id: string; title: string; history: string[]; };

type TerminalViewProps = {
  terminals: TerminalTab[];
  activeTerminalId: string;
  setActiveTerminalId: (id: string) => void;
  setTerminals: React.Dispatch<React.SetStateAction<TerminalTab[]>>;
  terminalInput: string;
  setTerminalInput: (val: string) => void;
  handleTerminalSubmit: () => void;
  terminalEndRef: React.RefObject<HTMLDivElement | null>;
  setActiveTab: (tab: string) => void;
  pageVariants: any;
};

export const TerminalView = ({
  terminals,
  activeTerminalId,
  setActiveTerminalId,
  setTerminals,
  terminalInput,
  setTerminalInput,
  handleTerminalSubmit,
  terminalEndRef,
  setActiveTab,
  pageVariants
}: TerminalViewProps) => {
  const activeTerminal = terminals.find(t => t.id === activeTerminalId) || terminals[0];
  const terminalHistory = activeTerminal.history;

  return (
    <motion.div key="terminal" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="absolute inset-0 bg-transparent p-4 sm:p-5 flex flex-col font-mono text-[13px] leading-relaxed text-[#abb2bf] w-full h-full pb-28">
       <div className="flex-1 bg-[#050505]/95 backdrop-blur-xl border border-white/10 flex flex-col rounded-[24px] sm:rounded-[32px] overflow-hidden relative shadow-[0_20px_60px_rgba(0,0,0,1)] ring-1 ring-white/5">
          <div className="bg-gradient-to-b from-[#111] to-[#0a0a0a] px-5 py-3.5 border-b border-white/5 flex items-center justify-between shadow-sm">
             <div className="flex gap-2">
               {terminals.map(t => (
                 <button key={t.id} onClick={() => setActiveTerminalId(t.id)} className={`text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${activeTerminalId === t.id ? 'bg-white/10 text-emerald-400' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}>
                   <TerminalSquare className="w-4 h-4" /> {t.title}
                 </button>
               ))}
               <button onClick={() => {
                  const newId = "term_" + (terminals.length + 1);
                  setTerminals(p => [...p, { id: newId, title: `bash-${terminals.length + 1}`, history: ["[SYSTEM] New terminal session initialized."] }]);
                  setActiveTerminalId(newId);
               }} className="text-gray-500 hover:text-gray-300 p-1.5 rounded-lg hover:bg-white/5 transition-colors">
                 <FilePlus className="w-4 h-4" />
               </button>
             </div>
             <div className="flex gap-2 items-center">
               <button onClick={() => setActiveTab("dashboard")} className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 px-3 py-1.5 rounded-lg text-indigo-400 hover:bg-white/5 transition-colors">
                 <Activity className="w-4 h-4" /> Metrics
               </button>
               <div className="flex gap-1.5 ml-2">
                 <div className="w-3 h-3 rounded-full bg-red-500/40 border border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.4)]"></div>
                 <div className="w-3 h-3 rounded-full bg-yellow-500/40 border border-yellow-500/50 shadow-[0_0_10px_rgba(234,179,8,0.4)]"></div>
                 <div className="w-3 h-3 rounded-full bg-emerald-500/40 border border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.4)]"></div>
               </div>
             </div>
          </div>
          <div className="flex-1 overflow-y-auto p-5 space-y-2 scrollbar-hide text-[13px] tracking-tight">
            {terminalHistory.map((line, i) => (
              <div key={i} className={`whitespace-pre-wrap break-words ${
                 line.startsWith('[SYSTEM]') ? 'text-purple-400 font-semibold drop-shadow-[0_0_8px_rgba(192,132,252,0.3)]' :
                 line.startsWith('[GIT]') ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]' :
                 line.startsWith('[LSP]') ? 'text-blue-400' :
                 line.startsWith('[AI]') ? 'text-purple-400 font-semibold' :
                 line.startsWith('[EXECUTE]') ? 'text-orange-400 font-semibold' :
                 line.startsWith('[ERROR]') || line.startsWith('bash:') ? 'text-red-400 font-bold' :
                 line.startsWith('>') ? 'text-white font-bold mt-4 mb-1' : ''
              }`}>{line}</div>
            ))}
            <div ref={terminalEndRef as any} />
          </div>
          <div className="bg-[#121216] px-5 py-4 w-full border-t border-white/5 flex items-center gap-3">
             <ChevronRight className="w-5 h-5 text-emerald-500 font-bold" />
             <input className="flex-1 bg-transparent border-none text-[14px] text-white focus:outline-none placeholder-gray-600 font-mono tracking-wide" autoFocus placeholder="Execute command..." value={terminalInput} onChange={e => setTerminalInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleTerminalSubmit()} />
          </div>
       </div>
    </motion.div>
  );
};
