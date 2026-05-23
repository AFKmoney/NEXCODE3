const fs = require('fs');

let content = fs.readFileSync('app/page.tsx', 'utf8');

if (!content.includes('import Editor from "@monaco-editor/react";')) {
  content = content.replace('import Prism from "prismjs";', 'import Prism from "prismjs";\nimport Editor from "@monaco-editor/react";');
}

const renderCodeViewRegex = /const renderCodeView = \(\) => \{[\s\S]*?if \(!isEditMode && !hasUnsavedChanges\) \{/;

const newRenderCodeView = `
  const renderCodeView = () => {
    if (isEditMode) {
      const languageMap: Record<string, string> = {
        'ts': 'typescript', 'tsx': 'typescript', 'js': 'javascript', 'jsx': 'javascript',
        'json': 'json', 'html': 'html', 'css': 'css', 'py': 'python', 'rs': 'rust'
      };
      const ext = activeFile ? activeFile.split('.').pop() || '' : '';
      const lang = languageMap[ext] || 'javascript';
      
      return (
        <div className={\`flex w-full h-full \${isSplitView ? 'flex-row' : 'flex-col'}\`}>
          <div className={\`h-full \${isSplitView ? 'w-1/2 border-r border-[#1e1e1e]' : 'w-full'}\`}>
             <Editor
               height="100%"
               language={lang}
               theme="vs-dark"
               value={activeCode}
               onChange={(val) => setFiles(p => ({...p, [activeFile as string]: val || ""}))}
               options={{
                 minimap: { enabled: true },
                 fontSize: 14,
                 fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                 scrollBeyondLastLine: false,
                 smoothScrolling: true,
                 cursorBlinking: "smooth",
                 cursorSmoothCaretAnimation: "on",
                 formatOnPaste: true,
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
    
    if (!isEditMode && !hasUnsavedChanges) {
`;

content = content.replace(renderCodeViewRegex, newRenderCodeView);

// Enhance Dashboard / Layout
content = content.replace(
  /w-full h-\[100dvh\] sm:h-\[95vh\] sm:w-\[95vw\] sm:max-w-7xl sm:rounded-\[24px\]/,
  'w-full h-[100dvh] sm:h-[95vh] sm:w-[95vw] sm:max-w-[1400px] sm:rounded-[32px]'
);

// We should fix the Rnd bounds
content = content.replace(
  /bounds="window"/,
  'bounds="parent"'
);

// Rnd container must be parent-relative to prevent weird overflow bugs on mobile sizes
content = content.replace(
  /<div className="fixed inset-0 pointer-events-none z-\[200\] overflow-hidden">/,
  '<div className="absolute inset-0 pointer-events-none z-[200] overflow-hidden">'
);

// Remove the `bg-black` from main wrapper and replace with modern grid layout or something subtle
content = content.replace(
  /className="min-h-screen bg-black flex items-center justify-center p-0 sm:p-6/,
  'className="min-h-screen bg-[#0a0a0c] flex items-center justify-center p-0 sm:p-6'
);

fs.writeFileSync('app/page.tsx', content);
