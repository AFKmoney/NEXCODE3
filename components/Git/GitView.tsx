"use client";

import React from "react";
import { motion } from "motion/react";
import { GitBranch, GitMerge, GitPullRequest, History, GitCommit } from "lucide-react";

type GitViewProps = {
  githubConnected: boolean;
  currentRepo: string | null;
  files: Record<string, string>;
  pullRequests: any[];
  commits: any[];
  pageVariants: any;
};

export const GitView = ({
  githubConnected,
  currentRepo,
  files,
  pullRequests,
  commits,
  pageVariants
}: GitViewProps) => {
  return (
    <motion.div key="git" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="absolute inset-0 overflow-y-auto bg-transparent p-5 pt-6 space-y-6 w-full h-full pb-20">
      {!githubConnected ? (
         <div className="text-center mt-32 bg-white/5 border border-white/10 p-6 rounded-3xl mx-4 text-gray-400 font-medium text-sm">Please initialize a workspace in the Explorer first.</div>
      ) : (
        <>
           <div className="bg-[#050505] border border-white/5 rounded-[32px] p-5 shadow-[0_10px_30px_rgba(0,0,0,1)] ring-1 ring-white/5">
             <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-emerald-500/10 rounded-xl">
                     <GitBranch className="w-5 h-5 text-emerald-400" />
                   </div>
                   <span className="font-bold text-white text-[15px]">{currentRepo?.split('/')[1] || "Local"}</span>
                </div>
                <span className="text-emerald-400 font-mono font-bold text-[10px] bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20 tracking-wider">main</span>
             </div>
             <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400 font-medium">{Object.keys(files).length} files tracked, 0 staged</span>
                <button className="px-5 py-2.5 bg-white text-black hover:bg-gray-200 rounded-full font-bold transition-transform active:scale-95 shadow-sm">Commit</button>
             </div>
           </div>

           <div className="relative bg-gradient-to-br from-indigo-500/20 to-[#050505] border border-indigo-500/30 rounded-[32px] p-6 overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.8)] ring-1 ring-indigo-500/20">
              <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-500/30 blur-[60px] rounded-full" />
              <div className="flex items-center justify-between mb-3 relative z-10">
                 <h3 className="text-[12px] font-bold text-indigo-300 uppercase tracking-widest flex items-center gap-2">
                   <GitMerge className="w-4 h-4" /> Quantum Divergence
                 </h3>
                 <span className="text-[9px] bg-amber-500/20 text-amber-400 px-2 py-1 rounded-md font-bold uppercase tracking-wider">Premium</span>
              </div>
              <p className="text-[13px] text-indigo-200/70 mb-5 leading-relaxed font-medium relative z-10">
                Create invisible parallel dimensions to test massive LLM-generated refactorings without altering your local working tree.
              </p>
              <button className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 rounded-full text-[13px] font-bold transition-all relative z-10 backdrop-blur-sm">
                Create Dimension
              </button>
           </div>
           
           <div className="bg-[#050505] border border-white/5 rounded-[32px] p-6 shadow-[0_10px_30px_rgba(0,0,0,1)] mb-6 ring-1 ring-white/5">
              <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2 mb-6">
                <GitPullRequest className="w-4 h-4" /> Pull Requests
              </h3>
              <div className="space-y-4">
                 {pullRequests.length > 0 ? (
                   pullRequests.map((pr, i) => (
                      <div key={i} className="flex gap-4 p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer border border-white/5">
                        <div className="w-8 h-8 bg-black border-2 border-white/5 rounded-full flex items-center justify-center shrink-0">
                          <GitPullRequest className={`w-3.5 h-3.5 ${pr.state === 'open' ? 'text-emerald-400' : 'text-purple-400'}`} />
                        </div>
                        <div className="flex flex-col gap-1 overflow-hidden">
                          <p className="text-[13px] text-gray-200 font-semibold truncate leading-tight">{pr.title}</p>
                          <p className="text-[11px] text-gray-500 font-mono tracking-tight">#{pr.number} • {pr.user}</p>
                        </div>
                      </div>
                   ))
                 ) : (
                   <div className="text-[13px] text-gray-500 font-medium">No open pull requests found.</div>
                 )}
              </div>
           </div>
           
           <div className="bg-[#050505] border border-white/5 rounded-[32px] p-6 shadow-[0_10px_30px_rgba(0,0,0,1)] mb-6 ring-1 ring-white/5">
              <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2 mb-6">
                <History className="w-4 h-4" /> Version History
              </h3>
              <div className="space-y-6 relative before:absolute before:inset-y-0 before:left-[15px] before:w-px before:bg-white/10">
                 {commits.length > 0 ? (
                   commits.map((c, i) => (
                      <div key={i} className="flex gap-4 relative z-10">
                        <div className="w-8 h-8 bg-black border-2 border-white/10 rounded-full flex items-center justify-center shrink-0 shadow-sm">
                          <GitCommit className="w-3.5 h-3.5 text-emerald-400" />
                        </div>
                        <div className="flex flex-col gap-1 pt-1 overflow-hidden">
                          <p className="text-[13px] text-gray-200 font-semibold whitespace-nowrap text-ellipsis overflow-hidden">{c.message}</p>
                          <p className="text-[11px] text-gray-500 font-mono tracking-tight">{c.sha} • {c.author}</p>
                        </div>
                      </div>
                   ))
                 ) : (
                   <div className="text-[13px] text-gray-500 pl-12 font-medium">Initialize git repository to view history.</div>
                 )}
              </div>
           </div>
        </>
      )}
    </motion.div>
  );
};
