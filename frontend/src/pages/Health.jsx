import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { Activity, Server, Database, Wifi, ShieldCheck } from 'lucide-react';
import StatCard from '../components/StatCard';

function Health() {
  const [health, setHealth] = useState(null);
  const [history, setHistory] = useState([]); // For the chart

  const fetchHealth = () => {
    axios.get('http://localhost:8000/api/health/')
      .then(res => {
        setHealth(res.data);
        setHistory(prev => [...prev.slice(-19), res.data.api_latency_ms]);
      });
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 2000); // Poll every 2s
    return () => clearInterval(interval);
  }, []);

  const chartData = {
    labels: Array.from({length: 20}, (_, i) => i),
    datasets: [{
      label: 'API Latency (ms)',
      data: history,
      borderColor: '#8B5CF6',
      backgroundColor: 'rgba(139, 92, 246, 0.1)',
      fill: true,
      tension: 0.4
    }]
  };

  if (!health) return <div className="text-white">Diagnosing System...</div>;

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
        <Activity className="text-purple-500" /> Infrastructure Health
      </h2>

      {/* Health Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="API Latency" value={`${health.api_latency_ms}ms`} icon={Server} colorClass="from-blue-500 to-cyan-400" />
        <StatCard title="WS Status" value={health.ws_status} icon={Wifi} colorClass="from-emerald-500 to-teal-400" />
        <StatCard title="Database" value={health.db_connection} icon={Database} colorClass="from-purple-500 to-pink-500" />
        <StatCard title="Server Load" value={`${health.server_load}%`} icon={ShieldCheck} colorClass="from-orange-500 to-red-400" />
      </div>

      {/* Latency Chart */}
      <div className="bg-[#111111]/80 backdrop-blur-xl border border-white/10 p-6 rounded-2xl">
        <h4 className="text-white font-medium mb-4">Real-time Latency (Last 40s)</h4>
        <div className="h-[300px]">
          <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false, scales: { y: { min: 0, max: 150 } } }} />
        </div>
      </div>
    </div>
  );
}

export default Health;