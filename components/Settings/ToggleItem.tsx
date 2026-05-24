"use client";

import React from "react";
import { ToggleRight, ToggleLeft } from "lucide-react";

export const ToggleItem = ({ title, desc, state, toggle, premium = false }: { title: string, desc: string, state: boolean, toggle: () => void, premium?: boolean }) => (
  <div className="flex items-center justify-between cursor-pointer group py-3.5 border-b border-gray-800/50 last:border-0" onClick={toggle}>
    <div className="space-y-1.5 pr-4">
      <h4 className="text-[14px] font-semibold text-gray-200 group-hover:text-indigo-300 transition-colors flex items-center gap-2">
        {title} {premium && <span className="text-[8px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Premium</span>}
      </h4>
      <p className="text-[11px] text-gray-500 leading-relaxed max-w-[220px]">{desc}</p>
    </div>
    {state ? <ToggleRight className={`w-9 h-9 ${premium ? 'text-amber-500' : 'text-indigo-500'} shrink-0 filter drop-shadow-sm`} /> : <ToggleLeft className="w-9 h-9 text-gray-700 shrink-0 group-hover:text-gray-500 transition-colors" />}
  </div>
);
