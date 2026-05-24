"use client";

import React, { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { 
  Menu, ChevronRight, Database, Play, Loader2, MousePointer2, 
  BrainCircuit, Edit3, Settings, Command, Search, Code2, 
  Smartphone, TerminalSquare, FolderTree, X, Sparkles, Send, 
  ChevronDown, GitBranch, GitMerge, GitPullRequest, History, 
  GitCommit, Activity, FolderPlus, Github, Folder, FileCode2, 
  Trash2, FilePlus, Lock, ListTodo, Kanban, Plus, CheckCircle2, 
  Circle, Calendar, Puzzle, DownloadCloud, Star, Upload, Heart, Info 
} from "lucide-react";
import * as diff from "diff";
import { useSession, signIn, signOut } from "next-auth/react";

import dynamic from "next/dynamic";
import { nexus } from "@/lib/engine";
import { causal } from "@/lib/causal";
import { vfs } from "@/lib/vfs";
import { collab } from "@/lib/collab";
import { rag } from "@/lib/rag";
import { telemetry } from "@/lib/telemetry";

// Import Refactored Components (Dynamic for client-side)
const EditorView = dynamic(() => import("@/components/Editor/EditorView").then(mod => mod.EditorView), { ssr: false });
const TerminalView = dynamic(() => import("@/components/Terminal/TerminalView").then(mod => mod.TerminalView), { ssr: false });
const FileExplorerView = dynamic(() => import("@/components/FileExplorer/FileExplorerView").then(mod => mod.FileExplorerView), { ssr: false });
const GitView = dynamic(() => import("@/components/Git/GitView").then(mod => mod.GitView), { ssr: false });
const GraphView = dynamic(() => import("@/components/Graph/GraphView").then(mod => mod.GraphView), { ssr: false });
const DashboardView = dynamic(() => import("@/components/Dashboard/DashboardView").then(mod => mod.DashboardView), { ssr: false });
const PreviewView = dynamic(() => import("@/components/Preview/PreviewView").then(mod => mod.PreviewView), { ssr: false });
const SettingsView = dynamic(() => import("@/components/Settings/SettingsView").then(mod => mod.SettingsView), { ssr: false });
const TaskBoard = dynamic(() => import("@/components/Tasks/TaskBoard").then(mod => mod.TaskBoard), { ssr: false });
const MarketplaceView = dynamic(() => import("@/components/Marketplace/MarketplaceView").then(mod => mod.MarketplaceView), { ssr: false });
const AiPanel = dynamic(() => import("@/components/Chat/AiPanel").then(mod => mod.AiPanel), { ssr: false });
const DevOpsView = dynamic(() => import("@/components/Dashboard/DevOpsView").then(mod => mod.DevOpsView), { ssr: false });

import { BottomTab } from "@/components/Navigation/BottomTab";
import { GlobalNav } from "@/components/Navigation/GlobalNav";
import { CommandPalette } from "@/components/Navigation/CommandPalette";
import { MainHeader } from "@/components/Layout/MainHeader";
import type { ProjectTask } from "@/components/Tasks/TaskBoard";
import type { Plugin } from "@/components/Marketplace/MarketplaceView";

// Types
type TabType = "editor" | "files" | "terminal" | "settings" | "git" | "preview" | "graph" | "dashboard" | "plugins" | "tasks" | "devops";

export default function NexusCodeApp() {
  const { data: session } = useSession();

  // --- States ---
  const [activeTab, setActiveTab] = useState<TabType>("editor");
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [files, setFiles] = useState<Record<string, string>>({});
  const [originalFiles, setOriginalFiles] = useState<Record<string, string>>({});
  const [githubConnected, setGithubConnected] = useState(false);
  const [currentRepo, setCurrentRepo] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSplitView, setIsSplitView] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [cmdSearchQuery, setCmdSearchQuery] = useState("");
  const [selectedLines, setSelectedLines] = useState<number[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [refactorPreview, setRefactorPreview] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);
  
  // Terminal
  const [terminals, setTerminals] = useState([{ id: "term_1", title: "bash", history: ["[SYSTEM] NexusCode Kernel v4.2.0 initialized.", "[SYSTEM] Virtual File System mounted."] }]);
  const [activeTerminalId, setActiveTerminalId] = useState("term_1");
  const [terminalInput, setTerminalInput] = useState("");
  
  // AI
  const [messages, setMessages] = useState<{role: 'user' | 'ai', content: string}[]>([{ role: 'ai', content: "Hello! I am Nexus AI. How can I help you today?" }]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [activeProvider, setActiveProvider] = useState('gemini');
  const [isProviderMenuOpen, setIsProviderMenuOpen] = useState(false);
  const [apiKeys, setApiKeys] = useState({ gemini: '', claude: '', openai: '', mistral: '' });
  const [models, setModels] = useState({ gemini: 'gemini-2.5-flash', claude: 'claude-3-5-sonnet-20241022', openai: 'gpt-4o', mistral: 'mistral-large-latest' });

  // Git / VCS
  const [commits] = useState([
    { sha: '8f2a1c', message: 'Initial commit', author: 'NexusUser' },
    { sha: '4d5e6f', message: 'Add core logic', author: 'NexusUser' }
  ]);
  const [pullRequests] = useState([
    { number: 12, title: 'Refactor Auth', user: 'ExternalDev', state: 'open' }
  ]);
  const [repoMetrics, setRepoMetrics] = useState<any>(null);

  // Tasks
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [taskView, setTaskView] = useState<"list" | "kanban">("list");
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  // Plugins
  const [plugins, setPlugins] = useState<Plugin[]>([
    { id: 'ext-1', name: 'Rust Analyzer', author: 'NexusCore', description: 'Advanced LSP for Rust development.', rating: 4.8, downloads: 12400, isInstalled: true, price: 'Free', reviews: [] },
    { id: 'ext-2', name: 'Docker Orchestrator', author: 'DevOpsTools', description: 'Manage containers directly from Nexus.', rating: 4.5, downloads: 8200, isInstalled: false, price: 'Pro', reviews: [] }
  ]);
  const [pluginMode, setPluginMode] = useState<"discover" | "installed" | "upload">("discover");
  const [pluginSearch, setPluginSearch] = useState("");
  const [newPluginData, setNewPluginData] = useState({ name: "", description: "", author: "", price: "Free" });
  const [reviewPluginId, setReviewPluginId] = useState<string | null>(null);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: "" });

  // Settings
  const [settings, setSettings] = useState({ themeDark: true, autoSave: true, formatOnSave: true, useIndexedDB: true, hardwareAcceleration: true });
  const [githubSshKey, setGithubSshKey] = useState("");
  const [sshTestStatus, setSshTestStatus] = useState("idle");

  // Refs
  const chatInputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // --- Effects ---
  useEffect(() => {
    if (session?.user) {
      telemetry.setUser((session.user as any).id || "", session.user.email || undefined);
    }
  }, [session]);

  useEffect(() => {
    const initEngines = async () => {
      const trace = telemetry.startTransaction("Project Load", "init");
      try {
        await nexus.init();
        await vfs.init();
        collab.init();
        
        const savedFiles = await vfs.getAllFiles();
        if (Object.keys(savedFiles).length > 0) {
          setFiles(savedFiles);
          setOriginalFiles(savedFiles);
          rag.indexWorkspace(savedFiles);
        }
      } catch (e: any) {
        telemetry.captureException(e);
      } finally {
        trace.finish();
      }
    };
    initEngines();
  }, []);

  // --- Worker Setup ---
  const workerRef = useRef<Worker | null>(null);
  const agentWorkerRef = useRef<Worker | null>(null);

  useEffect(() => {
    workerRef.current = new Worker(new URL('@/lib/workers/analyzer.worker.ts', import.meta.url));
    workerRef.current.postMessage({ type: 'INIT' });

    agentWorkerRef.current = new Worker(new URL('@/lib/workers/agent.worker.ts', import.meta.url));
    agentWorkerRef.current.onmessage = (e) => {
       const { type, data } = e.data;
       if (type === 'AGENT_STATUS' || type === 'AGENT_COMPLETE') {
          const msg = typeof data === 'string' ? data : data.summary;
          setTerminals(prev => prev.map(t => t.id === activeTerminalId ? { ...t, history: [...t.history, `[AI-AGENT] ${msg}`] } : t));
       }
    };
    
    return () => {
       workerRef.current?.terminate();
       agentWorkerRef.current?.terminate();
    };
  }, [activeTerminalId]);

  useEffect(() => {
    if (messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (terminalEndRef.current) terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [terminals]);

  // --- Handlers ---
  const hapticVibrate = (pattern: any) => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  };

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    hapticVibrate(10);
  };

  const handleSaveVFS = async () => {
    if (!activeFile) return;
    const content = files[activeFile];
    setOriginalFiles(prev => ({ ...prev, [activeFile]: content }));
    
    // Pilier 2: Persistence OPFS
    await vfs.writeFile(activeFile, content);
    
    // PhD Mode: Causal Impact Analysis
    const impact = await causal.analyzeImpact(activeFile, files);
    const impactMsg = impact.length > 1 
      ? `[CAUSAL] Change in ${activeFile} impacts ${impact.length - 1} other files.`
      : `[CAUSAL] Isolated change in ${activeFile}.`;

    setTerminals(prev => prev.map(t => t.id === activeTerminalId ? { ...t, history: [...t.history, `[SYSTEM] Saved ${activeFile} to VFS (OPFS).`, impactMsg] } : t));
    hapticVibrate([20, 50, 20]);
    
    // Pilier 3: Re-index for RAG
    rag.indexWorkspace(files);
  };

  const handleRunCode = async () => {
    if (!activeCode || isRunning) return;
    setIsRunning(true);
    setTerminals(prev => prev.map(t => t.id === activeTerminalId ? { ...t, history: [...t.history, `[EXECUTE] Running ${activeFile}...`] } : t));
    
    try {
      const res = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: activeCode, language: activeFile?.split('.').pop() || "js" })
      });
      const data = await res.json();
      setTerminals(prev => prev.map(t => t.id === activeTerminalId ? { ...t, history: [...t.history, data.output || "No output."] } : t));
    } catch (e) {
      setTerminals(prev => prev.map(t => t.id === activeTerminalId ? { ...t, history: [...t.history, "[ERROR] Execution failed."] } : t));
    } finally {
      setIsRunning(false);
    }
  };

  const handleRefactorAnalysis = async () => {
    if (!activeCode || isAnalyzing) return;
    setIsAnalyzing(true);
    setRefactorPreview(null);
    setTerminals(prev => prev.map(t => t.id === activeTerminalId ? { ...t, history: [...t.history, "[AI] Analyzing code snippet..."] } : t));
    
    try {
      const codeLinesArray = activeCode.split('\n');
      const linesCount = codeLinesArray.length;
      let startIdx = 0;
      let endIdx = Math.min(3, Math.max(0, linesCount - 1));
      
      if (selectedLines.length > 0) {
        startIdx = Math.min(...selectedLines);
        endIdx = Math.max(...selectedLines);
      } else if (linesCount > 4) {
        startIdx = 1; endIdx = 4;
      }

      const origLines = codeLinesArray.slice(startIdx, endIdx + 1);
      const language = activeFile?.split('.').pop() || "txt";

      const res = await fetch('/api/refactor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: origLines.join('\n'), language, provider: activeProvider, apiKeys, models })
      });
      
      const data = await res.json();

      setRefactorPreview({
        original: origLines.join('\n'),
        suggested: data.suggested,
        explanation: data.explanation,
        startLine: startIdx,
        endLine: endIdx
      });
      
      setTerminals(prev => prev.map(t => t.id === activeTerminalId ? { ...t, history: [...t.history, "[AI] Proposed refactoring generated."] } : t));
    } catch (e) {
      setTerminals(prev => prev.map(t => t.id === activeTerminalId ? { ...t, history: [...t.history, "[ERROR] AI Refactoring Engine unavailable."] } : t));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const loadFileContent = async (path: string) => {
    hapticVibrate(20);
    setActiveFile(path);
    setActiveTab("editor");
    
    if (files[path] === "// Fetching contents from GitHub...") {
      try {
        let res = await fetch(`https://raw.githubusercontent.com/${currentRepo}/main/${path}`);
        if (!res.ok) res = await fetch(`https://raw.githubusercontent.com/${currentRepo}/master/${path}`);
        
        if (res.ok) {
          const text = await res.text();
          setFiles(p => ({...p, [path]: text}));
          setOriginalFiles(p => ({...p, [path]: text}));
        } else {
          setFiles(p => ({...p, [path]: "// Failed to load from GitHub"}));
          setOriginalFiles(p => ({...p, [path]: "// Failed to load from GitHub"}));
        }
      } catch {
        setFiles(p => ({...p, [path]: "// Network error"}));
        setOriginalFiles(p => ({...p, [path]: "// Network error"}));
      }
    }
  };

  const handleTerminalSubmit = () => {
    if (!terminalInput.trim()) return;
    hapticVibrate([20, 50, 20]);
    const cmd = terminalInput.trim();
    
    setTerminals(prev => prev.map(t => t.id === activeTerminalId ? {
      ...t,
      history: [...t.history, `> ${cmd}`, 
        cmd === 'clear' ? '' : 
        cmd.startsWith('echo ') ? cmd.substring(5) :
        cmd === 'ls' ? (Object.keys(files).slice(0, 10).join('  ') + (Object.keys(files).length > 10 ? ' ...' : '')) :
        cmd === 'date' ? new Date().toString() :
        `bash: ${cmd}: command not found.`
      ].filter(l => l !== '')
    } : t));
    
    if (cmd === 'clear') {
       setTerminals(prev => prev.map(t => t.id === activeTerminalId ? { ...t, history: [] } : t));
    }

    setTerminalInput("");
  };

  const handleSendChat = async (overrideText?: string) => {
    const textToSend = overrideText || chatInput.trim();
    if (!textToSend) return;
    
    setMessages(prev => [...prev, { role: 'user', content: textToSend }]);
    if (!overrideText) setChatInput("");
    setIsChatLoading(true);

    const trace = telemetry.startTransaction("AI Chat", "gemini_call");
    try {
      if (activeProvider === 'gemini') {
        const apiKey = apiKeys.gemini;
        if (!apiKey) throw new Error("Gemini API Key missing in Settings.");
        
        // Pilier 3: RAG Context Search
        const relevantContext = await rag.search(textToSend);
        
        const { GoogleGenAI } = await import('@google/genai');
        const ai = new GoogleGenAI({ apiKey });
        
        const systemPrompt = `Tu es Nexus IA. Tu as accès à l'intégralité du projet.\n\nCONTEXTE PROJET (RAG):\n${relevantContext}\n\nCODE ACTUEL:\n${activeCode}\n\nRéponds de manière technique et précise.`;
        const formattedMessages = messages.map((m: any) => `${m.role === 'user' ? 'User' : 'Nexus'}: ${m.content}`).join('\n\n');
        const promptText = systemPrompt + "\n\n" + formattedMessages + "\n\nUser: " + textToSend + "\n\nNexus:";
        
        const start = performance.now();
        const response = await (ai as any).getGenerativeModel({ model: models.gemini || 'gemini-2.5-flash' }).generateContent(promptText);
        const result = await response.response;
        telemetry.logPerformance("ai_chat_latency", performance.now() - start, { provider: "gemini" });
        
        hapticVibrate([30, 50, 30]);
        setMessages(prev => [...prev, { role: 'ai', content: result.text() || "No response." }]);
      } else {
        throw new Error(`Direct client-side call for ${activeProvider} is not yet implemented. Use Gemini.`);
      }
    } catch (err: any) {
      telemetry.captureException(err, { provider: activeProvider });
      setMessages(prev => [...prev, { role: 'ai', content: `Error: ${err.message}` }]);
    } finally {
      setIsChatLoading(false);
      trace.finish();
    }
  };

  const handleTestSsh = () => {
    setSshTestStatus("testing");
    setTimeout(() => {
      setSshTestStatus(githubSshKey.includes("PRIVATE KEY") ? "success" : "error");
    }, 1500);
  };

  const startAgentTask = (taskName: string) => {
    if (!agentWorkerRef.current) return;
    agentWorkerRef.current.postMessage({
      type: 'START_AGENT_TASK',
      payload: { taskName, projectContext: files }
    });
    setActiveTab("terminal");
  };

  // --- UI Elements ---
  const activeCode = activeFile ? files[activeFile] || "" : "";
  
  const cmds = [
    { title: "Connect GitHub", run: () => { setIsCommandPaletteOpen(false); setActiveTab("files"); } },
    { title: "AI Assistant", run: () => { setIsCommandPaletteOpen(false); setIsAiPanelOpen(true); } },
    { title: "Open Terminal", run: () => { setIsCommandPaletteOpen(false); setActiveTab("terminal"); } },
    { title: "Toggle Zen Mode", run: () => { setIsCommandPaletteOpen(false); setIsZenMode(z => !z); } },
    { title: "Toggle Split View", run: () => { setIsCommandPaletteOpen(false); setIsSplitView(z => !z); setActiveTab('editor'); } },
    { title: "App Settings", run: () => { setIsCommandPaletteOpen(false); setActiveTab("settings"); } },
    { title: "Architecture Graph", run: () => { setIsCommandPaletteOpen(false); setActiveTab("graph"); } },
    { title: "Dev Analytics Dashboard", run: () => { setIsCommandPaletteOpen(false); setActiveTab("dashboard"); } },
    { title: "Plugin Marketplace", run: () => { setIsCommandPaletteOpen(false); setActiveTab("plugins"); } },
    { title: "Task Management", run: () => { setIsCommandPaletteOpen(false); setActiveTab("tasks"); } },
    { title: "DevOps Dashboard", run: () => { setIsCommandPaletteOpen(false); setActiveTab("devops"); } },
    { title: "Agent: Security Scan", run: () => { setIsCommandPaletteOpen(false); startAgentTask("Security Vulnerability Scan"); } },
    { title: "Agent: Generate Docs", run: () => { setIsCommandPaletteOpen(false); startAgentTask("Auto-Documentation Module"); } },
  ];
  const filteredCmds = cmds.filter(c => c.title.toLowerCase().includes(cmdSearchQuery.toLowerCase()));

  const pageVariants: any = {
    initial: { opacity: 0, y: 10, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -10, scale: 0.98, transition: { duration: 0.2 } }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center p-0 sm:p-6 font-sans select-none overflow-hidden text-gray-200 relative isolate">
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPHBhdGggZD0iTTAgMGg0djRIMHptMSAxaDJ2MkgxeiIgZmlsbD0iIzAwMCIgZmlsbC1vcGFjaXR5PSIwLjAyIi8+Cjwvc3ZnPg==')] mix-blend-overlay" />
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none z-0" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-500/10 blur-[120px] rounded-full pointer-events-none z-0" />

      <motion.div layout transition={{ type: "spring", damping: 25, stiffness: 200 }} className="relative bg-[#050505]/95 backdrop-blur-3xl shadow-[0_40px_80px_rgba(0,0,0,1)] flex flex-col mx-auto ring-1 ring-white/10 z-10 transition-all duration-300 overflow-hidden w-full h-[100dvh] sm:h-[95vh] sm:w-[95vw] sm:max-w-[1400px] sm:rounded-[32px]">
        
        <MainHeader 
           activeTab={activeTab} activeFile={activeFile} currentRepo={currentRepo} setActiveTab={setActiveTab as any}
           setIsCommandPaletteOpen={setIsCommandPaletteOpen} handleSaveVFS={handleSaveVFS} handleRunCode={handleRunCode}
           isRunning={isRunning} isEditMode={isEditMode} setIsEditMode={setIsEditMode} handleRefactorAnalysis={handleRefactorAnalysis}
           isAnalyzing={isAnalyzing} refactorPreview={refactorPreview} setSelectedLines={setSelectedLines} setRefactorPreview={setRefactorPreview}
        />

        <CommandPalette 
           isCommandPaletteOpen={isCommandPaletteOpen} setIsCommandPaletteOpen={setIsCommandPaletteOpen}
           cmdSearchQuery={cmdSearchQuery} setCmdSearchQuery={setCmdSearchQuery} filteredCmds={filteredCmds}
        />

        <main className="flex-1 relative overflow-hidden bg-black">
          <AnimatePresence mode="popLayout">
            {activeTab === "editor" && (
              <EditorView 
                activeFile={activeFile} files={files} setFiles={setFiles} originalFiles={originalFiles} setOriginalFiles={setOriginalFiles}
                isEditMode={isEditMode} setIsEditMode={setIsEditMode} isSplitView={isSplitView} setIsSplitView={setIsSplitView}
                selectedLines={selectedLines} setSelectedLines={setSelectedLines} isAnalyzing={isAnalyzing} isRunning={isRunning}
                refactorPreview={refactorPreview} setRefactorPreview={setRefactorPreview} settings={settings}
                handleSaveVFS={handleSaveVFS} handleRunCode={handleRunCode} handleRefactorAnalysis={handleRefactorAnalysis}
                setActiveTab={setActiveTab as any} setIsAiPanelOpen={setIsAiPanelOpen} setChatInput={setChatInput}
                chatInputRef={chatInputRef} pageVariants={pageVariants}
              />
            )}
            {activeTab === "files" && (
              <FileExplorerView 
                githubConnected={githubConnected} setGithubConnected={setGithubConnected} currentRepo={currentRepo}
                setCurrentRepo={setCurrentRepo} files={files} setFiles={setFiles} setOriginalFiles={setOriginalFiles}
                activeFile={activeFile} setActiveFile={setActiveFile} setActiveTab={setActiveTab as any} loadFileContent={loadFileContent}
                pageVariants={pageVariants}
              />
            )}
            {activeTab === "git" && (
              <GitView githubConnected={githubConnected} currentRepo={currentRepo} files={files} pullRequests={pullRequests} commits={commits} pageVariants={pageVariants} />
            )}
            {activeTab === "graph" && <GraphView files={files} pageVariants={pageVariants} />}
            {activeTab === "dashboard" && <DashboardView repoMetrics={repoMetrics} pageVariants={pageVariants} />}
            {activeTab === "preview" && <PreviewView files={files} activeFile={activeFile} pageVariants={pageVariants} />}
            {activeTab === "terminal" && (
               <TerminalView 
                 terminals={terminals} activeTerminalId={activeTerminalId} setActiveTerminalId={setActiveTerminalId}
                 setTerminals={setTerminals} terminalInput={terminalInput} setTerminalInput={setTerminalInput}
                 handleTerminalSubmit={handleTerminalSubmit} terminalEndRef={terminalEndRef} setActiveTab={setActiveTab as any}
                 pageVariants={pageVariants}
               />
            )}
            {activeTab === "settings" && (
               <SettingsView 
                 settings={settings} toggleSetting={toggleSetting as any} githubSshKey={githubSshKey} setGithubSshKey={setGithubSshKey}
                 sshTestStatus={sshTestStatus} handleTestSsh={handleTestSsh} apiKeys={apiKeys} setApiKeys={setApiKeys}
                 models={models} setModels={setModels} activeProvider={activeProvider} setActiveProvider={setActiveProvider}
                 isProviderMenuOpen={isProviderMenuOpen} setIsProviderMenuOpen={setIsProviderMenuOpen} pageVariants={pageVariants}
               />
            )}
            {activeTab === "tasks" && (
              <TaskBoard 
                tasks={tasks} setTasks={setTasks} taskView={taskView} setTaskView={setTaskView}
                isAddingTask={isAddingTask} setIsAddingTask={setIsAddingTask} newTaskTitle={newTaskTitle}
                setNewTaskTitle={setNewTaskTitle} pageVariants={pageVariants} hapticVibrate={hapticVibrate}
              />
            )}
            {activeTab === "plugins" && (
              <MarketplaceView 
                plugins={plugins} setPlugins={setPlugins} pluginMode={pluginMode} setPluginMode={setPluginMode}
                pluginSearch={pluginSearch} setPluginSearch={setPluginSearch} newPluginData={newPluginData}
                setNewPluginData={setNewPluginData} reviewPluginId={reviewPluginId} setReviewPluginId={setReviewPluginId}
                reviewData={reviewData} setReviewData={setReviewData} pageVariants={pageVariants} hapticVibrate={hapticVibrate}
              />
            )}
            {activeTab === "devops" && <DevOpsView pageVariants={pageVariants} />}
          </AnimatePresence>
        </main>

        <GlobalNav isZenMode={isZenMode} activeTab={activeTab} setActiveTab={setActiveTab as any} setIsAiPanelOpen={setIsAiPanelOpen} />
      </motion.div>

      <AiPanel 
         isAiPanelOpen={isAiPanelOpen} setIsAiPanelOpen={setIsAiPanelOpen} messages={messages} isChatLoading={isChatLoading}
         activeProvider={activeProvider} setActiveProvider={setActiveProvider} isProviderMenuOpen={isProviderMenuOpen}
         setIsProviderMenuOpen={setIsProviderMenuOpen} chatInput={chatInput} setChatInput={setChatInput}
         handleSendChat={handleSendChat} chatInputRef={chatInputRef} messagesEndRef={messagesEndRef}
      />
    </div>
  );
}
