"use client";

import React from "react";
import { motion } from "motion/react";
import { Settings, Shield, Cpu, Save, Trash2, Key } from "lucide-react";
import { useNexusStore } from "@/lib/store";
import { ToggleItem } from "./ToggleItem";

export const SettingsView = ({ pageVariants }: { pageVariants: any }) => {
  const store = useNexusStore();

  const handleKeyChange = (provider: string, value: string) => {
    store.setApiKeys({ ...store.apiKeys, [provider]: value });
  };

  const handleModelChange = (provider: string, value: string) => {
    store.setModels({ ...store.models, [provider]: value });
  };

  return (
    <motion.div 
      variants={pageVariants} 
      initial="initial" 
      animate="animate" 
      exit="exit" 
      className="absolute inset-0 overflow-y-auto pb-28 pt-10 px-7 scrollbar-hide bg-black w-full h-full"
    >
      <div className="flex items-center gap-5 mb-10">
        <div className="p-4 bg-gradient-to-br from-indigo-500/20 to-purple-500/10 rounded-[24px] border border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.15)] relative">
          <div className="absolute inset-0 bg-white/5 rounded-[24px] blur-sm" />
          <Settings className="w-8 h-8 text-indigo-400 relative z-10" />
        </div>
        <div>
          <h2 className="text-[26px] font-display font-medium text-white tracking-tight">Engine Config</h2>
          <p className="text-[13px] text-gray-400 mt-1 font-medium">System Core Parameters</p>
        </div>
      </div>

      <div className="space-y-8">
        {/* AI Configuration Section */}
        <section className="bg-[#050505] border border-white/5 rounded-[32px] p-6 shadow-2xl">
          <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-6">
            <Shield className="w-4 h-4 text-indigo-400" /> AI Matrix Control
          </h3>
          
          <div className="space-y-6">
            <div>
              <label className="text-[12px] text-gray-500 font-bold mb-2 block">Active Provider</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {['gemini', 'claude', 'openai', 'mistral'].map(p => (
                  <button 
                    key={p}
                    onClick={() => store.setActiveProvider(p)}
                    className={`py-2 rounded-xl text-[11px] font-bold uppercase transition-all border ${store.activeProvider === p ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' : 'bg-white/5 border-white/5 text-gray-500 hover:text-white'}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[12px] text-gray-500 font-bold block">API Credentials</label>
              {Object.keys(store.apiKeys).map(p => (
                <div key={p} className="relative">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600" />
                  <input 
                    type="password"
                    placeholder={`${p.toUpperCase()} API KEY`}
                    value={store.apiKeys[p]}
                    onChange={(e) => handleKeyChange(p, e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-xl py-3 pl-11 pr-4 text-[13px] text-white focus:outline-none focus:border-indigo-500/50 transition-all font-mono"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* System & Performance */}
        <section className="bg-[#050505] border border-white/5 rounded-[32px] p-6 shadow-2xl">
          <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-6">
            <Cpu className="w-4 h-4 text-emerald-400" /> Performance Runtime
          </h3>
          <div className="space-y-2">
            <ToggleItem label="Hardware Acceleration" desc="Use GPU for rendering UI animations." active={true} onClick={()=>{}} />
            <ToggleItem label="Auto-Save VFS" desc="Persist changes to local device automatically." active={true} onClick={()=>{}} />
            <ToggleItem label="PhD Mode" desc="Enable advanced causal impact analysis." active={true} onClick={()=>{}} />
          </div>
        </section>

        <button 
          onClick={() => { localStorage.clear(); window.location.reload(); }}
          className="w-full py-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-[12px] font-bold uppercase tracking-widest hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
        >
          <Trash2 className="w-4 h-4" /> Wipe Local Storage & Reset
        </button>
      </div>
    </motion.div>
  );
};
