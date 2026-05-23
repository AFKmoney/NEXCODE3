const fs = require('fs');
let code = fs.readFileSync('app/page.tsx', 'utf8');

// The AI_PROVIDERS constant
code = code.replace(/const AI_PROVIDERS = \["Gemini 2\.5 Flash", "Gemini 2\.0 Pro", "Claude 3\.5 Sonnet", "Mistral Large 2", "Grok 2\.0"\];\n/, '');

// aiProvider state
code = code.replace(/  const \[aiProvider, setAiProvider\] = useState\(AI_PROVIDERS\[0\]\);\n/, '');

// apiKeys state
code = code.replace(/  const \[apiKeys, setApiKeys\] = useState<Record<string, string>>\(\{\n    gemini: "",\n    claude: "",\n    mistral: "",\n    grok: ""\n  \}\);\n/, '');

// localStorage keys
code = code.replace(/  useEffect\(\(\) => \{\n    const saved = localStorage\.getItem\("nexus-ai-api-keys"\);\n    if \(saved\) setApiKeys\(JSON\.parse\(saved\)\);\n    const prov = localStorage\.getItem\("nexus-ai-provider"\);\n    if \(prov && AI_PROVIDERS\.includes\(prov\)\) setAiProvider\(prov\);\n  \}, \[\]\);\n\n  useEffect\(\(\) => \{\n    localStorage\.setItem\("nexus-ai-api-keys", JSON\.stringify\(apiKeys\)\);\n  \}, \[apiKeys\]\);\n\n  useEffect\(\(\) => \{\n    localStorage\.setItem\("nexus-ai-provider", aiProvider\);\n  \}, \[aiProvider\]\);\n/, '');

// provider/apiKeys in chat payload
code = code.replace(/           provider: aiProvider,\n           apiKeys,\n/, '');

// AI Options block
code = code.replace(/                 \{\/\* AI Options \*\/\}\n                 <div className="bg-\[\#050505\] border border-indigo-500\/20 rounded-\[32px\] p-6 shadow-\[0_20px_40px_rgba\(99,102,241,0\.1\)\] relative overflow-hidden ring-1 ring-white\/5">[\s\S]*?                 <\/div>\n\n                 \{\/\* AI API Keys Config \*\/\}/, '                 {/* AI API Keys Config */}');

// AI API Keys Config block
code = code.replace(/                 \{\/\* AI API Keys Config \*\/\}[\s\S]*?                 <\/div>\n               <\/div>\n/, '               </div>\n');

// Nexus AI dropdown in chat
code = code.replace(/<div className="flex items-center gap-1\.5 cursor-pointer relative"><div className="w-1\.5 h-1\.5 bg-emerald-400 rounded-full shadow-\[0_0_5px_currentColor\] pointer-events-none" \/><select value=\{aiProvider\} onChange=\{e => setAiProvider\(e\.target\.value\)\} className="text-\[11px\] text-emerald-400 font-mono tracking-tight bg-transparent appearance-none focus:outline-none cursor-pointer hover:underline pr-4 relative z-10 w-auto">\{AI_PROVIDERS\.map\(p => <option key=\{p\} value=\{p\} className="bg-black text-white">\{p\}<\/option>\)\}<\/select><ChevronRight className="w-3 h-3 text-emerald-400\/50 absolute right-0 top-1\/2 -translate-y-1\/2 rotate-90 pointer-events-none" \/><\/div>/, 
'<div className="text-[11px] text-emerald-400 font-mono tracking-tight flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-[0_0_5px_currentColor] pointer-events-none" />Gemini Genesis</div>');

fs.writeFileSync('app/page.tsx', code);
