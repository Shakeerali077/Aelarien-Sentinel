import React from 'react';
import { Shield, Brain, Cpu, Activity, ChevronRight, Lock, Database, Users, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

interface LandingPageProps {
  onLogin: () => void;
}

export default function LandingPage({ onLogin }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-[#0A0A0B] text-zinc-100 overflow-x-hidden selection:bg-blue-500/30">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full h-20 border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-xl z-50 px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white shadow-xl shadow-blue-900/40">S</div>
          <h1 className="text-lg font-bold tracking-tighter uppercase flex items-center gap-2">
            Aelarien <span className="text-blue-500 font-normal">Sentinel</span>
          </h1>
        </div>
        
        <div className="hidden md:flex items-center gap-10">
          <a href="#features" className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 hover:text-white transition-colors">Framework</a>
          <a href="#governance" className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 hover:text-white transition-colors">Governance</a>
          <a href="#security" className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 hover:text-white transition-colors">Security</a>
          <button 
            onClick={onLogin}
            className="px-6 py-2.5 bg-zinc-900 border border-zinc-800 hover:border-blue-500/50 text-[10px] font-bold uppercase tracking-[0.2em] rounded-lg transition-all"
          >
            Access Core
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-8 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/10 blur-[120px] rounded-full -mr-96 -mt-96 animate-pulse-soft" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-600/5 blur-[100px] rounded-full -ml-40 -mb-40" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-4xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-900/50 bg-blue-950/30 text-[10px] text-blue-400 font-bold uppercase tracking-[0.2em] mb-8">
              <Activity className="w-3 h-3 animate-pulse" />
              Next-Gen AI Orchestration Core
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black tracking-tight uppercase leading-[0.9] mb-8">
              Sovereign <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-400 to-blue-600">Intelligence</span> <br />
              Orchestration.
            </h1>
            
            <p className="text-xl text-zinc-400 font-light leading-relaxed max-w-2xl mb-12">
              The first high-resolution governance framework for enterprise AI agents. 
              Secure, validate, and scale autonomous workflows with zero-trust architectures.
            </p>
            
            <div className="flex flex-wrap gap-6">
              <button 
                onClick={onLogin}
                className="group px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold uppercase tracking-widest text-xs transition-all shadow-2xl shadow-blue-600/30 flex items-center gap-3"
              >
                Initialize Sentinel
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-10 py-5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-white rounded-2xl font-bold uppercase tracking-widest text-xs transition-all flex items-center gap-3">
                Watch Operations
                <ArrowUpRight className="w-4 h-4 text-zinc-500" />
              </button>
            </div>
          </motion.div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-32 border-t border-zinc-800 pt-12">
            {[
              { label: 'Uptime SLA', value: '99.999%', icon: Activity },
              { label: 'Validation Latency', value: '< 42ms', icon: Cpu },
              { label: 'Security Score', value: '100/100', icon: Shield },
              { label: 'Active Nodes', value: 'GLOBAL', icon: Database },
            ].map((stat, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                  <stat.icon className="w-3.5 h-3.5 text-blue-500" />
                  {stat.label}
                </div>
                <div className="text-3xl font-bold text-white mono">{stat.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Grid Features */}
      <section id="features" className="py-32 px-8 bg-zinc-950/50 relative border-y border-zinc-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="space-y-6">
              <div className="w-14 h-14 bg-blue-600/10 border border-blue-500/20 rounded-2xl flex items-center justify-center">
                <Brain className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-2xl font-bold uppercase tracking-tight">Multi-Agent <span className="text-blue-500">Chains</span></h3>
              <p className="text-zinc-500 text-sm leading-relaxed">
                Assign specialized roles to different models. Gemini Pro for deep reasoning, Flash for rapid security validation. 
                Full inter-agent orchestration out of the box.
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="w-14 h-14 bg-emerald-600/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center">
                <Shield className="w-8 h-8 text-emerald-500" />
              </div>
              <h3 className="text-2xl font-bold uppercase tracking-tight">Enterprise <span className="text-emerald-500">Guardrails</span></h3>
              <p className="text-zinc-500 text-sm leading-relaxed">
                Zero-trust governance for PII leaks, prompt injection, and hallucination detection. 
                Every token is audited before it reaches your systems.
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="w-14 h-14 bg-amber-600/10 border border-amber-500/20 rounded-2xl flex items-center justify-center">
                <Database className="w-8 h-8 text-amber-500" />
              </div>
              <h3 className="text-2xl font-bold uppercase tracking-tight">Semantic <span className="text-amber-500">Retrieval</span></h3>
              <p className="text-zinc-500 text-sm leading-relaxed">
                High-resolution knowledge indexing. Your agents use your data—securely, privately, 
                and with full source attribution for every response.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mock Dashboard Preview */}
      <section className="py-32 px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center text-center mb-20">
            <h2 className="text-4xl font-bold uppercase tracking-tighter mb-4">Command <span className="text-blue-500">Interface</span></h2>
            <p className="text-zinc-500 max-w-xl text-sm leading-relaxed">
              Design, deploy, and monitor your AI workforce through a mission-control dashboard 
              built for high-frequency operations.
            </p>
          </div>

          <div className="relative mx-auto max-w-5xl group">
             {/* Glow behind the "screen" */}
            <div className="absolute inset-0 bg-blue-600/20 blur-[100px] scale-90 group-hover:scale-100 transition-transform duration-1000" />
            
            <div className="relative bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl p-2 lg:p-4 aspect-video">
              <div className="w-full h-full bg-[#0A0A0B] rounded-2xl border border-zinc-800 overflow-hidden flex flex-col">
                <div className="h-10 border-b border-zinc-800 bg-zinc-950 flex items-center px-4 gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/20" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/20" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="px-4 py-1 bg-zinc-900 border border-zinc-800 rounded text-[8px] mono text-zinc-600 uppercase tracking-widest">
                      sentinel_alpha_core.maelstrom
                    </div>
                  </div>
                </div>
                <div className="flex-1 flex">
                  <div className="w-48 border-r border-zinc-800 p-4 space-y-4">
                    <div className="h-3 w-3/4 bg-zinc-800 rounded animate-pulse" />
                    <div className="h-3 w-full bg-zinc-800 rounded animate-pulse" />
                    <div className="h-3 w-5/6 bg-zinc-800 rounded animate-pulse" />
                  </div>
                  <div className="flex-1 p-8 grid grid-cols-2 gap-8">
                     <div className="space-y-4">
                        <div className="h-32 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center">
                          <Brain className="w-10 h-10 text-zinc-800" />
                        </div>
                        <div className="h-4 w-1/2 bg-zinc-800 rounded" />
                        <div className="h-3 w-full bg-zinc-800 rounded" />
                     </div>
                     <div className="space-y-4">
                        <div className="h-32 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center">
                          <Activity className="w-10 h-10 text-zinc-800" />
                        </div>
                        <div className="h-4 w-1/2 bg-zinc-800 rounded" />
                        <div className="h-3 w-full bg-zinc-800 rounded" />
                     </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-32 px-8 relative border-t border-zinc-800">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-blue-600/10 border border-blue-500/20 rounded-3xl flex items-center justify-center mb-10 shadow-xl shadow-blue-500/5">
            <Lock className="w-10 h-10 text-blue-500" />
          </div>
          <h2 className="text-5xl font-bold uppercase tracking-tighter mb-6">Secure Your <br /><span className="text-blue-500">Intelligence Fleet</span></h2>
          <p className="text-zinc-500 max-w-xl mb-12 text-sm leading-relaxed">
            Stop simulating security. Start enforcing it. Deploy your first Sentinel cluster today in minutes.
          </p>
          <button 
            onClick={onLogin}
            className="px-12 py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold uppercase tracking-widest text-sm transition-all shadow-2xl shadow-blue-600/30 flex items-center gap-4"
          >
            Deploy First Cluster
            <ChevronRight className="w-5 h-5" />
          </button>
          
          <div className="mt-20 flex flex-wrap justify-center gap-12 opacity-40 grayscale">
            <div className="flex items-center gap-2 font-bold uppercase tracking-widest text-xs">
              <CheckCircle2 className="w-4 h-4" /> HIPAA ALIGNED
            </div>
            <div className="flex items-center gap-2 font-bold uppercase tracking-widest text-xs">
              <CheckCircle2 className="w-4 h-4" /> GDPR READY
            </div>
            <div className="flex items-center gap-2 font-bold uppercase tracking-widest text-xs">
              <CheckCircle2 className="w-4 h-4" /> SOC2 COMPLIANT
            </div>
          </div>
        </div>
      </section>

      {/* Real Footer */}
      <footer className="py-20 px-8 border-t border-zinc-800/50 bg-zinc-950/50 flex flex-col items-center gap-8">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center font-bold text-white text-[10px]">S</div>
          <h1 className="text-sm font-bold tracking-tighter uppercase grayscale opacity-60">
            Aelarien Sentinel
          </h1>
        </div>
        <p className="text-[10px] mono text-zinc-600 uppercase tracking-widest">
          © 2026 AELARIEN SYSTEMS • ALL RIGHTS RESERVED • CLUSTER_01
        </p>
      </footer>
    </div>
  );
}
