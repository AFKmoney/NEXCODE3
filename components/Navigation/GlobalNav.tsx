"use client";

import React from "react";
import { FolderTree, Code2, BrainCircuit, Smartphone, TerminalSquare, Settings, LayoutGrid } from "lucide-react";
import { BottomTab } from "./BottomTab";

type GlobalNavProps = {
  isZenMode: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  setIsAiPanelOpen: (val: boolean) => void;
};

export const GlobalNav = ({
  isZenMode,
  activeTab,
  setActiveTab,
  setIsAiPanelOpen
}: GlobalNavProps) => {
  if (isZenMode) return (
    <div className="absolute w-full bottom-0 h-4 flex justify-center items-end pb-1.5 z-50 pointer-events-none">
      <div className="w-24 h-1 bg-white/10 rounded-full" />
    </div>
  );

  return (
    <>
      <div className="absolute bottom-10 inset-x-0 z-50 pointer-events-none flex justify-center px-6">
        <div className="relative group pointer-events-auto">
          {/* Outer glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-indigo-500/20 rounded-[40px] blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
          
          <nav className="h-[76px] rounded-[38px] glass-morphism grid grid-cols-5 items-center justify-items-center px-2 py-1.5 relative z-10 w-full max-w-[440px] border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.8)]">
            <BottomTab activeTab={activeTab} id="files" icon={FolderTree} label="Files" onClick={setActiveTab} />
            <BottomTab activeTab={activeTab} id="editor" icon={Code2} label="Code" onClick={setActiveTab} />
            
            <div className="relative -top-8 flex justify-center items-center">
               <div className="absolute inset-0 bg-indigo-500/40 rounded-full blur-2xl group-hover:bg-indigo-400/60 transition-all duration-500 scale-125 animate-pulse" />
               <button 
                onClick={() => setIsAiPanelOpen(true)} 
                className="relative w-[68px] h-[68px] rounded-[34px] bg-gradient-to-b from-indigo-500 to-indigo-700 text-white flex justify-center items-center shadow-[0_15px_35px_rgba(99,102,241,0.5)] hover:scale-110 active:scale-90 border-[6px] border-black transition-all duration-300 group/btn"
               >
                  <BrainCircuit className="w-7 h-7 drop-shadow-lg group-hover/btn:rotate-12 transition-transform" />
               </button>
            </div>

            <BottomTab activeTab={activeTab} id="preview" icon={Smartphone} label="Preview" onClick={setActiveTab} />
            
            {/* Quick Actions / More menu simulation */}
            <button
              onClick={() => setActiveTab(activeTab === "devops" ? "editor" : "devops")}
              className={`flex flex-col items-center justify-center w-full py-2 gap-1 transition-all ${
                activeTab === "devops" ? "text-indigo-400" : "text-gray-500 hover:text-gray-300"
              }`}
            >
              <LayoutGrid className="w-5 h-5" />
              <span className="text-[9px] font-bold uppercase tracking-tighter">More</span>
            </button>
          </nav>
        </div>
      </div>
      
      {/* Home Indicator */}
      <div className="absolute w-full bottom-0 h-8 flex justify-center items-end pb-2 z-50 pointer-events-none">
        <div className="w-32 h-1.5 bg-white/5 rounded-full" />
      </div>
    </>
  );
};
