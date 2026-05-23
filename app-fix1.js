const fs = require('fs');

let content = fs.readFileSync('app/page.tsx', 'utf8');

// Undo the bad Rnd
content = content.replace(
  /                  <\/div>\n          <\/motion\.div>\n          <\/Rnd>\n          <\/div>\n        \)\}\n      <\/AnimatePresence>/m,
  `                  </div>\n                  </motion.div>\n                )}\n              </AnimatePresence>`
);

content = content.replace(
  /                  <\/div>\s*<\/motion\.div>\s*\)\}\s*<\/AnimatePresence>\s*\n\s*\{isAiPanelOpen === true && \(/m, // actually, let's just find the end of AI Panel
  ``
); // No, let's just do it manually.
fs.writeFileSync('app-fix1.js', content)
