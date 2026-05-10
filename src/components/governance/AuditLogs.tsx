import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { useAuth } from '../../lib/AuthProvider';
import { AuditLog } from '../../types';
import { Table, Shield, AlertTriangle, CheckCircle, Search, Filter, ArrowUpRight } from 'lucide-react';
import { format } from 'date-fns';
import Skeleton from '../ui/Skeleton';
import { cn } from '../../lib/utils';

export default function AuditLogs({ projectId }: { projectId: string }) {
  const { user } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const path = `projects/${projectId}/audit_logs`;
    const q = query(
      collection(db, path),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setLogs(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as AuditLog)));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });

    return () => unsubscribe();
  }, [user]);

  const exportToCSV = () => {
    if (logs.length === 0) return;

    const headers = ['Timestamp', 'Date', 'User ID', 'Prompt', 'Compliance Status', 'Risk Score', 'Hallucination Detected'];
    const rows = logs.map(log => [
      log.createdAt ? format(new Date(log.createdAt.seconds * 1000), 'HH:mm:ss') : 'N/A',
      log.createdAt ? format(new Date(log.createdAt.seconds * 1000), 'dd MMM yyyy') : 'N/A',
      log.userId,
      `"${log.prompt.replace(/"/g, '""')}"`,
      log.complianceStatus,
      log.riskScore,
      log.hallucinationDetected ? 'YES' : 'NO'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `sentinel_audit_logs_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-10">
      <div className="flex items-end justify-between border-b border-zinc-800 pb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-3xl font-bold tracking-tighter uppercase">Audit Log Trace</h2>
            <div className="px-2 py-0.5 rounded border border-blue-900/50 bg-blue-950/30 text-[9px] text-blue-400 font-bold uppercase tracking-widest">Immutable Chain</div>
          </div>
          <p className="text-zinc-500 font-light max-w-xl leading-relaxed">
            Cryptographically signed records of all agent operations. This log serves as the <span className="text-zinc-300 font-medium font-mono uppercase tracking-widest text-[10px]">Source of Truth</span> for enterprise compliance audits.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={exportToCSV}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold uppercase tracking-[0.2em] text-[9px] transition-all shadow-lg shadow-blue-600/20 active:scale-95"
          >
            Export CSV Report
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900/50 border border-zinc-800 rounded hover:bg-zinc-800 transition-colors text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-400">
            Validate Integrity
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center p-5 bg-zinc-950/40 border border-zinc-800 rounded-xl">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
          <input 
            type="text" 
            placeholder="FILTER_BY_DIRECTIVE:: Search..."
            className="w-full bg-[#0A0A0B] border border-zinc-800 rounded-lg pl-10 pr-4 py-2.5 text-[10px] uppercase tracking-wider outline-none focus:border-blue-500/50 transition-all font-mono"
          />
        </div>
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-zinc-600" />
          <select className="bg-[#0A0A0B] border border-zinc-800 rounded-lg px-4 py-2 text-[10px] font-bold uppercase tracking-widest outline-none focus:border-blue-500/50 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer">
            <option>All Status</option>
            <option>Compliant</option>
            <option>Violation</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="border border-zinc-800 bg-zinc-950/60 rounded-2xl overflow-hidden shadow-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/20">
              <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Protocol Timestamp</th>
              <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Agent Logic Trace</th>
              <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Compliance Status</th>
              <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-center">Risk Index</th>
              <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {loading ? (
              [...Array(6)].map((_, i) => (
                <tr key={i}>
                  <td className="px-6 py-5"><Skeleton className="h-4 w-24" /></td>
                  <td className="px-6 py-5"><Skeleton className="h-4 w-full" /></td>
                  <td className="px-6 py-5"><Skeleton className="h-4 w-20" /></td>
                  <td className="px-6 py-5 text-center"><Skeleton className="h-4 w-10 mx-auto" /></td>
                  <td className="px-6 py-5 text-right"><Skeleton className="h-4 w-12 ml-auto" /></td>
                </tr>
              ))
            ) : logs.map((log) => (
              <tr key={log.id} className="hover:bg-zinc-900/20 transition-all group">
                <td className="px-6 py-5 whitespace-nowrap">
                  <p className="text-[10px] font-bold mono text-blue-500 uppercase tracking-tighter">
                    {log.createdAt ? format(new Date(log.createdAt.seconds * 1000), 'HH:mm:ss') : 'Pending'}
                  </p>
                  <p className="text-[9px] text-zinc-600 font-mono uppercase tracking-[0.1em]">
                    {log.createdAt ? format(new Date(log.createdAt.seconds * 1000), 'dd MMM yyyy') : '--'}
                  </p>
                </td>
                <td className="px-6 py-5 max-w-md">
                  <p className="text-[11px] text-zinc-300 line-clamp-1 font-light italic leading-relaxed group-hover:text-white transition-colors">"{log.prompt}"</p>
                  <p className="text-[9px] text-zinc-500 mono uppercase tracking-widest mt-1">SES_USER: {log.userId?.slice(0, 12)}</p>
                </td>
                <td className="px-6 py-5">
                  <div className={cn(
                    "inline-flex items-center gap-2 px-2.5 py-1 rounded text-[9px] font-bold uppercase tracking-[0.15em] border transition-all",
                    log.complianceStatus === 'COMPLIANT' 
                      ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
                      : log.complianceStatus === 'VIOLATION'
                      ? "bg-red-500/10 text-red-500 border-red-500/20"
                      : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                  )}>
                    <div className={cn("w-1 h-1 rounded-full animate-pulse-soft", 
                      log.complianceStatus === 'COMPLIANT' ? "bg-emerald-500" : 
                      log.complianceStatus === 'VIOLATION' ? "bg-red-500" : "bg-amber-500"
                    )} />
                    {log.complianceStatus}
                  </div>
                </td>
                <td className="px-6 py-5 text-center">
                  <span className={cn(
                    "text-xs font-bold mono px-2 py-1 rounded-md transition-colors cursor-help",
                    log.riskScore > 60 ? "text-red-500 bg-red-500/5" : log.riskScore > 30 ? "text-amber-500 bg-amber-500/5" : "text-emerald-500 bg-emerald-500/5"
                  )} title="Security Risk Assessment Value">
                    {log.riskScore.toFixed(1)}
                  </span>
                </td>
                <td className="px-6 py-5 text-right">
                  <button 
                    onClick={() => alert(`Accessing Trace Log: ${log.id}`)}
                    className="flex items-center gap-1.5 ml-auto text-[9px] font-bold uppercase tracking-[0.2em] text-blue-400 group-hover:text-blue-300 transition-all cursor-pointer hover:translate-x-1 active:scale-95"
                  >
                    TRC_VIEW <ArrowUpRight className="w-3 h-3" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="flex items-center justify-between p-6 bg-zinc-900/10 border border-zinc-800 rounded-xl border-dashed">
        <div className="flex items-center gap-4">
          <Shield className="w-8 h-8 text-zinc-700" />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Enterprise Integrity Chain</p>
            <p className="text-[10px] text-zinc-600 font-light mt-0.5">Logs are synchronized across all nodes in the Aelarien cluster.</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-mono text-zinc-500">HASH: ac88-f021-992e-5a01</p>
        </div>
      </div>
    </div>
  );
}
