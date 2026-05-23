const fs = require('fs');
let code = fs.readFileSync('app/page.tsx', 'utf8');

// 1. Remove Cloud GPU modal code block
code = code.replace(/\{\/\* Cloud GPU Modal \*\/\}[\s\S]*?<\/AnimatePresence>\n/, '');

// 2. Remove Cloud GPU command
code = code.replace(/\s*\{ title: "Connect Cloud GPU"[^\n]+/, '');

// 3. Remove GPU state
code = code.replace(/  \/\/ Cloud GPU State[\s\S]*?const \[gpuLogs, setGpuLogs\] = useState<string\[\]>\(\[\]\);\n/, '');
code = code.replace(/  const handleConnectGpu \= \(\) \=\> \{[\s\S]*?  \};\n/, '');

// 4. Time travel debugger
code = code.replace(/\s*\{\/\* Time-Travel Debugger Overlay Tool \*\/\}[\s\S]*?T-120s[\s\S]*?<\/div>\n\s*\)\}/, '');

// 5. Remove Premium settings variables
code = code.replace(/cfgNaming: true,[\s\S]*?expCrossRepo: true/, 'themeDark: true,\n    autoSave: true,\n    formatOnSave: true');

// 6. Replace settings toggles
const newToggles = `                 {/* IDE Behaviors */}
                 <div className="bg-[#050505] border border-white/5 rounded-[32px] p-6 shadow-[0_20px_40px_rgba(0,0,0,1)] ring-1 ring-white/5">
                  <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-2">
                    <h3 className="text-[11px] font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2"><Fingerprint className="w-4 h-4" /> IDE Settings</h3>
                  </div>
                  <ToggleItem title="Auto-Save Document" desc="Continuously saves document" state={settings.autoSave} toggle={() => toggleSetting('autoSave')} />
                  <ToggleItem title="Format on Save" desc="Format file when saved" state={settings.formatOnSave} toggle={() => toggleSetting('formatOnSave')} />
                  <ToggleItem title="Dark Theme" desc="Use IDE dark theme" state={settings.themeDark} toggle={() => toggleSetting('themeDark')} />
                 </div>`;

code = code.replace(/\s*\{\/\* Advanced AI Toggles \*\/\}[\s\S]*?\{\/\* Lab Experiments \*\/\}/, '');
code = code.replace(/\s*\{\/\* Lab Experiments \*\/\}[\s\S]*?<\/div>\n\s*<\/div>/, newToggles);

// 7. Simulated terminal logs for cargo
code = code.replace(/\s*\} else if \(cmd\.startsWith\('cargo '\)\) \{[\s\S]*?setTerminalHistory\(newHist\);/, '');

// 8. Fix Dev Analytics Dashboard placeholder
const dashboardRegex = /\{\/\* DASHBOARD VIEW \*\/\}[\s\S]*?Dev Analytics Dashboard[\s\S]*?(?=\{\/\* END VIEW \*\/\}|<\/AnimatePresence>|        <\/main>)/;

const newDashboard = `{/* DASHBOARD VIEW */}
          {activeTab === "dashboard" && (
            <motion.div key="dashboard" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="absolute inset-0 overflow-y-auto pb-28 pt-6 px-4 sm:px-7 scrollbar-hide bg-black w-full h-full mb-10">
              <div className="flex items-center gap-5 mb-8">
                <div className="p-4 bg-gradient-to-br from-emerald-500/20 to-teal-500/10 rounded-[24px] border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.15)] relative">
                  <div className="absolute inset-0 bg-white/5 rounded-[24px] blur-sm" />
                  <Activity className="w-8 h-8 text-emerald-400 relative z-10" />
                </div>
                <div>
                  <h2 className="text-[26px] font-display font-medium text-white tracking-tight">Metrics Dashboard</h2>
                  <p className="text-[13px] text-gray-400 mt-1 font-medium">Activity & Performance Logs</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="bg-[#050505] p-6 rounded-[32px] border border-white/5 ring-1 ring-white/5 shadow-xl">
                    <h3 className="text-gray-400 font-bold text-[11px] uppercase tracking-widest mb-4">Total Lines Written</h3>
                    <div className="text-4xl font-bold text-white tracking-tighter">4,289 <span className="text-emerald-400 text-sm tracking-normal">↑ 12%</span></div>
                 </div>
                 <div className="bg-[#050505] p-6 rounded-[32px] border border-white/5 ring-1 ring-white/5 shadow-xl">
                    <h3 className="text-gray-400 font-bold text-[11px] uppercase tracking-widest mb-4">Time Spent</h3>
                    <div className="text-4xl font-bold text-white tracking-tighter">18h 42m</div>
                 </div>
                 <div className="bg-[#050505] p-6 rounded-[32px] border border-white/5 ring-1 ring-white/5 shadow-xl">
                    <h3 className="text-gray-400 font-bold text-[11px] uppercase tracking-widest mb-4">API Requests</h3>
                    <div className="text-4xl font-bold text-white tracking-tighter">1,204</div>
                 </div>
              </div>
            </motion.div>
          )}
          
`;
code = code.replace(dashboardRegex, newDashboard);


fs.writeFileSync('app/page.tsx', code);
