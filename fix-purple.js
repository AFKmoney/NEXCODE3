const fs = require('fs');
let code = fs.readFileSync('app/page.tsx', 'utf8');

code = code.replace(/bg-gradient-to-b from-indigo-500 to-indigo-700/g, 'bg-gradient-to-b from-purple-500 to-purple-700');
code = code.replace(/shadow-\[0_10px_30px_rgba\(99,102,241,0\.5\)\]/g, 'shadow-[0_10px_30px_rgba(168,85,247,0.5)]');
code = code.replace(/bg-indigo-500\/50 rounded-full blur-xl group-hover:bg-indigo-400\/60/g, 'bg-purple-500/50 rounded-full blur-xl group-hover:bg-purple-400/60');

fs.writeFileSync('app/page.tsx', code);
