"use client";

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Server, Activity, ShieldCheck, Box, Terminal, RefreshCw, Cpu, Database } from "lucide-react";

export const DevOpsView = ({ pageVariants }: { pageVariants: any }) => {
  const [status, setStatus] = useState("online");
  const [logs, setLogs] = useState<string[]>(["[DOCKER] Instance nexus-ide initialized.", "[WASM] Bridge linked to rust_core_v1."]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.8) {
        setLogs(prev => [...prev.slice(-10), `[HEALTH] Heartbeat signal verified at ${new Date().toLocaleTimeString()}`]);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div key="devops" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="absolute inset-0 bg-[#050505] overflow-y-auto flex flex-col p-4 sm:p-8 text-white pb-32">
       <div className="flex items-center gap-4 mb-8">
         <div className="p-4 bg-gradient-to-br from-emerald-500/20 to-blue-500/10 rounded-2xl border border-emerald-500/20">
            <Server className="w-8 h-8 text-emerald-400" />
         </div>
         <div>
           <h2 className="text-[26px] font-display font-medium text-white tracking-tight">Orchestration Control</h2>
           <p className="text-[13px] text-gray-400">PhD Dev & Infrastructure Management</p>
         </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-[24px] shadow-lg ring-1 ring-white/5">
             <div className="flex justify-between items-start mb-4">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                   <Activity className="w-4 h-4 text-emerald-400" /> System Status
                </h3>
                <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold rounded-full border border-emerald-500/20 uppercase tracking-widest animate-pulse">Operational</span>
             </div>
             <div className="space-y-4">
                <div className="flex justify-between text-xs">
                   <span className="text-gray-500">Wasm Runtime</span>
                   <span className="text-gray-200 font-mono">OK (v1.2.0)</span>
                </div>
                <div className="flex justify-between text-xs">
                   <span className="text-gray-500">Encryption Layer</span>
                   <span className="text-emerald-400 font-mono">AES-256-GCM Active</span>
                </div>
                <div className="flex justify-between text-xs">
                   <span className="text-gray-500">Causal Engine</span>
                   <span className="text-purple-400 font-mono">PhD Mode Enabled</span>
                </div>
             </div>
          </div>

          <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-[24px] shadow-lg ring-1 ring-white/5">
             <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                <Box className="w-4 h-4 text-blue-400" /> Docker Environment
             </h3>
             <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                   <span className="text-[10px] text-gray-500 uppercase font-bold block mb-1">CPU Usage</span>
                   <span className="text-lg font-bold text-white">12.4%</span>
                </div>
                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                   <span className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Memory</span>
                   <span className="text-lg font-bold text-white">256MB / 2GB</span>
                </div>
             </div>
             <button className="w-full mt-4 py-2.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 text-[11px] font-bold uppercase tracking-widest rounded-full border border-blue-500/20 transition-all flex items-center justify-center gap-2">
                <RefreshCw className="w-3.5 h-3.5" /> Rebuild Container
             </button>
          </div>
       </div>

       <div className="bg-[#020202] border border-white/5 rounded-[24px] overflow-hidden flex flex-col flex-1 shadow-2xl shadow-black/50">
          <div className="bg-[#0a0a0a] px-5 py-3 border-b border-white/5 flex items-center justify-between">
             <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-gray-500" />
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Orchestration Logs</span>
             </div>
             <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-red-500/50" />
                <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
                <div className="w-2 h-2 rounded-full bg-emerald-500/50" />
             </div>
          </div>
          <div className="p-5 font-mono text-[11px] space-y-1.5 h-64 overflow-y-auto scrollbar-hide text-gray-500">
             {logs.map((log, i) => (
                <div key={i} className="flex gap-3">
                   <span className="text-gray-700">[{new Date().toLocaleTimeString()}]</span>
                   <span className={log.includes('WASM') ? 'text-purple-400' : log.includes('DOCKER') ? 'text-blue-400' : 'text-gray-400'}>{log}</span>
                </div>
             ))}
          </div>
       </div>
    </motion.div>
  );
};
