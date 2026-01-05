import { useState, useEffect } from 'react';
import { ArrowLeft, Users, TrendingUp, AlertTriangle, MapPin, Activity, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { destinations } from '../data/mockData';
import { connectSocket, subscribeRoom, unsubscribeRoom, onAdminAlert, onPlacesInit, onPlacesUpdate } from '../services/socket';
import { getAdminPlaces, getAdminAlerts, sendAdminAlert, sendAdminOverride } from '../services/api';

interface AdminDashboardProps {
  onBack: () => void;
}

export function AdminDashboard({ onBack }: AdminDashboardProps) {
  const [places, setPlaces] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [level, setLevel] = useState('info');
  const [targetPlace, setTargetPlace] = useState<string | null>(null);
  const [overridePlace, setOverridePlace] = useState<string | null>(null);
  const [overrideCount, setOverrideCount] = useState<number | ''>('');

  useEffect(() => {
    (async () => {
      const ps = await getAdminPlaces();
      setPlaces(ps || []);
      const as = await getAdminAlerts();
      setAlerts(as || []);
    })();
    const s = connectSocket();
    if (s) {
      subscribeRoom('alerts');
      subscribeRoom('places');
      onAdminAlert((a: any) => setAlerts(prev => [a, ...prev].slice(0, 20)));
      onPlacesInit((snapshot: any[]) => setPlaces(snapshot));
      onPlacesUpdate((u: any) => setPlaces(prev => prev.map(p => p.id === u.id ? { ...p, ...u } : p)));
    }
    return () => {
      if (s) {
        unsubscribeRoom('alerts');
        unsubscribeRoom('places');
      }
    };
  }, []);

  const sendAlert = async () => {
    if (!message) return;
    const res = await sendAdminAlert({ message, level, place_id: targetPlace });
    if (res?.ok) {
      setMessage('');
    }
  };

  const sendOverride = async () => {
    if (!overridePlace) return;
    const cnt = typeof overrideCount === 'number' ? overrideCount : parseInt(String(overrideCount));
    const res = await sendAdminOverride({ place_id: overridePlace, crowdCount: cnt });
    if (res?.ok) {
      setOverrideCount('');
    }
  };

  const crowdData = places.map(p => ({ name: p.name, crowd: Math.round((p.crowdCount / p.capacity) * 100), capacity: 100 }));

  const categoryData = [
    { name: 'Temples', value: 35, color: '#F97316' },
    { name: 'Parks', value: 25, color: '#10B981' },
    { name: 'Museums', value: 20, color: '#8B5CF6' },
    { name: 'Nature', value: 20, color: '#3B82F6' }
  ];

  const stats = [
    {
      label: 'Total Visitors',
      value: '8,542',
      change: '+12%',
      icon: <Users className="w-6 h-6" />,
      color: 'bg-blue-500'
    },
    {
      label: 'High Crowd Areas',
      value: '2',
      change: 'Critical',
      icon: <AlertTriangle className="w-6 h-6" />,
      color: 'bg-red-500'
    },
    {
      label: 'Active Locations',
      value: '6',
      change: 'Normal',
      icon: <MapPin className="w-6 h-6" />,
      color: 'bg-green-500'
    },
    {
      label: 'Avg Wait Time',
      value: '18 min',
      change: '-5%',
      icon: <Activity className="w-6 h-6" />,
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white pb-6">
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h2 className="mb-1">Admin Dashboard</h2>
              <p className="text-white/80 text-sm">Real-time monitoring & control</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm">Live</span>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl p-5 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className={`${stat.color} text-white p-2 rounded-lg`}>
                  {stat.icon}
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  stat.change.includes('+') || stat.change === 'Normal'
                    ? 'bg-green-100 text-green-700'
                    : stat.change === 'Critical'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {stat.change}
                </span>
              </div>
              <p className="text-2xl text-gray-900 mb-1">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Live Crowd Heatmap */}
        <div className="bg-white rounded-2xl p-5 mb-6 shadow-sm">
          <h3 className="text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Live Crowd Levels
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={crowdData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={80}
                style={{ fontSize: '11px' }}
              />
              <YAxis 
                label={{ value: 'Capacity %', angle: -90, position: 'insideLeft' }}
                style={{ fontSize: '12px' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px'
                }}
              />
              <Bar 
                dataKey="crowd" 
                fill="#3B82F6"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-2xl p-5 mb-6 shadow-sm">
          <h3 className="text-gray-900 mb-4">Visitor Distribution by Category</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Alert Management */}
        <div className="bg-white rounded-2xl p-5 mb-6 shadow-sm">
          <h3 className="text-gray-900 mb-4">Active Alerts</h3>
          <div className="space-y-3">
            <div className="p-3 bg-gray-50 rounded-xl">
              <div className="mb-3">
                <input className="w-full p-3 rounded-lg border" placeholder="Alert message" value={message} onChange={(e) => setMessage(e.target.value)} />
              </div>
              <div className="flex gap-2 mb-3">
                <select className="p-2 rounded-lg border" value={level} onChange={(e) => setLevel(e.target.value)}>
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="critical">Critical</option>
                </select>
                <select className="p-2 rounded-lg border" value={targetPlace || ''} onChange={(e) => setTargetPlace(e.target.value || null)}>
                  <option value="">All Places</option>
                  {places.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <button onClick={sendAlert} className="px-4 bg-blue-600 text-white rounded-lg">Send Alert</button>
              </div>

              <div className="space-y-2">
                {alerts.map(a => (
                  <div key={a.id} className={`p-3 rounded-lg ${a.level === 'critical' ? 'bg-red-50 border border-red-200' : a.level === 'warning' ? 'bg-yellow-50 border border-yellow-200' : 'bg-white border border-gray-100'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-sm text-gray-700">{a.message}</div>
                      <div className="text-xs text-gray-500">{new Date(a.ts).toLocaleString()}</div>
                    </div>
                    {a.place_id && <div className="text-xs text-gray-500">Target: {places.find(p => p.id === a.place_id)?.name || a.place_id}</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-5 mb-6 shadow-sm">
          <h3 className="text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => sendAlert()} className="bg-blue-50 text-blue-700 py-3 px-4 rounded-xl hover:bg-blue-100 transition-colors text-sm">
              Send Mass Alert
            </button>
            <div className="flex gap-2">
              <select className="flex-1 p-2 rounded-lg border" value={overridePlace || ''} onChange={(e) => setOverridePlace(e.target.value || null)}>
                <option value="">Select place...</option>
                {places.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <input className="w-24 p-2 rounded-lg border" placeholder="count" value={overrideCount as any} onChange={(e) => setOverrideCount(e.target.value === '' ? '' : Number(e.target.value))} />
              <button onClick={sendOverride} className="px-4 bg-green-600 text-white rounded-lg">Override</button>
            </div>
            <button className="bg-purple-50 text-purple-700 py-3 px-4 rounded-xl hover:bg-purple-100 transition-colors text-sm">
              View Reports
            </button>
            <button className="bg-orange-50 text-orange-700 py-3 px-4 rounded-xl hover:bg-orange-100 transition-colors text-sm">
              Emergency Mode
            </button>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="mb-1">System Status</p>
              <p className="text-white/80 text-sm">All systems operational</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
              <span className="text-sm">Online</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
