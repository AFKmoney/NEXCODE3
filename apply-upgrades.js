const fs = require('fs');

let content = fs.readFileSync('app/page.tsx', 'utf8');

// 1. ADD PRISMJS TO RENDERCODEVIEW FOR HIGHLIGHTING
if (!content.includes('import Prism from "prismjs"')) {
  content = content.replace('import * as diff from "diff";', 'import * as diff from "diff";\nimport Prism from "prismjs";\nimport "prismjs/themes/prism-tomorrow.css";\nimport "prismjs/components/prism-typescript";\nimport "prismjs/components/prism-rust";\nimport "prismjs/components/prism-python";\nimport "prismjs/components/prism-bash";');
}

// Ensure the split view state exists
if (!content.includes('const [isSplitView, setIsSplitView]')) {
  // Add state
  content = content.replace('const [isEditMode, setIsEditMode] = useState(false);', 'const [isEditMode, setIsEditMode] = useState(false);\n  const [isSplitView, setIsSplitView] = useState(false);');
}

if (!content.includes('const toggleSetting = (key: keyof typeof settings)')) {
   // Assuming old state, but user already ran my refactoring from before which used toggleSettings
}

const renderCodeViewRegex = /const renderCodeView = \(\) => \{\s*if \(isEditMode\) \{[\s\S]*?<textarea[\s\S]*?\/>\s*\);\s*\}/;

const newRenderCodeView = `
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
         className={\`flex px-1 hover:bg-white/5 cursor-text \${highlightLines.includes(i) ? 'bg-indigo-500/20' : ''}\`}
       >
         <div className="w-8 shrink-0 text-right pr-2 text-gray-600 select-none text-[10px] py-[2px] tabular-nums">{i + 1}</div>
         <div className="whitespace-pre py-[1px] font-mono text-[14px]" dangerouslySetInnerHTML={{__html: html || " "}} />
       </div>
    );
  };

  const renderCodeView = () => {
    if (isEditMode) {
      return (
        <div className={\`flex w-full h-[120%] \${isSplitView ? 'flex-row' : 'flex-col'}\`}>
        <textarea
          value={activeCode}
          onChange={(e) => setFiles(p => ({...p, [activeFile as string]: e.target.value}))}
          spellCheck={false}
          className={\`h-full bg-transparent text-[#abb2bf] font-mono text-[14px] leading-[1.6] px-5 py-0 focus:outline-none resize-none caret-indigo-500 shadow-none outline-none border-none \${isSplitView ? 'w-1/2 border-r border-white/10' : 'w-full'}\`}
        />
        {isSplitView && (
           <div className="w-1/2 h-full overflow-y-auto px-5 opacity-80 pointer-events-none">
              <pre className="font-mono text-[14px] leading-[1.6]"><code dangerouslySetInnerHTML={{__html: Prism.highlight(activeCode, Prism.languages.typescript || Prism.languages.javascript, 'typescript')}}></code></pre>
           </div>
        )}
        </div>
      );
    }
`;

content = content.replace(renderCodeViewRegex, newRenderCodeView);

// Enhance regular code rendering to use the new highlighted line rendering
const origRenderRegex = /const codeLinesArray = (activeCode \|\| "")\.split\('\\n'\);\s*return \([\s\S]*?<div className="flex px-1 hover(?:[\s\S]*?)<\/div>\s*\);\s*\}\);/g;

content = content.replace(origRenderRegex, (match) => {
   return `const codeLinesArray = (activeCode || "").split('\\n');\n    return (\n      <div className="font-mono text-[14px] leading-[1.6] py-2 whitespace-pre text-[#abb2bf]">\n        {codeLinesArray.map((l, i) => renderHighlightedLine(l, i, selectedLines))}`;
});

// Update Menu to have Dual Pane / Split view
content = content.replace(
  /\{ title: "Toggle Zen Mode", run: \(\) => \{ setIsCommandPaletteOpen\(false\); setIsZenMode\(z => !z\); \} \},/,
  `{ title: "Toggle Zen Mode", run: () => { setIsCommandPaletteOpen(false); setIsZenMode(z => !z); } },\n    { title: "Toggle Split View", run: () => { setIsCommandPaletteOpen(false); setIsSplitView(z => !z); setActiveTab('editor'); } },`
);

// Include Dashboard to the command palette
content = content.replace(
  /\{ title: "Architecture Graph", run: \(\) => \{ setIsCommandPaletteOpen\(false\); setActiveTab\("graph"\); \} \},/,
  `{ title: "Architecture Graph", run: () => { setIsCommandPaletteOpen(false); setActiveTab("graph"); } },\n    { title: "Dev Analytics Dashboard", run: () => { setIsCommandPaletteOpen(false); setActiveTab("dashboard"); } },`
);

// Find activeTab === "graph" and insert the new Dashboard tab
const dashboardTab = `
          {/* DASHBOARD VIEW */}
          {activeTab === "dashboard" && (
            <motion.div key="dashboard" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="absolute inset-0 bg-[#050505] overflow-y-auto flex flex-col p-4 sm:p-8 text-white pb-32">
               <div className="flex items-center gap-4 mb-8">
                 <div className="p-4 bg-gradient-to-br from-pink-500/20 to-purple-500/10 rounded-2xl border border-pink-500/20">
                    <Activity className="w-8 h-8 text-pink-400" />
                 </div>
                 <div>
                   <h2 className="text-[26px] font-display font-medium text-white tracking-tight">Nexus Analytics</h2>
                   <p className="text-[13px] text-gray-400">Local developer productivity metrics</p>
                 </div>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                  <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-2xl">
                     <span className="text-gray-400 text-[12px] font-medium uppercase tracking-widest block mb-2">Lines Written</span>
                     <span className="text-[32px] font-bold text-white tracking-tight">1,402</span>
                     <span className="text-emerald-400 text-sm ml-2 font-medium">↑ 12% today</span>
                  </div>
                  <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-2xl">
                     <span className="text-gray-400 text-[12px] font-medium uppercase tracking-widest block mb-2">Build Success</span>
                     <span className="text-[32px] font-bold text-white tracking-tight">96%</span>
                     <span className="text-emerald-400 text-sm ml-2 font-medium">↑ 2% today</span>
                  </div>
                  <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-2xl">
                     <span className="text-gray-400 text-[12px] font-medium uppercase tracking-widest block mb-2">AI Refactors</span>
                     <span className="text-[32px] font-bold text-white tracking-tight">24</span>
                     <span className="text-purple-400 text-sm ml-2 font-medium">Nexus Engine Active</span>
                  </div>
               </div>
               
               <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-2xl min-h-[250px] flex items-center justify-center">
                  <span className="text-gray-500">Activity Heatmap Placeholder (D3.js integration to come)</span>
               </div>
            </motion.div>
          )}
`;

content = content.replace(
  /\{\/\* PREVIEW VIEW \*\/\}/,
  dashboardTab + '\n\n          {/* PREVIEW VIEW */}'
);

const bottomNavRegex = /<BottomTab activeTab=\{activeTab\} id="preview" icon=\{Smartphone\} label="Preview" onClick=\{setActiveTab\} \/>/;
content = content.replace(bottomNavRegex, '<BottomTab activeTab={activeTab} id="preview" icon={Smartphone} label="Preview" onClick={setActiveTab} />\n              <BottomTab activeTab={activeTab} id="dashboard" icon={Activity} label="Metrics" onClick={setActiveTab} />');


fs.writeFileSync('app/page.tsx', content);
