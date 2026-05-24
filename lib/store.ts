import { create } from 'zustand';
import { nexus } from './engine';
import { vfs } from './vfs';
import { telemetry } from './telemetry';
import { rag } from './rag';
import { causal } from './causal';

export type TabType = "editor" | "files" | "terminal" | "settings" | "git" | "preview" | "graph" | "dashboard" | "plugins" | "tasks" | "devops";

interface NexusState {
  // Navigation
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  isAiPanelOpen: boolean;
  setIsAiPanelOpen: (open: boolean) => void;
  isZenMode: boolean;
  toggleZenMode: () => void;
  
  // Files
  files: Record<string, string>;
  originalFiles: Record<string, string>;
  activeFile: string | null;
  setActiveFile: (path: string | null) => void;
  setFiles: (files: Record<string, string>) => void;
  updateFile: (path: string, content: string) => void;
  saveFile: () => Promise<void>;
  
  // AI
  messages: {role: 'user' | 'ai', content: string}[];
  isChatLoading: boolean;
  activeProvider: string;
  apiKeys: Record<string, string>;
  models: Record<string, string>;
  setApiKeys: (keys: Record<string, string>) => void;
  setActiveProvider: (provider: string) => void;
  setModels: (models: Record<string, string>) => void;
  sendChatMessage: (input: string) => Promise<void>;
  
  // UI / Logic
  isEditMode: boolean;
  setIsEditMode: (edit: boolean) => void;
  isRunning: boolean;
  runCode: () => Promise<void>;
  
  // Init
  init: () => Promise<void>;
}

export const useNexusStore = create<NexusState>((set, get) => ({
  activeTab: "editor",
  setActiveTab: (tab) => set({ activeTab: tab }),
  isAiPanelOpen: false,
  setIsAiPanelOpen: (open) => set({ isAiPanelOpen: open }),
  isZenMode: false,
  toggleZenMode: () => set((state) => ({ isZenMode: !state.isZenMode })),
  
  files: {},
  originalFiles: {},
  activeFile: null,
  setActiveFile: (path) => set({ activeFile: path, activeTab: "editor" }),
  setFiles: (files) => set({ files }),
  updateFile: (path, content) => set((state) => ({
    files: { ...state.files, [path]: content }
  })),
  
  messages: [{ role: 'ai', content: "Hello! I am Nexus AI. Ready for industrial-grade coding." }],
  isChatLoading: false,
  activeProvider: 'gemini',
  apiKeys: { gemini: '', claude: '', openai: '', mistral: '' },
  models: { gemini: 'gemini-2.5-flash', claude: 'claude-3-5-sonnet-20241022', openai: 'gpt-4o', mistral: 'mistral-large-latest' },
  
  setApiKeys: (apiKeys) => {
    set({ apiKeys });
    localStorage.setItem("nexus-api-keys", JSON.stringify(apiKeys));
  },
  
  setActiveProvider: (activeProvider) => {
    set({ activeProvider });
    localStorage.setItem("nexus-provider", activeProvider);
  },

  setModels: (models) => {
    set({ models });
    localStorage.setItem("nexus-models", JSON.stringify(models));
  },
  
  isEditMode: false,
  setIsEditMode: (isEditMode) => set({ isEditMode }),
  isRunning: false,
  
  init: async () => {
    try {
      await nexus.init();
      await vfs.init();

      // Persistence: Load settings
      const savedKeys = localStorage.getItem("nexus-api-keys");
      const savedProvider = localStorage.getItem("nexus-provider");
      const savedModels = localStorage.getItem("nexus-models");
      
      if (savedKeys) set({ apiKeys: JSON.parse(savedKeys) });
      if (savedProvider) set({ activeProvider: savedProvider });
      if (savedModels) set({ models: JSON.parse(savedModels) });

      const savedFiles = await vfs.getAllFiles();
      if (Object.keys(savedFiles).length > 0) {
        set({ files: savedFiles, originalFiles: savedFiles });
        rag.indexWorkspace(savedFiles);
        // Set first file as active if none
        if (!get().activeFile) set({ activeFile: Object.keys(savedFiles)[0] });
      } else {
        // Factory reset default file
        const defaultPath = "README.md";
        const defaultContent = "# Welcome to NexusCode\n\nYour industrial IDE is ready.";
        await vfs.writeFile(defaultPath, defaultContent);
        set({ 
          files: { [defaultPath]: defaultContent }, 
          originalFiles: { [defaultPath]: defaultContent },
          activeFile: defaultPath
        });
      }
    } catch (e) {
      telemetry.captureException(e);
    }
  },

  saveFile: async () => {
    const { activeFile, files } = get();
    if (!activeFile) return;
    const content = files[activeFile];
    
    try {
      await vfs.writeFile(activeFile, content);
      set((state) => ({ originalFiles: { ...state.originalFiles, [activeFile]: content } }));
      
      causal.analyzeImpact(activeFile, files).then(impact => {
         console.log(`[Causal] Analysis complete. Impact: ${impact.length} files.`);
      });
      rag.indexWorkspace(files);
      telemetry.logPerformance("file_save", 1);
    } catch (e) {
      telemetry.captureException(e);
    }
  },

  runCode: async () => {
    const { activeFile, files, isRunning } = get();
    if (!activeFile || isRunning) return;
    set({ isRunning: true });
    try {
      const res = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          code: files[activeFile], 
          language: activeFile.split('.').pop() 
        })
      });
      const data = await res.json();
      console.log("[Execution Output]", data.output);
    } finally {
      set({ isRunning: false });
    }
  },

  sendChatMessage: async (input) => {
    const { activeProvider, apiKeys, models, messages, files, activeFile } = get();
    set({ isChatLoading: true, messages: [...messages, { role: 'user', content: input }] });
    
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: input,
          provider: activeProvider,
          apiKeys,
          models,
          context: activeFile ? files[activeFile] : ""
        })
      });
      const data = await res.json();
      set((state) => ({ 
        messages: [...state.messages, { role: 'ai', content: data.content }],
        isChatLoading: false 
      }));
    } catch (e) {
      set({ isChatLoading: false });
      telemetry.captureException(e);
    }
  }
}));
