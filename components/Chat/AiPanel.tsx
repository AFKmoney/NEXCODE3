"use client";

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Rnd } from "react-rnd";
import { Sparkles, X, ChevronDown, Send, Loader2 } from "lucide-react";

type Message = { role: 'user' | 'ai'; content: string; };

type AiPanelProps = {
  isAiPanelOpen: boolean;
  setIsAiPanelOpen: (val: boolean) => void;
  messages: Message[];
  isChatLoading: boolean;
  activeProvider: string;
  setActiveProvider: (val: string) => void;
  isProviderMenuOpen: boolean;
  setIsProviderMenuOpen: (val: boolean) => void;
  chatInput: string;
  setChatInput: (val: string) => void;
  handleSendChat: (overrideText?: string) => void;
  chatInputRef: React.RefObject<HTMLTextAreaElement | null>;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
};

export const AiPanel = ({
  isAiPanelOpen,
  setIsAiPanelOpen,
  messages,
  isChatLoading,
  activeProvider,
  setActiveProvider,
  isProviderMenuOpen,
  setIsProviderMenuOpen,
  chatInput,
  setChatInput,
  handleSendChat,
  chatInputRef,
  messagesEndRef
}: AiPanelProps) => {
  if (!isAiPanelOpen) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-[200] overflow-hidden">
      <Rnd
        default={{
          x: typeof window !== "undefined" && window.innerWidth > 1000 ? (window.innerWidth * 0.95 > 1400 ? 1000 : window.innerWidth * 0.95 - 400) : 20,
          y: 40,
          width: Math.min(380, typeof window !== 'undefined' ? window.innerWidth - 30 : 380),
          height: Math.min(600, typeof window !== 'undefined' ? window.innerHeight - 80 : 600)
        }}
        minWidth={Math.min(320, typeof window !== 'undefined' ? window.innerWidth - 30 : 320)}
        minHeight={400}
        bounds="parent"
        className="pointer-events-auto shadow-[0_30px_100px_rgba(0,0,0,1)] rounded-[32px]"
        dragHandleClassName="drag-handle"
      >
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-[100vw] h-full bg-[#050505]/95 backdrop-blur-3xl sm:rounded-[32px] rounded-[32px] mx-auto shadow-[0_-30px_100px_rgba(0,0,0,0.9)] border border-indigo-500/20 flex flex-col overflow-hidden ring-1 ring-white/10">
           
           <div className="drag-handle flex-none p-5 flex justify-center items-center border-b border-white/5 relative bg-gradient-to-b from-indigo-500/5 to-transparent cursor-move">
             <div className="absolute top-2 w-12 h-1 bg-white/20 rounded-full" />
             <div className="mt-2 flex items-center justify-between w-full px-0 sm:px-2">
               <div className="flex items-center gap-3.5">
                 <div className="w-11 h-11 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                   <Sparkles className="w-5 h-5 text-indigo-400" />
                 </div>
                 <div className="flex flex-col relative">
                   <span className="font-bold text-white text-[16px] tracking-tight">Nexus AI</span>
                   <button 
                     onClick={() => setIsProviderMenuOpen(!isProviderMenuOpen)}
                     className="text-[11px] text-emerald-400 font-mono tracking-tight flex items-center gap-1.5 hover:text-emerald-300 transition-colors uppercase cursor-pointer"
                   >
                     <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-[0_0_5px_currentColor] pointer-events-none" />
                     {activeProvider}
                     <ChevronDown className="w-3 h-3 ml-0.5 opacity-70" />
                   </button>
                   <AnimatePresence>
                     {isProviderMenuOpen && (
                       <motion.div 
                         initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                         className="absolute top-full left-0 mt-2 w-32 bg-[#0a0a0a] border border-white/10 rounded-[12px] shadow-2xl overflow-hidden z-[300]"
                       >
                         {['gemini', 'claude', 'openai', 'mistral'].map(p => (
                           <button
                             key={p}
                             onClick={() => {
                               setActiveProvider(p);
                               setIsProviderMenuOpen(false);
                             }}
                             className={`w-full text-left px-3 py-2 text-[10px] uppercase font-bold tracking-widest transition-colors ${activeProvider === p ? 'bg-purple-500/20 text-purple-400' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                           >
                             {p}
                           </button>
                         ))}
                       </motion.div>
                     )}
                   </AnimatePresence>
                 </div>
               </div>
               <button onPointerDown={(e) => e.stopPropagation()} onClick={() => setIsAiPanelOpen(false)} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                 <X className="w-5 h-5" />
               </button>
             </div>
           </div>

           <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-hide mb-2 relative">
             {messages.map((m, i) => (
               <div key={i} className={`flex w-full ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                 <div className={`max-w-[85%] overflow-hidden break-words break-all whitespace-pre-wrap rounded-[24px] px-5 py-3.5 text-[14px] leading-relaxed relative border ${
                   m.role === 'user' 
                     ? 'bg-indigo-600 bg-opacity-90 border-indigo-500 text-white rounded-br-sm shadow-[0_5px_15px_rgba(99,102,241,0.2)]' 
                     : 'bg-[#0a0a0a] border-white/10 text-gray-200 rounded-bl-sm shadow-[0_5px_15px_rgba(0,0,0,0.8)]'
                 }`}>
                    {m.content}
                 </div>
               </div>
             ))}
             {isChatLoading && (
               <div className="flex w-full justify-start">
                 <div className="max-w-[80%] rounded-[24px] bg-[#0a0a0a] border border-white/10 rounded-bl-sm px-6 py-4 shadow-lg">
                   <span className="flex gap-2">
                     <motion.span animate={{ y: [0, -6, 0], scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0 }} className="w-2.5 h-2.5 bg-indigo-500 rounded-full" />
                     <motion.span animate={{ y: [0, -6, 0], scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }} className="w-2.5 h-2.5 bg-purple-500 rounded-full" />
                     <motion.span animate={{ y: [0, -6, 0], scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }} className="w-2.5 h-2.5 bg-indigo-400 rounded-full" />
                   </span>
                 </div>
               </div>
             )}
             <div ref={messagesEndRef} className="h-4" />
           </div>

           <div className="flex-none p-5 bg-gradient-to-t from-[#050505] to-transparent pt-8 -mt-6 z-10 relative">
              <div className="relative flex items-center bg-[#0a0a0a] border border-indigo-500/30 rounded-[32px] overflow-hidden p-1.5 focus-within:ring-2 focus-within:ring-indigo-500/70 shadow-[0_0_20px_rgba(99,102,241,0.1)] transition-all">
                <textarea 
                  ref={chatInputRef as any}
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendChat();
                    }
                  }}
                  placeholder="Ask Nexus anything..."
                  className="flex-1 bg-transparent border-none py-3 px-4 text-[14px] text-white focus:outline-none placeholder-gray-600 resize-none max-h-32 min-h-[44px]"
                  rows={1}
                />
                <button 
                  onClick={() => handleSendChat()}
                  disabled={isChatLoading || !chatInput.trim()}
                  className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center disabled:opacity-50 disabled:bg-gray-800 transition-all hover:bg-indigo-500 shadow-lg active:scale-95"
                >
                  {isChatLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 ml-0.5" />}
                </button>
              </div>
           </div>
        </motion.div>
      </Rnd>
    </div>
  );
};
