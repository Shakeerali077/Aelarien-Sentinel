import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, addDoc, serverTimestamp, where } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { useAuth } from '../../lib/AuthProvider';
import { Shield, Plus, ChevronRight, LayoutGrid, Clock, Loader2, Brain, FileText, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Project {
  id: string;
  name: string;
  ownerId: string;
  createdAt: any;
}

interface ProjectSelectionProps {
  onSelect: (projectId: string) => void;
}

export default function ProjectSelection({ onSelect }: ProjectSelectionProps) {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'projects'), where('ownerId', '==', user.uid));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setProjects(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Project)));
      setIsLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'projects');
    });

    return () => unsubscribe();
  }, [user]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    setIsCreating(true);

    try {
      const docRef = await addDoc(collection(db, 'projects'), {
        name: newProjectName,
        ownerId: user?.uid,
        members: [user?.uid],
        createdAt: serverTimestamp(),
      });
      setNewProjectName('');
      setIsCreating(false);
      onSelect(docRef.id);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'projects');
      setIsCreating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-4xl font-bold tracking-tighter uppercase mb-2">Project <span className="text-blue-500">Selection</span></h1>
          <p className="text-zinc-500 text-sm font-light">Select an enterprise workspace to begin orchestration.</p>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all font-bold text-[10px] uppercase tracking-widest shadow-xl shadow-blue-600/20"
        >
          <Plus className="w-4 h-4" />
          Initialize New Logic
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.length === 0 && !isCreating ? (
          <div className="col-span-full">
            <div className="py-24 text-center bg-zinc-900/10 border border-dashed border-zinc-800 rounded-[3rem] p-12 relative overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-blue-600/5 blur-[100px] pointer-events-none" />
              
              <div className="w-20 h-20 bg-zinc-900 border border-zinc-800 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
                <Shield className="w-10 h-10 text-zinc-700" />
              </div>

              <h2 className="text-3xl font-bold text-white mb-4 uppercase tracking-tighter">No Operational Clusters</h2>
              <p className="text-zinc-500 max-w-sm mx-auto mb-10 text-sm leading-relaxed font-light">
                Your enterprise identity is provisioned, but no workspaces are initialized. 
                Create your first logic cluster to begin orchestrating AI agents.
              </p>

              <button 
                onClick={() => setIsCreating(true)}
                className="group px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold uppercase tracking-widest text-xs transition-all shadow-2xl shadow-blue-600/20 flex items-center gap-3 mx-auto"
              >
                Start First Deployment
                <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 opacity-40">
              {[
                { title: 'Define Agents', desc: 'Configure specialized roles like Security and Compliance.', icon: Brain },
                { title: 'Index Data', desc: 'Securely ingest enterprise documents for RAG operations.', icon: FileText },
                { title: 'Monitor Safety', desc: 'Track risk scores and governance violations in real-time.', icon: Activity },
              ].map((step, i) => (
                <div key={i} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <step.icon className="w-4 h-4 text-zinc-500" />
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Step 0{i+1}</span>
                  </div>
                  <h4 className="text-sm font-bold text-zinc-300 uppercase">{step.title}</h4>
                  <p className="text-[11px] text-zinc-600 leading-relaxed font-light">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          projects.map((project) => (
            <motion.button
              key={project.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(project.id)}
              className="group bg-zinc-900/40 border border-zinc-800 rounded-2xl p-8 text-left hover:border-blue-500/50 transition-all relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/5 blur-[40px] -mr-12 -mt-12 transition-all group-hover:bg-blue-600/10" />
              <div className="flex items-start justify-between mb-6 relative z-10">
                <div className="w-12 h-12 bg-blue-600/10 rounded-xl flex items-center justify-center border border-blue-500/20">
                  <Shield className="w-6 h-6 text-blue-500" />
                </div>
                <ChevronRight className="w-5 h-5 text-zinc-700 group-hover:text-blue-500 transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-tight relative z-10">{project.name}</h3>
              <div className="flex items-center gap-3 text-[10px] mono text-zinc-500 uppercase tracking-widest relative z-10">
                <Clock className="w-3 h-3" />
                {project.createdAt?.seconds ? new Date(project.createdAt.seconds * 1000).toLocaleDateString() : 'Active'}
              </div>
            </motion.button>
          ))
        )}
      </div>

      <AnimatePresence>
        {isCreating && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-zinc-950 border border-zinc-800 rounded-3xl p-10 max-w-md w-full shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-600" />
              <h2 className="text-2xl font-bold uppercase tracking-tight mb-2">New Security <span className="text-blue-500 font-normal">Workspace</span></h2>
              <p className="text-zinc-500 text-xs mb-8">Define the operational boundaries for your sentinel core.</p>
              
              <form onSubmit={handleCreateProject} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Workspace Identity</label>
                  <input 
                    autoFocus
                    type="text"
                    value={newProjectName}
                    onChange={e => setNewProjectName(e.target.value)}
                    placeholder="e.g. ALPHA_CLUSTER_01"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm mono uppercase tracking-wider outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all"
                  />
                </div>
                
                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="flex-1 px-6 py-3 border border-zinc-800 text-zinc-500 hover:text-zinc-200 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={!newProjectName.trim() || isCreating}
                    className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
                  >
                    {isCreating ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Initialize'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
