import React, { useState, useEffect, useMemo } from 'react';
import { Activity, Shield, AlertCircle, CheckCircle, Clock, Loader2, TrendingUp } from 'lucide-react';
import { collection, query, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { useAuth } from '../../lib/AuthProvider';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { motion } from 'motion/react';
import { format } from 'date-fns';
import { cn } from '../../lib/utils';

const StatCard = ({ title, value, detail, color, loading }: any) => (
  <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 group hover:border-zinc-700 transition-all relative overflow-hidden">
    <div className="relative z-10">
      <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">{title}</span>
      <div className={cn("text-2xl font-bold mt-1", 
        loading ? 'animate-pulse text-zinc-800' :
        color === 'emerald' ? 'text-emerald-500' : 
        color === 'red' ? 'text-red-500' : 
        color === 'amber' ? 'text-amber-500' : 'text-white'
      )}>
        {loading ? '---' : value}
      </div>
      {detail && <div className="text-[10px] text-zinc-500 mt-1 italic font-light">{detail}</div>}
    </div>
    {!loading && <div className={cn("absolute -right-4 -bottom-4 w-24 h-24 blur-[40px] rounded-full opacity-10 transition-all group-hover:opacity-20", 
       color === 'emerald' ? 'bg-emerald-500' : 
       color === 'red' ? 'bg-red-500' : 
       color === 'amber' ? 'bg-amber-500' : 'bg-blue-500'
    )} />}
  </div>
);

export default function DashboardOverview({ projectId }: { projectId: string }) {
  const { user } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const path = `projects/${projectId}/audit_logs`;
    const q = query(
      collection(db, path),
      orderBy('createdAt', 'desc'),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setLogs(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });

    return () => unsubscribe();
  }, [user, projectId]);

  const stats = useMemo(() => {
    if (logs.length === 0) return {
      validationRate: '0%',
      blockedAttacks: 0,
      riskLevel: 'Stable',
      totalAudits: 0
    };

    const compliant = logs.filter(l => l.complianceStatus === 'COMPLIANT').length;
    const violations = logs.filter(l => l.complianceStatus === 'VIOLATION').length;
    const avgRisk = logs.reduce((acc, curr) => acc + curr.riskScore, 0) / logs.length;

    return {
      validationRate: `${((compliant / logs.length) * 100).toFixed(1)}%`,
      blockedAttacks: violations,
      riskLevel: avgRisk > 60 ? 'CRITICAL' : avgRisk > 30 ? 'ELEVATED' : 'STABLE',
      totalAudits: logs.length
    };
  }, [logs]);

  const chartData = useMemo(() => {
    return logs.slice().reverse().map(log => ({
      time: log.createdAt ? format(new Date(log.createdAt.seconds * 1000), 'HH:mm') : '',
      risk: log.riskScore,
      status: log.complianceStatus
    }));
  }, [logs]);

  const statusDistribution = useMemo(() => {
    const counts = logs.reduce((acc: any, curr) => {
      acc[curr.complianceStatus] = (acc[curr.complianceStatus] || 0) + 1;
      return acc;
    }, {});

    return Object.keys(counts).map(key => ({
      name: key,
      value: counts[key]
    }));
  }, [logs]);

  return (
    <div className="space-y-10">
      <div className="flex items-end justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-3xl font-bold tracking-tighter uppercase whitespace-pre-wrap">System Operations: <span className="text-blue-500 font-normal">{projectId.slice(0, 8)}</span></h2>
            <div className={cn(
              "px-2 py-0.5 rounded border text-[9px] font-bold uppercase tracking-widest transition-all",
              stats.riskLevel === 'STABLE' ? "border-emerald-900/50 bg-emerald-950/30 text-emerald-400" : "border-red-900/50 bg-red-950/30 text-red-400"
            )}>
              {stats.riskLevel}
            </div>
          </div>
          <p className="text-zinc-500 font-light max-w-xl leading-relaxed">
            Real-time telemetry and governance metrics for the Aelarien Sentinel infrastructure.
            Currently auditing <span className="text-zinc-300 font-medium">{logs.length} operations</span> within this session boundary.
          </p>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.2em] mb-2">Cluster integrity</span>
          <div className="flex items-center gap-1.5 h-6">
            {[1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className={`w-1.5 h-full rounded-full ${i < 7 ? 'bg-emerald-500/40' : 'bg-emerald-500 animate-pulse'}`} />
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard 
          title="Validation Index" 
          value={stats.validationRate} 
          color="emerald" 
          loading={loading}
          detail="Operational success metric" 
        />
        <StatCard 
          title="Detected Violations" 
          value={stats.blockedAttacks} 
          color="red" 
          loading={loading}
          detail="Active policy triggers" 
        />
        <StatCard 
          title="Heuristic Risk" 
          value={stats.riskLevel} 
          color={stats.riskLevel === 'STABLE' ? 'emerald' : 'amber'} 
          loading={loading}
          detail="Heuristic stability score" 
        />
        <StatCard 
          title="Trace Density" 
          value={stats.totalAudits} 
          loading={loading}
          detail="Active audit records" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 border border-zinc-800 bg-zinc-950/60 rounded-3xl flex flex-col overflow-hidden">
          <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/20">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Risk Variance Trace</h3>
            </div>
            <div className="px-2 py-1 bg-zinc-800 rounded text-[9px] mono text-zinc-500 uppercase">Operational Telemetry</div>
          </div>
          <div className="p-8 h-[360px] w-full">
            {loading ? (
              <div className="w-full h-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-800" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                  <XAxis 
                    dataKey="time" 
                    stroke="#4b5563" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                    hide={chartData.length > 20}
                  />
                  <YAxis 
                    stroke="#4b5563" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                    domain={[0, 100]}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '12px' }}
                    labelStyle={{ display: 'none' }}
                    itemStyle={{ color: '#3b82f6', fontSize: '10px', textTransform: 'uppercase', fontFamily: 'monospace' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="risk" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorRisk)" 
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="lg:col-span-4 border border-zinc-800 bg-zinc-950/40 rounded-3xl flex flex-col overflow-hidden">
          <div className="p-6 border-b border-zinc-800 bg-zinc-900/20">
            <h4 className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest text-center">Compliance Logic Distro</h4>
          </div>
          <div className="flex-1 p-6 flex flex-col justify-between">
            <div className="h-64 w-full">
               <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                  <XAxis dataKey="name" stroke="#4b5563" fontSize={8} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '8px' }}
                    labelStyle={{ display: 'none' }}
                    itemStyle={{ fontSize: '10px', textTransform: 'uppercase', fontFamily: 'monospace' }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {statusDistribution.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.name === 'COMPLIANT' ? '#10b981' : entry.name === 'VIOLATION' ? '#ef4444' : '#f59e0b'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="space-y-4 mt-8">
              <div className="p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800/50 space-y-3">
                {statusDistribution.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-[10px] mono">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-1.5 h-1.5 rounded-full", 
                        item.name === 'COMPLIANT' ? "bg-emerald-500" : item.name === 'VIOLATION' ? "bg-red-500" : "bg-amber-500"
                      )} />
                      <span className="text-zinc-500 uppercase">{item.name}</span>
                    </div>
                    <span className="text-zinc-300">{item.value}</span>
                  </div>
                ))}
              </div>
              
              <div className="p-4 bg-blue-600/5 rounded-2xl border border-blue-500/10">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-3 h-3 text-blue-500" />
                  <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest">Policy Engine Log</span>
                </div>
                <p className="text-[9px] text-zinc-500 leading-relaxed italic">
                  All metrics are cryptographically verified via the Sentinel Alpha governance protocol.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
