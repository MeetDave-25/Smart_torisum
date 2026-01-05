import { ArrowLeft, AlertCircle, Info, CheckCircle, AlertTriangle, Bell } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getAdminAlerts } from '../services/api';
import { connectSocket, subscribeRoom, unsubscribeRoom, onAdminAlert } from '../services/socket';

interface AlertsScreenProps {
  onBack: () => void;
} 

export function AlertsScreen({ onBack }: AlertsScreenProps) {
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'danger': return <AlertCircle className="w-5 h-5" />;
      case 'warning': return <AlertTriangle className="w-5 h-5" />;
      case 'info': return <Info className="w-5 h-5" />;
      case 'success': return <CheckCircle className="w-5 h-5" />;
      default: return <Bell className="w-5 h-5" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'danger': return 'bg-red-50 border-red-200 text-red-700';
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      case 'info': return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'success': return 'bg-green-50 border-green-200 text-green-700';
      default: return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  const getAlertIconColor = (type: string) => {
    switch (type) {
      case 'danger': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      case 'info': return 'text-blue-600';
      case 'success': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const [alertsList, setAlertsList] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const a = await getAdminAlerts();
      setAlertsList(a || []);
    })();
    const s = connectSocket();
    if (s) {
      subscribeRoom('alerts');
      onAdminAlert((a: any) => setAlertsList(prev => [a, ...prev].slice(0, 50)));
    }
    return () => { if (s) unsubscribeRoom('alerts'); };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </button>
            <div>
              <h2 className="text-gray-900">Alerts & Notifications</h2>
              <p className="text-sm text-gray-500">{alertsList.length} active alerts</p>
            </div>
          </div>
          <button className="text-blue-600 text-sm hover:text-blue-700">
            Mark all read
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Safety Notice */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-5 mb-6 text-white">
          <div className="flex items-start gap-3">
            <Bell className="w-6 h-6 flex-shrink-0" />
            <div>
              <p className="mb-2">Stay Informed, Stay Safe</p>
              <p className="text-white/90 text-sm">
                Real-time alerts about crowd levels, safety conditions, and route updates.
              </p>
            </div>
          </div>
        </div>

        {/* Alert Categories */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          {[
            { label: 'All', count: alertsList.length, active: true },
            { label: 'Critical', count: alertsList.filter(a => a.level === 'critical').length, active: false },
            { label: 'Warning', count: alertsList.filter(a => a.level === 'warning').length, active: false },
            { label: 'Info', count: alertsList.filter(a => a.level === 'info' || !a.level).length, active: false }
          ].map((category) => (
            <button
              key={category.label}
              className={`py-2 px-3 rounded-xl text-sm transition-all ${
                category.active
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {category.label}
              {category.count > 0 && (
                <span className={`ml-1 text-xs ${category.active ? 'text-white/80' : 'text-gray-400'}`}>
                  ({category.count})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Alerts List */}
        <div className="space-y-3">
          {alertsList.map((alert) => (
            <div
              key={alert.id}
              className={`rounded-2xl p-5 border-2 ${getAlertColor(alert.type || alert.level || 'info')}`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-lg ${getAlertIconColor(alert.type || alert.level || 'info')} bg-white/50`}>
                  {getAlertIcon(alert.type || alert.level || 'info')}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-gray-900">{alert.message}</h3>
                    <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                      {new Date(alert.ts || alert.time || Date.now()).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm mb-2">{alert.place_id ? `Target: ${alert.place_id}` : 'Broadcast to all'}</p>
                  <div className="flex items-center gap-2 text-xs">
                    {alert.place_id && <span className="px-2 py-1 bg-white/50 rounded-full">📍 {alert.place_id}</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Notification Settings */}
        <div className="mt-6 bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="text-gray-900 mb-4">Notification Preferences</h3>
          <div className="space-y-3">
            {[
              { label: 'Crowd surge warnings', enabled: true },
              { label: 'Route updates', enabled: true },
              { label: 'Safety alerts', enabled: true },
              { label: 'Promotional offers', enabled: false }
            ].map((pref, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-gray-700">{pref.label}</span>
                <button
                  className={`w-12 h-6 rounded-full transition-colors ${
                    pref.enabled ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      pref.enabled ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  ></div>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Safety Tips */}
        <div className="mt-6 bg-purple-50 border border-purple-200 rounded-2xl p-5">
          <p className="text-purple-900 mb-2">💡 Safety Tips</p>
          <ul className="text-purple-700 text-sm space-y-2">
            <li>• Always check crowd levels before visiting popular destinations</li>
            <li>• Follow recommended visiting times for best experience</li>
            <li>• Keep emergency contacts readily available</li>
            <li>• Share your itinerary with family or friends</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
