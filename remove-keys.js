const fs = require('fs');
let code = fs.readFileSync('app/page.tsx', 'utf8');

// 1. Remove AI_PROVIDERS constant if exists
code = code.replace(/const AI_PROVIDERS = \["Gemini 2.5 Flash".*?\];\n/, '');

// 2. Remove aiProvider & apiKeys state
code = code.replace(/  const \[aiProvider, setAiProvider\] = useState\(AI_PROVIDERS\[0\]\);\n/, '');
code = code.replace(/  const \[apiKeys, setApiKeys\] = useState[^\}]+?\}\);\n/, '');

// 3. Remove localStorage for aiProvider and apiKeys
code = code.replace(/  useEffect\(\(\) => \{\n    localStorage\.setItem\("nexus-ai-api-keys", JSON\.stringify\(apiKeys\)\);\n  \}, \[apiKeys\]\);\n/, '');
code = code.replace(/  useEffect\(\(\) => \{\n    localStorage\.setItem\("nexus-ai-provider", aiProvider\);\n  \}, \[aiProvider\]\);\n/, '');

// 4. Remove provider & apiKeys from handleSendChat
code = code.replace(/          provider: aiProvider,\n          apiKeys,\n/, '');

// 5. Remove "Provider Selection" block from Settings
code = code.replace(/                 \{\/\* AI Options \*\/\}\n                 <div className="bg-\[\#050505\] border border-indigo-500\/20 rounded-\[32px\] p-6 shadow-\[0_20px_40px_rgba\(99,102,241,0\.1\)\] relative overflow-hidden ring-1 ring-white\/5">[\s\S]*?                   <\/div>\n                 <\/div>\n/, '');

// 6. Remove "AI API Keys Config" block from Settings
code = code.replace(/                 \{\/\* AI API Keys Config \*\/\}[\s\S]*?<\/div>\n                 <\/div>\n/, '');

// 7. Simplify AI Panel header to just "Nexus AI - Genesis Engine" instead of the select dropdown
code = code.replace(/<div className="flex items-center gap-1\.5 cursor-pointer relative"><div className="w-1\.5 h-1\.5 bg-emerald-400 rounded-full shadow-\[0_0_5px_currentColor\] pointer-events-none" \/><select value=\{aiProvider\}.*?><\/select><ChevronRight className="w-3 h-3 text-emerald-400\/50 absolute right-0 top-1\/2 -translate-y-1\/2 rotate-90 pointer-events-none" \/><\/div>/, 
'<div className="text-[11px] text-emerald-400 font-mono tracking-tight flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-[0_0_5px_currentColor] pointer-events-none" />Gemini Genesis</div>');

fs.writeFileSync('app/page.tsx', code);
