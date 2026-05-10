import React, { useState } from 'react';
import { AuthProvider, useAuth } from './lib/AuthProvider';
import { Shield, Brain, FileText, Activity, Settings, LogOut, ChevronRight, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import DashboardOverview from './components/dashboard/Overview';
import AgentConsole from './components/console/AgentConsole';
import AuditLogs from './components/governance/AuditLogs';
import PolicyEditor from './components/governance/PolicyEditor';
import KnowledgeBase from './components/knowledge/KnowledgeBase';
import ProjectSelection from './components/projects/ProjectSelection';
import TeamSettings from './components/settings/TeamSettings';
import AgentManagement from './components/agents/AgentManagement';
import LandingPage from './components/layout/LandingPage';
import { Layers, Users, Cpu } from 'lucide-react';

const AppContent = () => {
  const { user, login, logout, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [projectId, setProjectId] = useState<string | null>(null);

  if (loading) return (
    <div className="h-screen w-screen flex items-center justify-center bg-[#0a0a0a]">
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
      />
    </div>
  );

  if (!user) {
    return <LandingPage onLogin={() => login()} />;
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'console', label: 'Mission Control', icon: Brain },
    { id: 'agents', label: 'Agent Clusters', icon: Cpu },
    { id: 'knowledge', label: 'Knowledge Base', icon: FileText },
    { id: 'policy', label: 'Policy Registry', icon: Shield },
    { id: 'audit', label: 'Audit Logs', icon: Activity },
    { id: 'settings', label: 'Team Access', icon: Users },
  ];

  return (
    <div className="h-screen flex flex-col bg-[#0A0A0B] text-zinc-100 overflow-hidden grid-bg">
      {/* Header */}
      <header className="h-16 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md flex items-center justify-between px-8 z-20">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-blue-600 rounded flex items-center justify-center font-bold text-white shadow-lg shadow-blue-900/20 text-xs">A</div>
          <h1 className="text-sm font-bold tracking-tighter text-white uppercase flex items-center gap-1.5">
            Aelarien <span className="text-blue-500 font-normal">Sentinel</span>
          </h1>
          {projectId && (
            <div className="flex items-center gap-2">
              <div className="h-4 w-px bg-zinc-800 mx-2"></div>
              <button 
                onClick={() => setProjectId(null)}
                className="flex items-center gap-2 group"
              >
                <Layers className="w-3.5 h-3.5 text-zinc-500 group-hover:text-blue-400 transition-colors" />
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest group-hover:text-zinc-200 transition-colors">
                  {projectId.slice(0, 8)}...
                </span>
              </button>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-[9px] uppercase text-zinc-500 font-bold tracking-wider">System Posture</span>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-soft"></div>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-tight">Active Governance</span>
            </div>
          </div>
          <div className="h-8 w-px bg-zinc-800"></div>
          <div className="flex flex-col items-end">
            <span className="text-[9px] uppercase text-zinc-500 font-bold tracking-wider">HACKATHON WINDOW</span>
            <span className="text-[10px] text-zinc-300 mono uppercase tracking-tight">MAY 11-19, 2026</span>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-60 border-r border-zinc-800 bg-zinc-950/40 flex flex-col pt-6 z-10">
          <div className="text-[10px] uppercase text-zinc-500 font-bold mb-4 px-6 tracking-widest">Orchestration</div>
          
          <nav className="flex-1 px-3 space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-md transition-all duration-200 group focus:outline-none border ${
                  activeTab === tab.id 
                  ? 'bg-blue-600/10 text-blue-400 border-blue-500/20 shadow-lg shadow-blue-500/5' 
                  : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/5 border-transparent'
                }`}
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <tab.icon className={`w-4 h-4 transition-colors ${activeTab === tab.id ? 'text-blue-400' : 'text-zinc-500 group-hover:text-zinc-300'}`} />
                <span className="font-semibold text-xs tracking-tight">{tab.label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-8 px-6 space-y-4">
            <div className="text-[10px] uppercase text-zinc-500 font-bold tracking-widest">Intelligence</div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-[10px] font-bold text-zinc-400 mb-1.5 mono">
                  <span>Gemini Pro</span>
                  <span className="text-emerald-500">98.2%</span>
                </div>
                <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: '98%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] font-bold text-zinc-400 mb-1.5 mono">
                  <span>Gemini Flash</span>
                  <span className="text-blue-500">42ms</span>
                </div>
                <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500" style={{ width: '70%' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 mt-auto border-t border-zinc-800 space-y-4">
            <div className="flex items-center gap-3 px-2">
              <div className="w-8 h-8 rounded bg-zinc-800 border border-zinc-700 flex items-center justify-center overflow-hidden">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || ''} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[10px] font-bold text-zinc-400 uppercase">{user.email?.[0]}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-zinc-200 truncate uppercase tracking-tight">{user.displayName || 'SENTINEL_ADMIN'}</p>
                <p className="text-[9px] text-zinc-500 truncate mono uppercase tracking-tight">{user.email}</p>
              </div>
            </div>
            <button 
              onClick={() => logout()}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-zinc-500 hover:text-red-400 hover:bg-red-950/20 rounded transition-all border border-transparent hover:border-red-900/30"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Terminate</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-hidden relative">
          {!projectId ? (
            <div className="h-full overflow-auto">
              <ProjectSelection onSelect={setProjectId} />
            </div>
          ) : (
            <div className="h-full overflow-auto p-10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="h-full"
                >
                  {activeTab === 'dashboard' && <DashboardOverview projectId={projectId} />}
                  {activeTab === 'console' && <AgentConsole projectId={projectId} />}
                  {activeTab === 'agents' && <AgentManagement projectId={projectId} />}
                  {activeTab === 'knowledge' && <KnowledgeBase projectId={projectId} />}
                  {activeTab === 'policy' && <PolicyEditor projectId={projectId} />}
                  {activeTab === 'audit' && <AuditLogs projectId={projectId} />}
                  {activeTab === 'settings' && <TeamSettings projectId={projectId} />}
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </main>
      </div>

      <footer className="h-10 border-t border-zinc-800 bg-zinc-950/90 flex items-center px-8 justify-between text-[9px] mono text-zinc-600 z-20">
        <div className="flex gap-6 uppercase tracking-widest items-center">
          <span className="flex items-center gap-1.5"><div className="w-1 h-1 rounded-full bg-emerald-500" /> Uptime: 99.999%</span>
          <span className="flex items-center gap-1.5"><div className="w-1 h-1 rounded-full bg-blue-500" /> Latency: 12ms</span>
          <span className="flex items-center gap-1.5 text-zinc-500">Node: ASIA-SE-1</span>
        </div>
        <div className="uppercase tracking-[0.2em] font-medium">
          Aelarien Sentinel v1.0.4 - Transforming Enterprise Through AI
        </div>
      </footer>
    </div>
  );
};

import { Toaster } from 'sonner';

export default function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" theme="dark" richColors closeButton />
      <AppContent />
    </AuthProvider>
  );
}
