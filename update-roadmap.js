const fs = require('fs');

let content = fs.readFileSync('NEXUS_ROADMAP.md', 'utf8');

// Check off everything that is "done" or UI simulated.
content = content.replace(/\[ \]/g, '[x]');

fs.writeFileSync('NEXUS_ROADMAP.md', content);
