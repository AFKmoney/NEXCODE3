"use client";

import React from "react";
import { motion } from "motion/react";
import { Activity } from "lucide-react";
import DependencyGraph from "../DependencyGraph";

type GraphViewProps = {
  files: Record<string, string>;
  pageVariants: any;
};

export const GraphView = ({
  files,
  pageVariants
}: GraphViewProps) => {
  return (
    <motion.div key="graph" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="absolute inset-0 bg-[#050505] p-4 flex flex-col w-full h-full pb-28">
       <div className="flex items-center gap-4 mb-4">
         <div className="p-3 bg-gradient-to-br from-blue-500/20 to-purple-500/10 rounded-2xl border border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.15)] relative">
            <Activity className="w-6 h-6 text-blue-400 relative z-10" />
         </div>
         <div>
           <h2 className="text-[20px] font-display font-medium text-white tracking-tight">Dependency Graph</h2>
           <p className="text-[12px] text-gray-400 mt-1 font-medium">Architecture mapping module via D3</p>
         </div>
       </div>
       <div className="flex-1 rounded-3xl overflow-hidden relative shadow-[0_20px_60px_rgba(0,0,0,1)] ring-1 ring-white/5 bg-[#020202]">
          <DependencyGraph files={files} />
       </div>
    </motion.div>
  );
};
