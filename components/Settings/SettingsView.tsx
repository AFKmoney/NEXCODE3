"use client";

import React from "react";
import { motion } from "motion/react";
import { 
  Settings, Database, Loader2, CheckCircle2, X, FolderTree, BrainCircuit, ChevronDown 
} from "lucide-react";

type SettingsViewProps = {
  settings: any;
  toggleSetting: (key: any) => void;
  githubSshKey: string;
  setGithubSshKey: (val: string) => void;
  sshTestStatus: string;
  handleTestSsh: () => void;
  apiKeys: any;
  setApiKeys: React.Dispatch<React.SetStateAction<any>>;
  models: any;
  setModels: React.Dispatch<React.SetStateAction<any>>;
  activeProvider: string;
  setActiveProvider: (val: string) => void;
  isProviderMenuOpen: boolean;
  setIsProviderMenuOpen: (val: boolean) => void;
  pageVariants: any;
};

export const SettingsView = ({
  settings,
  toggleSetting,
  githubSshKey,
  setGithubSshKey,
  sshTestStatus,
  handleTestSsh,
  apiKeys,
  setApiKeys,
  models,
  setModels,
  activeProvider,
  setActiveProvider,
  pageVariants
}: SettingsViewProps) => {
  return (
    <motion.div key="settings" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="absolute inset-0 overflow-y-auto pb-28 pt-10 px-7 scrollbar-hide bg-black w-full h-full mb-10">
      <div className="flex items-center gap-5 mb-10">
        <div className="p-4 bg-gradient-to-br from-indigo-500/20 to-purple-500/10 rounded-[24px] border border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.15)] relative">
          <div className="absolute inset-0 bg-white/5 rounded-[24px] blur-sm" />
          <Settings className="w-8 h-8 text-indigo-400 relative z-10" />
        </div>
        <div>
          <h2 className="text-[26px] font-display font-medium text-white tracking-tight">Engine Config</h2>
          <p className="text-[13px] text-gray-400 mt-1 font-medium">Orchestration Parameters</p>
        </div>
      </div>

      <div className="space-y-6">
         <div className="bg-[#050505] border border-white/5 rounded-[32px] p-6 shadow-[0_20px_40px_rgba(0,0,0,1)] ring-1 ring-white/5">
           <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-2">
             <Settings className="w-4 h-4 text-indigo-400" /> Editor Preferences
           </h3>
           <p className="text-[12px] text-gray-500 mb-6">Customize the workspace environment and text editor behavior.</p>
           
           <div className="space-y-3">
             {[
               { id: 'themeDark', label: 'Dark Theme', desc: 'Use the deep-contrast dark mode for the editor.' },
               { id: 'autoSave', label: 'Auto-Save', desc: 'Automatically save file changes to the VFS.' },
               { id: 'formatOnSave', label: 'Format on Save', desc: 'Run Prettier on file save.' }
             ].map((setting) => (
               <label key={setting.id} className="flex items-center justify-between p-4 rounded-[16px] bg-[#0a0a0a] border border-white/5 hover:border-white/10 transition-colors cursor-pointer group">
                 <div className="flex flex-col">
                   <span className="text-[14px] text-gray-200 font-medium">{setting.label}</span>
                   <span className="text-[11px] text-gray-500">{setting.desc}</span>
                 </div>
                 <div className="relative inline-flex items-center cursor-pointer">
                   <input type="checkbox" className="sr-only peer" checked={settings[setting.id]} onChange={() => toggleSetting(setting.id)} />
                   <div className="w-11 h-6 bg-white/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500/80"></div>
                 </div>
               </label>
             ))}
           </div>
         </div>

         <div className="bg-[#050505] border border-white/5 rounded-[32px] p-6 shadow-[0_20px_40px_rgba(0,0,0,1)] ring-1 ring-white/5">
           <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-2">
             <Database className="w-4 h-4 text-blue-400" /> Engine & Storage
           </h3>
           <p className="text-[12px] text-gray-500 mb-6">Configure underlying performance and persistence parameters.</p>
           
           <div className="space-y-3">
             {[
               { id: 'useIndexedDB', label: 'IndexedDB File Manager', desc: 'Use high-performance IndexedDB for VFS mapping rather than localStorage.' },
               { id: 'hardwareAcceleration', label: 'Hardware Acceleration', desc: 'Offload intensive tasks to GPU when decoding frames.' }
             ].map((setting) => (
               <label key={setting.id} className="flex items-center justify-between p-4 rounded-[16px] bg-[#0a0a0a] border border-white/5 hover:border-white/10 transition-colors cursor-pointer group">
                 <div className="flex flex-col">
                   <span className="text-[14px] text-gray-200 font-medium">{setting.label}</span>
                   <span className="text-[11px] text-gray-500">{setting.desc}</span>
                 </div>
                 <div className="relative inline-flex items-center cursor-pointer">
                   <input type="checkbox" className="sr-only peer" checked={settings[setting.id]} onChange={() => toggleSetting(setting.id)} />
                   <div className="w-11 h-6 bg-white/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500/80"></div>
                 </div>
               </label>
             ))}
           </div>
         </div>

         <div className="bg-[#050505] border border-white/5 rounded-[32px] p-6 shadow-[0_20px_40px_rgba(0,0,0,1)] ring-1 ring-white/5">
           <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-2">
             <Settings className="w-4 h-4 text-pink-400" /> Secrets & Authentication
           </h3>
           <p className="text-[12px] text-gray-500 mb-6">Manage sensitive credentials for accessing private repositories.</p>
           
           <div className="space-y-4">
             <div className="relative group">
               <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center justify-between">
                 <span className="flex items-center gap-1.5"><FolderTree className="w-3 h-3 text-emerald-400" /> GitHub SSH Key</span>
               </label>
               <textarea 
                 value={githubSshKey}
                 onChange={e => setGithubSshKey(e.target.value)}
                 placeholder="Begins with '-----BEGIN OPENSSH PRIVATE KEY-----'"
                 className="w-full bg-[#0a0a0a] text-emerald-400 border border-white/5 rounded-[16px] py-3 px-4 text-[13px] font-mono focus:outline-none focus:border-emerald-500/50 transition-colors h-32 resize-none shadow-inner"
               />
               <div className="text-[10px] text-gray-500 mt-2 flex items-center justify-between">
                  <span>Stored exclusively in local browser storage.</span>
                  <div className="flex items-center gap-3">
                    {sshTestStatus === "testing" && <span className="text-indigo-400 font-bold flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin"/> Testing...</span>}
                    {sshTestStatus === "success" && <span className="text-emerald-400 font-bold flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Valid Key</span>}
                    {sshTestStatus === "error" && <span className="text-red-400 font-bold flex items-center gap-1"><X className="w-3 h-3"/> Invalid Key</span>}
                    {githubSshKey.length > 0 && sshTestStatus === "idle" && <span className="text-emerald-400 font-bold">● Key Saved</span>}
                    <button onClick={handleTestSsh} disabled={!githubSshKey || sshTestStatus === "testing"} className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded-full text-white tracking-widest uppercase font-bold disabled:opacity-50 transition-colors">Test Connection</button>
                  </div>
               </div>
             </div>
           </div>
         </div>
         
         <div className="bg-[#050505] border border-white/5 rounded-[32px] p-6 shadow-[0_20px_40px_rgba(0,0,0,1)] ring-1 ring-white/5">
           <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-2">
             <BrainCircuit className="w-4 h-4 text-purple-400" /> AI Providers & Models
           </h3>
           <p className="text-[12px] text-gray-500 mb-6">Select your orchestration engine and configure the associated model.</p>
           
           <div className="space-y-6">
             <div className="flex flex-col gap-2">
               <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Provider</label>
               <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                 {['gemini', 'claude', 'openai', 'mistral'].map(p => (
                   <button 
                     key={p} 
                     onClick={() => setActiveProvider(p)}
                     className={`px-3 py-2.5 rounded-[12px] text-[11px] font-bold uppercase tracking-wider transition-all flex items-center justify-center ${activeProvider === p ? 'bg-purple-500/20 text-purple-400 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.15)] ring-1 ring-purple-500/50' : 'bg-white/5 text-gray-500 border-white/5 hover:text-gray-300 hover:bg-white/10'} border`}
                   >
                     {p}
                   </button>
                 ))}
               </div>
             </div>

             {[
               { id: 'gemini', label: 'Gemini (Google)', keyPlaceholder: 'AIza...', defaultModel: 'gemini-2.5-flash' },
               { id: 'claude', label: 'Claude (Anthropic)', keyPlaceholder: 'sk-ant-...', defaultModel: 'claude-3-5-sonnet-20241022' },
               { id: 'openai', label: 'OpenAI', keyPlaceholder: 'sk-...', defaultModel: 'gpt-4o' },
               { id: 'mistral', label: 'Mistral AI', keyPlaceholder: '...', defaultModel: 'mistral-large-latest' }
             ].map(provider => (
               activeProvider === provider.id && (
                 <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} key={provider.id} className="space-y-4 pt-2 border-t border-white/5">
                   <div className="relative group">
                     <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center justify-between">
                       <span className="flex items-center gap-1.5 text-purple-400">{provider.label} API Key</span>
                     </label>
                     <input
                       type="password"
                       value={apiKeys[provider.id] || ''}
                       onChange={e => setApiKeys((prev: any) => ({...prev, [provider.id]: e.target.value}))}
                       placeholder={provider.keyPlaceholder}
                       className="w-full bg-[#0a0a0a] text-purple-300 border border-white/5 rounded-[12px] py-2.5 px-4 text-[13px] font-mono focus:outline-none focus:border-purple-500/50 transition-colors shadow-inner"
                     />
                   </div>
                   <div className="relative group">
                     <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center justify-between">
                       <span className="flex items-center gap-1.5">{provider.label} Model Name</span>
                     </label>
                     <input
                       type="text"
                       value={models[provider.id] || ''}
                       onChange={e => setModels((prev: any) => ({...prev, [provider.id]: e.target.value}))}
                       placeholder={`e.g. ${provider.defaultModel}`}
                       className="w-full bg-[#0a0a0a] text-gray-300 border border-white/5 rounded-[12px] py-2.5 px-4 text-[13px] font-mono focus:outline-none focus:border-white/20 transition-colors shadow-inner"
                     />
                   </div>
                 </motion.div>
               )
             ))}
           </div>
         </div>
      </div>
    </motion.div>
  );
};
