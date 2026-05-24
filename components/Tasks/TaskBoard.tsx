"use client";

import React from "react";
import { motion } from "motion/react";
import { ListTodo, Kanban, Plus, CheckCircle2, Circle, Calendar } from "lucide-react";

export type TaskStatus = "todo" | "in-progress" | "done" | "archived";
export type TaskPriority = "low" | "medium" | "high";

export type ProjectTask = {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: string;
  dueDate: string;
  completedAt?: string;
};

type TaskBoardProps = {
  tasks: ProjectTask[];
  setTasks: React.Dispatch<React.SetStateAction<ProjectTask[]>>;
  taskView: "list" | "kanban";
  setTaskView: (val: "list" | "kanban") => void;
  isAddingTask: boolean;
  setIsAddingTask: (val: boolean) => void;
  newTaskTitle: string;
  setNewTaskTitle: (val: string) => void;
  pageVariants: any;
  hapticVibrate: (pattern: any) => void;
};

export const TaskBoard = ({
  tasks,
  setTasks,
  taskView,
  setTaskView,
  isAddingTask,
  setIsAddingTask,
  newTaskTitle,
  setNewTaskTitle,
  pageVariants,
  hapticVibrate
}: TaskBoardProps) => {
  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="absolute inset-0 flex flex-col pt-16 bg-[#050505]">
      <div className="flex-1 overflow-y-auto px-6 pb-24 scrollbar-hide">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[12px] bg-indigo-500/20 flex items-center justify-center text-indigo-400">
              <ListTodo className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-display font-medium text-white tracking-tight">Project Tasks</h2>
              <p className="text-xs text-gray-500 font-mono">Manage your workflow</p>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="bg-white/5 rounded-full p-1 flex">
              <button onClick={() => setTaskView("list")} className={`p-1.5 rounded-full transition-colors ${taskView === "list" ? "bg-white/10 text-white" : "text-gray-500"}`}><ListTodo className="w-4 h-4" /></button>
              <button onClick={() => setTaskView("kanban")} className={`p-1.5 rounded-full transition-colors ${taskView === "kanban" ? "bg-white/10 text-white" : "text-gray-500"}`}><Kanban className="w-4 h-4" /></button>
            </div>
            <button onClick={() => setIsAddingTask(true)} className="w-9 h-9 rounded-full bg-indigo-500 hover:bg-indigo-600 text-white flex items-center justify-center shadow-lg transition-colors"><Plus className="w-5 h-5" /></button>
          </div>
        </div>

        {isAddingTask && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-[#111] border border-white/10 p-4 rounded-[16px] mb-6">
            <input autoFocus type="text" placeholder="Task title..." value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} onKeyDown={e => {
              if (e.key === 'Enter' && newTaskTitle) {
                setTasks([...tasks, { id: `t-${Date.now()}`, title: newTaskTitle, description: "", status: "todo", priority: "medium", assignee: "Unassigned", dueDate: "" }]);
                setNewTaskTitle("");
                setIsAddingTask(false);
                hapticVibrate(15);
              } else if (e.key === 'Escape') setIsAddingTask(false);
            }} className="w-full bg-transparent text-sm text-white placeholder-gray-500 outline-none font-medium mb-3" />
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-gray-500 font-mono">Press Enter to save, Esc to cancel</p>
              <div className="flex gap-2">
                <button onClick={() => setIsAddingTask(false)} className="px-3 py-1.5 rounded-full text-[10px] uppercase tracking-widest text-gray-400 hover:text-white transition-colors">Cancel</button>
                <button onClick={() => { if(newTaskTitle){ setTasks([...tasks, { id: `t-${Date.now()}`, title: newTaskTitle, description: "", status: "todo", priority: "medium", assignee: "Unassigned", dueDate: "" }]); setNewTaskTitle(""); setIsAddingTask(false); hapticVibrate(15); } }} className="px-3 py-1.5 rounded-full bg-indigo-500 hover:bg-indigo-600 text-white text-[10px] uppercase tracking-widest font-bold transition-colors">Save</button>
              </div>
            </div>
          </motion.div>
        )}

        {taskView === "list" ? (
          <div className="space-y-2">
            {tasks.map(t => (
              <div key={t.id} className={`group bg-[#111] border border-white/5 hover:border-white/10 rounded-[12px] p-3 flex items-center gap-3 transition-colors cursor-pointer ${t.status === 'archived' ? 'opacity-50' : ''}`} onClick={() => setTasks(tasks.map(x => x.id === t.id ? { ...x, status: x.status === "done" ? "todo" : "done", completedAt: x.status !== "done" ? new Date().toISOString() : undefined } : x))}>
                <button className={`shrink-0 w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${t.status === "done" || t.status === "archived" ? "bg-emerald-500 border-emerald-500 text-white" : "border-white/20 text-transparent"}`}>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium leading-tight truncate transition-colors ${t.status === "done" || t.status === "archived" ? "text-gray-500 line-through" : "text-white"}`}>{t.title} {t.status === "archived" && <span className="ml-2 text-xs font-mono text-purple-400 uppercase tracking-wider">(Archived)</span>}</p>
                  {(t.assignee !== "Unassigned" || t.dueDate || t.completedAt) && (
                    <div className="flex items-center gap-3 mt-1.5 text-[10px] text-gray-500 font-mono">
                      {t.assignee !== "Unassigned" && <span className="flex items-center gap-1"><Circle className="w-3 h-3" /> {t.assignee}</span>}
                      {t.dueDate && <span className="flex items-center gap-1 text-indigo-400"><Calendar className="w-3 h-3" /> {t.dueDate}</span>}
                      {t.status === "archived" && t.completedAt && <span className="flex items-center gap-1 text-purple-400">Archived {new Date(t.completedAt).toLocaleDateString()}</span>}
                    </div>
                  )}
                </div>
                <div className={`shrink-0 px-2 py-0.5 rounded text-[9px] uppercase tracking-widest font-bold ${t.priority === 'high' ? 'bg-red-500/10 text-red-400' : t.priority === 'medium' ? 'bg-amber-500/10 text-amber-400' : 'bg-blue-500/10 text-blue-400'}`}>{t.priority}</div>
              </div>
            ))}
            {tasks.length === 0 && <div className="text-center py-10 text-xs text-gray-500 font-mono">No tasks yet.</div>}
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {(["todo", "in-progress", "done", "archived"] as TaskStatus[]).map(status => {
              const statusTasks = tasks.filter(t => t.status === status);
              if (status === "archived" && statusTasks.length === 0) return null; // hide archive if empty
              
              return (
              <div key={status} className={`bg-[#0a0a0a] rounded-[16px] border border-white/5 p-4 ${status === 'archived' ? 'opacity-70 grayscale' : ''}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[11px] uppercase tracking-widest font-bold text-gray-400 flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${status === 'todo' ? 'bg-gray-500' : status === 'in-progress' ? 'bg-amber-500' : status === 'done' ? 'bg-emerald-500' : 'bg-purple-500'}`} />
                    {status.replace('-', ' ')}
                    <span className="text-gray-600 bg-white/5 px-1.5 rounded">{statusTasks.length}</span>
                  </h3>
                </div>
                <div className="space-y-2">
                  {statusTasks.map(t => (
                    <div key={t.id} className="bg-[#111] border border-white/5 rounded-[12px] p-3 active:scale-[0.98] transition-transform">
                      <p className="text-sm font-medium text-white leading-snug mb-2">{t.title}</p>
                      {t.description && <p className="text-xs text-gray-500 line-clamp-2 mb-3">{t.description}</p>}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${t.priority === 'high' ? 'bg-red-500' : t.priority === 'medium' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                          <span className="text-[10px] text-gray-500 font-mono">{t.assignee}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {status !== "archived" && (
                            <button onClick={() => {
                              const nextStatus = status === 'todo' ? 'in-progress' : status === 'in-progress' ? 'done' : 'todo';
                              const completedAt = nextStatus === 'done' ? new Date().toISOString() : undefined;
                              setTasks(tasks.map(x => x.id === t.id ? { ...x, status: nextStatus, completedAt } : x));
                            }} className="text-[10px] text-gray-600 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-2 py-1 rounded">Move</button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {statusTasks.length === 0 && (
                    <div className="border border-dashed border-white/10 rounded-[12px] p-4 text-center">
                      <p className="text-[11px] text-gray-600 font-mono">No tasks</p>
                    </div>
                  )}
                </div>
              </div>
            )})}
          </div>
        )}
      </div>
    </motion.div>
  );
};
