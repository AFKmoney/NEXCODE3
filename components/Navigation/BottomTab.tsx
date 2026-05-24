"use client";

import React from "react";

type TabProps = {
  activeTab: string;
  id: string;
  icon: React.ElementType;
  label: string;
  onClick: (id: string) => void;
};

export const BottomTab = ({ activeTab, id, icon: Icon, label, onClick }: TabProps) => (
  <button
    onClick={() => onClick(id)}
    className={`flex flex-col items-center justify-center w-full py-2 gap-1 transition-colors ${
      activeTab === id ? "text-indigo-400" : "text-gray-500 hover:text-gray-400"
    }`}
  >
    <Icon className="w-5 h-5" />
    <span className="text-[10px] font-medium">{label}</span>
  </button>
);
