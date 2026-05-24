"use client";

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Puzzle, Search, DownloadCloud, Star, Trash2, CheckCircle2, Info, Upload, Heart, X 
} from "lucide-react";

export type PluginReview = {
  user: string;
  rating: number;
  comment: string;
};

export type Plugin = {
  id: string;
  name: string;
  author: string;
  description: string;
  rating: number;
  downloads: number;
  isInstalled: boolean;
  price: string;
  reviews: PluginReview[];
};

type MarketplaceViewProps = {
  plugins: Plugin[];
  setPlugins: React.Dispatch<React.SetStateAction<Plugin[]>>;
  pluginMode: "discover" | "installed" | "upload";
  setPluginMode: (val: "discover" | "installed" | "upload") => void;
  pluginSearch: string;
  setPluginSearch: (val: string) => void;
  newPluginData: any;
  setNewPluginData: (val: any) => void;
  reviewPluginId: string | null;
  setReviewPluginId: (val: string | null) => void;
  reviewData: any;
  setReviewData: (val: any) => void;
  pageVariants: any;
  hapticVibrate: (pattern: any) => void;
};

export const MarketplaceView = ({
  plugins,
  setPlugins,
  pluginMode,
  setPluginMode,
  pluginSearch,
  setPluginSearch,
  newPluginData,
  setNewPluginData,
  reviewPluginId,
  setReviewPluginId,
  reviewData,
  setReviewData,
  pageVariants,
  hapticVibrate
}: MarketplaceViewProps) => {
  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="absolute inset-0 flex flex-col pt-16 bg-[#0a0a0a]">
      <div className="flex-1 overflow-y-auto px-6 pb-24 scrollbar-hide">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-[12px] bg-purple-500/20 flex items-center justify-center text-purple-400">
            <Puzzle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-display font-medium text-white tracking-tight">Plugin Marketplace</h2>
            <p className="text-xs text-gray-500 font-mono">Extend NexusCode capabilities</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 mb-6">
          {(["discover", "installed", "upload"] as const).map(m => (
            <button key={m} onClick={() => setPluginMode(m)} className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-colors ${pluginMode === m ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>
              {m}
            </button>
          ))}
        </div>

        {pluginMode === "discover" && (
          <div className="space-y-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input type="text" placeholder="Search extensions..." value={pluginSearch} onChange={e => setPluginSearch(e.target.value)} className="w-full bg-white/5 border border-white/5 rounded-[12px] py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-purple-500/50" />
            </div>
            {plugins.filter(p => p.name.toLowerCase().includes(pluginSearch.toLowerCase()) && !p.isInstalled).length === 0 ? (
               <div className="text-center py-12 text-gray-500 text-sm">No new plugins found.</div>
            ) : (
              plugins.filter(p => p.name.toLowerCase().includes(pluginSearch.toLowerCase()) && !p.isInstalled).map(p => (
                <div key={p.id} className="p-4 rounded-[16px] bg-[#111] border border-white/5 hover:border-white/10 transition-colors flex flex-col gap-3">
                   <div className="flex justify-between items-start">
                     <div>
                       <h4 className="text-sm font-bold text-white leading-tight">{p.name}</h4>
                       <p className="text-[11px] text-gray-500 mt-0.5">by {p.author}</p>
                     </div>
                     <button onClick={() => { setPlugins(prev => prev.map(pl => pl.id === p.id ? { ...pl, isInstalled: true } : pl)); setPluginMode('installed'); hapticVibrate([40, 50, 40]); }} className="px-3 py-1.5 rounded-full bg-white text-black hover:bg-gray-200 text-[10px] uppercase font-bold tracking-widest transition-colors flex items-center gap-1">
                       <DownloadCloud className="w-3 h-3" /> Install
                     </button>
                   </div>
                   <p className="text-[12px] text-gray-400 leading-relaxed max-w-[90%]">{p.description}</p>
                   <div className="flex items-center justify-between mt-1">
                     <div className="flex items-center gap-4 text-[10px] text-gray-500 font-mono tracking-tight pt-2">
                       <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-500 fill-current" /> {p.rating.toFixed(1)}</span>
                       <span className="flex items-center gap-1"><DownloadCloud className="w-3 h-3" /> {p.downloads.toLocaleString()}</span>
                       <span className={`px-1.5 rounded ${p.price === 'Free' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>{p.price}</span>
                     </div>
                     <button onClick={() => setReviewPluginId(p.id)} className="text-[10px] text-gray-400 hover:text-white uppercase font-bold tracking-widest pt-2">
                       View Reviews
                     </button>
                   </div>
                </div>
              ))
            )}
          </div>
        )}

        {pluginMode === "installed" && (
           <div className="space-y-4">
             {plugins.filter(p => p.isInstalled).length === 0 ? (
               <div className="text-center py-12 text-gray-500 text-sm">No plugins installed yet.</div>
             ) : (
               plugins.filter(p => p.isInstalled).map(p => (
                 <div key={p.id} className="p-4 rounded-[16px] bg-[#111] border border-emerald-500/20 flex flex-col gap-3 relative overflow-hidden group">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[50px] pointer-events-none" />
                   <div className="flex justify-between items-start relative z-10">
                     <div className="flex items-center gap-2">
                       <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                         <CheckCircle2 className="w-4 h-4" />
                       </div>
                       <div>
                         <h4 className="text-sm font-bold text-white leading-tight">{p.name}</h4>
                         <p className="text-[11px] text-gray-500 mt-0.5">by {p.author}</p>
                       </div>
                     </div>
                     <button onClick={() => setPlugins(prev => prev.map(pl => pl.id === p.id ? { ...pl, isInstalled: false } : pl))} className="px-3 py-1.5 rounded-full border border-red-500/20 text-red-400 hover:bg-red-500/10 text-[10px] uppercase font-bold tracking-widest transition-colors flex items-center gap-1">
                       <Trash2 className="w-3 h-3" /> Uninstall
                     </button>
                   </div>
                   <p className="text-[12px] text-gray-400 pl-10 relative z-10">{p.description}</p>
                   
                   <div className="pl-10 pt-3 border-t border-white/5 mt-2 space-y-2 relative z-10">
                     <div className="flex items-center justify-between">
                       <h5 className="text-[10px] uppercase font-bold tracking-widest text-gray-500">Reviews ({p.reviews.length})</h5>
                       <button onClick={() => setReviewPluginId(p.id)} className="text-[10px] uppercase font-bold text-indigo-400 hover:text-indigo-300">Add Review</button>
                     </div>
                     {p.reviews.map((r, i) => (
                       <div key={i} className="bg-white/5 rounded-lg p-2.5 text-[11px] mt-2 border border-white/5">
                         <div className="flex items-center justify-between mb-1">
                           <strong className="text-white">{r.user}</strong>
                           <div className="flex gap-0.5 text-amber-500">{Array.from({ length: 5 }).map((_, j) => <Star key={j} className={`w-2.5 h-2.5 ${j < r.rating ? 'fill-current' : 'text-gray-600'}`} />)}</div>
                         </div>
                         <p className="text-gray-400">{r.comment}</p>
                       </div>
                     ))}
                   </div>
                 </div>
               ))
             )}
           </div>
        )}

        {pluginMode === "upload" && (
           <div className="space-y-4 max-w-sm">
             <p className="text-[12px] text-gray-400 leading-relaxed mb-4">Submit a new plugin to the Nexus Marketplace.</p>
             <div className="space-y-3">
               <input type="text" placeholder="Plugin Name" value={newPluginData.name} onChange={e => setNewPluginData({...newPluginData, name: e.target.value})} className="w-full bg-[#111] border border-white/5 rounded-[12px] py-3 px-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors" />
               <input type="text" placeholder="Author Name" value={newPluginData.author} onChange={e => setNewPluginData({...newPluginData, author: e.target.value})} className="w-full bg-[#111] border border-white/5 rounded-[12px] py-3 px-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors" />
               <textarea placeholder="Description" rows={3} value={newPluginData.description} onChange={e => setNewPluginData({...newPluginData, description: e.target.value})} className="w-full bg-[#111] border border-white/5 rounded-[12px] py-3 px-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 resize-none transition-colors" />
               <div className="flex items-center justify-between gap-4">
                 <select value={newPluginData.price} onChange={e => setNewPluginData({...newPluginData, price: e.target.value})} className="bg-[#111] border border-white/5 rounded-[12px] py-3 px-4 text-sm text-white focus:outline-none focus:border-indigo-500/50">
                   <option>Free</option>
                   <option>Pro</option>
                 </select>
                 <button 
                   onClick={() => {
                     if (newPluginData.name) {
                       const newPlugin: Plugin = { id: `ext-${Date.now()}`, ...newPluginData, rating: 0, downloads: 0, isInstalled: true, reviews: [] };
                       setPlugins(prev => [newPlugin, ...prev]);
                       setPluginMode('installed');
                       setNewPluginData({ name: "", description: "", author: "", price: "Free" });
                       hapticVibrate([40, 50, 40]);
                     }
                   }}
                   disabled={!newPluginData.name}
                   className="flex-1 bg-white text-black hover:bg-gray-200 py-3 rounded-[12px] font-bold text-sm tracking-wide disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                 >
                   <Upload className="w-4 h-4" /> Publish
                 </button>
               </div>
             </div>
           </div>
        )}
        
      </div>

      <AnimatePresence>
        {reviewPluginId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-x-0 bottom-0 top-0 bg-black/80 z-[100] flex items-center justify-center p-6 backdrop-blur-md">
            <motion.div initial={{ y: 20, scale: 0.95 }} animate={{ y: 0, scale: 1 }} className="w-full max-w-sm bg-[#111] border border-white/10 rounded-[24px] p-6 shadow-2xl">
              <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-4">
                <h3 className="text-white font-bold text-lg font-display">Plugin Review</h3>
                <button onClick={() => setReviewPluginId(null)} className="p-1.5 rounded-[10px] bg-white/5 hover:bg-white/10 text-gray-400 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              {(() => {
                const plugin = plugins.find(p => p.id === reviewPluginId);
                return plugin ? (
                  <>
                    <div className="mb-6">
                      <h4 className="text-white font-medium text-sm">{plugin.name}</h4>
                      <p className="text-gray-500 text-[11px]">Leave a review for this plugin.</p>
                    </div>
                    
                    {plugin.isInstalled ? (
                      <>
                        <div className="flex gap-2 mb-6 justify-center">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <button key={i} onClick={() => setReviewData((prev: any) => ({ ...prev, rating: i + 1 }))} className="p-2 transition-all hover:scale-110 active:scale-95">
                              <Star className={`w-8 h-8 ${i < reviewData.rating ? 'text-amber-500 fill-current drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'text-white/10'}`} />
                            </button>
                          ))}
                        </div>
                        <textarea placeholder="Share your experience..." rows={4} value={reviewData.comment} onChange={e => setReviewData({...reviewData, comment: e.target.value})} className="w-full bg-[#050505] border border-white/5 rounded-[12px] py-3 px-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 resize-none mb-4 transition-colors" />
                        <button 
                          onClick={() => {
                            setPlugins(prev => prev.map(p => p.id === reviewPluginId ? { ...p, reviews: [{ user: "NexusUser", rating: reviewData.rating, comment: reviewData.comment || "No comment." }, ...p.reviews] } : p));
                            setReviewPluginId(null);
                            setReviewData({ rating: 5, comment: "" });
                            hapticVibrate([40, 50, 40]);
                          }}
                          className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-3 rounded-[12px] font-bold text-[12px] uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                        >
                          <Heart className="w-4 h-4" /> Submit Review
                        </button>
                      </>
                    ) : (
                      <div className="space-y-4">
                       <div className="max-h-40 overflow-y-auto pr-2 space-y-2 scrollbar-hide">
                         {plugin.reviews.length === 0 ? <p className="text-gray-500 text-xs">No reviews yet.</p> : plugin.reviews.map((r, idx) => (
                           <div key={idx} className="bg-white/5 rounded-lg p-2.5 text-[11px] border border-white/5">
                             <div className="flex items-center justify-between mb-1">
                               <strong className="text-white">{r.user}</strong>
                               <div className="flex gap-0.5 text-amber-500">{Array.from({ length: 5 }).map((_, j) => <Star key={j} className={`w-2 h-2 ${j < r.rating ? 'fill-current' : 'text-gray-600'}`} />)}</div>
                             </div>
                             <p className="text-gray-400">{r.comment}</p>
                           </div>
                         ))}
                       </div>
                       <div className="pt-4 border-t border-white/5">
                         <p className="text-amber-500/80 text-[11px] flex items-center gap-2 bg-amber-500/10 p-2 rounded-lg">
                           <Info className="w-4 h-4 shrink-0" />
                           Install this plugin to leave your own review.
                         </p>
                       </div>
                      </div>
                    )}
                  </>
                ) : null;
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
