const fs = require('fs');
let code = fs.readFileSync('app/page.tsx', 'utf8');

const regexKeys = /    const savedKeys = localStorage\.getItem\("nexus-api-keys"\);\n    if \(savedKeys\) \{\n      try \{\n        setApiKeys\(JSON\.parse\(savedKeys\)\);\n      \} catch \(e\) \{\}\n    \}\n/g;
code = code.replace(regexKeys, '');

const regexProvider = /    const savedProvider = localStorage\.getItem\("nexus-ai-provider"\);\n    if \(savedProvider\) \{\n       setAiProvider\(savedProvider\);\n    \}\n/g;
code = code.replace(regexProvider, '');

fs.writeFileSync('app/page.tsx', code);
