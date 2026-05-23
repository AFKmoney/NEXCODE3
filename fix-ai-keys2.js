const fs = require('fs');
let code = fs.readFileSync('app/page.tsx', 'utf8');

const toRemove = `                 {/* Provider Config */}
                 <div className="bg-[#050505] border border-white/5 rounded-[32px] p-6 space-y-4 shadow-[0_20px_40px_rgba(0,0,0,1)] ring-1 ring-white/5">
                   <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                      <Zap className="w-4 h-4 text-emerald-400" /> Task Router 
                   </h3>
                   <div className="relative">
                     <select value={aiProvider} onChange={e => setAiProvider(e.target.value)} className="w-full bg-[#0a0a0a] text-white border-2 border-transparent rounded-[20px] py-4 px-5 text-[15px] font-semibold focus:outline-none focus:border-indigo-500/50 appearance-none transition-colors shadow-inner">
                       {AI_PROVIDERS.map(p => <option key={p} value={p}>{p}</option>)}
                     </select>
                     <ChevronRight className="w-5 h-5 absolute right-5 top-1/2 -translate-y-1/2 rotate-90 text-gray-400 pointer-events-none" />
                   </div>
                 </div>`;

code = code.replace(toRemove, '');
fs.writeFileSync('app/page.tsx', code);
