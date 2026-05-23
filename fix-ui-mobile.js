const fs = require('fs');
let content = fs.readFileSync('app/page.tsx', 'utf8');

// 1. Text wrapping for messages
content = content.replace(
  /className=\{`max-w-\[85%\] rounded-\[24px\] px-5 py-3\.5 text-\[14px\] leading-relaxed relative border \$\{/g,
  'className={`max-w-[85%] overflow-hidden break-words break-all whitespace-pre-wrap rounded-[24px] px-5 py-3.5 text-[14px] leading-relaxed relative border ${'
);

// 2. Chat input scrollbar fix (switch to input, or hide scrollbar aggressively)
// I will just switch it to input since multi-line isn't strictly requested and avoids 90% of resizing bugs.
content = content.replace(
  /<textarea \n                    ref=\{chatInputRef\}\n                    value=\{chatInput\}\n                    onChange=\{e => setChatInput\(e\.target\.value\)\}\n                    onKeyDown=\{e => \{ if \(e\.key === 'Enter' && !e\.shiftKey\) \{ e\.preventDefault\(\); handleSendChat\(\); \} \}\}\n                    placeholder="Ask Nexus AI\.\.\."\n                    className="flex-1 bg-transparent border-none text-\[15px\] font-medium text-white focus:outline-none resize-none h-\[44px\] py-3 px-5 scrollbar-hide placeholder-gray-500"\n                    rows=\{1\}\n                  \/>/,
  `<input \n                    ref={chatInputRef as any}\n                    value={chatInput}\n                    onChange={e => setChatInput(e.target.value)}\n                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleSendChat(); } }}\n                    placeholder="Ask Nexus AI..."\n                    className="flex-1 w-full bg-transparent border-none text-[15px] font-medium text-white focus:outline-none h-[44px] py-1 px-5 placeholder-gray-500 min-w-0"\n                  />`
);

// 3. AI Panel Rnd logic: we need to ensure the panel can't be wider than the screen.
content = content.replace(
  /width: 360,\n                height: 600/,
  `width: Math.min(380, typeof window !== 'undefined' ? window.innerWidth - 30 : 380),\n                height: Math.min(600, typeof window !== 'undefined' ? window.innerHeight - 80 : 600)`
);

// 4. Also adjust the `minWidth={320}` constraint on `react-rnd` which can overflow small screens.
content = content.replace(
  /minWidth=\{320\}/,
  `minWidth={Math.min(320, typeof window !== 'undefined' ? window.innerWidth - 30 : 320)}`
);

// Improve the close button layout so it's not super squished on mobile
content = content.replace(
  /className="mt-2 flex items-center justify-between w-full px-2"/g,
  'className="mt-2 flex items-center justify-between w-full px-0 sm:px-2"'
);

// Give the Rnd panel a max-width to not exceed 100vw
content = content.replace(
  /<motion\.div initial=\{\{ opacity: 0, scale: 0\.95 \}\} animate=\{\{ opacity: 1, scale: 1 \}\} exit=\{\{ opacity: 0, scale: 0\.95 \}\} className="w-full h-full bg-\[\#050505\]\/95 backdrop-blur-3xl sm:rounded-\[32px\] rounded-\[32px\] mx-auto/g,
  '<motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-[100vw] h-full bg-[#050505]/95 backdrop-blur-3xl sm:rounded-[32px] rounded-[32px] mx-auto'
);

fs.writeFileSync('app/page.tsx', content);
