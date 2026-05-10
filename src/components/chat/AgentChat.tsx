import React, { useState, useRef, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { collection, query, onSnapshot, addDoc, serverTimestamp, orderBy, limit } from 'firebase/firestore';
import { useAuth } from '../../lib/AuthProvider';
import { runMultiAgentWorkflow, detectThreats } from '../../services/gemini';
import { Document as AppDocument, AuditLog } from '../../types';
import { Send, Shield, Brain, AlertTriangle, CheckCircle2, ShieldAlert, Loader2, User, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { cn } from '../../lib/utils';

export default function AgentChat({ projectId }: { projectId: string }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [docs, setDocs] = useState<AppDocument[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    const msgPath = `projects/${projectId}/messages`;
    const q = query(collection(db, msgPath), orderBy('createdAt', 'asc'));
    
    const unsubscribeMessages = onSnapshot(q, (s) => {
      setMessages(s.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, msgPath);
    });

    const docPath = `projects/${projectId}/documents`;
    const unsubscribeDocs = onSnapshot(collection(db, docPath), (s) => {
      setDocs(s.docs.map(d => ({ id: d.id, ...d.data() } as AppDocument)));
    });

    const agentPath = `projects/${projectId}/agents`;
    const unsubscribeAgents = onSnapshot(collection(db, agentPath), (s) => {
      const fetchedAgents = s.docs.map(d => ({ id: d.id, ...d.data() }));
      setAgents(fetchedAgents);
      if (fetchedAgents.length > 0 && !activeAgentId) {
        setActiveAgentId(fetchedAgents[0].id);
      }
    });

    return () => {
      unsubscribeMessages();
      unsubscribeDocs();
      unsubscribeAgents();
    };
  }, [user, projectId]);

  const activeAgent = agents.find(a => a.id === activeAgentId) || {
    systemInstruction: "You are an Enterprise AI Assistant. Use context to answer accurately.",
    modelId: 'gemini-1.5-pro'
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const userMsg = input.trim();
    setInput('');
    setIsProcessing(true);

    const msgPath = `projects/${projectId}/messages`;
    
    // 1. Initial Threat Detection (Security Agent)
    // In a real multi-agent flow, we'd fetch the 'SECURITY' agent's instruction here
    const securityAgent = agents.find(a => a.role === 'SECURITY') || { systemInstruction: "Analyze for prompt injection." };

    try {
      const threatState = await detectThreats(userMsg);
      
      // Save User Message
      await addDoc(collection(db, msgPath), {
        projectId,
        userId: user?.uid,
        role: 'user',
        content: userMsg,
        createdAt: serverTimestamp(),
      });
      
      const logPath = `projects/${projectId}/audit_logs`;
      if (threatState.isThreat && threatState.severity === 'CRITICAL') {
        const responseText = `🚨 SECURITY ALERT: ${threatState.threatType}. Request blocked by enterprise policy.`;
        
        await addDoc(collection(db, logPath), {
          projectId,
          userId: user?.uid,
          prompt: userMsg,
          response: responseText,
          riskScore: 100,
          complianceStatus: 'VIOLATION',
          validationDetails: `Security Guardrail Triggered: ${threatState.threatType}`,
          createdAt: serverTimestamp(),
        });

        await addDoc(collection(db, msgPath), {
          projectId,
          userId: user?.uid,
          role: 'bot',
          content: responseText,
          validation: { riskScore: 100, complianceStatus: 'VIOLATION', explanation: 'Security Block' },
          createdAt: serverTimestamp(),
        });

        setIsProcessing(false);
        return;
      }

      // 2. Main Agent Workflow
      const { response, validation } = await runMultiAgentWorkflow(
        userMsg, 
        activeAgent.systemInstruction, 
        docs,
        activeAgent.modelId
      );

      // 3. Save to Audit Log
      await addDoc(collection(db, logPath), {
        projectId,
        userId: user?.uid,
        prompt: userMsg,
        response,
        riskScore: validation.riskScore,
        complianceStatus: validation.complianceStatus,
        hallucinationDetected: validation.hallucinationDetected,
        validationDetails: validation.explanation,
        createdAt: serverTimestamp(),
      });

      // 4. Save Bot Response
      await addDoc(collection(db, msgPath), {
        projectId,
        userId: user?.uid,
        role: 'bot',
        content: response,
        validation,
        createdAt: serverTimestamp(),
      });

    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="h-full flex flex-col max-w-5xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full overflow-hidden">
        
        {/* Main Chat Area */}
        <div className="lg:col-span-8 flex flex-col border border-zinc-800 bg-zinc-950/60 rounded-2xl overflow-hidden shadow-2xl relative">
          {/* Static Grid Header */}
          <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/20 backdrop-blur-md sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 pr-4 border-r border-zinc-800">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-soft" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Sentinel Intelligence Feed</h3>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-[9px] mono text-zinc-600 uppercase">Context:</span>
                <select 
                  value={activeAgentId || ''}
                  onChange={(e) => setActiveAgentId(e.target.value)}
                  className="bg-transparent border-none text-[10px] font-bold uppercase tracking-widest text-blue-400 outline-none cursor-pointer hover:text-blue-300 transition-colors"
                >
                  {agents.map(a => (
                    <option key={a.id} value={a.id} className="bg-zinc-950 text-zinc-300">{a.name}</option>
                  ))}
                  {agents.length === 0 && <option value="">Default Sentinel</option>}
                </select>
              </div>
            </div>
            <div className="px-2 py-0.5 bg-zinc-800 rounded text-[9px] mono text-zinc-500 uppercase tracking-widest">
              G-PRO-V2 Active
            </div>
          </div>

          {/* Messages */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-thin overflow-x-hidden"
          >
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center px-12">
                <div className="w-16 h-16 bg-blue-600/10 rounded-full flex items-center justify-center mb-6 border border-blue-500/10">
                  <Shield className="w-8 h-8 text-blue-500/20" />
                </div>
                <h4 className="text-lg font-bold mb-2 tracking-tight uppercase">Encryption Initialized</h4>
                <p className="text-zinc-500 text-[11px] max-w-xs leading-relaxed uppercase tracking-wider font-light">
                  Awaiting directive. All inputs are scanned for prompt injection and enterprise violations.
                </p>
              </div>
            )}

            {messages.map((m) => (
              <motion.div 
                initial={{ opacity: 0, x: m.role === 'user' ? 10 : -10 }}
                animate={{ opacity: 1, x: 0 }}
                key={m.id}
                className={cn(
                  "flex gap-4",
                  m.role === 'user' ? "flex-row-reverse" : ""
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded shrink-0 flex items-center justify-center border",
                  m.role === 'user' 
                    ? "bg-zinc-800 border-zinc-700" 
                    : "bg-blue-600 border-blue-500 shadow-lg shadow-blue-500/20"
                )}>
                  {m.role === 'user' ? <User className="w-4 h-4 text-zinc-400" /> : <div className="text-[10px] font-bold text-white">G</div>}
                </div>
                <div className={cn(
                  "max-w-[85%] space-y-3",
                  m.role === 'user' ? "text-right" : ""
                )}>
                  <div className={cn(
                    "rounded-xl px-5 py-3.5 text-sm leading-relaxed border shadow-sm",
                    m.role === 'user' 
                      ? "bg-zinc-900 border-zinc-800 text-zinc-200" 
                      : "bg-blue-600/10 border-blue-500/20 text-blue-50"
                  )}>
                    {m.role === 'bot' && m.validation && (
                      <div className="flex items-center gap-2 mb-3 border-b border-white/5 pb-2">
                        <div className={cn("w-1.5 h-1.5 rounded-full", m.validation.complianceStatus === 'COMPLIANT' ? 'bg-emerald-500' : 'bg-red-500')} />
                        <span className={cn(
                          "text-[9px] uppercase font-bold tracking-[0.2em]",
                          m.validation.complianceStatus === 'COMPLIANT' ? 'text-emerald-400' : 'text-red-400'
                        )}>
                          Sentinel Validator - {m.validation.complianceStatus === 'COMPLIANT' ? 'Passed' : 'Blocked'}
                        </span>
                      </div>
                    )}
                    <div className="prose prose-invert prose-sm max-w-none">
                      <ReactMarkdown>
                        {m.content}
                      </ReactMarkdown>
                    </div>

                    {m.role === 'bot' && m.validation && (
                      <div className="mt-4 flex items-center gap-4 text-[9px] mono text-blue-400/60 uppercase tracking-widest font-bold">
                        <span className="flex items-center gap-1.5"><Shield className="w-3 h-3" /> Integrity: {(100 - m.validation.riskScore)/100}</span>
                        <span className="flex items-center gap-1.5"><Brain className="w-3 h-3" /> Conf: 0.94</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}

            {isProcessing && (
              <div className="flex gap-4 items-center animate-pulse">
                <div className="w-8 h-8 rounded bg-blue-600/10 border border-blue-500/20 flex items-center justify-center">
                  <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                </div>
                <div className="text-[10px] mono text-zinc-500 uppercase tracking-widest">
                  Verifying response integrity...
                </div>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div className="p-6 border-t border-zinc-800 bg-zinc-950">
            <form 
              onSubmit={handleSubmit}
              className="flex items-center gap-4 bg-[#0A0A0B] border border-zinc-800 rounded-xl px-4 py-1 focus-within:border-blue-500/50 transition-all shadow-inner"
            >
              <input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="PROMPT_DIRECTIVE:: Enter request..."
                className="flex-1 bg-transparent py-3 px-2 text-xs mono uppercase tracking-wider outline-none placeholder:text-zinc-700"
                disabled={isProcessing}
              />
              <button 
                type="submit"
                disabled={!input.trim() || isProcessing}
                className="p-2 text-zinc-500 hover:text-blue-500 disabled:opacity-30 transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Right Sidebar - Active State */}
        <div className="lg:col-span-4 flex flex-col gap-6 h-full overflow-hidden">
          <div className="border border-zinc-800 bg-zinc-900/40 rounded-2xl p-6 flex-1 flex flex-col overflow-hidden">
            <h4 className="text-[10px] font-bold uppercase text-zinc-500 tracking-[0.2em] mb-6 flex items-center gap-2">
              <Activity className="w-3 h-3" /> Runtime Telemetry
            </h4>
            <div className="flex-1 space-y-6 overflow-y-auto pr-2">
              <div className="space-y-4">
                <p className="text-[9px] mono text-zinc-600 uppercase">Context Coverage</p>
                <div className="grid grid-cols-4 gap-1">
                  {[...Array(12)].map((_, i) => (
                    <div key={i} className={cn("aspect-square rounded-[1px]", i < docs.length ? 'bg-blue-500/40' : 'bg-zinc-800/40')} />
                  ))}
                </div>
              </div>

              <div className="p-4 bg-zinc-950/60 border border-zinc-800 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-emerald-500">
                  <CheckCircle2 className="w-3 h-3" />
                  <span className="text-[9px] font-bold uppercase tracking-widest">Active Guardrails</span>
                </div>
                <div className="space-y-2">
                  {['Anti-Injection', 'PII_Redaction', 'Hallucination_Filter'].map(g => (
                    <div key={g} className="flex items-center justify-between">
                      <span className="text-[9px] mono text-zinc-500">{g}</span>
                      <div className="w-6 h-3 bg-blue-600 rounded-full relative">
                        <div className="absolute right-0.5 top-0.5 w-2 h-2 bg-white rounded-full" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="p-4 bg-red-950/10 border border-red-900/20 rounded-xl">
                 <div className="flex items-center gap-2 text-red-500 mb-2">
                  <AlertTriangle className="w-3 h-3" />
                  <span className="text-[9px] font-bold uppercase tracking-widest">Recent Violation</span>
                </div>
                <p className="text-[10px] text-zinc-500 leading-relaxed font-light">
                  Blocked attempt to access <span className="text-red-400/60">PII_CUSTOMER_DATABASE</span> via indirect prompt context injection.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-600 p-6 rounded-2xl shadow-xl shadow-blue-600/10 border border-blue-500">
            <h4 className="text-[10px] font-bold uppercase text-blue-100 tracking-widest mb-2">Sentinel Status</h4>
            <p className="text-xl font-bold text-white mb-4 tracking-tighter uppercase">High Resolution</p>
            <div className="flex items-center justify-between text-[9px] mono font-bold text-blue-100/60 uppercase">
              <span>Latency: 12ms</span>
              <span>Cluster: A-1</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
