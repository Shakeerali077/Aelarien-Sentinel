import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, doc, setDoc, deleteDoc, serverTimestamp, getDocs, where } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { useAuth } from '../../lib/AuthProvider';
import { Users, UserPlus, Shield, ShieldCheck, Mail, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';
import { ListSkeleton } from '../ui/Skeleton';

interface Member {
  id: string;
  email: string;
  role: 'ADMIN' | 'ANALYST';
  addedAt: any;
}

export default function TeamSettings({ projectId }: { projectId: string }) {
  const { user } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'ADMIN' | 'ANALYST'>('ANALYST');
  const [isInviting, setIsInviting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const path = `projects/${projectId}/members`;
    const unsubscribe = onSnapshot(collection(db, path), (snapshot) => {
      setMembers(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Member)));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });

    return () => unsubscribe();
  }, [user, projectId]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setIsInviting(true);
    setError(null);

    try {
      // In a real app, we'd need to find the userId by email or use an invitation system
      // For this implementation, we'll assume the email is the key and use a placeholder ID or 
      // trigger a cloud function. Since we only have client-side, we'll just use a mock hash of email as ID
      // or simply wait for the user to be found.
      // Better approach for this demo: Just use the email as the document ID in members subcollection
      // (This is a simplification)
      
      const memberId = inviteEmail.replace(/[@.]/g, '_'); // Mock ID generation
      
      await setDoc(doc(db, `projects/${projectId}/members`, memberId), {
        email: inviteEmail,
        role: inviteRole,
        addedAt: serverTimestamp(),
      });

      setInviteEmail('');
      setIsInviting(false);
      toast.success(`Identity provisioned: ${inviteEmail}`);
    } catch (error) {
      toast.error("Provisioning failed. Unauthorized.");
      setError("Authorization failed: Only project administrators can manage team access.");
      setIsInviting(false);
    }
  };

  const removeMember = async (memberId: string) => {
    try {
      await deleteDoc(doc(db, `projects/${projectId}/members`, memberId));
      toast.info("Access revoked for operator.");
    } catch (error) {
      toast.error("Revocation failed.");
      setError("Removal failed: Insufficient permissions.");
    }
  };

  // if (loading) return <div className="h-64 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div>;

  return (
    <div className="space-y-10 max-w-5xl">
       <div className="flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tighter uppercase mb-2">Team <span className="text-blue-500">Access Control</span></h2>
          <p className="text-zinc-500 font-light max-w-xl text-sm">
            Manage enterprise roles and workspace visibility for Sentinel operators.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Invite Form */}
        <div className="lg:col-span-1">
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-8 sticky top-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <UserPlus className="w-5 h-5 text-blue-500" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-white">Delegate Access</h3>
            </div>

            <form onSubmit={handleInvite} className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Operator Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                  <input 
                    type="email"
                    value={inviteEmail}
                    onChange={e => setInviteEmail(e.target.value)}
                    placeholder="operator@aelarien.com"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-12 pr-4 py-3 text-sm mono outline-none focus:border-blue-500/50 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Operational Rank</label>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    type="button"
                    onClick={() => setInviteRole('ANALYST')}
                    className={cn(
                      "px-4 py-3 rounded-xl border text-[10px] font-bold uppercase tracking-widest transition-all",
                      inviteRole === 'ANALYST' ? "bg-blue-600/10 border-blue-500/50 text-blue-400" : "bg-zinc-950 border-zinc-800 text-zinc-600 hover:border-zinc-700"
                    )}
                  >
                    Analyst
                  </button>
                  <button 
                    type="button"
                    onClick={() => setInviteRole('ADMIN')}
                    className={cn(
                      "px-4 py-3 rounded-xl border text-[10px] font-bold uppercase tracking-widest transition-all",
                      inviteRole === 'ADMIN' ? "bg-blue-600/10 border-blue-500/50 text-blue-400" : "bg-zinc-950 border-zinc-800 text-zinc-600 hover:border-zinc-700"
                    )}
                  >
                    Admin
                  </button>
                </div>
              </div>

              <button 
                type="submit"
                disabled={!inviteEmail || isInviting}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl shadow-blue-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isInviting ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Provision Identity'}
              </button>

              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3"
                  >
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-red-400 leading-relaxed font-medium">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </div>
        </div>

        {/* Member List */}
        <div className="lg:col-span-2">
          <div className="bg-zinc-900/20 border border-zinc-800 rounded-3xl overflow-hidden">
            <div className="flex items-center justify-between p-8 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-zinc-500" />
                <h3 className="text-sm font-bold uppercase tracking-widest text-white">Authorized Operators</h3>
              </div>
              <span className="text-[10px] mono text-zinc-500">{members.length} Active</span>
            </div>

            <div className="divide-y divide-zinc-800">
              {loading ? (
                <div className="p-4">
                  <ListSkeleton count={4} />
                </div>
              ) : members.length === 0 ? (
                <div className="p-12 text-center text-zinc-600 text-[10px] font-bold uppercase tracking-widest">
                  No delegates provisioned for this cluster.
                </div>
              ) : (
                members.map((member) => (
                  <div key={member.id} className="p-6 flex items-center justify-between group hover:bg-zinc-800/20 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center border",
                        member.role === 'ADMIN' ? "bg-amber-500/10 border-amber-500/20" : "bg-zinc-900 border-zinc-800"
                      )}>
                        {member.role === 'ADMIN' ? <ShieldCheck className="w-5 h-5 text-amber-500" /> : <Users className="w-5 h-5 text-zinc-600" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white mb-0.5">{member.email}</p>
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded",
                            member.role === 'ADMIN' ? "bg-amber-500/10 text-amber-500" : "bg-blue-500/10 text-blue-400"
                          )}>
                            {member.role}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => removeMember(member.id)}
                      className="p-2 text-zinc-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all rounded-lg hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
