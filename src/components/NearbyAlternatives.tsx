import { ArrowLeft, MapPin, Navigation, Star, Users } from 'lucide-react';
import { Screen, Destination } from '../App';
import { useEffect, useState } from 'react';
import { getNearby } from '../services/api';
import { IndiaMap } from './IndiaMap';

interface NearbyAlternativesProps {
  destination: Destination | null;
  onNavigate: (screen: Screen, destination?: Destination) => void;
  onBack: () => void;
}

export function NearbyAlternatives({ destination, onNavigate, onBack }: NearbyAlternativesProps) {
  if (!destination) return null;

  const [alternatives, setAlternatives] = useState<Destination[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const list = await getNearby(destination.id);
      if (!mounted) return;
      setAlternatives(list.map((x: any) => ({ ...x })));
    })();
    return () => { mounted = false; };
  }, [destination]);

  const getCrowdColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'high': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </button>
            <div>
              <h2 className="text-gray-900">Nearby Alternatives</h2>
              <p className="text-sm text-gray-500">Less crowded places nearby</p>
            </div>
          </div>

          {/* Current Location Info */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-3">
            <p className="text-red-900 text-sm mb-1">You're viewing alternatives to:</p>
            <p className="text-red-700">{destination.name} - High Crowd</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Smart Recommendation Banner */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-5 mb-6 text-white">
          <p className="mb-2">💡 Smart Recommendation</p>
          <p className="text-white/90 text-sm">
            These nearby destinations have similar appeal but with significantly lower crowds right now.
          </p>
        </div>

        {/* Map View Toggle */}
        <div className="bg-white rounded-2xl p-4 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-700 font-medium">Nearby Locations</span>
            <MapPin className="w-5 h-5 text-blue-600" />
          </div>
          <div className="h-56 rounded-xl overflow-hidden border border-gray-100">
            <IndiaMap
              destinations={[destination, ...alternatives]}
              selectedDestination={destination}
              onSelectDestination={(dest) => {
                if (dest.id !== destination.id) {
                  onNavigate('destination', dest);
                }
              }}
              showLabels={true}
            />
          </div>
          <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Current (crowded)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Alternatives</span>
            </div>
          </div>
        </div>

        {/* Alternatives List */}
        <div className="space-y-3">
          {alternatives.map((alt) => (
            <div
              key={alt.id}
              className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="flex gap-4 p-4">
                <img
                  src={alt.image}
                  alt={alt.name}
                  className="w-24 h-24 rounded-xl object-cover flex-shrink-0"
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-gray-900">{alt.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ${getCrowdColor(alt.crowdLevel)}`}>
                      {alt.crowdLevel.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mb-3 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span>{alt.rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{alt.distance} km</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{alt.crowdCount}</span>
                    </div>
                  </div>

                  {/* Comparison Stats */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="bg-green-50 rounded-lg p-2">
                      <p className="text-xs text-gray-600">Wait Time</p>
                      <p className="text-green-700">
                        {alt.waitingTime === 0 ? 'No wait' : `${alt.waitingTime} min`}
                      </p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-2">
                      <p className="text-xs text-gray-600">Capacity</p>
                      <p className="text-blue-700">
                        {Math.round((alt.crowdCount / alt.capacity) * 100)}% full
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => onNavigate('destination', alt)}
                      className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                    >
                      View Details
                    </button>
                    <button className="px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                      <Navigation className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Savings Badge */}
              {alt.crowdLevel === 'low' && (
                <div className="bg-green-100 border-t border-green-200 px-4 py-2">
                  <p className="text-green-800 text-xs">
                    ⚡ Save {destination.waitingTime - alt.waitingTime} minutes compared to {destination.name}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* No alternatives message */}
        {alternatives.length === 0 && (
          <div className="bg-white rounded-2xl p-8 text-center">
            <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600">No nearby alternatives found</p>
          </div>
        )}

        {/* Tips */}
        <div className="mt-6 bg-blue-50 rounded-2xl p-5">
          <p className="text-blue-900 mb-2">💡 Pro Tip</p>
          <p className="text-blue-700 text-sm">
            Visit during early morning hours (6-8 AM) for the best experience with minimal crowds at most locations.
          </p>
        </div>
      </div>
    </div>
  );
}
