"use client";

import React, { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import dynamic from "next/dynamic";
import { useNexusStore } from "@/lib/store";

// UI Components
import { GlobalNav } from "@/components/Navigation/GlobalNav";
import { CommandPalette } from "@/components/Navigation/CommandPalette";
import { MainHeader } from "@/components/Layout/MainHeader";

// Dynamic Views (Optimized for Mobile)
const EditorView = dynamic(() => import("@/components/Editor/EditorView").then(mod => mod.EditorView), { ssr: false });
const TerminalView = dynamic(() => import("@/components/Terminal/TerminalView").then(mod => mod.TerminalView), { ssr: false });
const FileExplorerView = dynamic(() => import("@/components/FileExplorer/FileExplorerView").then(mod => mod.FileExplorerView), { ssr: false });
const GitView = dynamic(() => import("@/components/Git/GitView").then(mod => mod.GitView), { ssr: false });
const GraphView = dynamic(() => import("@/components/Graph/GraphView").then(mod => mod.GraphView), { ssr: false });
const PreviewView = dynamic(() => import("@/components/Preview/PreviewView").then(mod => mod.PreviewView), { ssr: false });
const SettingsView = dynamic(() => import("@/components/Settings/SettingsView").then(mod => mod.SettingsView), { ssr: false });
const TaskBoard = dynamic(() => import("@/components/Tasks/TaskBoard").then(mod => mod.TaskBoard), { ssr: false });
const MarketplaceView = dynamic(() => import("@/components/Marketplace/MarketplaceView").then(mod => mod.MarketplaceView), { ssr: false });
const AiPanel = dynamic(() => import("@/components/Chat/AiPanel").then(mod => mod.AiPanel), { ssr: false });
const DevOpsView = dynamic(() => import("@/components/Dashboard/DevOpsView").then(mod => mod.DevOpsView), { ssr: false });

export default function NexusCodeApp() {
  const store = useNexusStore();
  
  useEffect(() => {
    store.init();
  }, []);

  const pageVariants = {
    initial: { opacity: 0, y: 10, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -10, scale: 0.98, transition: { duration: 0.2 } }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center p-0 sm:p-6 font-sans select-none overflow-hidden text-gray-200 relative isolate">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPHBhdGggZD0iTTAgMGg0djRIMHptMSAxaDJ2MkgxeiIgZmlsbD0iIzAwMCIgZmlsbC1vcGFjaXR5PSIwLjAyIi8+Cjwvc3ZnPg==')] mix-blend-overlay" />
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none z-0" />
      
      <motion.div layout className="relative bg-[#050505]/95 backdrop-blur-3xl shadow-[0_40px_80px_rgba(0,0,0,1)] flex flex-col mx-auto ring-1 ring-white/10 z-10 overflow-hidden w-full h-[100dvh] sm:h-[95vh] sm:w-[95vw] sm:max-w-[1400px] sm:rounded-[32px]">
        
        <MainHeader />

        <main className="flex-1 relative overflow-hidden bg-black">
          <AnimatePresence mode="popLayout">
            {store.activeTab === "editor" && <EditorView key="editor" pageVariants={pageVariants} />}
            {store.activeTab === "files" && <FileExplorerView key="files" pageVariants={pageVariants} />}
            {store.activeTab === "terminal" && <TerminalView key="terminal" pageVariants={pageVariants} />}
            {store.activeTab === "git" && <GitView key="git" pageVariants={pageVariants} />}
            {store.activeTab === "graph" && <GraphView key="graph" pageVariants={pageVariants} />}
            {store.activeTab === "preview" && <PreviewView key="preview" pageVariants={pageVariants} />}
            {store.activeTab === "settings" && <SettingsView key="settings" pageVariants={pageVariants} />}
            {store.activeTab === "tasks" && <TaskBoard key="tasks" pageVariants={pageVariants} />}
            {store.activeTab === "plugins" && <MarketplaceView key="plugins" pageVariants={pageVariants} />}
            {store.activeTab === "devops" && <DevOpsView key="devops" pageVariants={pageVariants} />}
          </AnimatePresence>
        </main>

        <GlobalNav 
          isZenMode={store.isZenMode} 
          activeTab={store.activeTab} 
          setActiveTab={store.setActiveTab} 
          setIsAiPanelOpen={store.setIsAiPanelOpen} 
        />
      </motion.div>

      <AiPanel />
      <CommandPalette />
    </div>
  );
}
