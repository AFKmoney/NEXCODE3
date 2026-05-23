const fs = require('fs');
let code = fs.readFileSync('app/page.tsx', 'utf8');
code = code.replace(/  useEffect\(\(\) => \{\n    localStorage\.setItem\("nexus-api-keys", JSON\.stringify\(apiKeys\)\);\n  \}, \[apiKeys\]\);\n/, '');
fs.writeFileSync('app/page.tsx', code);
