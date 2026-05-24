"use client";

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Code2, MousePointer2, Sparkles, X, Edit3, Loader2, Play, Database 
} from "lucide-react";
import Editor from "@monaco-editor/react";
import { useNexusStore } from "@/lib/store";
import { nexus } from "@/lib/engine";

export const EditorView = ({ pageVariants }: { pageVariants: any }) => {
  const store = useNexusStore();
  const activeCode = store.activeFile ? store.files[store.activeFile] || "" : "";
  const hasUnsavedChanges = store.activeFile && store.originalFiles[store.activeFile] !== undefined && store.originalFiles[store.activeFile] !== store.files[store.activeFile];

  const renderCodeView = () => {
    if (store.isEditMode) {
      const languageMap: Record<string, string> = {
        'ts': 'typescript', 'tsx': 'typescript', 'js': 'javascript', 'jsx': 'javascript',
        'json': 'json', 'html': 'html', 'css': 'css', 'py': 'python', 'rs': 'rust'
      };
      const ext = store.activeFile ? store.activeFile.split('.').pop() || '' : '';
      const lang = languageMap[ext] || 'javascript';
      
      return (
        <div className="w-full h-full">
           <Editor
             height="100%"
             language={lang}
             theme="vs-dark"
             value={activeCode}
             onChange={(val) => store.updateFile(store.activeFile!, val || "")}
             options={{
               minimap: { enabled: false },
               fontSize: 14,
               fontFamily: 'monospace',
               scrollBeyondLastLine: false,
               smoothScrolling: true,
               cursorBlinking: "smooth",
               padding: { top: 16 }
             }}
           />
        </div>
      );
    }

    if (hasUnsavedChanges) {
      const parts = nexus.computeDiff(store.originalFiles[store.activeFile!] || "", store.files[store.activeFile!] || "");
      return (
        <div className="flex w-full font-mono text-[11px] leading-[1.6] bg-black overflow-x-auto">
           <div className="flex flex-col py-4 min-w-full">
              {parts.map((part, i) => (
                <div key={i} className={`px-4 ${part.kind === 'insert' ? 'bg-emerald-500/10 text-emerald-400' : part.kind === 'delete' ? 'bg-red-500/10 text-red-400' : 'text-gray-500'}`}>
                  <pre className="whitespace-pre-wrap">{part.content}</pre>
                </div>
              ))}
           </div>
        </div>
      );
    }

    return (
      <div className="p-4 font-mono text-[13px] text-gray-400 whitespace-pre-wrap">
        {activeCode || "No content."}
      </div>
    );
  };

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="absolute inset-0 overflow-y-auto flex flex-col w-full h-full">
      {!store.activeFile ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6 gap-6">
          <Code2 className="w-12 h-12 text-indigo-500/50" />
          <h3 className="text-white font-bold">No File Selected</h3>
          <button onClick={() => store.setActiveTab("files")} className="px-6 py-2 bg-white/5 rounded-full text-sm font-bold border border-white/10">Open Explorer</button>
        </div>
      ) : (
        <div className="flex-1">
          {renderCodeView()}
        </div>
      )}
    </motion.div>
  );
};
