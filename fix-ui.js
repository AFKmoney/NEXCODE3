const fs = require('fs');
let content = fs.readFileSync('app/page.tsx', 'utf8');

// 1. Remove mobile frame limits
content = content.replace(
  /className=\{`relative bg-\[\#050505\][\s\S]*?`\}/,
  'className={`relative bg-[#050505]/95 backdrop-blur-3xl shadow-[0_40px_80px_rgba(0,0,0,1)] flex flex-col mx-auto ring-1 ring-white/10 z-10 transition-all duration-300 overflow-hidden w-full h-[100dvh] sm:h-[95vh] sm:w-[95vw] sm:max-w-7xl sm:rounded-[24px]`}'
);

// 2. Remove mobile status bar
content = content.replace(
  /\{\/\* iOS\/Android Unified Status Bar \*\/\}[\s\S]*?\{\/\* Dynamic Header \*\/\}/,
  '{/* Dynamic Header */}'
);

// 3. Make Rnd (AI panel) look like a floating desktop widget better, or just lock it to the right
content = content.replace(
  /default=\{\{\s*x: typeof window !== "undefined"[^}]+\}\}/,
  'default={{ x: typeof window !== "undefined" ? window.innerWidth - 420 : 0, y: typeof window !== "undefined" ? 40 : 0, width: 380, height: typeof window !== "undefined" ? window.innerHeight - 80 : 600 }}'
);

// 4. Center bottom navigation properly and make it look clean
content = content.replace(
  /w-full max-w-\[360px\]/,
  'w-full max-w-[420px]'
);

// 5. Replace "120%" height in code view which causes weird scrolling
content = content.replace(
  /h-\[120\%\]/g,
  'h-full'
);

content = content.replace(
  /min-h-\[120\%\]/g,
  'min-h-full h-full'
);

// 6. Fix file explorer grid so it's not super squished on desktop
content = content.replace(
  /bg-\[\#050505\] border border-white\/5 rounded-3xl overflow-hidden shadow-xl flex flex-col ring-1 ring-white\/5/,
  'bg-[#050505] border border-white/5 rounded-3xl overflow-hidden shadow-xl flex flex-col ring-1 ring-white/5 mx-4 sm:mx-8'
);

// 7. Fix Rnd z-index and pointer issue (it was inside a non-pointer-event but the panel couldn't be easily used if not carefully managed)
content = content.replace(
  /<div className="fixed inset-0 pointer-events-none z-\[200\]">/,
  '<div className="fixed inset-0 pointer-events-none z-[200] overflow-hidden">'
);

fs.writeFileSync('app/page.tsx', content);
