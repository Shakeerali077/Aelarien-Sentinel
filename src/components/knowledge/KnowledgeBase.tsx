import React, { useState, useEffect, useRef } from 'react';
import { collection, query, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { useAuth } from '../../lib/AuthProvider';
import { Document as AppDocument } from '../../types';
import { FileText, Plus, Trash2, Search, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import Skeleton, { CardSkeleton } from '../ui/Skeleton';

export default function KnowledgeBase({ projectId }: { projectId: string }) {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<AppDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newDoc, setNewDoc] = useState({ name: '', content: '' });
  const [fileLoading, setFileLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    const path = `projects/${projectId}/documents`;
    const q = query(collection(db, path));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as AppDocument));
      setDocuments(docs);
      setIsLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });

    return () => unsubscribe();
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    loadFile(file);
  };

  const loadFile = (file: File) => {
    setFileLoading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setNewDoc({
        name: file.name.toUpperCase().replace(/\s+/g, '_'),
        content: text
      });
      setFileLoading(false);
    };
    reader.readAsText(file);
  };

  const handleCreateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDoc.name || !newDoc.content) return;
    setIsAdding(true);
    
    const path = `projects/${projectId}/documents`;
    try {
      await addDoc(collection(db, path), {
        projectId,
        name: newDoc.name,
        content: newDoc.content,
        type: 'TEXT',
        uploadedBy: user?.uid,
        createdAt: serverTimestamp(),
      });
      setNewDoc({ name: '', content: '' });
      setIsAdding(false);
      toast.success("Semantic context layer updated.");
    } catch (error) {
      toast.error("Ingestion failed. Check connectivity.");
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const handleDelete = async (id: string) => {
    const path = `projects/${projectId}/documents`;
    try {
      await deleteDoc(doc(db, path, id));
      toast.info("Resource purged from knowledge graph.");
    } catch (error) {
      toast.error("Purge failed. Insufficient permissions.");
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      <div className="flex items-end justify-between border-b border-zinc-800 pb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-3xl font-bold tracking-tighter uppercase">Knowledge Repository</h2>
            <div className="px-2 py-0.5 rounded border border-blue-900/50 bg-blue-950/30 text-[9px] text-blue-400 font-bold uppercase tracking-widest">RAG Optimized</div>
          </div>
          <p className="text-zinc-500 font-light max-w-xl leading-relaxed">
            Manage the semantic context layer. Documents are indexed and served to agents via the <span className="text-zinc-300 font-medium font-mono">RETRIEVAL_AUGMENTED_GEN</span> protocol.
          </p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-3 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all font-bold text-[10px] uppercase tracking-widest shadow-xl shadow-blue-600/20"
        >
          <Plus className="w-4 h-4" />
          Ingest Context
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleCreateDocument} className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-8 space-y-6 mb-12 shadow-2xl relative">
              <div className="absolute top-4 right-4 text-[9px] mono text-zinc-600 uppercase">PROTOCOL::INGESTION_v2</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-2">Resource Identity</label>
                    <input 
                      type="text"
                      value={newDoc.name}
                      onChange={e => setNewDoc({...newDoc, name: e.target.value})}
                      placeholder="e.g. COMPLIANCE_FRAMEWORK_v4"
                      className="w-full bg-[#0A0A0B] border border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-blue-500/50 transition-all text-xs mono uppercase tracking-wider"
                    />
                  </div>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-blue-500/50'); }}
                    onDragLeave={(e) => { e.preventDefault(); e.currentTarget.classList.remove('border-blue-500/50'); }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.remove('border-blue-500/50');
                      const file = e.dataTransfer.files?.[0];
                      if (file) loadFile(file);
                    }}
                    className="p-8 border-2 border-dashed border-zinc-800 rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-blue-500/50 transition-all"
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      onChange={handleFileChange}
                      accept=".txt,.md,.json,.csv"
                    />
                    {fileLoading ? (
                      <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                    ) : (
                      <>
                        <Plus className="w-6 h-6 text-zinc-700" />
                        <div className="text-center">
                          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Drop payload or Click</p>
                          <p className="text-[9px] text-zinc-600 mt-1 uppercase">Supports .txt, .md, .csv</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-2">Raw Payload Content</label>
                  <textarea 
                    value={newDoc.content}
                    onChange={e => setNewDoc({...newDoc, content: e.target.value})}
                    placeholder="Provide document text for semantic processing..."
                    rows={6}
                    className="w-full bg-[#0A0A0B] border border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-blue-500/50 transition-all text-xs font-light resize-none leading-relaxed"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-4 border-t border-zinc-800 pt-6 mt-4">
                <button 
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 text-zinc-500 hover:text-zinc-200 text-[10px] font-bold uppercase tracking-widest"
                >
                  Abort
                </button>
                <button 
                  type="submit"
                  disabled={isAdding && !newDoc.name}
                  className="px-8 py-3 bg-white text-black font-bold rounded hover:bg-zinc-200 transition-all text-[10px] uppercase tracking-[0.2em] flex items-center gap-2"
                >
                  {isAdding && <Loader2 className="w-4 h-4 animate-spin" />}
                  Finalize Ingestion
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : documents.length === 0 ? (
          <div className="col-span-full py-32 text-center bg-zinc-900/20 border border-dashed border-zinc-800 rounded-3xl">
            <FileText className="w-16 h-16 text-zinc-800 mx-auto mb-6 opacity-40" />
            <p className="text-zinc-600 uppercase text-[10px] font-bold tracking-[0.3em]">No Context Layers Loaded</p>
          </div>
        ) : (
          documents.map((doc) => (
            <motion.div 
              layout
              key={doc.id}
              className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-all group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/5 blur-[40px] -mr-12 -mt-12 transition-all group-hover:bg-blue-600/10" />
              <div className="flex items-start justify-between mb-5 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-zinc-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-zinc-100 tracking-tight text-sm uppercase">{doc.name}</h3>
                    <p className="text-[9px] text-zinc-500 font-mono uppercase tracking-widest mt-1">
                      {doc.type} • {doc.createdAt ? format(new Date(doc.createdAt.seconds * 1000), 'dd MMM yy') : 'Pending'}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => handleDelete(doc.id)}
                  className="p-2 text-zinc-700 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="text-[11px] text-zinc-500 line-clamp-3 leading-relaxed font-light relative z-10 italic">
                {doc.content}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
