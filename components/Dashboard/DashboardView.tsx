"use client";

import React from "react";
import { motion } from "motion/react";
import { Activity } from "lucide-react";

type DashboardViewProps = {
  repoMetrics: any;
  pageVariants: any;
};

export const DashboardView = ({
  repoMetrics,
  pageVariants
}: DashboardViewProps) => {
  return (
    <motion.div key="dashboard" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="absolute inset-0 bg-[#050505] overflow-y-auto flex flex-col p-4 sm:p-8 text-white pb-32">
       <div className="flex items-center gap-4 mb-8">
         <div className="p-4 bg-gradient-to-br from-pink-500/20 to-purple-500/10 rounded-2xl border border-pink-500/20">
            <Activity className="w-8 h-8 text-pink-400" />
         </div>
         <div>
           <h2 className="text-[26px] font-display font-medium text-white tracking-tight">{repoMetrics ? repoMetrics.name : "Nexus Analytics"}</h2>
           <p className="text-[13px] text-gray-400">{repoMetrics ? repoMetrics.description || "Project Metrics" : "Connect a repository to load specific metrics"}</p>
         </div>
       </div>

       {repoMetrics ? (
         <>
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-2xl flex flex-col justify-between">
                 <span className="text-gray-400 text-[12px] font-medium uppercase tracking-widest block mb-2">Stars</span>
                 <span className="text-[32px] font-bold text-white tracking-tight">{repoMetrics.stargazers_count?.toLocaleString() || "0"}</span>
              </div>
              <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-2xl flex flex-col justify-between">
                 <span className="text-gray-400 text-[12px] font-medium uppercase tracking-widest block mb-2">Forks</span>
                 <span className="text-[32px] font-bold text-white tracking-tight">{repoMetrics.forks_count?.toLocaleString() || "0"}</span>
              </div>
              <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-2xl flex flex-col justify-between">
                 <span className="text-gray-400 text-[12px] font-medium uppercase tracking-widest block mb-2">Open Issues</span>
                 <span className="text-[32px] font-bold text-white tracking-tight">{repoMetrics.open_issues_count?.toLocaleString() || "0"}</span>
              </div>
              <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-2xl flex flex-col justify-between">
                 <span className="text-gray-400 text-[12px] font-medium uppercase tracking-widest block mb-2">Size (KB)</span>
                 <span className="text-[32px] font-bold text-white tracking-tight">{repoMetrics.size?.toLocaleString() || "0"}</span>
              </div>
           </div>
           
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
             <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-2xl flex flex-col justify-between min-h-[160px]">
                <span className="text-gray-400 text-[12px] font-medium uppercase tracking-widest block mb-2">Primary Language</span>
                <span className="text-[32px] font-bold text-emerald-400 tracking-tight">{repoMetrics.language || "Unknown"}</span>
             </div>
             <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-2xl flex flex-col justify-between min-h-[160px]">
                <span className="text-gray-400 text-[12px] font-medium uppercase tracking-widest block mb-2">Subscribers</span>
                <span className="text-[32px] font-bold text-purple-400 tracking-tight">{repoMetrics.subscribers_count?.toLocaleString() || "0"}</span>
             </div>
           </div>
         </>
       ) : (
         <div className="bg-[#0a0a0a] border border-white/5 p-12 rounded-2xl flex flex-col items-center justify-center text-center">
            <Activity className="w-12 h-12 text-gray-700 mb-4" />
            <h3 className="text-lg font-bold text-gray-300">No project metrics</h3>
            <p className="text-sm text-gray-500 mt-2 max-w-sm">Connect a valid GitHub repository in the UI to dynamically analyze its structure and view real-time project metrics here.</p>
         </div>
       )}
    </motion.div>
  );
};
