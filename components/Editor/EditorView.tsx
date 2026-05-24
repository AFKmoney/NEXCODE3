"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Code2, MousePointer2, Sparkles, X, Edit3, Loader2, BrainCircuit, Play, Database, Copy, Check 
} from "lucide-react";
import Editor from "@monaco-editor/react";
import { nexus } from "@/lib/engine";

// Client-side only imports for Prism components
if (typeof window !== "undefined") {
  try {
    require("prismjs/components/prism-javascript");
    require("prismjs/components/prism-typescript");
    require("prismjs/components/prism-rust");
    require("prismjs/components/prism-python");
  } catch (e) {
    console.warn("Prism components load failed", e);
  }
}

type EditorViewProps = {
  activeFile: string | null;
  files: Record<string, string>;
  setFiles: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  originalFiles: Record<string, string>;
  setOriginalFiles: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  isEditMode: boolean;
  setIsEditMode: (val: boolean) => void;
  isSplitView: boolean;
  setIsSplitView: (val: boolean) => void;
  selectedLines: number[];
  setSelectedLines: React.Dispatch<React.SetStateAction<number[]>>;
  isAnalyzing: boolean;
  isRunning: boolean;
  refactorPreview: any;
  setRefactorPreview: (val: any) => void;
  settings: any;
  handleSaveVFS: () => void;
  handleRunCode: () => void;
  handleRefactorAnalysis: () => void;
  setActiveTab: (tab: string) => void;
  setIsAiPanelOpen: (val: boolean) => void;
  setChatInput: (val: string) => void;
  chatInputRef: React.RefObject<HTMLTextAreaElement | null>;
  pageVariants: any;
};

export const EditorView = ({
  activeFile,
  files,
  setFiles,
  originalFiles,
  setOriginalFiles,
  isEditMode,
  setIsEditMode,
  isSplitView,
  setIsSplitView,
  selectedLines,
  setSelectedLines,
  isAnalyzing,
  isRunning,
  refactorPreview,
  setRefactorPreview,
  settings,
  handleSaveVFS,
  handleRunCode,
  handleRefactorAnalysis,
  setActiveTab,
  setIsAiPanelOpen,
  setChatInput,
  chatInputRef,
  pageVariants
}: EditorViewProps) => {
  const [copied, setCopied] = useState(false);
  const activeCode = activeFile ? files[activeFile] || "" : "";
  const codeLinesArray = activeCode.split('\n');
  const hasUnsavedChanges = activeFile && originalFiles[activeFile] !== undefined && originalFiles[activeFile] !== files[activeFile];

  const handleCopy = () => {
    navigator.clipboard.writeText(activeCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getSyntaxHighlighting = (text: string) => {
    if (text.trim().startsWith('//') || text.trim().startsWith('#')) return 'text-[#7c7c7c] italic';
    if (text.match(/\b(fn|pub|struct|impl|enum|class|def|async|await)\b/)) return 'text-[#c678dd] font-semibold';
    if (text.match(/\b(let|mut|const|use|mod|import|export|from|var|val)\b/)) return 'text-[#61afef]';
    if (text.match(/\b(for|if|in|else|match|return|while|try|catch)\b/)) return 'text-[#d55fde]';
    if (text.includes('!') || text.includes('println') || text.includes('console.log')) return 'text-[#d19a66]';
    if (text.match(/\b(String|Vec|Self|number|string|boolean|int|float|any)\b/)) return 'text-[#e5c07b]';
    if (text.match(/".*?"|'.*?'/)) return 'text-[#98c379]';
    return 'text-[#abb2bf]';
  };

  const renderCodeView = () => {
    if (isEditMode) {
      const languageMap: Record<string, string> = {
        'ts': 'typescript', 'tsx': 'typescript', 'js': 'javascript', 'jsx': 'javascript',
        'json': 'json', 'html': 'html', 'css': 'css', 'py': 'python', 'rs': 'rust'
      };
      const ext = activeFile ? activeFile.split('.').pop() || '' : '';
      const lang = languageMap[ext] || 'javascript';
      
      return (
        <div className={`flex w-full h-full ${isSplitView ? 'flex-row' : 'flex-col'}`}>
          <div className={`h-full ${isSplitView ? 'w-1/2 border-r border-white/5' : 'w-full'}`}>
             <Editor
               height="100%"
               language={lang}
               theme="vs-dark"
               value={activeCode}
               onChange={(val) => {
                 setFiles(p => ({...p, [activeFile as string]: val || ""}));
                 if (settings.autoSave) {
                   setOriginalFiles(p => ({...p, [activeFile as string]: val || ""}));
                 }
               }}
               options={{
                 minimap: { enabled: false },
                 fontSize: 14,
                 fontFamily: 'JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                 scrollBeyondLastLine: false,
                 smoothScrolling: true,
                 cursorBlinking: "smooth",
                 cursorSmoothCaretAnimation: "on",
                 lineNumbers: "on",
                 renderLineHighlight: "all",
                 padding: { top: 20 }
               }}
             />
          </div>
          {isSplitView && (
            <div className="w-1/2 h-full bg-[#0a0a0c] flex flex-col items-center justify-center border-l border-white/5">
               <div className="p-8 text-center space-y-4 opacity-40">
                  <div className="w-12 h-12 rounded-full border-2 border-dashed border-gray-600 flex items-center justify-center mx-auto">
                    <Code2 className="w-6 h-6" />
                  </div>
                  <p className="text-gray-500 font-mono text-sm max-w-[200px]">Split View Active. Open another file from the Command Palette.</p>
               </div>
            </div>
          )}
        </div>
      );
    }

    if (hasUnsavedChanges) {
      const parts = nexus.computeDiff(originalFiles[activeFile!] || "", files[activeFile!] || "");
      let leftLines: React.ReactNode[] = [];
      let rightLines: React.ReactNode[] = [];
      let lineOld = 1;
      let lineNew = 1;

      parts.forEach((part, i) => {
         const lines = part.content.replace(/\n$/, "").split('\n');
         if (part.kind === "insert") {
            lines.forEach((l, j) => {
               rightLines.push(
                  <div key={`r-${i}-${j}`} className="flex px-1 bg-emerald-500/10 text-emerald-400 border-l-[2px] border-emerald-500 w-max min-w-full">
                    <div className="w-10 shrink-0 text-right pr-3 text-emerald-500/40 select-none text-[10px] py-[2px] tabular-nums font-mono border-r border-white/5 mr-3">{lineNew++}</div>
                    <div className="whitespace-pre py-[2px] font-mono">{l || " "}</div>
                  </div>
               );
               leftLines.push(
                  <div key={`l-${i}-${j}`} className="flex px-1 bg-transparent opacity-0 pointer-events-none select-none w-max min-w-full">
                    <div className="w-10 shrink-0 text-right pr-3 text-[10px] py-[2px]"> </div>
                    <div className="whitespace-pre py-[2px]"> </div>
                  </div>
               );
            });
         } else if (part.kind === "delete") {
            lines.forEach((l, j) => {
               leftLines.push(
                  <div key={`l-${i}-${j}`} className="flex px-1 bg-red-500/10 text-red-400 border-l-[2px] border-red-500 w-max min-w-full">
                    <div className="w-10 shrink-0 text-right pr-3 text-red-500/40 select-none text-[10px] py-[2px] tabular-nums font-mono border-r border-white/5 mr-3">{lineOld++}</div>
                    <div className="whitespace-pre py-[2px] font-mono">{l || " "}</div>
                  </div>
               );
               rightLines.push(
                  <div key={`r-${i}-${j}`} className="flex px-1 bg-transparent opacity-0 pointer-events-none select-none w-max min-w-full">
                    <div className="w-10 shrink-0 text-right pr-3 text-[10px] py-[2px]"> </div>
                    <div className="whitespace-pre py-[2px]"> </div>
                  </div>
               );
            });
         } else {
            lines.forEach((l, j) => {
               leftLines.push(
                  <div key={`l-${i}-${j}`} className="flex px-1 text-gray-500 hover:bg-white/[0.02] w-max min-w-full">
                    <div className="w-10 shrink-0 text-right pr-3 text-gray-700 select-none text-[10px] py-[2px] tabular-nums font-mono border-r border-white/5 mr-3">{lineOld++}</div>
                    <div className="whitespace-pre py-[2px] font-mono">{l || " "}</div>
                  </div>
               );
               rightLines.push(
                  <div key={`r-${i}-${j}`} className="flex px-1 text-gray-500 hover:bg-white/[0.02] w-max min-w-full">
                    <div className="w-10 shrink-0 text-right pr-3 text-gray-700 select-none text-[10px] py-[2px] tabular-nums font-mono border-r border-white/5 mr-3">{lineNew++}</div>
                    <div className="whitespace-pre py-[2px] font-mono">{l || " "}</div>
                  </div>
               );
            });
         }
      });

      return (
        <div className="flex w-full h-full bg-[#050505] divide-x divide-white/5">
           <div className="flex-1 flex flex-col overflow-x-auto relative scrollbar-hide">
              <div className="bg-[#0a0a0c] px-4 py-2 border-b border-white/5 text-[10px] font-bold text-gray-500 uppercase tracking-widest sticky top-0 left-0 z-10 w-full flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500/50" /> Previous Version
              </div>
              <div className="flex flex-col py-4 min-w-max">
                 {leftLines}
              </div>
           </div>
           <div className="flex-1 flex flex-col overflow-x-auto relative scrollbar-hide">
              <div className="bg-[#0a0a0c] px-4 py-2 border-b border-white/5 text-[10px] font-bold text-emerald-500/70 uppercase tracking-widest sticky top-0 left-0 z-10 w-full flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50 animate-pulse" /> New Changes
              </div>
              <div className="flex flex-col py-4 min-w-max">
                 {rightLines}
              </div>
           </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col font-mono text-[14px] leading-[1.8] py-6 px-2 bg-[#050505] min-h-full">
        {codeLinesArray.map((lineText, index) => {
          const isSelected = selectedLines.includes(index);
          return (
            <div key={index} onClick={() => !isEditMode && setSelectedLines(p => p.includes(index) ? p.filter(n=>n!==index) : [...p, index])}
              className={`flex px-2 py-[1px] cursor-pointer transition-all duration-200 group ${isSelected ? "bg-indigo-500/15 border-l-[3px] border-indigo-500" : "hover:bg-white/[0.03] border-l-[3px] border-transparent"}`}
            >
              <div className="w-12 pr-4 text-right text-gray-700 select-none opacity-40 shrink-0 tabular-nums text-[12px] group-hover:opacity-80 transition-opacity border-r border-white/5 mr-4">{index + 1}</div>
              <div className={`whitespace-pre tracking-wide flex-1 font-mono ${getSyntaxHighlighting(lineText)}`}>{lineText || " "}</div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <motion.div key="editor" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="absolute inset-0 overflow-y-auto scrollbar-hide flex flex-col relative w-full h-full bg-[#050505]">
      {!activeFile ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6 gap-8 nexus-gradient-bg">
          <div className="relative group">
            <div className="absolute inset-0 bg-indigo-500/20 rounded-[2.5rem] blur-2xl group-hover:bg-indigo-500/30 transition-all duration-500 scale-110" />
            <div className="w-28 h-28 glass-morphism rounded-[2.5rem] flex items-center justify-center relative z-10 transform rotate-3 group-hover:rotate-0 transition-transform duration-500">
               <Code2 className="w-12 h-12 text-indigo-400 drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
            </div>
          </div>
          <div className="space-y-3 max-w-sm">
            <h3 className="text-2xl font-display font-bold text-white tracking-tight">System Ready</h3>
            <p className="text-sm text-gray-400 font-medium leading-relaxed">Select a module from the filesystem to begin neural orchestration.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setActiveTab("files")} className="text-sm text-white bg-indigo-600 hover:bg-indigo-500 px-8 py-3.5 rounded-full font-bold transition-all shadow-[0_0_25px_rgba(99,102,241,0.3)] active:scale-95">Open Filesystem</button>
            <button onClick={() => setIsAiPanelOpen(true)} className="text-sm text-gray-300 glass-morphism hover:bg-white/5 px-8 py-3.5 rounded-full font-bold transition-all active:scale-95">Ask Nexus</button>
          </div>
        </div>
      ) : (
        <div className="flex-1 relative overflow-hidden flex flex-col">
          <div className="absolute top-4 right-4 z-50 flex gap-2">
             <button onClick={handleCopy} className="p-2 rounded-lg glass-morphism hover:bg-white/10 transition-colors text-gray-400 hover:text-white" title="Copy All">
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
             </button>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-hide pb-32">
            {renderCodeView()}
          </div>

          {!isEditMode && !hasUnsavedChanges && selectedLines.length === 0 && (
             <div className="absolute bottom-24 left-1/2 -translate-x-1/2 pointer-events-none w-full max-w-md px-8 opacity-60">
               <div className="glass-morphism rounded-2xl p-4 flex items-center justify-center text-center gap-3">
                  <MousePointer2 className="w-4 h-4 text-indigo-400 animate-pulse" />
                  <p className="text-[11px] text-gray-500 uppercase font-bold tracking-[0.2em]">Select code lines to orchestrate</p>
               </div>
             </div>
          )}
        </div>
      )}

      <AnimatePresence>
        {refactorPreview && (
          <motion.div initial={{ y: 50, opacity: 0, scale: 0.95 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 50, opacity: 0, scale: 0.95 }} className="absolute inset-x-6 top-16 bottom-24 glass-morphism rounded-[2rem] p-6 z-[80] flex flex-col gap-6 shadow-[0_40px_100px_rgba(0,0,0,0.9)] overflow-hidden">
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-display font-bold text-white tracking-tight">Neural Refactoring</h3>
                    <p className="text-xs text-gray-500 font-mono">Impact Score: High</p>
                  </div>
               </div>
               <button onClick={() => setRefactorPreview(null)} className="text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full p-2 transition-colors"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto scrollbar-hide space-y-6">
              <div className="glass-morphism rounded-2xl p-5 border-l-4 border-indigo-500 bg-indigo-500/5">
                <p className="text-[13px] text-gray-200 leading-relaxed font-medium italic">"{refactorPreview.explanation}"</p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-2">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-red-500" /> Current</span>
                  </div>
                  <pre className="p-5 text-[12px] font-mono whitespace-pre-wrap text-gray-400 bg-black/40 rounded-2xl border border-white/5 overflow-x-auto ring-1 ring-black shadow-inner">{refactorPreview.original}</pre>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-2">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-500 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Proposed</span>
                  </div>
                  <pre className="p-5 text-[12px] font-mono whitespace-pre-wrap text-emerald-400/90 bg-black/40 rounded-2xl border border-emerald-500/20 overflow-x-auto ring-1 ring-emerald-500/10 shadow-inner">{refactorPreview.suggested}</pre>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4 border-t border-white/5">
               <button onClick={() => setRefactorPreview(null)} className="flex-1 py-4 rounded-xl text-sm font-bold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 transition-all active:scale-[0.98]">Discard Intelligence</button>
               <button onClick={() => {
                   const newLines = [...codeLinesArray];
                   newLines.splice(refactorPreview.startLine, refactorPreview.endLine - refactorPreview.startLine + 1, refactorPreview.suggested);
                   setFiles(p => ({...p, [activeFile as string]: newLines.join('\n')}));
                   setRefactorPreview(null);
                   setSelectedLines([]);
                   handleSaveVFS();
               }} className="flex-[2] py-4 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.4)] transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                  <BrainCircuit className="w-4 h-4" /> Merge Orchestration
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedLines.length > 0 && !isEditMode && activeFile && (
          <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }} className="absolute bottom-12 left-1/2 -translate-x-1/2 glass-morphism rounded-[2.5rem] px-3 py-3 flex items-center gap-2 z-[90] shadow-[0_30px_60px_rgba(0,0,0,0.8)] border-indigo-500/30">
            <button onClick={() => { setIsAiPanelOpen(true); setChatInput(`Analyze and explain the purpose of these lines in the project context:\n\n\`\`\`\n${selectedLines.map(idx => codeLinesArray[idx]).join('\n')}\n\`\`\``); setTimeout(() => chatInputRef.current?.focus(), 200); }} className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-full flex flex-col items-center gap-1 transition-all group">
              <Sparkles className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
              <span className="text-[9px] font-bold uppercase text-gray-500 group-hover:text-gray-200 tracking-wider">Explain</span>
            </button>
            <div className="w-px h-10 bg-white/10" />
            <button onClick={handleRefactorAnalysis} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-full flex flex-col items-center gap-1 transition-all group shadow-lg shadow-indigo-600/20">
              {isAnalyzing ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <BrainCircuit className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />}
              <span className="text-[9px] font-bold uppercase text-white tracking-wider">Refactor</span>
            </button>
            <div className="w-px h-10 bg-white/10" />
            <button onClick={() => setSelectedLines([])} className="p-4 text-gray-500 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
