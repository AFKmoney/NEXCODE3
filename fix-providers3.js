const fs = require('fs');
let code = fs.readFileSync('app/page.tsx', 'utf8');

const toRemove = `const AI_PROVIDERS = [
  "Gemini 2.5 Pro",
  "Claude 3.5 Sonnet",
  "Mistral Large",
  "Grok 1.5",
  "Local (Llama 3 8B)*"
];`;

code = code.replace(toRemove, '');
fs.writeFileSync('app/page.tsx', code);
