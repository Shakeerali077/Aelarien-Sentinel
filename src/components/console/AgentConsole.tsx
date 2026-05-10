import React, { useState, useEffect, useRef } from 'react';
import { collection, query, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Agent, AuditLog } from '../../types';
import { useAuth } from '../../lib/AuthProvider';
import { executeAgent } from '../../services/aiService';
import { Terminal, Send, Cpu, Brain, Shield, Loader2, Sparkles, AlertCircle, CheckCircle2, History } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';

export default function AgentConsole({ projectId }: { projectId: string }) {
  const { user } = useAuth();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [input, setInput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [history, setHistory] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const agentsPath = `projects/${projectId}/agents`;
    const unsubAgents = onSnapshot(query(collection(db, agentsPath)), (snap) => {
      const activeAgents = snap.docs.map(d => ({ id: d.id, ...d.data() } as Agent)).filter(a => a.isActive);
      setAgents(activeAgents);
      if (activeAgents.length > 0 && !selectedAgent) setSelectedAgent(activeAgents[0]);
      setLoading(false);
    });

    const logsPath = `projects/${projectId}/audit_logs`;
    const unsubLogs = onSnapshot(query(collection(db, logsPath), orderBy('createdAt', 'desc'), limit(15)), (snap) => {
      setHistory(snap.docs.map(d => ({ id: d.id, ...d.data() } as AuditLog)).reverse());
    });

    return () => { unsubAgents(); unsubLogs(); };
  }, [projectId]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [history]);

  const handleSend = async () => {
    if (!input.trim() || !selectedAgent || !user || isExecuting) return;
    
    setIsExecuting(true);
    const userPrompt = input;
    setInput('');

    try {
      await executeAgent(projectId, selectedAgent, userPrompt, user.uid);
      toast.success("Intelligence cycle complete.");
    } catch (error) {
      toast.error("Neural discharge failed. Check agent config.");
      setInput(userPrompt);
    } finally {
      setIsExecuting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[600px] flex items-center justify-center border border-zinc-800 bg-zinc-950/40 rounded-3xl">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-blue-500 mx-auto" />
          <p className="text-[10px] mono uppercase tracking-widest text-zinc-600">Initializing Core Interface...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-250px)]">
      {/* Sidebar: Agent Selector */}
      <div className="lg:col-span-3 space-y-6">
        <div className="space-y-4">
          <label className="text-[10px] mono text-zinc-500 uppercase tracking-widest px-1">Active Neural Clusters</label>
          <div className="space-y-2">
            {agents.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-zinc-800 text-center">
                <p className="text-[10px] text-zinc-600 lowercase italic">No active agents provisioned</p>
              </div>
            ) : agents.map((agent) => (
              <button
                key={agent.id}
                onClick={() => setSelectedAgent(agent)}
                className={cn(
                  "w-full p-4 rounded-2xl border transition-all text-left flex items-center gap-3 group",
                  selectedAgent?.id === agent.id 
                    ? "bg-blue-600/10 border-blue-500/20 text-white" 
                    : "bg-zinc-900/40 border-zinc-800 text-zinc-500 hover:border-zinc-700"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center transition-colors px-4",
                  selectedAgent?.id === agent.id ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-600 group-hover:bg-zinc-700"
                )}>
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-tight">{agent.name}</div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">{agent.role}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="p-5 bg-zinc-900/40 border border-zinc-800 rounded-2xl space-y-4">
          <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
            <Shield className="w-3.5 h-3.5 text-blue-500" />
            Enforcement Active
          </div>
          <p className="text-[10px] text-zinc-500 leading-relaxed font-light italic">
            Global governance policies are being injected into every orchestration cycle. 
            Risk analysis is performed in real-time.
          </p>
        </div>
      </div>

      {/* Main: Console Interface */}
      <div className="lg:col-span-9 flex flex-col border border-zinc-800 bg-zinc-950/60 rounded-3xl overflow-hidden shadow-2xl relative">
        {/* Terminal Header */}
        <div className="h-14 border-b border-zinc-800 px-6 flex items-center justify-between bg-zinc-900/20">
          <div className="flex items-center gap-3">
            <Terminal className="w-4 h-4 text-zinc-500" />
            <span className="text-[10px] mono text-zinc-400 uppercase tracking-widest">
              AE-SENTINEL // CORE_INTERFACE // {selectedAgent?.name || 'NULL'}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] mono text-emerald-500 uppercase">Synchronized</span>
            </div>
          </div>
        </div>

        {/* Message Log */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth"
        >
          {history.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-30 space-y-6">
              <Sparkles className="w-16 h-16 text-blue-500" />
              <div className="space-y-2">
                <p className="text-sm font-bold uppercase tracking-widest">Awaiting Command Input</p>
                <p className="text-[10px] mono lowercase tracking-widest">Establishing neural connection with selected cluster...</p>
              </div>
            </div>
          ) : history.map((log) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={log.id} 
              className="space-y-6"
            >
              {/* User Prompt */}
              <div className="flex items-start gap-4 justify-end">
                <div className="max-w-[80%] bg-zinc-900 border border-zinc-800 rounded-2xl rounded-tr-none p-4 shadow-lg shadow-black/20">
                  <p className="text-sm text-zinc-300 font-light leading-relaxed">{log.prompt}</p>
                </div>
                <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center shrink-0 border border-zinc-700">
                   <span className="text-[10px] font-bold text-zinc-500">U</span>
                </div>
              </div>

              {/* Agent Response */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shrink-0 border border-blue-500/50 shadow-lg shadow-blue-600/20">
                   <Cpu className="w-5 h-5 text-white" />
                </div>
                <div className="max-w-[85%] space-y-4">
                  <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl rounded-tl-none p-6 shadow-xl relative group">
                    <div className="flex items-center gap-3 mb-4 border-b border-zinc-800/50 pb-3">
                       <div className={cn(
                         "flex items-center gap-1.5 px-2 py-0.5 rounded text-[8px] font-black tracking-widest uppercase",
                         log.complianceStatus === 'COMPLIANT' ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                       )}>
                         {log.complianceStatus === 'COMPLIANT' ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                         {log.complianceStatus}
                       </div>
                       <span className="text-[9px] mono text-zinc-600 uppercase tracking-widest">Risk: {log.riskScore}%</span>
                    </div>
                    <p className="text-sm text-zinc-200 leading-relaxed font-light whitespace-pre-wrap">{log.response}</p>
                  </div>
                  
                  {log.validationDetails && (
                    <div className="px-4 py-2 bg-zinc-900/20 border border-zinc-800/50 rounded-xl flex items-center gap-3 group/detail hover:bg-zinc-900/40 transition-colors">
                      <History className="w-3 h-3 text-zinc-600 group-hover/detail:text-blue-500 transition-colors" />
                      <span className="text-[9px] mono text-zinc-600 uppercase tracking-widest group-hover/detail:text-zinc-400 transition-colors">
                        Reasoning Trace: {log.validationDetails}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          {isExecuting && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-start gap-4"
            >
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shrink-0 border border-blue-500/50 animate-pulse">
                 <Loader2 className="w-5 h-5 text-white animate-spin" />
              </div>
              <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl rounded-tl-none p-4 flex items-center gap-3">
                <span className="text-[10px] mono text-zinc-500 uppercase tracking-widest animate-pulse">Neural transmission in progress...</span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-6 border-t border-zinc-800 bg-zinc-900/20 backdrop-blur-xl">
           <div className="relative max-w-4xl mx-auto group">
              <input 
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder={selectedAgent ? `Command ${selectedAgent.name}...` : "Select an agent to begin..."}
                disabled={!selectedAgent || isExecuting}
                className="w-full bg-zinc-950 border border-zinc-800 hover:border-zinc-700 focus:border-blue-500/50 rounded-2xl pl-6 pr-16 py-5 text-sm transition-all focus:outline-none shadow-2xl disabled:opacity-50"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isExecuting}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 text-white rounded-xl flex items-center justify-center transition-all shadow-xl shadow-blue-600/20 group-hover:scale-105 active:scale-95"
              >
                {isExecuting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
           </div>
           <div className="flex justify-center mt-4">
              <p className="text-[9px] mono text-zinc-700 uppercase tracking-[0.3em]">Sentinel Alpha Orchestration Protocol v1.4.2</p>
           </div>
        </div>
      </div>
    </div>
  );
}
