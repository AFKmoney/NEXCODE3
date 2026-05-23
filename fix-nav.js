const fs = require('fs');
let content = fs.readFileSync('app/page.tsx', 'utf8');

content = content.replace(
  /nav className="h-\[68px\] rounded-\[34px\] border border-white\/5 bg-black\/80 backdrop-blur-3xl flex justify-around items-center px-1\.5 py-1\.5 shadow-\[0_30px_60px_rgba\(0,0,0,1\)\] pointer-events-auto w-full max-w-\[420px\] ring-1 ring-white\/10"/,
  'nav className="h-[68px] rounded-[34px] border border-white/5 bg-black/80 backdrop-blur-3xl grid grid-cols-5 items-center justify-items-center px-1.5 py-1.5 shadow-[0_30px_60px_rgba(0,0,0,1)] pointer-events-auto w-full max-w-[420px] ring-1 ring-white/10"'
);

// If the grid-cols replacement didn't work, just use the flex approach but fix the widths
// Wait, grid-cols-5 works perfectly for 5 elements!

// Fix the AI button wrapper to fit inside the grid cell cleanly without getting crushed
content = content.replace(
  /className="relative -top-7 px-2 z-50 group"/,
  'className="relative -top-7 z-50 group flex justify-center items-center"'
);

fs.writeFileSync('app/page.tsx', content);
