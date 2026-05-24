"use client";

import React, { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, BrainCircuit, Send, Loader2, ChevronDown 
} from "lucide-react";
import { useNexusStore } from "@/lib/store";

export const AiPanel = () => {
  const store = useNexusStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [chatInput, setChatInput] = React.useState("");

  useEffect(() => {
    if (messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [store.messages]);

  if (!store.isAiPanelOpen) return null;

  const handleSend = async () => {
    if (!chatInput.trim() || store.isChatLoading) return;
    const input = chatInput;
    setChatInput("");
    await store.sendChatMessage(input);
  };

  return (
    <motion.div 
      initial={{ x: "100%" }} 
      animate={{ x: 0 }} 
      exit={{ x: "100%" }}
      className="fixed inset-y-0 right-0 w-full sm:w-[450px] bg-[#050505]/95 backdrop-blur-3xl border-l border-white/5 z-[100] flex flex-col shadow-2xl"
    >
      <div className="h-16 border-b border-white/5 flex items-center justify-between px-6 shrink-0 bg-black/40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/20 flex items-center justify-center border border-indigo-500/30">
            <BrainCircuit className="w-5 h-5 text-indigo-400" />
          </div>
          <h2 className="text-[15px] font-bold text-white uppercase tracking-widest">Nexus AI</h2>
        </div>
        <button onClick={() => store.setIsAiPanelOpen(false)} className="p-2 hover:bg-white/5 rounded-full text-gray-500 hover:text-white transition-all">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
        {store.messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-[14px] leading-relaxed ${m.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white/5 text-gray-300 border border-white/5'}`}>
              {m.content}
            </div>
          </div>
        ))}
        {store.isChatLoading && (
          <div className="flex justify-start">
            <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
              <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-6 bg-black/40 border-t border-white/5 space-y-4">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/5 text-[11px] font-bold text-indigo-400 uppercase tracking-tighter">
             <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
             {store.activeProvider}
           </div>
        </div>
        
        <div className="relative group">
          <textarea
            ref={inputRef}
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }}}
            placeholder="Ask Nexus anything..."
            className="w-full bg-[#0a0a0a] border border-white/10 rounded-2xl p-4 text-[14px] text-white placeholder:text-gray-600 focus:outline-none focus:border-indigo-500/50 transition-all resize-none min-h-[100px]"
          />
          <button 
            onClick={handleSend}
            disabled={store.isChatLoading}
            className="absolute bottom-4 right-4 p-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
