"use client";

import React from "react";
import { motion } from "motion/react";
import { FolderTree, FolderPlus, Github, Folder, FileCode2, Trash2, FilePlus, Lock } from "lucide-react";

type FileExplorerViewProps = {
  githubConnected: boolean;
  setGithubConnected: (val: boolean) => void;
  currentRepo: string | null;
  setCurrentRepo: (val: string) => void;
  files: Record<string, string>;
  setFiles: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setOriginalFiles: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  activeFile: string | null;
  setActiveFile: (val: string | null) => void;
  setActiveTab: (val: string) => void;
  loadFileContent: (path: string) => void;
  pageVariants: any;
};

export const FileExplorerView = ({
  githubConnected,
  setGithubConnected,
  currentRepo,
  setCurrentRepo,
  files,
  setFiles,
  setOriginalFiles,
  activeFile,
  setActiveFile,
  setActiveTab,
  loadFileContent,
  pageVariants
}: FileExplorerViewProps) => {
  return (
    <motion.div key="files" variants={pageVariants} initial="initial" animate="animate" exit="exit" 
      onDragOver={e => e.preventDefault()}
      onDrop={async e => {
        e.preventDefault();
        if (e.dataTransfer.files.length > 0) {
          setGithubConnected(true);
          setCurrentRepo(currentRepo || "Local Project");
          const newFiles = { ...files };
          for (const file of Array.from(e.dataTransfer.files)) {
            const text = await file.text();
            newFiles[file.name] = text;
          }
          setFiles(newFiles);
        }
      }}
      className="absolute inset-0 overflow-y-auto bg-transparent p-5 sm:p-6 flex flex-col w-full h-full pb-28">
      {!githubConnected ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 pb-10 mt-6 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none -z-10" />

          <div className="w-[104px] h-[104px] bg-gradient-to-br from-[#1a1a1a] to-black border border-white/10 rounded-[35px] flex items-center justify-center shadow-[0_20px_40px_rgba(0,0,0,0.5)] relative overflow-hidden ring-1 ring-white/5">
            <div className="absolute inset-0 bg-indigo-500/20 blur-2xl"></div>
            <FolderTree className="w-12 h-12 text-white relative z-10" />
          </div>
          <div className="space-y-3 max-w-[280px]">
            <h2 className="text-[26px] font-display font-bold tracking-tight text-white mb-2">Your Workspace</h2>
            <p className="text-[14px] text-gray-400 leading-relaxed font-medium">
              Mount a virtual file system to compile and preview multi-language projects locally.
            </p>
          </div>
          
          <div className="w-[90%] space-y-4 pt-6">
            <div className="flex w-full gap-3 flex-col">
              <button onClick={() => { setGithubConnected(true); setCurrentRepo("Local Project"); setFiles({}); setOriginalFiles({}); }} className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-bold text-[15px] tracking-wide transition-all shadow-[0_10px_30px_rgba(79,70,229,0.3)] flex items-center justify-center gap-2">
                <FolderPlus className="w-5 h-5" /> New Project
              </button>
              <button onClick={() => { setGithubConnected(true); setCurrentRepo("Imported GitHub"); setFiles({}); setOriginalFiles({}); }} className="w-full py-4 bg-[#0a0a0a] hover:bg-[#151515] text-white rounded-full font-bold text-[15px] tracking-wide border border-white/10 transition-all shadow-md flex items-center justify-center gap-2">
                <Github className="w-5 h-5" /> Import from GitHub
              </button>
            </div>
          </div>
          <div className="text-[10px] text-gray-500 font-bold tracking-widest flex items-center gap-2 uppercase mt-8 bg-white/5 px-5 py-2.5 rounded-full border border-white/5 shadow-inner backdrop-blur-md">
             <Lock className="w-3.5 h-3.5" /> End-to-End Encrypted
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1 mb-4 border-b border-white/5 pb-4">
            <div className="text-[13px] font-bold text-gray-200 flex items-center gap-2.5">
              <FolderTree className="w-4 h-4 text-indigo-400" /> {currentRepo || "Local System"}
            </div>
            <div className="flex items-center gap-1.5">
              <button onClick={() => { setGithubConnected(false); setFiles({}); setOriginalFiles({}); setCurrentRepo(""); setActiveFile(""); }} className="text-gray-300 hover:text-white p-2 rounded-full transition-colors bg-white/5 hover:bg-white/10 border border-white/5" title="New Project">
                <Folder className="w-4 h-4" />
              </button>
              <button onClick={() => { 
                const name = prompt("New folder name:");
                if (name) { 
                  setFiles(p => ({...p, [name + "/.keep"]: ""})); 
                  setOriginalFiles(p => ({...p, [name + "/.keep"]: ""})); 
                }
              }} className="text-gray-300 hover:text-white p-2 rounded-full transition-colors bg-white/5 hover:bg-white/10 border border-white/5" title="New Folder">
                <FolderPlus className="w-4 h-4" />
              </button>
              <button onClick={() => {
                const name = prompt("New file name (e.g. main.rs, script.py, app.tsx):");
                if (name) { 
                  let content = "";
                  if (name.endsWith(".rs")) content = "fn main() {\n  println!(\"Hello from Rust\");\n}";
                  else if (name.endsWith(".py")) content = "print('Hello from Python')";
                  else if (name.endsWith(".js") || name.endsWith(".ts") || name.endsWith(".tsx")) content = "console.log('Hello from JS/TS');";
                  else if (name.endsWith(".go")) content = "package main\n\nimport \"fmt\"\n\nfunc main() {\n  fmt.Println(\"Hello from Go\")\n}";
                  else if (name.endsWith(".cpp")) content = "#include <iostream>\n\nint main() {\n  std::cout << \"Hello C++\\n\";\n  return 0;\n}";
                  else if (name.endsWith(".html")) content = "<!DOCTYPE html>\n<html>\n<body>\n  <h1>New View</h1>\n</body>\n</html>";
                  else content = "// New file";
                  setFiles(p => ({...p, [name]: content})); 
                  setOriginalFiles(p => ({...p, [name]: content})); 
                  setActiveFile(name); 
                  setActiveTab("editor"); 
                }
              }} className="text-gray-300 hover:text-white p-2 rounded-full transition-colors bg-white/5 hover:bg-white/10 border border-white/5" title="New File">
                <FilePlus className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="bg-[#050505] border border-white/5 rounded-3xl overflow-hidden shadow-xl flex flex-col ring-1 ring-white/5 mx-4 sm:mx-8">
             {Object.keys(files).map((f) => (
               <div key={f} className="flex items-center justify-between px-5 py-4 border-b border-white/5 hover:bg-white/5 transition-colors last:border-0 group cursor-pointer" onClick={() => loadFileContent(f)}>
                 <div className="flex items-center gap-4 flex-1">
                   <div className="p-2 bg-white/5 rounded-xl group-hover:scale-110 transition-transform">
                     <FileCode2 className={`w-4 h-4 ${f.includes('html') || f.includes('jsx') || f.includes('tsx') ? 'text-blue-400' : f.includes('ts') || f.includes('js') ? 'text-yellow-400' : f.includes('rs') ? 'text-orange-400' : f.includes('py') ? 'text-emerald-400' : 'text-gray-400'}`} />
                   </div>
                   <div className="flex flex-col">
                     <span className="text-[14px] text-gray-200 font-semibold truncate tracking-tight">{f.split('/').pop()}</span>
                     <span className="text-[10px] text-gray-500 font-medium">~/workspace/{f}</span>
                   </div>
                 </div>
                 <button 
                   onClick={(e) => {
                     e.stopPropagation();
                     if (confirm(`Delete ${f}?`)) {
                       setFiles(p => { const nv = {...p}; delete nv[f]; return nv; });
                       if (activeFile === f) setActiveFile(null);
                     }
                   }}
                   className="text-gray-500 hover:text-red-400 p-2 opacity-0 group-hover:opacity-100 transition-all rounded-full hover:bg-red-400/10"
                 >
                   <Trash2 className="w-4 h-4" />
                 </button>
               </div>
             ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};
