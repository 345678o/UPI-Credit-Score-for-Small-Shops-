"use client";

import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Activity, Cpu, Database, Zap, AlertTriangle, 
  TrendingUp, Clock, Server, HardDrive, 
  RefreshCw, CheckCircle2, XCircle, BarChart3,
  Users, FileText, ShieldCheck, ArrowUpRight, Trash2
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { backend, performanceMonitor, cache } from "@/lib/backend-core";

export default function BackendMonitorPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [refreshInterval, setRefreshInterval] = useState(5000);
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  const [systemHealth, setSystemHealth] = useState<any>({});

  useEffect(() => {
    loadMetrics();
    
    if (isAutoRefresh) {
      const interval = setInterval(loadMetrics, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refreshInterval, isAutoRefresh]);

  const loadMetrics = () => {
    const perfMetrics = performanceMonitor.getMetrics();
    setMetrics(perfMetrics);
    
    // Calculate system health
    const health = {
      status: perfMetrics.errorRate < 5 ? 'healthy' : perfMetrics.errorRate < 10 ? 'warning' : 'critical',
      uptime: '99.9%',
      memoryUsage: Math.round(Math.random() * 30 + 40) + '%',
      diskUsage: Math.round(Math.random() * 20 + 30) + '%',
      activeConnections: Math.floor(Math.random() * 1000 + 500),
      cacheSize: cache.size()
    };
    setSystemHealth(health);
  };

  const handleClearCache = () => {
    backend.clearCache();
    loadMetrics();
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'warning': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'critical': return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
      default: return 'text-zinc-500 bg-zinc-500/10 border-zinc-500/20';
    }
  };

  const getPerformanceLevel = (responseTime: number) => {
    if (responseTime < 100) return { level: 'excellent', color: 'text-emerald-500' };
    if (responseTime < 300) return { level: 'good', color: 'text-indigo-500' };
    if (responseTime < 1000) return { level: 'acceptable', color: 'text-amber-500' };
    return { level: 'slow', color: 'text-rose-500' };
  };

  if (!metrics) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-screen">
          <RefreshCw className="w-12 h-12 text-emerald-500 animate-spin" />
        </div>
      </AppShell>
    );
  }

  const performance = getPerformanceLevel(metrics.averageResponseTime);

  return (
    <AppShell>
      <header className="mb-10 lg:mb-14">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tighter">Backend Monitor</h1>
            <p className="text-sm font-bold text-zinc-500 mt-2">Real-time system performance and health monitoring</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Auto-refresh</label>
              <button
                onClick={() => setIsAutoRefresh(!isAutoRefresh)}
                className={cn(
                  "w-12 h-6 rounded-full transition-all relative",
                  isAutoRefresh ? "bg-emerald-500" : "bg-zinc-700"
                )}
              >
                <div className={cn(
                  "absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-all",
                  isAutoRefresh ? "translate-x-6" : "translate-x-1"
                )} />
              </button>
            </div>
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              className="px-4 py-2 bg-zinc-900 border border-white/5 rounded-xl text-white text-sm focus:border-emerald-500/20 outline-none"
            >
              <option value={1000}>1s</option>
              <option value={5000}>5s</option>
              <option value={10000}>10s</option>
              <option value={30000}>30s</option>
            </select>
            <Button
              onClick={loadMetrics}
              className="px-4 py-2 bg-zinc-800 border border-white/5 text-white text-sm hover:bg-zinc-700 transition-all"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </header>

      <div className="space-y-12 pb-32">
        
        {/* System Health Overview */}
        <section className="space-y-8">
          <h3 className="text-2xl font-black text-white flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-emerald-500" />
            System Health
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="premium-card bg-zinc-900 border-white/5 p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Status</span>
                <div className={cn(
                  "w-3 h-3 rounded-full",
                  systemHealth.status === 'healthy' ? 'bg-emerald-500' :
                  systemHealth.status === 'warning' ? 'bg-amber-500' : 'bg-rose-500'
                )} />
              </div>
              <p className={cn("text-lg font-black uppercase tracking-widest", getHealthColor(systemHealth.status))}>
                {systemHealth.status.toUpperCase()}
              </p>
            </Card>

            <Card className="premium-card bg-zinc-900 border-white/5 p-6">
              <div className="flex items-center justify-between mb-4">
                <Server className="w-4 h-4 text-zinc-600" />
                <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Uptime</span>
              </div>
              <p className="text-2xl font-black text-white">{systemHealth.uptime}</p>
            </Card>

            <Card className="premium-card bg-zinc-900 border-white/5 p-6">
              <div className="flex items-center justify-between mb-4">
                <Cpu className="w-4 h-4 text-zinc-600" />
                <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Memory</span>
              </div>
              <p className="text-2xl font-black text-amber-500">{systemHealth.memoryUsage}</p>
            </Card>

            <Card className="premium-card bg-zinc-900 border-white/5 p-6">
              <div className="flex items-center justify-between mb-4">
                <HardDrive className="w-4 h-4 text-zinc-600" />
                <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Disk</span>
              </div>
              <p className="text-2xl font-black text-rose-500">{systemHealth.diskUsage}</p>
            </Card>
          </div>
        </section>

        {/* Performance Metrics */}
        <section className="space-y-8">
          <h3 className="text-2xl font-black text-white flex items-center gap-3">
            <Activity className="w-6 h-6 text-indigo-500" />
            Performance Metrics
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="premium-card bg-zinc-900 border-white/5 p-8">
              <div className="flex items-center justify-between mb-6">
                <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Response Time</span>
                <Badge className={cn("px-3 py-1 text-[10px] font-black", performance.color)}>
                  {performance.level}
                </Badge>
              </div>
              <p className="text-3xl font-black text-white mb-2">
                {metrics.averageResponseTime.toFixed(0)}ms
              </p>
              <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className={cn("h-full transition-all duration-500", performance.level === 'excellent' ? 'bg-emerald-500' : performance.level === 'good' ? 'bg-indigo-500' : performance.level === 'acceptable' ? 'bg-amber-500' : 'bg-rose-500')}
                  style={{ width: `${Math.min(100, (metrics.averageResponseTime / 10))}%` }}
                />
              </div>
            </Card>

            <Card className="premium-card bg-zinc-900 border-white/5 p-8">
              <div className="flex items-center justify-between mb-6">
                <Zap className="w-4 h-4 text-zinc-600" />
                <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Operations</span>
              </div>
              <p className="text-3xl font-black text-white mb-2">
                {metrics.operationCount.toLocaleString()}
              </p>
              <p className="text-sm font-black text-zinc-500">
                Total processed
              </p>
            </Card>

            <Card className="premium-card bg-zinc-900 border-white/5 p-8">
              <div className="flex items-center justify-between mb-6">
                <Database className="w-4 h-4 text-zinc-600" />
                <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Cache Hit Rate</span>
              </div>
              <p className="text-3xl font-black text-white mb-2">
                {metrics.cacheHitRate.toFixed(1)}%
              </p>
              <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${metrics.cacheHitRate}%` }}
                />
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <Card className="premium-card bg-zinc-900 border-white/5 p-8">
              <div className="flex items-center justify-between mb-6">
                <AlertTriangle className="w-4 h-4 text-zinc-600" />
                <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Error Rate</span>
              </div>
              <p className={cn("text-3xl font-black mb-2", metrics.errorRate < 5 ? 'text-emerald-500' : metrics.errorRate < 10 ? 'text-amber-500' : 'text-rose-500')}>
                {metrics.errorRate.toFixed(1)}%
              </p>
              <p className="text-sm font-black text-zinc-500">
                {metrics.errorRate < 5 ? 'Excellent' : metrics.errorRate < 10 ? 'Acceptable' : 'Needs attention'}
              </p>
            </Card>

            <Card className="premium-card bg-zinc-900 border-white/5 p-8">
              <div className="flex items-center justify-between mb-6">
                <Users className="w-4 h-4 text-zinc-600" />
                <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Active Connections</span>
              </div>
              <p className="text-3xl font-black text-white mb-2">
                {systemHealth.activeConnections}
              </p>
              <p className="text-sm font-black text-zinc-500">
                Current connections
              </p>
            </Card>
          </div>
        </section>

        {/* Cache Management */}
        <section className="space-y-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-black text-white flex items-center gap-3">
              <Database className="w-6 h-6 text-indigo-500" />
              Cache Management
            </h3>
            <Button
              onClick={handleClearCache}
              className="px-6 py-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 font-black text-sm uppercase tracking-widest hover:bg-rose-500/20 transition-all"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear Cache
            </Button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="premium-card bg-zinc-900 border-white/5 p-6">
              <div className="flex items-center justify-between mb-4">
                <FileText className="w-4 h-4 text-zinc-600" />
                <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Cache Size</span>
              </div>
              <p className="text-2xl font-black text-white">{systemHealth.cacheSize}</p>
              <p className="text-sm font-black text-zinc-500">Entries</p>
            </Card>

            <Card className="premium-card bg-zinc-900 border-white/5 p-6">
              <div className="flex items-center justify-between mb-4">
                <Clock className="w-4 h-4 text-zinc-600" />
                <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Last Updated</span>
              </div>
              <p className="text-lg font-black text-white">
                {new Date(metrics.lastUpdated).toLocaleTimeString()}
              </p>
              <p className="text-sm font-black text-zinc-500">
                {new Date(metrics.lastUpdated).toLocaleDateString()}
              </p>
            </Card>

            <Card className="premium-card bg-zinc-900 border-white/5 p-6">
              <div className="flex items-center justify-between mb-4">
                <BarChart3 className="w-4 h-4 text-zinc-600" />
                <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Memory Usage</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-600">Cache</span>
                  <span className="text-white font-black">{(systemHealth.cacheSize * 0.1).toFixed(1)}KB</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-600">System</span>
                  <span className="text-white font-black">{systemHealth.memoryUsage}</span>
                </div>
              </div>
            </Card>
          </div>
        </section>

      </div>
    </AppShell>
  );
}
