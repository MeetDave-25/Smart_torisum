import { ArrowLeft, Navigation, Clock, Users, Star, TrendingUp, MapPin as MapPinIcon } from 'lucide-react';
import { Screen, Destination } from '../App';
import { useEffect, useState } from 'react';
import { connectSocket, subscribeRoom, unsubscribeRoom, onPlaceUpdate, onPlaceAdminAlert } from '../services/socket';
import { getForecast } from '../services/api';
import { toast } from 'sonner';

interface DestinationDetailProps {
  destination: Destination | null;
  onNavigate: (screen: Screen) => void;
}

export function DestinationDetail({ destination, onNavigate }: DestinationDetailProps) {
  if (!destination) return null;

  const [place, setPlace] = useState(destination);
  const [forecast, setForecast] = useState<any[] | null>(null);

  useEffect(() => {
    setPlace(destination);
  }, [destination]);

  useEffect(() => {
    const s = connectSocket();
    if (s) {
      subscribeRoom(`place:${destination.id}`);
      subscribeRoom('alerts');
      onPlaceUpdate((p: any) => {
        if (p.id === destination.id) setPlace(prev => prev ? { ...prev, crowdCount: p.crowdCount, crowdLevel: p.crowdLevel } : prev);
      });
      onPlaceAdminAlert((a: any) => {
        if (a.place_id === destination.id) {
          const text = a.message || 'Alert for this place';
          const action = {
            label: 'View',
            onClick: () => {
              // open alerts screen to see details
              onNavigate('alerts');
            }
          };
          if ((toast as any)?.error && a.level === 'critical') (toast as any).error(text, { action });
          else if ((toast as any)?.warning && a.level === 'warning') (toast as any).warning(text, { action });
          else (toast as any ? (toast as any)(text, { action }) : console.log(text));
        }
      });
    }
    // fetch quick forecast
    (async () => {
      const f = await getForecast(destination.id, 6);
      setForecast(f?.forecast || null);
    })();
    return () => {
      if (s) unsubscribeRoom(`place:${destination.id}`);
    };
  }, [destination]);

  const getCrowdColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getCrowdBgColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-50';
      case 'medium': return 'bg-yellow-50';
      case 'high': return 'bg-red-50';
      default: return 'bg-gray-50';
    }
  };

  const getCrowdTextColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-700';
      case 'medium': return 'text-yellow-700';
      case 'high': return 'text-red-700';
      default: return 'text-gray-700';
    }
  };

  const crowdCount = place ? place.crowdCount : destination.crowdCount;
  const capacity = place ? place.capacity : destination.capacity;
  const crowdLevel = place ? place.crowdLevel : destination.crowdLevel;
  const crowdPercentage = (crowdCount / capacity) * 100;

  return (
    <div className="min-h-screen bg-white">
      {/* Image Header */}
      <div className="relative">
        <img
          src={destination.image}
          alt={destination.name}
          className="w-full h-80 object-cover"
        />
        <button
          onClick={() => onNavigate('home')}
          className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
        
        {/* Floating Crowd Badge */}
        <div className={`absolute top-4 right-4 ${getCrowdBgColor(crowdLevel)} backdrop-blur-sm px-4 py-2 rounded-full shadow-lg`}>
          <span className={`${getCrowdTextColor(crowdLevel)}`}>
            {crowdLevel?.toUpperCase() || 'N/A'} CROWD
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 max-w-4xl mx-auto">
        {/* Title & Rating */}
        <div className="mb-6">
          <h1 className="text-gray-900 mb-2">{destination.name}</h1>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              <span className="text-gray-700">{destination.rating}</span>
            </div>
            {destination.state && (
              <div className="flex items-center gap-1 text-gray-600">
                <MapPinIcon className="w-4 h-4" />
                <span className="text-sm">{destination.state}, {destination.region}</span>
              </div>
            )}
            {destination.distance && (
              <span className="text-sm text-gray-500">{destination.distance} km away</span>
            )}
          </div>
          {destination.description && (
            <p className="text-gray-600 text-sm mt-3">{destination.description}</p>
          )}
        </div>

        {/* Crowd Status Card */}
        <div className={`${getCrowdBgColor(destination.crowdLevel)} rounded-2xl p-5 mb-6`}>
          <div className="flex items-center justify-between mb-3">
            <span className={`${getCrowdTextColor(destination.crowdLevel)}`}>
              Live Crowd Status
            </span>
            <Users className={`w-5 h-5 ${getCrowdTextColor(destination.crowdLevel)}`} />
          </div>
          
          <div className="flex items-end gap-2 mb-2">
            <span className={`text-4xl ${getCrowdTextColor(crowdLevel)}`}>
              {crowdCount}
            </span>
            <span className="text-gray-600 mb-1">/ {capacity} people</span>
          </div>

          {/* Progress Bar */}
          <div className="bg-white/50 h-3 rounded-full overflow-hidden mb-4">
            <div 
              className={`${getCrowdColor(crowdLevel)} h-full rounded-full transition-all`}
              style={{ width: `${crowdPercentage}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div>
              <p className="text-gray-600">Waiting Time</p>
              <p className={`${getCrowdTextColor(destination.crowdLevel)}`}>
                {destination.waitingTime > 0 ? `${destination.waitingTime} minutes` : 'No wait'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-gray-600">Capacity</p>
              <p className={`${getCrowdTextColor(destination.crowdLevel)}`}>
                {crowdPercentage.toFixed(0)}% Full
              </p>
            </div>
          </div>
        </div>

        {/* Best Visiting Time */}
        <div className="bg-blue-50 rounded-2xl p-5 mb-6">
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-gray-900 mb-1">Best Time to Visit</p>
              <p className="text-blue-700">{destination.bestTime}</p>
              <p className="text-sm text-gray-600 mt-1">Lower crowd expected during these hours</p>
            </div>
          </div>

          {/* Small Forecast Preview */}
          {forecast && (
            <div className="mt-4 grid grid-cols-3 gap-2">
              {forecast.slice(0, 6).map((f: any, idx: number) => (
                <div key={idx} className="bg-white rounded-lg p-2 text-center">
                  <div className="text-xs text-gray-500">+{f.hour}h</div>
                  <div className="text-sm font-medium">{f.predictedCount}</div>
                  <div className="text-xs mt-1">{f.crowdLevel}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 mb-6">
          <button
            onClick={() => onNavigate('prediction')}
            className="w-full bg-purple-600 text-white py-4 rounded-xl hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30"
          >
            <TrendingUp className="w-5 h-5" />
            <span>View Crowd Predictions</span>
          </button>
          
          <button
            onClick={() => onNavigate('alternatives')}
            className="w-full bg-green-600 text-white py-4 rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-green-600/30"
          >
            <MapPinIcon className="w-5 h-5" />
            <span>View Nearby Alternatives</span>
          </button>

          <button className="w-full bg-blue-600 text-white py-4 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30">
            <Navigation className="w-5 h-5" />
            <span>Navigate to Location</span>
          </button>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-gray-600 text-sm mb-1">Category</p>
            <p className="text-gray-900 capitalize">{destination.category}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-gray-600 text-sm mb-1">Status</p>
            <p className="text-green-600">Open Now</p>
          </div>
        </div>
      </div>
    </div>
  );
}