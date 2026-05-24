"use client";

import React from "react";
import { FolderTree, Code2, BrainCircuit, Smartphone, TerminalSquare } from "lucide-react";
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
      <div className="w-24 h-[5px] bg-white/30 rounded-full" />
    </div>
  );

  return (
    <>
      <div className="absolute bottom-8 inset-x-0 z-50 pointer-events-none flex justify-center px-5">
        <nav className="h-[68px] rounded-[34px] border border-white/5 bg-black/80 backdrop-blur-3xl grid grid-cols-5 items-center justify-items-center px-1.5 py-1.5 shadow-[0_30px_60px_rgba(0,0,0,1)] pointer-events-auto w-full max-w-[420px] ring-1 ring-white/10">
          <BottomTab activeTab={activeTab} id="files" icon={FolderTree} label="Files" onClick={setActiveTab} />
          <BottomTab activeTab={activeTab} id="editor" icon={Code2} label="Code" onClick={setActiveTab} />
          <div className="relative z-50 group flex justify-center items-center">
             <div className="absolute inset-0 bg-purple-500/50 rounded-full blur-xl group-hover:bg-purple-400/60 transition-colors" />
             <button onClick={() => setIsAiPanelOpen(true)} className="relative w-[56px] h-[56px] rounded-[28px] bg-gradient-to-b from-purple-500 to-purple-700 text-white flex justify-center items-center shadow-[0_10px_30px_rgba(168,85,247,0.5)] hover:scale-105 active:scale-95 border-[4px] border-[#050505] transition-all">
                <BrainCircuit className="w-6 h-6 drop-shadow-md" />
             </button>
          </div>
          <BottomTab activeTab={activeTab} id="preview" icon={Smartphone} label="Preview" onClick={setActiveTab} />
          <BottomTab activeTab={activeTab} id="terminal" icon={TerminalSquare} label="Console" onClick={setActiveTab} />
        </nav>
      </div>
      <div className="absolute w-full bottom-0 h-4 flex justify-center items-end pb-1.5 z-50 pointer-events-none">
        <div className="w-24 h-[5px] bg-white/30 rounded-full" />
      </div>
    </>
  );
};
