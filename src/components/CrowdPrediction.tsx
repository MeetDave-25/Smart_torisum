import { ArrowLeft, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Destination } from '../App';
import { crowdPredictionData } from '../data/mockData';

interface CrowdPredictionProps {
  destination: Destination | null;
  onBack: () => void;
}

export function CrowdPrediction({ destination, onBack }: CrowdPredictionProps) {
  if (!destination) return null;

  const currentHour = new Date().getHours();
  const peakTime = '6 PM';
  const safeTimes = ['6 AM - 8 AM', '10 PM - Close'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto p-4 flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <div>
            <h2 className="text-gray-900">Crowd Predictions</h2>
            <p className="text-sm text-gray-500">{destination.name}</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 lg:p-6">
        {/* AI Insights Banner */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-5 mb-6 text-white">
          <div className="flex items-start gap-3 mb-3">
            <TrendingUp className="w-6 h-6 flex-shrink-0" />
            <div>
              <h3 className="mb-1">AI-Powered Prediction</h3>
              <p className="text-white/90 text-sm">
                Based on historical data, current trends, and local events
              </p>
            </div>
          </div>
        </div>

        {/* Prediction Chart */}
        <div className="bg-white rounded-2xl p-5 mb-6 shadow-sm">
          <h3 className="text-gray-900 mb-4">Today's Crowd Forecast</h3>
          
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={crowdPredictionData}>
              <defs>
                <linearGradient id="colorCrowd" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="time" 
                stroke="#6B7280"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#6B7280"
                style={{ fontSize: '12px' }}
                label={{ value: 'Capacity %', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="crowd" 
                stroke="#3B82F6" 
                strokeWidth={2}
                fill="url(#colorCrowd)"
                name="Current Crowd"
              />
              <Area 
                type="monotone" 
                dataKey="predicted" 
                stroke="#8B5CF6" 
                strokeWidth={2}
                strokeDasharray="5 5"
                fill="url(#colorPredicted)"
                name="Predicted"
              />
            </AreaChart>
          </ResponsiveContainer>

          <div className="flex items-center gap-4 mt-4 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>Live Data</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded border-2 border-purple-500" style={{ borderStyle: 'dashed' }}></div>
              <span>AI Prediction</span>
            </div>
          </div>
        </div>

        {/* Peak Warning */}
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
            <div>
              <p className="text-red-900 mb-1">Peak Crowd Expected</p>
              <p className="text-red-700 text-sm">
                Crowd levels are predicted to reach <strong>95% capacity at {peakTime}</strong>. 
                We recommend visiting during off-peak hours.
              </p>
            </div>
          </div>
        </div>

        {/* Best Times */}
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5 mb-6">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-green-900 mb-3">Recommended Visiting Times</p>
              <div className="space-y-2">
                {safeTimes.map((time, index) => (
                  <div key={index} className="flex items-center justify-between bg-white rounded-lg p-3">
                    <span className="text-gray-700">{time}</span>
                    <span className="text-green-600 text-sm">Low Crowd</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-gray-500 text-sm mb-1">Average Wait Time</p>
            <p className="text-gray-900 text-2xl">{destination.waitingTime}</p>
            <p className="text-xs text-gray-500">minutes</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-gray-500 text-sm mb-1">Peak Capacity</p>
            <p className="text-gray-900 text-2xl">95%</p>
            <p className="text-xs text-gray-500">at {peakTime}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-gray-500 text-sm mb-1">Prediction Accuracy</p>
            <p className="text-gray-900 text-2xl">94%</p>
            <p className="text-xs text-gray-500">based on AI</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-gray-500 text-sm mb-1">Best Time</p>
            <p className="text-gray-900">6-8 AM</p>
            <p className="text-xs text-gray-500">lowest crowd</p>
          </div>
        </div>

        {/* Historical Insight */}
        <div className="bg-blue-50 rounded-2xl p-5">
          <p className="text-blue-900 mb-2">📊 Historical Insight</p>
          <p className="text-blue-700 text-sm">
            Over the past 30 days, this location experiences peak crowds on weekends between 4 PM - 8 PM. 
            Weekday mornings typically see 60% less visitors.
          </p>
        </div>
      </div>
    </div>
  );
}