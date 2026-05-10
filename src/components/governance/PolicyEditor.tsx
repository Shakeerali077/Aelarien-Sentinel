import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { Policy } from '../../types';
import { Shield, Plus, Trash2, CheckCircle, AlertTriangle, ToggleLeft, ToggleRight, Loader2, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';
import { ListSkeleton } from '../ui/Skeleton';

export default function PolicyEditor({ projectId }: { projectId: string }) {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newPolicy, setNewPolicy] = useState({ name: '', description: '', rules: '', severity: 'MEDIUM' as const });

  useEffect(() => {
    const path = `projects/${projectId}/policies`;
    const q = query(collection(db, path));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPolicies(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Policy)));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
    return () => unsubscribe();
  }, [projectId]);

  const handleAdd = async () => {
    if (!newPolicy.name || !newPolicy.rules) return;
    const path = `projects/${projectId}/policies`;
    try {
      await addDoc(collection(db, path), {
        ...newPolicy,
        rules: newPolicy.rules.split('\n').filter(r => r.trim()),
        isActive: true,
        projectId,
        createdAt: serverTimestamp(),
      });
      setNewPolicy({ name: '', description: '', rules: '', severity: 'MEDIUM' });
      setIsAdding(false);
      toast.success("Governance policy active.");
    } catch (error) {
      toast.error("Failed to deploy policy.");
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const togglePolicy = async (policy: Policy) => {
    try {
      await updateDoc(doc(db, `projects/${projectId}/policies`, policy.id), {
        isActive: !policy.isActive
      });
      toast.info(`Policy ${policy.isActive ? 'decommissioned' : 'activated'}.`);
    } catch (error) {
      toast.error("State transition failed.");
    }
  };

  const removePolicy = async (id: string) => {
    try {
      await deleteDoc(doc(db, `projects/${projectId}/policies`, id));
      toast.info("Policy purged from registry.");
    } catch (error) {
      toast.error("Purge failed.");
    }
  };

  if (loading) return <ListSkeleton count={4} />;

  return (
    <div className="space-y-10 max-w-5xl">
      <div className="flex items-end justify-between border-b border-zinc-800 pb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tighter uppercase mb-2">Governance <span className="text-blue-500 font-normal">Policies</span></h2>
          <p className="text-zinc-500 font-light max-w-xl leading-relaxed">
            Define high-resolution boundaries for your AI agent workforce. 
            Policies are enforced at runtime via the Sentinel Alpha reasoning engine.
          </p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all"
        >
          <Plus className="w-4 h-4" />
          Create Policy
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-8 space-y-6 overflow-hidden"
          >
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] mono text-zinc-500 uppercase tracking-widest">Policy Name</label>
                <input 
                  value={newPolicy.name}
                  onChange={e => setNewPolicy({...newPolicy, name: e.target.value})}
                  placeholder="e.g., PII Redaction"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] mono text-zinc-500 uppercase tracking-widest">Severity</label>
                <select 
                  value={newPolicy.severity}
                  onChange={e => setNewPolicy({...newPolicy, severity: e.target.value as any})}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 text-zinc-300"
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] mono text-zinc-500 uppercase tracking-widest">Enforcement description</label>
              <input 
                value={newPolicy.description}
                onChange={e => setNewPolicy({...newPolicy, description: e.target.value})}
                placeholder="Briefly describe the intent of this policy..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] mono text-zinc-500 uppercase tracking-widest">Rule Definitions (One per line)</label>
              <textarea 
                value={newPolicy.rules}
                onChange={e => setNewPolicy({...newPolicy, rules: e.target.value})}
                placeholder="- No email addresses in output\n- No financial data extraction\n- No social security numbers..."
                rows={4}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 mono"
              />
            </div>

            <div className="flex gap-4 pt-4 border-t border-zinc-800">
              <button 
                onClick={handleAdd}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all"
              >
                Deploy to Core
              </button>
              <button 
                onClick={() => setIsAdding(false)}
                className="px-8 py-3 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:text-white transition-all"
              >
                Discard
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-4">
        {policies.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-zinc-800 rounded-3xl opacity-40">
            <Shield className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <span className="text-[10px] mono uppercase tracking-widest">Zero policies active in this cluster.</span>
          </div>
        ) : policies.map((policy) => (
          <motion.div 
            layout
            key={policy.id}
            className={cn(
              "p-6 rounded-3xl border transition-all group flex items-center justify-between",
              policy.isActive ? "bg-zinc-900/40 border-zinc-800" : "bg-zinc-900/10 border-zinc-800/50 grayscale"
            )}
          >
            <div className="flex items-start gap-6">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center border",
                policy.severity === 'HIGH' ? "bg-red-500/10 border-red-500/20 text-red-500" :
                policy.severity === 'MEDIUM' ? "bg-amber-500/10 border-amber-500/20 text-amber-500" :
                "bg-blue-500/10 border-blue-500/20 text-blue-500"
              )}>
                <Shield className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h4 className="font-bold uppercase tracking-tight text-white">{policy.name}</h4>
                  <span className={cn(
                    "px-2 py-0.5 rounded text-[8px] font-bold tracking-widest uppercase",
                    policy.severity === 'HIGH' ? "bg-red-500/10 text-red-500" :
                    policy.severity === 'MEDIUM' ? "bg-amber-500/10 text-amber-500" :
                    "bg-blue-500/10 text-blue-500"
                  )}>
                    {policy.severity} RISK
                  </span>
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed max-w-lg mb-2">{policy.description}</p>
                <div className="flex flex-wrap gap-2">
                  {policy.rules.map((rule, i) => (
                    <div key={i} className="flex items-center gap-1 text-[9px] mono text-zinc-400 bg-zinc-950 px-2 py-1 rounded border border-zinc-800">
                      <CheckCircle className="w-2.5 h-2.5 text-zinc-600" />
                      {rule}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => togglePolicy(policy)}
                className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-500 hover:text-white transition-all"
                title={policy.isActive ? "Decommission" : "Activate"}
              >
                {policy.isActive ? <ToggleRight className="w-5 h-5 text-blue-500" /> : <ToggleLeft className="w-5 h-5" />}
              </button>
              <button 
                onClick={() => removePolicy(policy.id)}
                className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-500 hover:text-red-500 transition-all"
                title="Purge Policy"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="p-6 bg-blue-600/5 rounded-3xl border border-blue-500/10 flex items-start gap-4">
        <Info className="w-6 h-6 text-blue-500 shrink-0" />
        <p className="text-[11px] text-blue-400/80 leading-relaxed font-light">
          PRO TIP: Multi-agent chains share this policy layer. When an agent retrieves data from the knowledge base, 
          the system automatically scans the context for potential leaks against these rules before the agent processes 
          the information.
        </p>
      </div>
    </div>
  );
}
