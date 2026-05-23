const fs = require('fs');

let content = fs.readFileSync('app/page.tsx', 'utf8');

if (!content.includes('import { Rnd } from "react-rnd";')) {
  content = content.replace('import * as diff from "diff";', 'import * as diff from "diff";\nimport { Rnd } from "react-rnd";');
}

// Ensure the panel is completely draggable using Rnd.
const rndReplacement = `
      {/* Floating AI Panel */}
      <AnimatePresence>
        {isAiPanelOpen && (
          <div className="fixed inset-0 pointer-events-none z-[200]">
            <Rnd
              default={{
                x: typeof window !== 'undefined' ? window.innerWidth - 440 : 100,
                y: 80,
                width: 380,
                height: Math.min(600, typeof window !== 'undefined' ? window.innerHeight - 100 : 700),
              }}
              minWidth={320}
              minHeight={400}
              bounds="window"
              className="pointer-events-auto"
              dragHandleClassName="drag-handle"
            >
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full h-full bg-[#050505]/95 backdrop-blur-3xl rounded-[32px] sm:rounded-[36px] overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.9)] border border-indigo-500/20 flex flex-col ring-1 ring-white/10">
                 
                 {/* Header */}
                 <div className="flex-none p-5 flex justify-center items-center border-b border-white/5 relative bg-gradient-to-b from-indigo-500/5 to-transparent drag-handle cursor-move">
                   <div className="mt-2 flex items-center justify-between w-full px-2">
`;
content = content.replace(
  /\{\/\* Slide-Up AI Panel \*\/\}\s*<AnimatePresence>\s*\{isAiPanelOpen && \(\s*<motion\.div initial=\{\{ y: "100%" \}\} animate=\{\{ y: 0 \}\} exit=\{\{ y: "100%" \}\} transition=\{\{ [^}]+\}\} className="[^"]+">/,
  `{/* Floating AI Panel */}
      <AnimatePresence>
        {isAiPanelOpen && (
          <div className="fixed inset-0 pointer-events-none z-[200]">
            <Rnd
              default={{
                x: typeof window !== "undefined" ? window.innerWidth - 420 : 0,
                y: typeof window !== "undefined" ? (window.innerHeight - 600) / 2 : 0,
                width: 380,
                height: 600,
              }}
              minWidth={320}
              minHeight={400}
              bounds="window"
              className="pointer-events-auto shadow-[0_30px_100px_rgba(0,0,0,1)] rounded-[32px]"
              dragHandleClassName="drag-handle"
            >
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full h-full bg-[#050505]/95 backdrop-blur-3xl sm:rounded-[32px] rounded-[32px] mx-auto shadow-[0_-30px_100px_rgba(0,0,0,0.9)] border border-indigo-500/20 flex flex-col overflow-hidden ring-1 ring-white/10">`
);

content = content.replace(
  /\{\/\* Header \*\/\}\s*<div className="flex-none p-5 flex justify-center items-center border-b border-white\/5 relative bg-gradient-to-b from-indigo-500\/5 to-transparent">\s*<div className="absolute top-3 w-16 h-1.5 bg-white\/20 rounded-full" \/>\s*<div className="mt-4 flex items-center justify-between w-full px-2">/,
  `{/* Header */}
             <div className="drag-handle flex-none p-5 flex justify-center items-center border-b border-white/5 relative bg-gradient-to-b from-indigo-500/5 to-transparent cursor-move">
               <div className="absolute top-2 w-12 h-1 bg-white/20 rounded-full" />
               <div className="mt-2 flex items-center justify-between w-full px-2">`
);

content = content.replace(
  /                  <\/div>\s*<\/motion\.div>\s*\)\}\s*<\/AnimatePresence>/m,
  `                  </div>
          </motion.div>
          </Rnd>
          </div>
        )}
      </AnimatePresence>`
);

fs.writeFileSync('app/page.tsx', content);
