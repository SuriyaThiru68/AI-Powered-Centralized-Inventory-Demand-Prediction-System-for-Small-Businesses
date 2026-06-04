import { useState, useEffect } from 'react';
import { Activity, Clock, CheckCircle, XCircle, Loader } from 'lucide-react';
import api from '../lib/api';

export default function AutoAgentStatus() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatus();
    // Refresh every 30 seconds
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await api.get('/api/agent/status');
      setStatus(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch agent status:', err);
      setLoading(false);
    }
  };

  const formatTime = (date) => {
    if (!date) return 'Not run yet';
    const d = new Date(date);
    return d.toLocaleString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit',
      day: 'numeric',
      month: 'short'
    });
  };

  const getStatusIcon = (s) => {
    if (s === 'running') return <Loader size={16} className="animate-spin text-blue-500" />;
    if (s === 'completed') return <CheckCircle size={16} className="text-green-500" />;
    if (s === 'failed') return <XCircle size={16} className="text-red-500" />;
    return <Clock size={16} className="text-gray-400" />;
  };

  const agents = [
    { key: 'lowStock', name: '📊 Low Stock Monitor', desc: 'Runs every hour' },
    { key: 'prediction', name: '🔮 Prediction Agent', desc: 'Daily at 12:00 AM' },
    { key: 'decision', name: '⚖️ Decision Agent', desc: 'Daily at 6:00 AM' },
    { key: 'notification', name: '📱 Notification Agent', desc: 'Every 6 hours' },
  ];

  if (loading) {
    return (
      <div className="card">
        <div className="card-header">
          <Activity size={20} />
          <h3>Automatic Agents</h3>
        </div>
        <div className="card-body text-center py-8">
          <Loader size={24} className="animate-spin mx-auto text-gray-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <Activity size={20} />
        <h3>Automatic Agents</h3>
        <span className="ml-auto px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-semibold">
          Running
        </span>
      </div>
      <div className="card-body p-0">
        <div className="divide-y">
          {agents.map((agent) => {
            const s = status?.[agent.key];
            return (
              <div key={agent.key} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm">{agent.name}</span>
                      {s && getStatusIcon(s.status)}
                    </div>
                    <p className="text-xs text-gray-500 mb-2">{agent.desc}</p>
                    <div className="flex gap-4 text-xs text-gray-600">
                      <div>
                        <span className="font-medium">Last run:</span>{' '}
                        <span className="text-gray-500">{formatTime(s?.lastRun)}</span>
                      </div>
                      <div>
                        <span className="font-medium">Next run:</span>{' '}
                        <span className="text-gray-500">{formatTime(s?.nextRun)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="card-footer text-xs text-gray-500">
        These agents run automatically in the background to monitor your inventory.
      </div>
    </div>
  );
}
