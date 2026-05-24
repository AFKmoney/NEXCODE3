"use client";

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Code2, MousePointer2, Sparkles, X, Edit3, Loader2, BrainCircuit, Play, Database 
} from "lucide-react";
import Editor from "@monaco-editor/react";
import { nexus } from "@/lib/engine";

// Client-side only imports for Prism components
if (typeof window !== "undefined") {
  require("prismjs/components/prism-javascript");
  require("prismjs/components/prism-typescript");
  require("prismjs/components/prism-rust");
  require("prismjs/components/prism-python");
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
  const activeCode = activeFile ? files[activeFile] || "" : "";
  const codeLinesArray = activeCode.split('\n');
  const hasUnsavedChanges = activeFile && originalFiles[activeFile] !== undefined && originalFiles[activeFile] !== files[activeFile];

  const getSyntaxHighlighting = (text: string) => {
    if (text.trim().startsWith('//')) return 'text-[#a0aabf] italic';
    if (text.match(/\b(fn|pub|struct|impl|enum)\b/)) return 'text-[#c678dd] font-semibold';
    if (text.match(/\b(let|mut|const|use|mod|import|export|from)\b/)) return 'text-[#61afef]';
    if (text.match(/\b(for|if|in|else|match|return)\b/)) return 'text-[#c678dd]';
    if (text.includes('!') || text.includes('println') || text.includes('console')) return 'text-[#d19a66]';
    if (text.match(/\b(String|Vec|Self|number|string|boolean)\b/)) return 'text-[#e5c07b]';
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
          <div className={`h-full ${isSplitView ? 'w-1/2 border-r border-[#1e1e1e]' : 'w-full'}`}>
             <Editor
               height="100%"
               language={lang}
               theme={settings.themeDark ? "vs-dark" : "light"}
               value={activeCode}
               onChange={(val) => {
                 setFiles(p => ({...p, [activeFile as string]: val || ""}));
                 if (settings.autoSave) {
                   setOriginalFiles(p => ({...p, [activeFile as string]: val || ""}));
                 }
               }}
               options={{
                 minimap: { enabled: true },
                 fontSize: 14,
                 fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                 scrollBeyondLastLine: false,
                 smoothScrolling: true,
                 cursorBlinking: "smooth",
                 cursorSmoothCaretAnimation: "on",
                 formatOnPaste: settings.formatOnSave,
                 formatOnType: settings.formatOnSave,
                 padding: { top: 16 }
               }}
             />
          </div>
          {isSplitView && (
            <div className="w-1/2 h-full opacity-80 pointer-events-none bg-[#1e1e1e] flex flex-col items-center justify-center">
               <span className="text-gray-500 font-mono text-sm px-10 text-center">Split View Active<br/>(Select another file from Command Palette)</span>
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
                  <div key={`r-${i}-${j}`} className="flex px-1 bg-emerald-500/20 text-emerald-300 border-l-[2px] border-emerald-500 w-max min-w-full">
                    <div className="w-8 shrink-0 text-right pr-2 text-emerald-500/50 select-none text-[10px] py-[2px] tabular-nums">{lineNew++}</div>
                    <div className="whitespace-pre py-[1px]">{l || " "}</div>
                  </div>
               );
               leftLines.push(
                  <div key={`l-${i}-${j}`} className="flex px-1 bg-transparent opacity-0 pointer-events-none select-none w-max min-w-full">
                    <div className="w-8 shrink-0 text-right pr-2 text-[10px] py-[2px]"> </div>
                    <div className="whitespace-pre py-[1px]"> </div>
                  </div>
               );
            });
         } else if (part.kind === "delete") {
            lines.forEach((l, j) => {
               leftLines.push(
                  <div key={`l-${i}-${j}`} className="flex px-1 bg-red-500/20 text-red-300 border-l-[2px] border-red-500 w-max min-w-full">
                    <div className="w-8 shrink-0 text-right pr-2 text-red-500/50 select-none text-[10px] py-[2px] tabular-nums">{lineOld++}</div>
                    <div className="whitespace-pre py-[1px]">{l || " "}</div>
                  </div>
               );
               rightLines.push(
                  <div key={`r-${i}-${j}`} className="flex px-1 bg-transparent opacity-0 pointer-events-none select-none w-max min-w-full">
                    <div className="w-8 shrink-0 text-right pr-2 text-[10px] py-[2px]"> </div>
                    <div className="whitespace-pre py-[1px]"> </div>
                  </div>
               );
            });
         } else {
            lines.forEach((l, j) => {
               leftLines.push(
                  <div key={`l-${i}-${j}`} className="flex px-1 text-gray-400 border-l-[2px] border-transparent hover:bg-white/5 w-max min-w-full">
                    <div className="w-8 shrink-0 text-right pr-2 text-gray-600 select-none text-[10px] py-[2px] tabular-nums">{lineOld++}</div>
                    <div className="whitespace-pre py-[1px]">{l || " "}</div>
                  </div>
               );
               rightLines.push(
                  <div key={`r-${i}-${j}`} className="flex px-1 text-gray-400 border-l-[2px] border-transparent hover:bg-white/5 w-max min-w-full">
                    <div className="w-8 shrink-0 text-right pr-2 text-gray-600 select-none text-[10px] py-[2px] tabular-nums">{lineNew++}</div>
                    <div className="whitespace-pre py-[1px]">{l || " "}</div>
                  </div>
               );
            });
         }
      });

      return (
        <div className="flex w-full font-mono text-[11px] leading-[1.6] bg-[#020202]">
           <div className="w-1/2 flex flex-col border-r border-white/5 overflow-x-auto relative">
              <div className="bg-[#050505] px-3 py-1.5 border-b border-white/5 text-[10px] font-bold text-gray-500 uppercase tracking-widest sticky top-0 left-0 z-10 w-full backdrop-blur-md">Original</div>
              <div className="flex flex-col py-2 min-w-max">
                 {leftLines}
              </div>
           </div>
           <div className="w-1/2 flex flex-col overflow-x-auto relative">
              <div className="bg-[#050505] px-3 py-1.5 border-b border-white/5 text-[10px] font-bold text-emerald-500/80 uppercase tracking-widest sticky top-0 left-0 z-10 w-full backdrop-blur-md">Modified (Unsaved)</div>
              <div className="flex flex-col py-2 min-w-max">
                 {rightLines}
              </div>
           </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col font-mono text-[13px] leading-[1.7]">
        {codeLinesArray.map((lineText, index) => {
          const isSelected = selectedLines.includes(index);
          return (
            <div key={index} onClick={() => !isEditMode && setSelectedLines(p => p.includes(index) ? p.filter(n=>n!==index) : [...p, index])}
              className={`flex px-2 py-[1px] cursor-pointer transition-colors ${isSelected ? "bg-indigo-500/20 border-l-[3px] border-indigo-500" : "hover:bg-white/5 border-l-[3px] border-transparent"}`}
            >
              <div className="w-10 pr-3 text-right text-gray-600 select-none opacity-60 shrink-0 tabular-nums text-[12px] pt-[1px]">{index + 1}</div>
              <div className={`whitespace-pre tracking-wide flex-1 break-words ${getSyntaxHighlighting(lineText)}`}>{lineText || " "}</div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <motion.div key="editor" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="absolute inset-0 overflow-y-auto scrollbar-hide flex flex-col relative w-full h-full">
      {!activeFile ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6 gap-6">
          <div className="w-24 h-24 bg-gradient-to-br from-indigo-500/20 to-purple-500/5 rounded-[2rem] flex items-center justify-center border border-indigo-500/20 shadow-[0_0_40px_rgba(99,102,241,0.15)] relative rotate-3 group-hover:rotate-0 transition-transform">
             <div className="absolute inset-0 bg-white/5 rounded-[2rem] blur-md" />
             <Code2 className="w-10 h-10 text-indigo-400 relative z-10" />
          </div>
          <div className="space-y-1 mt-2">
            <h3 className="text-[17px] font-bold text-white tracking-tight">Workspace Empty</h3>
            <p className="text-[13px] text-gray-400 font-medium tracking-wide">Select a file to begin coding.</p>
          </div>
          <button onClick={() => setActiveTab("files")} className="text-[13px] text-white bg-white/10 hover:bg-white/15 transition-all px-8 py-3 rounded-full font-bold border border-white/10 backdrop-blur-md active:scale-95 shadow-sm mt-4">Browse Explorer</button>
        </div>
      ) : (
        <div className="pt-4 pb-28">
          {renderCodeView()}

          {!isEditMode && !hasUnsavedChanges && selectedLines.length === 0 && (
             <div className="px-8 mt-12 mb-8 pointer-events-none opacity-40">
               <div className="border border-dashed border-white/10 rounded-3xl p-6 flex flex-col items-center justify-center text-center gap-3">
                  <MousePointer2 className="w-6 h-6 text-gray-500" />
                  <p className="text-[11px] text-gray-400 uppercase font-bold tracking-widest">Select Lines to Analyze</p>
               </div>
             </div>
          )}
        </div>
      )}

      <AnimatePresence>
        {refactorPreview && (
          <motion.div initial={{ y: 30, opacity: 0, scale: 0.95 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 30, opacity: 0, scale: 0.95 }} className="absolute inset-x-4 top-[15%] bg-[#050505]/90 backdrop-blur-3xl border border-purple-500/40 rounded-[32px] p-5 shadow-[0_30px_80px_rgba(0,0,0,0.8)] flex flex-col gap-5 z-[80]">
            <div className="flex justify-between items-center">
               <h3 className="text-[15px] font-bold text-purple-300 flex items-center gap-2">
                 <Sparkles className="w-5 h-5" /> Refactor Suggestion
               </h3>
               <button onClick={() => setRefactorPreview(null)} className="text-gray-400 hover:text-white bg-white/5 rounded-full p-1.5 transition-colors"><X className="w-4 h-4" /></button>
            </div>
            <p className="text-[12px] text-gray-300 leading-relaxed font-medium">{refactorPreview.explanation}</p>
            <div className="flex flex-col rounded-2xl overflow-hidden border border-white/10 ring-1 ring-black/50">
               <div className="bg-red-500/10 px-4 py-2 text-[10px] uppercase font-bold text-red-400 flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-red-400" /> Original
               </div>
               <pre className="p-4 text-[12px] font-mono whitespace-pre-wrap text-gray-400 bg-black/50 overflow-x-auto">{refactorPreview.original}</pre>
               <div className="bg-emerald-500/10 px-4 py-2 text-[10px] uppercase font-bold text-emerald-400 border-t border-white/5 flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Suggested
               </div>
               <pre className="p-4 text-[12px] font-mono whitespace-pre-wrap text-[#e5c07b] bg-black/50 overflow-x-auto">{refactorPreview.suggested}</pre>
            </div>
            <div className="flex gap-3">
               <button onClick={() => setRefactorPreview(null)} className="flex-1 py-3.5 rounded-2xl text-[13px] font-bold text-gray-300 bg-white/5 hover:bg-white/10 transition-colors">Discard</button>
               <button onClick={() => {
                   const newLines = [...codeLinesArray];
                   newLines.splice(refactorPreview.startLine, refactorPreview.endLine - refactorPreview.startLine + 1, refactorPreview.suggested);
                   setFiles(p => ({...p, [activeFile as string]: newLines.join('\n')}));
                   setRefactorPreview(null);
                   setSelectedLines([]);
               }} className="flex-1 py-3.5 rounded-2xl text-[13px] font-bold text-white bg-purple-600 hover:bg-purple-500 shadow-[0_0_20px_rgba(147,51,234,0.4)] transition-all">Accept Change</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedLines.length > 0 && !isEditMode && activeFile && (
          <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }} className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-[#050505]/95 border border-white/10 shadow-2xl shadow-indigo-500/10 rounded-[28px] px-2 py-2 flex items-center gap-1 z-40 backdrop-blur-xl">
            <button onClick={() => { setIsAiPanelOpen(true); setChatInput(`Explain the syntax of these lines.`); setTimeout(() => chatInputRef.current?.focus(), 200); }} className="px-4 py-2 hover:bg-white/5 rounded-2xl flex flex-col items-center gap-1 transition-colors">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <span className="text-[9px] font-bold uppercase text-gray-400 tracking-wider">Explain</span>
            </button>
            <div className="w-px h-8 bg-white/10" />
            <button onClick={() => { setIsAiPanelOpen(true); setChatInput(`Optimize these lines using Causal Graph.`); setTimeout(() => chatInputRef.current?.focus(), 200); }} className="px-4 py-2 hover:bg-white/5 rounded-2xl flex flex-col items-center gap-1 transition-colors">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <span className="text-[9px] font-bold uppercase text-gray-400 tracking-wider">Rewrite</span>
            </button>
            <div className="w-px h-8 bg-white/10" />
            <button onClick={() => setSelectedLines([])} className="px-4 py-2.5 font-bold text-gray-500 hover:text-white rounded-2xl transition-colors">
              <X className="w-6 h-6" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
