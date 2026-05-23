"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Code2, FolderTree, Terminal, Settings, Sparkles, Menu, X, ChevronRight, ChevronDown, Zap, Info, Fingerprint,
  Edit3, MousePointer2, Cpu, Loader2, Send, FileCode2, Folder, ToggleLeft, ToggleRight, CheckCircle2,
  Search, Command, TerminalSquare, Github, GitBranch, GitMerge, GitCommit, History, Activity, Lock, GitPullRequest, BrainCircuit, Play, Save, Database,
  Globe, Smartphone, FilePlus, FolderPlus, Trash2, Puzzle, Upload, Star, DownloadCloud, Heart, ListTodo, Circle, Calendar, Flag, MoreVertical, Plus, Kanban
} from "lucide-react";
import * as diff from "diff";
import Prism from "prismjs";
import Editor from "@monaco-editor/react";
import "prismjs/themes/prism-tomorrow.css";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-rust";
import "prismjs/components/prism-python";
import "prismjs/components/prism-bash";
import { Rnd } from "react-rnd";
import { hapticVibrate } from "../lib/utils";
import DependencyGraph from "../components/DependencyGraph";
import { get, set } from "idb-keyval";

type TabProps = {
  activeTab: string;
  id: string;
  icon: React.ElementType;
  label: string;
  onClick: (id: string) => void;
};

const BottomTab = ({ activeTab, id, icon: Icon, label, onClick }: TabProps) => (
  <button
    onClick={() => onClick(id)}
    className={`flex flex-col items-center justify-center w-full py-2 gap-1 transition-colors ${
      activeTab === id ? "text-indigo-400" : "text-gray-500 hover:text-gray-400"
    }`}
  >
    <Icon className="w-5 h-5" />
    <span className="text-[10px] font-medium">{label}</span>
  </button>
);

const ToggleItem = ({ title, desc, state, toggle, premium = false }: { title: string, desc: string, state: boolean, toggle: () => void, premium?: boolean }) => (
  <div className="flex items-center justify-between cursor-pointer group py-3.5 border-b border-gray-800/50 last:border-0" onClick={toggle}>
    <div className="space-y-1.5 pr-4">
      <h4 className="text-[14px] font-semibold text-gray-200 group-hover:text-indigo-300 transition-colors flex items-center gap-2">
        {title} {premium && <span className="text-[8px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Premium</span>}
      </h4>
      <p className="text-[11px] text-gray-500 leading-relaxed max-w-[220px]">{desc}</p>
    </div>
    {state ? <ToggleRight className={`w-9 h-9 ${premium ? 'text-amber-500' : 'text-indigo-500'} shrink-0 filter drop-shadow-sm`} /> : <ToggleLeft className="w-9 h-9 text-gray-700 shrink-0 group-hover:text-gray-500 transition-colors" />}
  </div>
);

type PluginReview = {
  user: string;
  rating: number;
  comment: string;
};

type Plugin = {
  id: string;
  name: string;
  author: string;
  description: string;
  rating: number;
  downloads: number;
  isInstalled: boolean;
  price: string;
  reviews: PluginReview[];
};

const initialPlugins: Plugin[] = [
  { id: "nexus-prettier", name: "Prettier Formatter", author: "Nexus Team", description: "Format your code with Prettier effortlessly.", rating: 4.8, downloads: 12053, isInstalled: true, price: "Free", reviews: [{ user: "Alice", rating: 5, comment: "Must have!" }] },
  { id: "git-lens", name: "GitLens Supercharged", author: "Eric", description: "Supercharge your Git capabilities within the editor.", rating: 4.9, downloads: 8932, isInstalled: false, price: "Free", reviews: [] },
  { id: "copilot-assistant", name: "AI Autocomplete", author: "Nexus AI Team", description: "Context-aware AI autocomplete for blazing fast coding.", rating: 4.5, downloads: 3102, isInstalled: false, price: "Pro", reviews: [] },
  { id: "theme-dracula", name: "Dracula Theme", author: "Zeno", description: "A dark theme for many editors, shells, and more.", rating: 4.7, downloads: 5430, isInstalled: false, price: "Free", reviews: [] },
  { id: "rust-analyzer", name: "Rust Analyzer", author: "rust-lang", description: "Rust language support for NexusCode.", rating: 4.8, downloads: 2004, isInstalled: false, price: "Free", reviews: [] },
];

type TaskStatus = "todo" | "in-progress" | "done" | "archived";
type TaskPriority = "low" | "medium" | "high";

export type ProjectTask = {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: string;
  dueDate: string;
  completedAt?: string;
};

const initialTasks: ProjectTask[] = [
  { id: "t-1", title: "Setup auth flow", description: "Implement OAuth with GitHub", status: "in-progress", priority: "high", assignee: "AI", dueDate: "2026-05-24" },
  { id: "t-2", title: "Fix component hydration", description: "SSR mismatch in Dashboard", status: "todo", priority: "medium", assignee: "Unassigned", dueDate: "2026-05-25" },
  { id: "t-3", title: "Write initial tests", description: "Vitest config and unit tests", status: "done", priority: "low", assignee: "Me", dueDate: "2026-05-20", completedAt: "2026-05-10T12:00:00Z" },
];

export default function NexusCodeApp() {
  const [activeTab, setActiveTab] = useState("files");
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [cmdSearchQuery, setCmdSearchQuery] = useState("");
  
  // GitHub & FS State
  const [githubConnected, setGithubConnected] = useState(false);
  const [isCloning, setIsCloning] = useState(false);
  const [currentRepo, setCurrentRepo] = useState<string | null>(null);
  const [files, setFiles] = useState<Record<string, string>>({});
  const [originalFiles, setOriginalFiles] = useState<Record<string, string>>({});
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [repoInput, setRepoInput] = useState("torvalds/linux");
  const [commits, setCommits] = useState<any[]>([]);
  const [pullRequests, setPullRequests] = useState<any[]>([]);
  const [repoMetrics, setRepoMetrics] = useState<any>(null);
  const [time, setTime] = useState("09:41");

  // Editor State
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSplitView, setIsSplitView] = useState(false);
  const [selectedLines, setSelectedLines] = useState<number[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [refactorPreview, setRefactorPreview] = useState<{
    original: string;
    suggested: string;
    explanation: string;
    startLine: number;
    endLine: number;
  } | null>(null);
  
  // Terminal State
  type TerminalTab = { id: string; title: string; history: string[]; };
  const [terminals, setTerminals] = useState<TerminalTab[]>([{ id: "term_1", title: "bash", history: ["[SYSTEM] Nexus IDE Core Engine initialized.", "[SYSTEM] Awaiting workspace connection..."] }]);
  const [activeTerminalId, setActiveTerminalId] = useState<string>("term_1");
  const activeTerminal = terminals.find(t => t.id === activeTerminalId) || terminals[0];
  const terminalHistory = activeTerminal.history;
  const setTerminalHistory = (updateOrArray: string[] | ((prev: string[]) => string[])) => {
    setTerminals(prev => prev.map(t => t.id === activeTerminalId ? { ...t, history: typeof updateOrArray === "function" ? updateOrArray(t.history) : updateOrArray } : t));
  };
  const [terminalInput, setTerminalInput] = useState("");
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // AI & Chat State
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<{role: 'user'|'ai', content: string}[]>([
    { role: 'ai', content: "Orchestration Engine ready. What would you like to develop today?" }
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);
  const [isProviderMenuOpen, setIsProviderMenuOpen] = useState(false);

  // Marketplace State
  const [plugins, setPlugins] = useState<Plugin[]>(initialPlugins);
  const [pluginMode, setPluginMode] = useState<"discover" | "installed" | "upload">("discover");
  const [pluginSearch, setPluginSearch] = useState("");
  const [newPluginData, setNewPluginData] = useState({ name: "", description: "", author: "", price: "Free" });
  const [reviewPluginId, setReviewPluginId] = useState<string | null>(null);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: "" });

  // Tasks State
  const [tasks, setTasks] = useState<ProjectTask[]>(initialTasks);
  const [taskView, setTaskView] = useState<"list" | "kanban">("kanban");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isAddingTask, setIsAddingTask] = useState(false);

  // Auto-archive effect (7 days)
  useEffect(() => {
    const now = new Date().getTime();
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    
    let changed = false;
    const updatedTasks = tasks.map(t => {
      if (t.status === "done" && t.completedAt) {
        const completedTime = new Date(t.completedAt).getTime();
        if (now - completedTime >= sevenDaysMs) {
          changed = true;
          return { ...t, status: "archived" as TaskStatus };
        }
      }
      return t;
    });
    
    if (changed) {
      setTasks(updatedTasks);
    }
  }, [tasks]);

  // Settings State
  const [githubSshKey, setGithubSshKey] = useState("");
  const [sshTestStatus, setSshTestStatus] = useState<"idle" | "testing" | "success" | "error">("idle");
  const [apiKeys, setApiKeys] = useState<{gemini: string; claude: string; openai: string; mistral: string}>({
    gemini: "",
    claude: "",
    openai: "",
    mistral: ""
  });
  const [models, setModels] = useState<{gemini: string; claude: string; openai: string; mistral: string}>({
    gemini: "gemini-2.5-flash",
    claude: "claude-3-5-sonnet-20241022",
    openai: "gpt-4o",
    mistral: "mistral-large-latest"
  });
  const [activeProvider, setActiveProvider] = useState("gemini");

  const [settings, setSettings] = useState({
    themeDark: true,
    autoSave: true,
    formatOnSave: true,
    useIndexedDB: true,
    hardwareAcceleration: true,
  });
  
  const toggleSetting = (key: keyof typeof settings) => {
    hapticVibrate(15);
    setSettings(s => ({...s, [key]: !s[key]}));
  };


  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const updateTime = () => setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    updateTime();
    const intId = setInterval(updateTime, 60000);

    const loadVfs = async () => {
      try {
        const idbVfs = await get("nexus-vfs");
        if (idbVfs && Object.keys(idbVfs).length > 0) {
          setFiles(idbVfs);
          setOriginalFiles(idbVfs);
          return;
        }
      } catch (e) {}

      const savedVfs = localStorage.getItem("nexus-vfs");
      if (savedVfs) {
        try {
          const parsed = JSON.parse(savedVfs);
          if (Object.keys(parsed).length > 0) {
            setFiles(parsed);
            setOriginalFiles(parsed);
          }
        } catch (e) {}
      }
    };
    loadVfs();
    


    
    const savedSettings = localStorage.getItem("nexus-settings");
    if (savedSettings) {
      try { setSettings(JSON.parse(savedSettings)); } catch(e){}
    }
    
    const savedSshKey = localStorage.getItem("nexus-github-ssh-key");
    if (savedSshKey) setGithubSshKey(savedSshKey);
    
    const savedApiKeys = localStorage.getItem("nexus-api-keys");
    if (savedApiKeys) {
      try { setApiKeys(JSON.parse(savedApiKeys)); } catch(e){}
    }

    const savedModels = localStorage.getItem("nexus-models");
    if (savedModels) {
      try { setModels(m => ({ ...m, ...JSON.parse(savedModels) })); } catch(e){}
    }

    const savedProvider = localStorage.getItem("nexus-provider");
    if (savedProvider) setActiveProvider(savedProvider);

    const savedTab = localStorage.getItem("nexus-active-tab");
    if (savedTab) setActiveTab(savedTab);

    const savedTasks = localStorage.getItem("nexus-tasks");
    if (savedTasks) {
      try { setTasks(JSON.parse(savedTasks)); } catch(e){}
    }
    
    const savedMessages = localStorage.getItem("nexus-messages");
    if (savedMessages) {
      try { setMessages(JSON.parse(savedMessages)); } catch(e){}
    }

    const savedPlugins = localStorage.getItem("nexus-plugins");
    if (savedPlugins) {
      try { setPlugins(JSON.parse(savedPlugins)); } catch(e){}
    }

    const savedTerminals = localStorage.getItem("nexus-terminals");
    if (savedTerminals) {
      try { setTerminals(JSON.parse(savedTerminals)); } catch(e){}
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(o => !o);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'j') {
        e.preventDefault();
        setIsZenMode(z => !z);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearInterval(intId);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("nexus-active-tab", activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem("nexus-tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("nexus-messages", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem("nexus-plugins", JSON.stringify(plugins));
  }, [plugins]);

  useEffect(() => {
    localStorage.setItem("nexus-terminals", JSON.stringify(terminals));
  }, [terminals]);

  


  useEffect(() => {
    localStorage.setItem("nexus-settings", JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem("nexus-github-ssh-key", githubSshKey);
  }, [githubSshKey]);

  useEffect(() => {
    localStorage.setItem("nexus-api-keys", JSON.stringify(apiKeys));
  }, [apiKeys]);

  useEffect(() => {
    localStorage.setItem("nexus-models", JSON.stringify(models));
  }, [models]);

  useEffect(() => {
    localStorage.setItem("nexus-provider", activeProvider);
  }, [activeProvider]);

  useEffect(() => {
    if (isAiPanelOpen) setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }, [messages, isAiPanelOpen, isChatLoading]);

  useEffect(() => {
    if (activeTab === "terminal") terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [terminalHistory, activeTab]);

  const handleConnectGithub = async () => {
    if (!repoInput.trim()) return;
    setIsCloning(true);
    setTerminalHistory(prev => [...prev, `[GIT] Fetching ${repoInput}...`]);
    try {
      const repoRes = await fetch(`https://api.github.com/repos/${repoInput}`);
      if (!repoRes.ok) throw new Error("Repository not found");
      const repoData = await repoRes.json();
      setRepoMetrics(repoData);
      const defaultBranch = repoData.default_branch || "main";

      const treeRes = await fetch(`https://api.github.com/repos/${repoInput}/git/trees/${defaultBranch}?recursive=1`);
      const treeData = await treeRes.json();
      
      const newFiles: Record<string, string> = {};
      let count = 0;
      for (const item of treeData.tree) {
        if (item.type === "blob" && !item.path.includes("node_modules") && !item.path.includes(".png") && count < 50) {
           try {
             const contentRes = await fetch(`https://raw.githubusercontent.com/${repoInput}/${defaultBranch}/${item.path}`);
             if (contentRes.ok) {
               newFiles[item.path] = await contentRes.text();
             } else {
               newFiles[item.path] = "// Failed to fetch from GitHub.";
             }
           } catch (e) {
             newFiles[item.path] = "// Error fetching content.";
           }
           count++;
        }
      }

      setFiles(newFiles);
      setOriginalFiles(newFiles);
      setCurrentRepo(repoInput);
      setGithubConnected(true);
      setActiveTab("files");

      const commitsRes = await fetch(`https://api.github.com/repos/${repoInput}/commits?per_page=5`);
      const commitsData = await commitsRes.json();
      setCommits(commitsData.map((c: any) => ({
        message: c.commit.message,
        sha: c.sha.substring(0, 7),
        author: c.commit.author.name
      })));

      const pullsRes = await fetch(`https://api.github.com/repos/${repoInput}/pulls?state=all&per_page=5`);
      if (pullsRes.ok) {
         const pullsData = await pullsRes.json();
         setPullRequests(pullsData.map((p: any) => ({
           title: p.title,
           number: p.number,
           state: p.state,
           user: p.user?.login
         })));
      }

      setTerminalHistory(prev => [...prev, `[GIT] Cloned ${repoInput} successfully.`, `[LSP] Indexed ${count} files.`]);
    } catch (e: any) {
      setTerminalHistory(prev => [...prev, `[ERROR] Failed: ${e.message}`]);
    } finally {
      setIsCloning(false);
    }
  };

  const handleTestSsh = async () => {
    if (!githubSshKey) return;
    setSshTestStatus("testing");
    await new Promise(r => setTimeout(r, 1500));
    try {
      const response = await fetch("https://api.github.com/meta", {
        headers: { "User-Agent": "NexusCode" }
      });
      if (!response.ok) throw new Error("GitHub unreachable");
      if (githubSshKey.includes("BEGIN") && githubSshKey.includes("PRIVATE KEY")) {
        setSshTestStatus("success");
      } else {
        setSshTestStatus("error");
      }
    } catch {
      setSshTestStatus("error");
    }
  };

  const handleSaveVFS = async () => {
    if (settings.useIndexedDB) {
      try {
        await set("nexus-vfs", files);
        setTerminalHistory(prev => [...prev, "[SYSTEM] File changes saved to IndexedDB."]);
      } catch (e) {
        localStorage.setItem("nexus-vfs", JSON.stringify(files));
        setTerminalHistory(prev => [...prev, "[SYSTEM] File changes saved to local storage (IDB failed)."]);
      }
    } else {
      localStorage.setItem("nexus-vfs", JSON.stringify(files));
      setTerminalHistory(prev => [...prev, "[SYSTEM] File changes saved to local storage."]);
    }
    setOriginalFiles(files);
  };

  const handleRunCode = async () => {
    if (!activeFile || isRunning) return;
    setIsRunning(true);
    setActiveTab("terminal");
    const lang = activeFile.split('.').pop() || "txt";
    const langMap: Record<string, string> = { "js": "JavaScript", "ts": "TypeScript", "py": "Python", "rs": "Rust", "go": "Go", "cpp": "C++", "c": "C", "java": "Java", "rb": "Ruby", "php": "PHP" };
    const langName = langMap[lang.toLowerCase()] || lang.toUpperCase();
    
    setTerminalHistory(prev => [...prev, `[SYSTEM] Preparing ${langName} environment...`, `[EXECUTE] Running ${activeFile}...`]);
    
    try {
      const res = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: files[activeFile], language: lang, provider: activeProvider, apiKeys, models })
      });
      const data = await res.json();
      if (data.exitCode === 0) hapticVibrate([40, 50, 40]);
      else hapticVibrate([80, 50, 80]);
      setTerminalHistory(prev => [...prev, ...data.output.split('\n').filter(Boolean).map((l: string) => `> ${l}`), `[SYSTEM] Process exited with code ${data.exitCode}.`]);
    } catch {
       setTerminalHistory(prev => [...prev, `[ERROR] Execution failed.`]);
    } finally {
      setIsRunning(false);
    }
  };

  const handleRefactorAnalysis = async () => {
    if (!activeCode || isAnalyzing) return;
    setIsAnalyzing(true);
    setRefactorPreview(null);
    setTerminalHistory(prev => [...prev, "[AI] Analyzing code snippet..."]);
    
    try {
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
      
      setTerminalHistory(prev => [...prev, "[AI] Proposed refactoring generated."]);
    } catch (e) {
      setTerminalHistory(prev => [...prev, "[ERROR] AI Refactoring Engine unavailable."]);
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
    const newHist = [...terminalHistory, `> ${cmd}`];
    
    if (cmd === 'clear') {
      setTerminalHistory([]);
    } else if (cmd.startsWith('echo ')) {
      newHist.push(cmd.substring(5));
      setTerminalHistory(newHist);
    } else if (cmd === 'ls') {
      newHist.push(Object.keys(files).slice(0, 10).join('  ') + (Object.keys(files).length > 10 ? ' ...' : ''));
      setTerminalHistory(newHist);
    } else if (cmd === 'date') {
      newHist.push(new Date().toString());
      setTerminalHistory(newHist);
    } else {
      newHist.push(`bash: ${cmd}: command not found.`);
      setTerminalHistory(newHist);
    }
    setTerminalInput("");
  };

  const getSyntaxHighlighting = (text: string) => {
    if (text.trim().startsWith('//')) return 'text-[#a0aabf] italic';
    if (text.match(/\b(fn|pub|struct|impl|enum)\b/)) return 'text-[#c678dd] font-semibold';
    if (text.match(/\b(let|mut|const|use|mod|import|export|from)\b/)) return 'text-[#61afef]';
    if (text.match(/\b(for|if|in|else|match|return)\b/)) return 'text-[#c678dd]';
    if (text.includes('!') || text.includes('println') || text.includes('console')) return 'text-[#d19a66]';
    if (text.match(/\b(String|Vec|Self|number|string|boolean)\b/)) return 'text-[#e5c07b]';
    return 'text-[#abb2bf]';
  };

  const hasUnsavedChanges = activeFile && originalFiles[activeFile] !== undefined && originalFiles[activeFile] !== files[activeFile];

  
  const renderHighlightedLine = (text: string, i: number, highlightLines: number[]) => {
    let html = text;
    try {
      const ext = activeFile ? activeFile.split('.').pop() : '';
      let lang = 'javascript';
      if (ext === 'ts' || ext === 'tsx') lang = 'typescript';
      if (ext === 'rs') lang = 'rust';
      if (ext === 'py') lang = 'python';
      if (ext === 'sh' || ext === 'bash') lang = 'bash';
      html = Prism.highlight(text, Prism.languages[lang] || Prism.languages.javascript, lang);
    } catch(e) {}
    
    return (
       <div 
         key={i} 
         onClick={() => {
            if (highlightLines.includes(i)) {
               setSelectedLines(highlightLines.filter(l => l !== i));
            } else {
               setSelectedLines([...highlightLines, i]);
            }
         }}
         className={`flex px-1 hover:bg-white/5 cursor-text ${highlightLines.includes(i) ? 'bg-indigo-500/20' : ''}`}
       >
         <div className="w-8 shrink-0 text-right pr-2 text-gray-600 select-none text-[10px] py-[2px] tabular-nums">{i + 1}</div>
         <div className="whitespace-pre py-[1px] font-mono text-[14px]" dangerouslySetInnerHTML={{__html: html || " "}} />
       </div>
    );
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
      const parts = diff.diffLines(originalFiles[activeFile!] || "", files[activeFile!] || "");
      let leftLines: React.ReactNode[] = [];
      let rightLines: React.ReactNode[] = [];
      let lineOld = 1;
      let lineNew = 1;

      parts.forEach((part, i) => {
         const lines = part.value.replace(/\n$/, "").split('\n');
         if (part.added) {
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
         } else if (part.removed) {
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

  const activeCode = activeFile ? files[activeFile] || "" : "";
  const codeLinesArray = activeCode.split('\n');

  const handleSendChat = async (overrideText?: string) => {
    const textToSend = overrideText || chatInput.trim();
    if (!textToSend) return;
    
    setMessages(prev => [...prev, { role: 'user', content: textToSend }]);
    if (!overrideText) setChatInput("");
    setIsChatLoading(true);

    try {
      if (activeProvider === 'gemini') {
        const apiKey = apiKeys.gemini;
        if (!apiKey) throw new Error("Gemini API Key missing in Settings.");
        
        const { GoogleGenAI } = await import('@google/genai');
        const ai = new GoogleGenAI({ apiKey });
        
        const systemPrompt = `Tu es Nexus IA, un assistant de pair-programming. Code Context:\n\n${activeCode}\n\nRponds de maniere concise.`;
        const formattedMessages = messages.map((m: any) => `${m.role === 'user' ? 'User' : 'Nexus'}: ${m.content}`).join('\n\n');
        const promptText = systemPrompt + "\n\n" + formattedMessages + "\n\nUser: " + textToSend + "\n\nNexus:";
        
        const response = await ai.models.generateContent({
          model: models.gemini || 'gemini-2.5-flash',
          contents: promptText,
        });
        
        hapticVibrate([30, 50, 30]);
        setMessages(prev => [...prev, { role: 'ai', content: response.text || "No response." }]);
      } else {
        throw new Error(`Direct client-side call for ${activeProvider} is not yet implemented. Use Gemini.`);
      }
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'ai', content: `Error: ${err.message}` }]);
    } finally {
      setIsChatLoading(false);
    }
  };


  // Commands
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
  ];
  const filteredCmds = cmds.filter(c => c.title.toLowerCase().includes(cmdSearchQuery.toLowerCase()));

  const pageVariants: any = {
    initial: { opacity: 0, y: 10, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -10, scale: 0.98, transition: { duration: 0.2 } }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center p-0 sm:p-6 font-sans select-none overflow-hidden text-gray-200 relative isolate">
      {/* Texture Grain Overlay */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPHBhdGggZD0iTTAgMGg0djRIMHptMSAxaDJ2MkgxeiIgZmlsbD0iIzAwMCIgZmlsbC1vcGFjaXR5PSIwLjAyIi8+Cjwvc3ZnPg==')] mix-blend-overlay"></div>

      {/* Ambient Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none z-0" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-500/10 blur-[120px] rounded-full pointer-events-none z-0" />

      {/* Mobile Frame Workspace */}
      <motion.div 
        layout
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className={`relative bg-[#050505]/95 backdrop-blur-3xl shadow-[0_40px_80px_rgba(0,0,0,1)] flex flex-col mx-auto ring-1 ring-white/10 z-10 transition-all duration-300 overflow-hidden w-full h-[100dvh] sm:h-[95vh] sm:w-[95vw] sm:max-w-[1400px] sm:rounded-[32px]`}
      >
        
        {/* Dynamic Header */}
        <header className="h-14 border-b border-white/5 flex items-center justify-between px-4 z-40 bg-transparent backdrop-blur-md">
          {activeTab === "editor" && activeFile ? (
            <>
              <div className="flex items-center gap-3 w-full">
                <button onClick={() => setActiveTab("files")} className="p-1.5 text-gray-400 hover:text-white rounded-full bg-white/5 transition-colors">
                  <Menu className="w-4 h-4" />
                </button>
                <div className="flex flex-col flex-1 overflow-hidden">
                  <span className="text-[10px] text-gray-400 font-medium tracking-wide flex items-center gap-1 uppercase">
                    <span className="cursor-pointer hover:text-white transition-colors" onClick={() => setActiveTab("files")}>{currentRepo || "Local"}</span>
                    <ChevronRight className="w-3 h-3" />
                    <span className="cursor-pointer hover:text-white transition-colors" onClick={() => setIsCommandPaletteOpen(true)}>main</span>
                  </span>
                  <span className="text-sm text-gray-100 font-semibold tracking-tight truncate flex items-center gap-2 cursor-pointer hover:text-indigo-300 transition-colors" onClick={() => setIsCommandPaletteOpen(true)}>
                    {activeFile.split('/').pop()}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 bg-white/5 rounded-full p-1 border border-white/5 shadow-sm absolute right-4">
                <button onClick={handleSaveVFS} className="p-1.5 justify-center items-center rounded-full transition-all text-gray-400 hover:bg-emerald-500/20 hover:text-emerald-400 group relative">
                  <Database className="w-4 h-4" />
                </button>
                <button onClick={handleRunCode} disabled={isRunning} className={`p-1.5 justify-center items-center rounded-full transition-all ${isRunning ? 'text-green-500/50' : 'text-gray-400 hover:bg-green-500/20 hover:text-green-400'}`}>
                  {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                </button>
                <div className="w-px h-5 my-auto bg-gray-700/50 mx-0.5" />
                <button onClick={() => setIsEditMode(false)} className={`p-1.5 justify-center items-center rounded-full transition-all ${!isEditMode && !refactorPreview ? 'bg-indigo-500 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}>
                  <MousePointer2 className="w-4 h-4" />
                </button>
                <button onClick={handleRefactorAnalysis} disabled={isAnalyzing} className={`p-1.5 justify-center items-center rounded-full transition-all ${refactorPreview || isAnalyzing ? 'bg-purple-500/20 text-purple-400 shadow-sm' : 'text-gray-400 hover:text-purple-400'}`}>
                  {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <BrainCircuit className="w-4 h-4" />}
                </button>
                <button onClick={() => { setIsEditMode(true); setSelectedLines([]); setRefactorPreview(null); }} className={`p-1.5 justify-center items-center rounded-full transition-all ${isEditMode ? 'bg-indigo-500 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}>
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="w-full flex items-center justify-center relative">
               <button onClick={() => setActiveTab("settings")} className="absolute left-0 p-1.5 bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors">
                  <Settings className="w-4 h-4" />
               </button>
               <span className="text-[14px] font-display font-medium tracking-widest text-white uppercase">
                 {activeTab === "files" ? "Explorer" : activeTab === "settings" ? "Settings" : activeTab === "git" ? "VCS / Git" : activeTab === "preview" ? "Live Preview" : activeTab === "graph" ? "Dep Graph" : activeTab === "plugins" ? "Marketplace" : activeTab === "tasks" ? "Task Board" : "Terminal"}
               </span>
               <button onClick={() => setIsCommandPaletteOpen(true)} className="absolute right-0 p-1.5 bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors">
                  <Command className="w-4 h-4" />
               </button>
            </div>
          )}
        </header>

        {/* Command Palette Overlay */}
        <AnimatePresence>
          {isCommandPaletteOpen && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[100] bg-black/60 backdrop-blur-md flex flex-col pt-16 px-4" onClick={() => setIsCommandPaletteOpen(false)}>
                <div className="bg-[#050505] border border-white/10 shadow-2xl rounded-3xl overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
                   <div className="flex items-center px-4 py-4 border-b border-white/5">
                      <Search className="w-5 h-5 text-gray-400 mr-3" />
                      <input autoFocus className="flex-1 bg-transparent text-[15px] font-medium text-white placeholder-gray-500 focus:outline-none" placeholder="Search files, commands..." value={cmdSearchQuery} onChange={(e) => setCmdSearchQuery(e.target.value)} />
                   </div>
                   <div className="max-h-64 overflow-y-auto p-2">
                     {filteredCmds.map((c, i) => (
                       <button key={i} onClick={c.run} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-300 hover:bg-white/5 rounded-2xl transition-colors">
                         <Command className="w-4 h-4 text-indigo-400" /> {c.title}
                       </button>
                     ))}
                   </div>
                </div>
             </motion.div>
          )}
        </AnimatePresence>

        {/* Main Routing */}
        <main className="flex-1 relative overflow-hidden bg-black">
         <AnimatePresence mode="popLayout">
          
          {/* EDITOR VIEW */}
          {activeTab === "editor" && (
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

                  {/* Empty Selection State */}
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

              {/* Refactor Preview Overlay */}
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
                           setTerminalHistory(prev => [...prev, "[AI] Patch applied to local tree."]);
                       }} className="flex-1 py-3.5 rounded-2xl text-[13px] font-bold text-white bg-purple-600 hover:bg-purple-500 shadow-[0_0_20px_rgba(147,51,234,0.4)] transition-all">Accept Change</button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Selection AI Action Strip */}
              <AnimatePresence>
                {selectedLines.length > 0 && !isEditMode && activeFile && (
                  <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }} className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-[#050505]/95 border border-white/10 shadow-2xl shadow-indigo-500/10 rounded-[28px] px-2 py-2 flex items-center gap-1 z-40 backdrop-blur-xl">
                    <button onClick={() => { setIsAiPanelOpen(true); setChatInput(`Explain the syntax of these lines.`); setTimeout(() => chatInputRef.current?.focus(), 200); }} className="px-4 py-2 hover:bg-white/5 rounded-2xl flex flex-col items-center gap-1 transition-colors">
                      <Info className="w-5 h-5 text-indigo-400" />
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
          )}

          {/* FILES VIEW */}
          {activeTab === "files" && (
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
                  {/* Subtle Background Elements */}
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
          )}

          {/* GIT / VCS VIEW */}
          {activeTab === "git" && (
            <motion.div key="git" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="absolute inset-0 overflow-y-auto bg-transparent p-5 pt-6 space-y-6 w-full h-full pb-20">
              {!githubConnected ? (
                 <div className="text-center mt-32 bg-white/5 border border-white/10 p-6 rounded-3xl mx-4 text-gray-400 font-medium text-sm">Please initialize a workspace in the Explorer first.</div>
              ) : (
                <>
                   {/* Main Repo Status */}
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

                   {/* Premium Quantum Branching */}
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
                   
                   {/* Pull Requests */}
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
                   
                   {/* Local Timeline */}
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
          )}

          {/* GRAPH VIEW */}
          {activeTab === "graph" && (
            <motion.div key="graph" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="absolute inset-0 bg-[#050505] p-4 flex flex-col w-full h-full pb-28">
               <div className="flex items-center gap-4 mb-4">
                 <div className="p-3 bg-gradient-to-br from-blue-500/20 to-purple-500/10 rounded-2xl border border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.15)] relative">
                    <Activity className="w-6 h-6 text-blue-400 relative z-10" />
                 </div>
                 <div>
                   <h2 className="text-[20px] font-display font-medium text-white tracking-tight">Dependency Graph</h2>
                   <p className="text-[12px] text-gray-400 mt-1 font-medium">Architecture mapping module via D3</p>
                 </div>
               </div>
               <div className="flex-1 rounded-3xl overflow-hidden relative shadow-[0_20px_60px_rgba(0,0,0,1)] ring-1 ring-white/5 bg-[#020202]">
                  <DependencyGraph files={files} />
               </div>
            </motion.div>
          )}

          
          {/* DASHBOARD VIEW */}
          {activeTab === "dashboard" && (
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
          )}


          {/* PREVIEW VIEW */}
          {activeTab === "preview" && (
            <motion.div key="preview" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="absolute inset-0 bg-white flex flex-col font-sans w-full h-full pb-20">
               <div className="bg-[#f4f4f5] border-b border-gray-200 py-3 px-4 flex items-center justify-center relative shadow-sm z-10">
                 <div className="flex items-center justify-center bg-white border border-gray-200 rounded-full w-full max-w-sm py-2 gap-2 shadow-sm">
                    <Lock className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-[13px] text-gray-700 font-medium tracking-wide">localhost:3000</span>
                 </div>
               </div>
               <div className="flex-1 w-full bg-white relative">
                 <iframe 
                   title="Localhost Preview"
                   className="w-full h-full border-none" 
                   srcDoc={files["index.html"] || (activeFile && activeFile.endsWith(".html") ? files[activeFile] : `<html><body style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;padding:2rem;background:#fafafa;"><div style="max-w:400px;margin:2rem auto;text-align:center;background:white;padding:2rem;border-radius:24px;box-shadow:0 10px 40px rgba(0,0,0,0.05);"><h2 style="color:#111;margin-bottom:0.5rem;font-weight:700;">Local VFS Preview</h2><p style="color:#71717a;line-height:1.6;font-size:14px;margin-bottom:1.5rem;">Serving the current workspace locally. Write an index.html file to replace this view.</p><div style="display:inline-block;padding:0.5rem 1rem;background:#f4f4f5;border-radius:12px;color:#52525b;font-size:12px;font-family:monospace;font-weight:600;">Active File: ${activeFile || 'None'}</div></div></body></html>`)}
                   sandbox="allow-scripts allow-forms allow-modals"
                 />
               </div>
            </motion.div>
          )}

          {/* TERMINAL VIEW */}
          {activeTab === "terminal" && (
            <motion.div key="terminal" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="absolute inset-0 bg-transparent p-4 sm:p-5 flex flex-col font-mono text-[13px] leading-relaxed text-[#abb2bf] w-full h-full pb-28">
               <div className="flex-1 bg-[#050505]/95 backdrop-blur-xl border border-white/10 flex flex-col rounded-[24px] sm:rounded-[32px] overflow-hidden relative shadow-[0_20px_60px_rgba(0,0,0,1)] ring-1 ring-white/5">
                  <div className="bg-gradient-to-b from-[#111] to-[#0a0a0a] px-5 py-3.5 border-b border-white/5 flex items-center justify-between shadow-sm">
                     <div className="flex gap-2">
                       {terminals.map(t => (
                         <button key={t.id} onClick={() => setActiveTerminalId(t.id)} className={`text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${activeTerminalId === t.id ? 'bg-white/10 text-emerald-400' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}>
                           <TerminalSquare className="w-4 h-4" /> {t.title}
                         </button>
                       ))}
                       <button onClick={() => {
                          const newId = "term_" + (terminals.length + 1);
                          setTerminals(p => [...p, { id: newId, title: `bash-${terminals.length + 1}`, history: ["[SYSTEM] New terminal session initialized."] }]);
                          setActiveTerminalId(newId);
                       }} className="text-gray-500 hover:text-gray-300 p-1.5 rounded-lg hover:bg-white/5 transition-colors">
                         <FilePlus className="w-4 h-4" />
                       </button>
                     </div>
                     <div className="flex gap-2 items-center">
                       <button onClick={() => setActiveTab("dashboard")} className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 px-3 py-1.5 rounded-lg text-indigo-400 hover:bg-white/5 transition-colors">
                         <Activity className="w-4 h-4" /> Metrics
                       </button>
                       <div className="flex gap-1.5 ml-2">
                         <div className="w-3 h-3 rounded-full bg-red-500/40 border border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.4)]"></div>
                         <div className="w-3 h-3 rounded-full bg-yellow-500/40 border border-yellow-500/50 shadow-[0_0_10px_rgba(234,179,8,0.4)]"></div>
                         <div className="w-3 h-3 rounded-full bg-emerald-500/40 border border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.4)]"></div>
                       </div>
                     </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-5 space-y-2 scrollbar-hide text-[13px] tracking-tight">
                    {terminalHistory.map((line, i) => (
                      <div key={i} className={`whitespace-pre-wrap break-words ${
                         line.startsWith('[SYSTEM]') ? 'text-purple-400 font-semibold drop-shadow-[0_0_8px_rgba(192,132,252,0.3)]' :
                         line.startsWith('[GIT]') ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]' :
                         line.startsWith('[LSP]') ? 'text-blue-400' :
                         line.startsWith('[AI]') ? 'text-purple-400 font-semibold' :
                         line.startsWith('[EXECUTE]') ? 'text-orange-400 font-semibold' :
                         line.startsWith('[ERROR]') || line.startsWith('bash:') ? 'text-red-400 font-bold' :
                         line.startsWith('>') ? 'text-white font-bold mt-4 mb-1' : ''
                      }`}>{line}</div>
                    ))}
                    <div ref={terminalEndRef} />
                  </div>
                  <div className="bg-[#121216] px-5 py-4 w-full border-t border-white/5 flex items-center gap-3">
                     <ChevronRight className="w-5 h-5 text-emerald-500 font-bold" />
                     <input className="flex-1 bg-transparent border-none text-[14px] text-white focus:outline-none placeholder-gray-600 font-mono tracking-wide" autoFocus placeholder="Execute command..." value={terminalInput} onChange={e => setTerminalInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleTerminalSubmit()} />
                  </div>
               </div>
            </motion.div>
          )}

          {/* SETTINGS VIEW */}
          {activeTab === "settings" && (
            <motion.div key="settings" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="absolute inset-0 overflow-y-auto pb-28 pt-10 px-7 scrollbar-hide bg-black w-full h-full mb-10">
              <div className="flex items-center gap-5 mb-10">
                <div className="p-4 bg-gradient-to-br from-indigo-500/20 to-purple-500/10 rounded-[24px] border border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.15)] relative">
                  <div className="absolute inset-0 bg-white/5 rounded-[24px] blur-sm" />
                  <Settings className="w-8 h-8 text-indigo-400 relative z-10" />
                </div>
                <div>
                  <h2 className="text-[26px] font-display font-medium text-white tracking-tight">Engine Config</h2>
                  <p className="text-[13px] text-gray-400 mt-1 font-medium">Orchestration Parameters</p>
                </div>
              </div>

              <div className="space-y-6">
                 {/* Core Settings */}
                 <div className="bg-[#050505] border border-white/5 rounded-[32px] p-6 shadow-[0_20px_40px_rgba(0,0,0,1)] ring-1 ring-white/5">
                   <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                     <Settings className="w-4 h-4 text-indigo-400" /> Editor Preferences
                   </h3>
                   <p className="text-[12px] text-gray-500 mb-6">Customize the workspace environment and text editor behavior.</p>
                   
                   <div className="space-y-3">
                     {[
                       { id: 'themeDark', label: 'Dark Theme', desc: 'Use the deep-contrast dark mode for the editor.' },
                       { id: 'autoSave', label: 'Auto-Save', desc: 'Automatically save file changes to the VFS.' },
                       { id: 'formatOnSave', label: 'Format on Save', desc: 'Run Prettier on file save.' }
                     ].map((setting) => (
                       <label key={setting.id} className="flex items-center justify-between p-4 rounded-[16px] bg-[#0a0a0a] border border-white/5 hover:border-white/10 transition-colors cursor-pointer group">
                         <div className="flex flex-col">
                           <span className="text-[14px] text-gray-200 font-medium">{setting.label}</span>
                           <span className="text-[11px] text-gray-500">{setting.desc}</span>
                         </div>
                         <div className="relative inline-flex items-center cursor-pointer">
                           <input type="checkbox" className="sr-only peer" checked={settings[setting.id as keyof typeof settings]} onChange={() => toggleSetting(setting.id as keyof typeof settings)} />
                           <div className="w-11 h-6 bg-white/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500/80"></div>
                         </div>
                       </label>
                     ))}
                   </div>
                 </div>

                 {/* System Settings */}
                 <div className="bg-[#050505] border border-white/5 rounded-[32px] p-6 shadow-[0_20px_40px_rgba(0,0,0,1)] ring-1 ring-white/5">
                   <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                     <Database className="w-4 h-4 text-blue-400" /> Engine & Storage
                   </h3>
                   <p className="text-[12px] text-gray-500 mb-6">Configure underlying performance and persistence parameters.</p>
                   
                   <div className="space-y-3">
                     {[
                       { id: 'useIndexedDB', label: 'IndexedDB File Manager', desc: 'Use high-performance IndexedDB for VFS mapping rather than localStorage.' },
                       { id: 'hardwareAcceleration', label: 'Hardware Acceleration', desc: 'Offload intensive tasks to GPU when decoding frames.' }
                     ].map((setting) => (
                       <label key={setting.id} className="flex items-center justify-between p-4 rounded-[16px] bg-[#0a0a0a] border border-white/5 hover:border-white/10 transition-colors cursor-pointer group">
                         <div className="flex flex-col">
                           <span className="text-[14px] text-gray-200 font-medium">{setting.label}</span>
                           <span className="text-[11px] text-gray-500">{setting.desc}</span>
                         </div>
                         <div className="relative inline-flex items-center cursor-pointer">
                           <input type="checkbox" className="sr-only peer" checked={settings[setting.id as keyof typeof settings]} onChange={() => toggleSetting(setting.id as keyof typeof settings)} />
                           <div className="w-11 h-6 bg-white/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500/80"></div>
                         </div>
                       </label>
                     ))}
                   </div>
                 </div>

                 {/* Secrets Config */}
                 <div className="bg-[#050505] border border-white/5 rounded-[32px] p-6 shadow-[0_20px_40px_rgba(0,0,0,1)] ring-1 ring-white/5">
                   <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                     <Settings className="w-4 h-4 text-pink-400" /> Secrets & Authentication
                   </h3>
                   <p className="text-[12px] text-gray-500 mb-6">Manage sensitive credentials for accessing private repositories.</p>
                   
                   <div className="space-y-4">
                     <div className="relative group">
                       <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center justify-between">
                         <span className="flex items-center gap-1.5"><FolderTree className="w-3 h-3 text-emerald-400" /> GitHub SSH Key</span>
                       </label>
                       <textarea 
                         value={githubSshKey}
                         onChange={e => {
                           setGithubSshKey(e.target.value);
                           setSshTestStatus("idle");
                         }}
                         placeholder="Begins with '-----BEGIN OPENSSH PRIVATE KEY-----'"
                         className="w-full bg-[#0a0a0a] text-emerald-400 border border-white/5 rounded-[16px] py-3 px-4 text-[13px] font-mono focus:outline-none focus:border-emerald-500/50 transition-colors h-32 resize-none shadow-inner"
                       />
                       <div className="text-[10px] text-gray-500 mt-2 flex items-center justify-between">
                          <span>Stored exclusively in local browser storage.</span>
                          <div className="flex items-center gap-3">
                            {sshTestStatus === "testing" && <span className="text-indigo-400 font-bold flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin"/> Testing...</span>}
                            {sshTestStatus === "success" && <span className="text-emerald-400 font-bold flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Valid Key</span>}
                            {sshTestStatus === "error" && <span className="text-red-400 font-bold flex items-center gap-1"><X className="w-3 h-3"/> Invalid Key</span>}
                            {githubSshKey.length > 0 && sshTestStatus === "idle" && <span className="text-emerald-400 font-bold">● Key Saved</span>}
                            <button onClick={handleTestSsh} disabled={!githubSshKey || sshTestStatus === "testing"} className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded-full text-white tracking-widest uppercase font-bold disabled:opacity-50 transition-colors">Test Connection</button>
                          </div>
                       </div>
                     </div>
                   </div>
                 </div>
                 
                 {/* AI Providers & Models */}
                 <div className="bg-[#050505] border border-white/5 rounded-[32px] p-6 shadow-[0_20px_40px_rgba(0,0,0,1)] ring-1 ring-white/5">
                   <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                     <BrainCircuit className="w-4 h-4 text-purple-400" /> AI Providers & Models
                   </h3>
                   <p className="text-[12px] text-gray-500 mb-6">Select your orchestration engine and configure the associated model.</p>
                   
                   <div className="space-y-6">
                     <div className="flex flex-col gap-2">
                       <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Provider</label>
                       <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                         {['gemini', 'claude', 'openai', 'mistral'].map(p => (
                           <button 
                             key={p} 
                             onClick={() => setActiveProvider(p)}
                             className={`px-3 py-2.5 rounded-[12px] text-[11px] font-bold uppercase tracking-wider transition-all flex items-center justify-center ${activeProvider === p ? 'bg-purple-500/20 text-purple-400 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.15)] ring-1 ring-purple-500/50' : 'bg-white/5 text-gray-500 border-white/5 hover:text-gray-300 hover:bg-white/10'} border`}
                           >
                             {p}
                           </button>
                         ))}
                       </div>
                     </div>

                     {[
                       { id: 'gemini', label: 'Gemini (Google)', keyPlaceholder: 'AIza...', defaultModel: 'gemini-2.5-flash' },
                       { id: 'claude', label: 'Claude (Anthropic)', keyPlaceholder: 'sk-ant-...', defaultModel: 'claude-3-5-sonnet-20241022' },
                       { id: 'openai', label: 'OpenAI', keyPlaceholder: 'sk-...', defaultModel: 'gpt-4o' },
                       { id: 'mistral', label: 'Mistral AI', keyPlaceholder: '...', defaultModel: 'mistral-large-latest' }
                     ].map(provider => (
                       activeProvider === provider.id && (
                         <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} key={provider.id} className="space-y-4 pt-2 border-t border-white/5">
                           <div className="relative group">
                             <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center justify-between">
                               <span className="flex items-center gap-1.5 text-purple-400">{provider.label} API Key</span>
                             </label>
                             <input
                               type="password"
                               value={apiKeys[provider.id as keyof typeof apiKeys] || ''}
                               onChange={e => setApiKeys(prev => ({...prev, [provider.id]: e.target.value}))}
                               placeholder={provider.keyPlaceholder}
                               className="w-full bg-[#0a0a0a] text-purple-300 border border-white/5 rounded-[12px] py-2.5 px-4 text-[13px] font-mono focus:outline-none focus:border-purple-500/50 transition-colors shadow-inner"
                             />
                           </div>
                           <div className="relative group">
                             <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center justify-between">
                               <span className="flex items-center gap-1.5">{provider.label} Model Name</span>
                             </label>
                             <input
                               type="text"
                               value={models[provider.id as keyof typeof models] || ''}
                               onChange={e => setModels(prev => ({...prev, [provider.id]: e.target.value}))}
                               placeholder={`e.g. ${provider.defaultModel}`}
                               className="w-full bg-[#0a0a0a] text-gray-300 border border-white/5 rounded-[12px] py-2.5 px-4 text-[13px] font-mono focus:outline-none focus:border-white/20 transition-colors shadow-inner"
                             />
                           </div>
                         </motion.div>
                       )
                     ))}
                   </div>
                 </div>
              </div>
            </motion.div>
          )}
          
          {/* TASKS VIEW */}
          {activeTab === "tasks" && (
            <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="absolute inset-0 flex flex-col pt-16 bg-[#050505]">
              <div className="flex-1 overflow-y-auto px-6 pb-24 scrollbar-hide">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-[12px] bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                      <ListTodo className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-display font-medium text-white tracking-tight">Project Tasks</h2>
                      <p className="text-xs text-gray-500 font-mono">Manage your workflow</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="bg-white/5 rounded-full p-1 flex">
                      <button onClick={() => setTaskView("list")} className={`p-1.5 rounded-full transition-colors ${taskView === "list" ? "bg-white/10 text-white" : "text-gray-500"}`}><ListTodo className="w-4 h-4" /></button>
                      <button onClick={() => setTaskView("kanban")} className={`p-1.5 rounded-full transition-colors ${taskView === "kanban" ? "bg-white/10 text-white" : "text-gray-500"}`}><Kanban className="w-4 h-4" /></button>
                    </div>
                    <button onClick={() => setIsAddingTask(true)} className="w-9 h-9 rounded-full bg-indigo-500 hover:bg-indigo-600 text-white flex items-center justify-center shadow-lg transition-colors"><Plus className="w-5 h-5" /></button>
                  </div>
                </div>

                {isAddingTask && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-[#111] border border-white/10 p-4 rounded-[16px] mb-6">
                    <input autoFocus type="text" placeholder="Task title..." value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} onKeyDown={e => {
                      if (e.key === 'Enter' && newTaskTitle) {
                        setTasks([...tasks, { id: `t-${Date.now()}`, title: newTaskTitle, description: "", status: "todo", priority: "medium", assignee: "Unassigned", dueDate: "" }]);
                        setNewTaskTitle("");
                        setIsAddingTask(false);
                        hapticVibrate(15);
                      } else if (e.key === 'Escape') setIsAddingTask(false);
                    }} className="w-full bg-transparent text-sm text-white placeholder-gray-500 outline-none font-medium mb-3" />
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] text-gray-500 font-mono">Press Enter to save, Esc to cancel</p>
                      <div className="flex gap-2">
                        <button onClick={() => setIsAddingTask(false)} className="px-3 py-1.5 rounded-full text-[10px] uppercase tracking-widest text-gray-400 hover:text-white transition-colors">Cancel</button>
                        <button onClick={() => { if(newTaskTitle){ setTasks([...tasks, { id: `t-${Date.now()}`, title: newTaskTitle, description: "", status: "todo", priority: "medium", assignee: "Unassigned", dueDate: "" }]); setNewTaskTitle(""); setIsAddingTask(false); hapticVibrate(15); } }} className="px-3 py-1.5 rounded-full bg-indigo-500 hover:bg-indigo-600 text-white text-[10px] uppercase tracking-widest font-bold transition-colors">Save</button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {taskView === "list" ? (
                  <div className="space-y-2">
                    {tasks.map(t => (
                      <div key={t.id} className={`group bg-[#111] border border-white/5 hover:border-white/10 rounded-[12px] p-3 flex items-center gap-3 transition-colors cursor-pointer ${t.status === 'archived' ? 'opacity-50' : ''}`} onClick={() => setTasks(tasks.map(x => x.id === t.id ? { ...x, status: x.status === "done" ? "todo" : "done", completedAt: x.status !== "done" ? new Date().toISOString() : undefined } : x))}>
                        <button className={`shrink-0 w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${t.status === "done" || t.status === "archived" ? "bg-emerald-500 border-emerald-500 text-white" : "border-white/20 text-transparent"}`}>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium leading-tight truncate transition-colors ${t.status === "done" || t.status === "archived" ? "text-gray-500 line-through" : "text-white"}`}>{t.title} {t.status === "archived" && <span className="ml-2 text-xs font-mono text-purple-400 uppercase tracking-wider">(Archived)</span>}</p>
                          {(t.assignee !== "Unassigned" || t.dueDate || t.completedAt) && (
                            <div className="flex items-center gap-3 mt-1.5 text-[10px] text-gray-500 font-mono">
                              {t.assignee !== "Unassigned" && <span className="flex items-center gap-1"><Circle className="w-3 h-3" /> {t.assignee}</span>}
                              {t.dueDate && <span className="flex items-center gap-1 text-indigo-400"><Calendar className="w-3 h-3" /> {t.dueDate}</span>}
                              {t.status === "archived" && t.completedAt && <span className="flex items-center gap-1 text-purple-400">Archived {new Date(t.completedAt).toLocaleDateString()}</span>}
                            </div>
                          )}
                        </div>
                        <div className={`shrink-0 px-2 py-0.5 rounded text-[9px] uppercase tracking-widest font-bold ${t.priority === 'high' ? 'bg-red-500/10 text-red-400' : t.priority === 'medium' ? 'bg-amber-500/10 text-amber-400' : 'bg-blue-500/10 text-blue-400'}`}>{t.priority}</div>
                      </div>
                    ))}
                    {tasks.length === 0 && <div className="text-center py-10 text-xs text-gray-500 font-mono">No tasks yet.</div>}
                  </div>
                ) : (
                  <div className="flex flex-col gap-6">
                    {(["todo", "in-progress", "done", "archived"] as TaskStatus[]).map(status => {
                      const statusTasks = tasks.filter(t => t.status === status);
                      if (status === "archived" && statusTasks.length === 0) return null; // hide archive if empty
                      
                      return (
                      <div key={status} className={`bg-[#0a0a0a] rounded-[16px] border border-white/5 p-4 ${status === 'archived' ? 'opacity-70 grayscale' : ''}`}>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-[11px] uppercase tracking-widest font-bold text-gray-400 flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${status === 'todo' ? 'bg-gray-500' : status === 'in-progress' ? 'bg-amber-500' : status === 'done' ? 'bg-emerald-500' : 'bg-purple-500'}`} />
                            {status.replace('-', ' ')}
                            <span className="text-gray-600 bg-white/5 px-1.5 rounded">{statusTasks.length}</span>
                          </h3>
                        </div>
                        <div className="space-y-2">
                          {statusTasks.map(t => (
                            <div key={t.id} className="bg-[#111] border border-white/5 rounded-[12px] p-3 active:scale-[0.98] transition-transform">
                              <p className="text-sm font-medium text-white leading-snug mb-2">{t.title}</p>
                              {t.description && <p className="text-xs text-gray-500 line-clamp-2 mb-3">{t.description}</p>}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className={`w-2 h-2 rounded-full ${t.priority === 'high' ? 'bg-red-500' : t.priority === 'medium' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                                  <span className="text-[10px] text-gray-500 font-mono">{t.assignee}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  {status !== "archived" && (
                                    <button onClick={() => {
                                      const nextStatus = status === 'todo' ? 'in-progress' : status === 'in-progress' ? 'done' : 'todo';
                                      const completedAt = nextStatus === 'done' ? new Date().toISOString() : undefined;
                                      setTasks(tasks.map(x => x.id === t.id ? { ...x, status: nextStatus, completedAt } : x));
                                    }} className="text-[10px] text-gray-600 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-2 py-1 rounded">Move</button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                          {statusTasks.length === 0 && (
                            <div className="border border-dashed border-white/10 rounded-[12px] p-4 text-center">
                              <p className="text-[11px] text-gray-600 font-mono">No tasks</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )})}
                  </div>
                )}
              </div>
            </motion.div>
          )}
          
          {activeTab === "plugins" && (
            <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="absolute inset-0 flex flex-col pt-16 bg-[#0a0a0a]">
              <div className="flex-1 overflow-y-auto px-6 pb-24 scrollbar-hide">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-[12px] bg-purple-500/20 flex items-center justify-center text-purple-400">
                    <Puzzle className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-display font-medium text-white tracking-tight">Plugin Marketplace</h2>
                    <p className="text-xs text-gray-500 font-mono">Extend NexusCode capabilities</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mb-6">
                  {(["discover", "installed", "upload"] as const).map(m => (
                    <button key={m} onClick={() => setPluginMode(m)} className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-colors ${pluginMode === m ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>
                      {m}
                    </button>
                  ))}
                </div>

                {pluginMode === "discover" && (
                  <div className="space-y-4">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input type="text" placeholder="Search extensions..." value={pluginSearch} onChange={e => setPluginSearch(e.target.value)} className="w-full bg-white/5 border border-white/5 rounded-[12px] py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-purple-500/50" />
                    </div>
                    {plugins.filter(p => p.name.toLowerCase().includes(pluginSearch.toLowerCase()) && !p.isInstalled).length === 0 ? (
                       <div className="text-center py-12 text-gray-500 text-sm">No new plugins found.</div>
                    ) : (
                      plugins.filter(p => p.name.toLowerCase().includes(pluginSearch.toLowerCase()) && !p.isInstalled).map(p => (
                        <div key={p.id} className="p-4 rounded-[16px] bg-[#111] border border-white/5 hover:border-white/10 transition-colors flex flex-col gap-3">
                           <div className="flex justify-between items-start">
                             <div>
                               <h4 className="text-sm font-bold text-white leading-tight">{p.name}</h4>
                               <p className="text-[11px] text-gray-500 mt-0.5">by {p.author}</p>
                             </div>
                             <button onClick={() => { setPlugins(prev => prev.map(pl => pl.id === p.id ? { ...pl, isInstalled: true } : pl)); setPluginMode('installed'); hapticVibrate([40, 50, 40]); }} className="px-3 py-1.5 rounded-full bg-white text-black hover:bg-gray-200 text-[10px] uppercase font-bold tracking-widest transition-colors flex items-center gap-1">
                               <DownloadCloud className="w-3 h-3" /> Install
                             </button>
                           </div>
                           <p className="text-[12px] text-gray-400 leading-relaxed max-w-[90%]">{p.description}</p>
                           <div className="flex items-center justify-between mt-1">
                             <div className="flex items-center gap-4 text-[10px] text-gray-500 font-mono tracking-tight pt-2">
                               <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-500 fill-current" /> {p.rating.toFixed(1)}</span>
                               <span className="flex items-center gap-1"><DownloadCloud className="w-3 h-3" /> {p.downloads.toLocaleString()}</span>
                               <span className={`px-1.5 rounded ${p.price === 'Free' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>{p.price}</span>
                             </div>
                             <button onClick={() => setReviewPluginId(p.id)} className="text-[10px] text-gray-400 hover:text-white uppercase font-bold tracking-widest pt-2">
                               View Reviews
                             </button>
                           </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {pluginMode === "installed" && (
                   <div className="space-y-4">
                     {plugins.filter(p => p.isInstalled).length === 0 ? (
                       <div className="text-center py-12 text-gray-500 text-sm">No plugins installed yet.</div>
                     ) : (
                       plugins.filter(p => p.isInstalled).map(p => (
                         <div key={p.id} className="p-4 rounded-[16px] bg-[#111] border border-emerald-500/20 flex flex-col gap-3 relative overflow-hidden group">
                           <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[50px] pointer-events-none" />
                           <div className="flex justify-between items-start relative z-10">
                             <div className="flex items-center gap-2">
                               <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                                 <CheckCircle2 className="w-4 h-4" />
                               </div>
                               <div>
                                 <h4 className="text-sm font-bold text-white leading-tight">{p.name}</h4>
                                 <p className="text-[11px] text-gray-500 mt-0.5">by {p.author}</p>
                               </div>
                             </div>
                             <button onClick={() => setPlugins(prev => prev.map(pl => pl.id === p.id ? { ...pl, isInstalled: false } : pl))} className="px-3 py-1.5 rounded-full border border-red-500/20 text-red-400 hover:bg-red-500/10 text-[10px] uppercase font-bold tracking-widest transition-colors flex items-center gap-1">
                               <Trash2 className="w-3 h-3" /> Uninstall
                             </button>
                           </div>
                           <p className="text-[12px] text-gray-400 pl-10 relative z-10">{p.description}</p>
                           
                           {/* Reviews Section Quick Actions */}
                           <div className="pl-10 pt-3 border-t border-white/5 mt-2 space-y-2 relative z-10">
                             <div className="flex items-center justify-between">
                               <h5 className="text-[10px] uppercase font-bold tracking-widest text-gray-500">Reviews ({p.reviews.length})</h5>
                               <button onClick={() => setReviewPluginId(p.id)} className="text-[10px] uppercase font-bold text-indigo-400 hover:text-indigo-300">Add Review</button>
                             </div>
                             {p.reviews.map((r, i) => (
                               <div key={i} className="bg-white/5 rounded-lg p-2.5 text-[11px] mt-2 border border-white/5">
                                 <div className="flex items-center justify-between mb-1">
                                   <strong className="text-white">{r.user}</strong>
                                   <div className="flex gap-0.5 text-amber-500">{Array.from({ length: 5 }).map((_, j) => <Star key={j} className={`w-2.5 h-2.5 ${j < r.rating ? 'fill-current' : 'text-gray-600'}`} />)}</div>
                                 </div>
                                 <p className="text-gray-400">{r.comment}</p>
                               </div>
                             ))}
                           </div>
                         </div>
                       ))
                     )}
                   </div>
                )}

                {pluginMode === "upload" && (
                   <div className="space-y-4 max-w-sm">
                     <p className="text-[12px] text-gray-400 leading-relaxed mb-4">Submit a new plugin to the Nexus Marketplace.</p>
                     <div className="space-y-3">
                       <input type="text" placeholder="Plugin Name" value={newPluginData.name} onChange={e => setNewPluginData({...newPluginData, name: e.target.value})} className="w-full bg-[#111] border border-white/5 rounded-[12px] py-3 px-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors" />
                       <input type="text" placeholder="Author Name" value={newPluginData.author} onChange={e => setNewPluginData({...newPluginData, author: e.target.value})} className="w-full bg-[#111] border border-white/5 rounded-[12px] py-3 px-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors" />
                       <textarea placeholder="Description" rows={3} value={newPluginData.description} onChange={e => setNewPluginData({...newPluginData, description: e.target.value})} className="w-full bg-[#111] border border-white/5 rounded-[12px] py-3 px-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 resize-none transition-colors" />
                       <div className="flex items-center justify-between gap-4">
                         <select value={newPluginData.price} onChange={e => setNewPluginData({...newPluginData, price: e.target.value})} className="bg-[#111] border border-white/5 rounded-[12px] py-3 px-4 text-sm text-white focus:outline-none focus:border-indigo-500/50">
                           <option>Free</option>
                           <option>Pro</option>
                         </select>
                         <button 
                           onClick={() => {
                             if (newPluginData.name) {
                               const newPlugin: Plugin = { id: `ext-${Date.now()}`, ...newPluginData, rating: 0, downloads: 0, isInstalled: true, reviews: [] };
                               setPlugins(prev => [newPlugin, ...prev]);
                               setPluginMode('installed');
                               setNewPluginData({ name: "", description: "", author: "", price: "Free" });
                               hapticVibrate([40, 50, 40]);
                             }
                           }}
                           disabled={!newPluginData.name}
                           className="flex-1 bg-white text-black hover:bg-gray-200 py-3 rounded-[12px] font-bold text-sm tracking-wide disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                         >
                           <Upload className="w-4 h-4" /> Publish
                         </button>
                       </div>
                     </div>
                   </div>
                )}
                
              </div>

              {/* Review Modal */}
              <AnimatePresence>
                {reviewPluginId && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-x-0 bottom-0 top-0 bg-black/80 z-[100] flex items-center justify-center p-6 backdrop-blur-md">
                    <motion.div initial={{ y: 20, scale: 0.95 }} animate={{ y: 0, scale: 1 }} className="w-full max-w-sm bg-[#111] border border-white/10 rounded-[24px] p-6 shadow-2xl">
                      <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-4">
                        <h3 className="text-white font-bold text-lg font-display">Plugin Review</h3>
                        <button onClick={() => setReviewPluginId(null)} className="p-1.5 rounded-[10px] bg-white/5 hover:bg-white/10 text-gray-400 transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      
                      {(() => {
                        const plugin = plugins.find(p => p.id === reviewPluginId);
                        return plugin ? (
                          <>
                            <div className="mb-6">
                              <h4 className="text-white font-medium text-sm">{plugin.name}</h4>
                              <p className="text-gray-500 text-[11px]">Leave a review for this plugin.</p>
                            </div>
                            
                            {plugin.isInstalled ? (
                              <>
                                <div className="flex gap-2 mb-6 justify-center">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <button key={i} onClick={() => setReviewData(prev => ({ ...prev, rating: i + 1 }))} className="p-2 transition-all hover:scale-110 active:scale-95">
                                      <Star className={`w-8 h-8 ${i < reviewData.rating ? 'text-amber-500 fill-current drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'text-white/10'}`} />
                                    </button>
                                  ))}
                                </div>
                                <textarea placeholder="Share your experience..." rows={4} value={reviewData.comment} onChange={e => setReviewData({...reviewData, comment: e.target.value})} className="w-full bg-[#050505] border border-white/5 rounded-[12px] py-3 px-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 resize-none mb-4 transition-colors" />
                                <button 
                                  onClick={() => {
                                    setPlugins(prev => prev.map(p => p.id === reviewPluginId ? { ...p, reviews: [{ user: "NexusUser", rating: reviewData.rating, comment: reviewData.comment || "No comment." }, ...p.reviews] } : p));
                                    setReviewPluginId(null);
                                    setReviewData({ rating: 5, comment: "" });
                                    hapticVibrate([40, 50, 40]);
                                  }}
                                  className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-3 rounded-[12px] font-bold text-[12px] uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                                >
                                  <Heart className="w-4 h-4" /> Submit Review
                                </button>
                              </>
                            ) : (
                              <div className="space-y-4">
                               <div className="max-h-40 overflow-y-auto pr-2 space-y-2 scrollbar-hide">
                                 {plugin.reviews.length === 0 ? <p className="text-gray-500 text-xs">No reviews yet.</p> : plugin.reviews.map((r, idx) => (
                                   <div key={idx} className="bg-white/5 rounded-lg p-2.5 text-[11px] border border-white/5">
                                     <div className="flex items-center justify-between mb-1">
                                       <strong className="text-white">{r.user}</strong>
                                       <div className="flex gap-0.5 text-amber-500">{Array.from({ length: 5 }).map((_, j) => <Star key={j} className={`w-2 h-2 ${j < r.rating ? 'fill-current' : 'text-gray-600'}`} />)}</div>
                                     </div>
                                     <p className="text-gray-400">{r.comment}</p>
                                   </div>
                                 ))}
                               </div>
                               <div className="pt-4 border-t border-white/5">
                                 <p className="text-amber-500/80 text-[11px] flex items-center gap-2 bg-amber-500/10 p-2 rounded-lg">
                                   <Info className="w-4 h-4 shrink-0" />
                                   Install this plugin to leave your own review.
                                 </p>
                               </div>
                              </div>
                            )}
                          </>
                        ) : null;
                      })()}
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

            </motion.div>
          )}

         </AnimatePresence>
        </main>

        {/* Global Navigation - Float over content */}
        {!isZenMode && (
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
        )}

        {/* Home Indicator */}
        <div className="absolute w-full bottom-0 h-4 flex justify-center items-end pb-1.5 z-50 pointer-events-none">
          <div className="w-24 h-[5px] bg-white/30 rounded-full" />
        </div>

      </motion.div>

      {/* Floating AI Panel */}
      <AnimatePresence>
        {isAiPanelOpen && (
          <div className="absolute inset-0 pointer-events-none z-[200] overflow-hidden">
            <Rnd
              default={{
                x: typeof window !== "undefined" && window.innerWidth > 1000 ? (window.innerWidth * 0.95 > 1400 ? 1000 : window.innerWidth * 0.95 - 400) : 20,
                y: 40,
                width: Math.min(380, typeof window !== 'undefined' ? window.innerWidth - 30 : 380),
                height: Math.min(600, typeof window !== 'undefined' ? window.innerHeight - 80 : 600)
              }}
              minWidth={Math.min(320, typeof window !== 'undefined' ? window.innerWidth - 30 : 320)}
              minHeight={400}
              bounds="parent"
              className="pointer-events-auto shadow-[0_30px_100px_rgba(0,0,0,1)] rounded-[32px]"
              dragHandleClassName="drag-handle"
            >
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-[100vw] h-full bg-[#050505]/95 backdrop-blur-3xl sm:rounded-[32px] rounded-[32px] mx-auto shadow-[0_-30px_100px_rgba(0,0,0,0.9)] border border-indigo-500/20 flex flex-col overflow-hidden ring-1 ring-white/10">
             
             {/* Header */}
             <div className="drag-handle flex-none p-5 flex justify-center items-center border-b border-white/5 relative bg-gradient-to-b from-indigo-500/5 to-transparent cursor-move">
               <div className="absolute top-2 w-12 h-1 bg-white/20 rounded-full" />
               <div className="mt-2 flex items-center justify-between w-full px-0 sm:px-2">
                 <div className="flex items-center gap-3.5">
                   <div className="w-11 h-11 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                     <Sparkles className="w-5 h-5 text-indigo-400" />
                   </div>
                   <div className="flex flex-col relative">
                     <span className="font-bold text-white text-[16px] tracking-tight">Nexus AI</span>
                     <button 
                       onClick={() => setIsProviderMenuOpen(!isProviderMenuOpen)}
                       className="text-[11px] text-emerald-400 font-mono tracking-tight flex items-center gap-1.5 hover:text-emerald-300 transition-colors uppercase cursor-pointer"
                     >
                       <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-[0_0_5px_currentColor] pointer-events-none" />
                       {activeProvider}
                       <ChevronDown className="w-3 h-3 ml-0.5 opacity-70" />
                     </button>
                     <AnimatePresence>
                       {isProviderMenuOpen && (
                         <motion.div 
                           initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                           className="absolute top-full left-0 mt-2 w-32 bg-[#0a0a0a] border border-white/10 rounded-[12px] shadow-2xl overflow-hidden z-[300]"
                         >
                           {['gemini', 'claude', 'openai', 'mistral'].map(p => (
                             <button
                               key={p}
                               onClick={() => {
                                 setActiveProvider(p);
                                 setIsProviderMenuOpen(false);
                               }}
                               className={`w-full text-left px-3 py-2 text-[10px] uppercase font-bold tracking-widest transition-colors ${activeProvider === p ? 'bg-purple-500/20 text-purple-400' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                             >
                               {p}
                             </button>
                           ))}
                         </motion.div>
                       )}
                     </AnimatePresence>
                   </div>
                 </div>
                 <button onPointerDown={(e) => e.stopPropagation()} onClick={() => setIsAiPanelOpen(false)} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                   <X className="w-5 h-5" />
                 </button>
               </div>
             </div>

             {/* Chat History */}
             <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-hide mb-2 relative">
               {messages.map((m, i) => (
                 <div key={i} className={`flex w-full ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                   <div className={`max-w-[85%] overflow-hidden break-words break-all whitespace-pre-wrap rounded-[24px] px-5 py-3.5 text-[14px] leading-relaxed relative border ${
                     m.role === 'user' 
                       ? 'bg-indigo-600 bg-opacity-90 border-indigo-500 text-white rounded-br-sm shadow-[0_5px_15px_rgba(99,102,241,0.2)]' 
                       : 'bg-[#0a0a0a] border-white/10 text-gray-200 rounded-bl-sm shadow-[0_5px_15px_rgba(0,0,0,0.8)]'
                   }`}>
                      {m.content}
                   </div>
                 </div>
               ))}
               {isChatLoading && (
                 <div className="flex w-full justify-start">
                   <div className="max-w-[80%] rounded-[24px] bg-[#0a0a0a] border border-white/10 rounded-bl-sm px-6 py-4 shadow-lg">
                     <span className="flex gap-2">
                       <motion.span animate={{ y: [0, -6, 0], scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0 }} className="w-2.5 h-2.5 bg-indigo-500 rounded-full" />
                       <motion.span animate={{ y: [0, -6, 0], scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }} className="w-2.5 h-2.5 bg-purple-500 rounded-full" />
                       <motion.span animate={{ y: [0, -6, 0], scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }} className="w-2.5 h-2.5 bg-indigo-400 rounded-full" />
                     </span>
                   </div>
                 </div>
               )}
               <div ref={messagesEndRef} className="h-4" />
             </div>

             {/* Chat Input */}
             <div className="flex-none p-5 bg-gradient-to-t from-[#050505] to-transparent pt-8 -mt-6 z-10 relative">
                <div className="relative flex items-center bg-[#0a0a0a] border border-indigo-500/30 rounded-[32px] overflow-hidden p-1.5 focus-within:ring-2 focus-within:ring-indigo-500/70 shadow-[0_0_20px_rgba(99,102,241,0.1)] transition-all">
                  <input 
                    ref={chatInputRef as any}
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleSendChat(); } }}
                    placeholder="Ask Nexus AI..."
                    className="flex-1 w-full bg-transparent border-none text-[15px] font-medium text-white focus:outline-none h-[44px] py-1 px-5 placeholder-gray-500 min-w-0"
                  />
                  <button onClick={() => handleSendChat()} disabled={!chatInput.trim() || isChatLoading} className="w-11 h-11 shrink-0 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all outline-none disabled:opacity-50 disabled:hover:scale-100 mr-0.5 shadow-lg">
                    <Send className="w-4 h-4 ml-0.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </Rnd>
          </div>
        )}
      </AnimatePresence>

      
    </div>
  );
}
