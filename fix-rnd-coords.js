const fs = require('fs');

let content = fs.readFileSync('app/page.tsx', 'utf8');

// The AI panel must be positioned relative to the app window, NOT the browser window, since we're using a bound container.
content = content.replace(
  /default=\{\{\s*x: typeof window !== "undefined" \? window\.innerWidth - 420 : 0,\s*y: typeof window !== "undefined" \? 40 : 0,\s*width: 380,\s*height: typeof window !== "undefined" \? window\.innerHeight - 80 : 600\s*\}\}/,
  'default={{ x: 300, y: 40, width: 380, height: 600 }}' // It handles its own offsets, we will just give it a safe default
);

// We need to dynamically measure the parent or just give it safe defaults that keep it visible when opened.
content = content.replace(
  /<Rnd\s*default=\{\{\s*x: 300/,
  '<Rnd\n              default={{\n                x: typeof window !== "undefined" && window.innerWidth > 1000 ? window.innerWidth * 0.95 > 1400 ? 1000 : window.innerWidth * 0.95 - 400 : 20,\n                y: 40,\n                width: 360,\n                height: 600\n              }}'
);

fs.writeFileSync('app/page.tsx', content);
