const fs = require('fs');

let content = fs.readFileSync('app/page.tsx', 'utf8');

// Undo the wrong Rnd tags near line 831
content = content.replace(
  /830:\s*<\/motion\.div>\s*<\/Rnd>\s*<\/div>\s*\)\}\s*<\/AnimatePresence>/, 
  '' // This won't work, line numbers are not in the file
);

content = content.replace(
  /<\/div>\n          <\/motion\.div>\n          <\/Rnd>\n          <\/div>\n        \)\}\n      <\/AnimatePresence>\n\n              \{\/\* Selection AI Action Strip \*\/\}/m,
  '</div>\n                  </motion.div>\n                )}\n              </AnimatePresence>\n\n              {/* Selection AI Action Strip */}'
);

// Add the correct Rnd tags at the end of the AI Panel
content = content.replace(
  /<\/div>\n             <\/div>\n          <\/motion\.div>\n        \)\}\n      <\/AnimatePresence>\n\n      \{\/\* GPU Cloud Modal \*\/\}/m,
  '</div>\n             </div>\n          </motion.div>\n          </Rnd>\n          </div>\n        )}\n      </AnimatePresence>\n\n      {/* GPU Cloud Modal */}'
);

fs.writeFileSync('app/page.tsx', content);
