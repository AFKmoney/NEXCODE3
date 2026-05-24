"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Rnd } from "react-rnd";
import { Sparkles, X, ChevronDown, Send, Loader2, BrainCircuit, Maximize2, Minimize2 } from "lucide-react";

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
  const [isMaximized, setIsMaximized] = useState(false);

  if (!isAiPanelOpen) return null;

  const defaultSize = {
    x: typeof window !== "undefined" && window.innerWidth > 1000 ? window.innerWidth - 420 : 20,
    y: 60,
    width: Math.min(380, typeof window !== 'undefined' ? window.innerWidth - 40 : 380),
    height: Math.min(650, typeof window !== 'undefined' ? window.innerHeight - 120 : 650)
  };

  const maximizedSize = {
    x: 20,
    y: 20,
    width: typeof window !== 'undefined' ? window.innerWidth - 40 : 800,
    height: typeof window !== 'undefined' ? window.innerHeight - 40 : 800
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-[200] overflow-hidden">
      <Rnd
        size={isMaximized ? { width: maximizedSize.width, height: maximizedSize.height } : undefined}
        position={isMaximized ? { x: maximizedSize.x, y: maximizedSize.y } : undefined}
        default={defaultSize}
        minWidth={320}
        minHeight={400}
        bounds="parent"
        disableDragging={isMaximized}
        enableResizing={!isMaximized}
        className="pointer-events-auto"
        dragHandleClassName="drag-handle"
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }} 
          animate={{ opacity: 1, scale: 1, y: 0 }} 
          exit={{ opacity: 0, scale: 0.9, y: 20 }} 
          className="w-full h-full glass-morphism rounded-[2.5rem] flex flex-col overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.8)] border-indigo-500/20 ring-1 ring-white/10"
        >
           {/* Header */}
           <div className="drag-handle flex-none p-5 flex justify-center items-center border-b border-white/5 relative bg-gradient-to-b from-indigo-500/10 to-transparent cursor-move">
             <div className="absolute top-2 w-12 h-1.5 bg-white/10 rounded-full" />
             <div className="mt-3 flex items-center justify-between w-full px-2">
               <div className="flex items-center gap-4">
                 <div className="relative">
                    <div className="absolute inset-0 bg-indigo-500/30 blur-lg rounded-full animate-pulse" />
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center relative z-10 shadow-lg border border-white/20">
                      <BrainCircuit className="w-6 h-6 text-white" />
                    </div>
                 </div>
                 <div className="flex flex-col">
                   <span className="font-display font-bold text-white text-[17px] tracking-tight">Nexus Intelligence</span>
                   <div className="relative">
                      <button 
                        onClick={() => setIsProviderMenuOpen(!isProviderMenuOpen)}
                        className="text-[11px] text-emerald-400 font-mono tracking-wider flex items-center gap-1.5 hover:text-emerald-300 transition-colors uppercase font-bold"
                      >
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_8px_#10b981]" />
                        {activeProvider}
                        <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${isProviderMenuOpen ? 'rotate-180' : ''}`} />
                      </button>
                      <AnimatePresence>
                        {isProviderMenuOpen && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                            className="absolute top-full left-0 mt-3 w-40 glass-morphism rounded-2xl shadow-2xl overflow-hidden z-[300] border-white/10 p-1.5"
                          >
                            {['gemini', 'claude', 'openai', 'mistral'].map(p => (
                              <button
                                key={p}
                                onClick={() => {
                                  setActiveProvider(p);
                                  setIsProviderMenuOpen(false);
                                }}
                                className={`w-full text-left px-4 py-2.5 text-[11px] uppercase font-bold tracking-widest rounded-xl transition-all ${activeProvider === p ? 'bg-indigo-500 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}`}
                              >
                                {p}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                   </div>
                 </div>
               </div>
               
               <div className="flex items-center gap-2">
                 <button onClick={() => setIsMaximized(!isMaximized)} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-gray-400 transition-colors">
                   {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                 </button>
                 <button onClick={() => setIsAiPanelOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors">
                   <X className="w-5 h-5" />
                 </button>
               </div>
             </div>
           </div>

           {/* Messages */}
           <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide bg-black/20">
             {messages.map((m, i) => (
               <motion.div 
                initial={{ opacity: 0, x: m.role === 'user' ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                key={i} 
                className={`flex w-full ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
               >
                 <div className={`max-w-[90%] rounded-[2rem] px-6 py-4 text-[14px] leading-relaxed shadow-xl border ${
                   m.role === 'user' 
                     ? 'bg-indigo-600 border-indigo-400 text-white rounded-tr-none' 
                     : 'bg-[#111]/80 border-white/5 text-gray-200 rounded-tl-none font-medium'
                 }`}>
                    {m.content}
                    {m.role === 'ai' && i === messages.length - 1 && isChatLoading && (
                       <span className="inline-block ml-2 w-1.5 h-4 bg-indigo-400 animate-pulse align-middle" />
                    )}
                 </div>
               </motion.div>
             ))}
             {isChatLoading && messages[messages.length-1].role === 'user' && (
               <div className="flex w-full justify-start">
                 <div className="rounded-[2rem] bg-[#111]/80 border border-white/5 px-6 py-4 shadow-lg rounded-tl-none">
                   <div className="flex gap-1.5">
                     <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1 }} className="w-2 h-2 bg-indigo-500 rounded-full" />
                     <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-2 h-2 bg-purple-500 rounded-full" />
                     <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-2 h-2 bg-indigo-400 rounded-full" />
                   </div>
                 </div>
               </div>
             )}
             <div ref={messagesEndRef} className="h-10" />
           </div>

           {/* Input */}
           <div className="flex-none p-6 bg-gradient-to-t from-black to-transparent pt-10 -mt-10">
              <div className="relative flex items-end gap-3 glass-morphism rounded-[2rem] p-2 border-indigo-500/30 focus-within:ring-2 focus-within:ring-indigo-500/50 transition-all shadow-2xl">
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
                  placeholder="Inquire the Nexus..."
                  className="flex-1 bg-transparent border-none py-4 px-5 text-[15px] text-white focus:outline-none placeholder-gray-600 resize-none max-h-48 min-h-[56px] font-medium"
                  rows={1}
                />
                <button 
                  onClick={() => handleSendChat()}
                  disabled={isChatLoading || !chatInput.trim()}
                  className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center disabled:opacity-30 disabled:grayscale transition-all hover:bg-indigo-500 shadow-lg active:scale-95 group mb-1 mr-1"
                >
                  {isChatLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />}
                </button>
              </div>
           </div>
        </motion.div>
      </Rnd>
    </div>
  );
};
