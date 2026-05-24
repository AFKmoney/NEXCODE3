"use client";

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Command } from "lucide-react";

type CommandPaletteProps = {
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (val: boolean) => void;
  cmdSearchQuery: string;
  setCmdSearchQuery: (val: string) => void;
  filteredCmds: any[];
};

export const CommandPalette = ({
  isCommandPaletteOpen,
  setIsCommandPaletteOpen,
  cmdSearchQuery,
  setCmdSearchQuery,
  filteredCmds
}: CommandPaletteProps) => {
  return (
    <AnimatePresence>
      {isCommandPaletteOpen && (
         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[100] bg-black/60 backdrop-blur-md flex flex-col pt-16 px-4" onClick={() => setIsCommandPaletteOpen(false)}>
            <div className="bg-[#050505] border border-white/10 shadow-2xl rounded-3xl overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
               <div className="flex items-center px-4 py-4 border-b border-white/5">
                  <Search className="w-5 h-5 text-gray-400 mr-3" />
                  <input autoFocus className="flex-1 bg-transparent text-[15px] font-medium text-white placeholder-gray-500 focus:outline-none" placeholder="Search files, commands..." value={cmdSearchQuery} onChange={(e) => setCmdSearchQuery(e.target.value)} />
               </div>
               <div className="max-h-64 overflow-y-auto p-2">
                 {filteredCmds.map((c, i) => (
                   <button key={i} onClick={c.run} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-300 hover:bg-white/5 rounded-2xl transition-colors">
                     <Command className="w-4 h-4 text-indigo-400" /> {c.title}
                   </button>
                 ))}
               </div>
            </div>
         </motion.div>
      )}
    </AnimatePresence>
  );
};
