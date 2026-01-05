import { Search, MapPin, Bell, User, Cloud, Calendar, Navigation, TrendingUp, Filter, X } from 'lucide-react';
import { Screen, Destination } from '../App';
import { destinations as initialDestinations } from '../data/mockData';
import { useState, useEffect } from 'react';
import { getPlaces } from '../services/api';
import { connectSocket, subscribeRoom, unsubscribeRoom, onPlacesInit, onPlacesUpdate, onPlaceUpdate, onAdminAlert } from '../services/socket';
import { toast } from 'sonner';
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, DrawerClose } from './ui/drawer';
import { IndiaMap } from './IndiaMap';

interface HomeDashboardProps {
  onNavigate: (screen: Screen, destination?: Destination) => void;
}

export function HomeDashboard({ onNavigate }: HomeDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('All Regions');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Live places (fallback to local mock data)
  const [places, setPlaces] = useState<Destination[]>(initialDestinations);
  const [alertCount, setAlertCount] = useState<number>(0);
  const [alertsList, setAlertsList] = useState<any[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const res = await getPlaces();
      if (mounted && Array.isArray(res)) setPlaces(res);
    })();

    const s = connectSocket();
    if (s) {
      subscribeRoom('places');
      subscribeRoom('alerts');
      onPlacesInit((snapshot: any[]) => {
        setPlaces(prev => {
          // merge snapshot into existing
          const map = new Map(prev.map(p => [p.id, p]));
          snapshot.forEach((sp: any) => {
            const cur = map.get(sp.id);
            if (cur) map.set(sp.id, { ...cur, ...sp });
            else map.set(sp.id, sp);
          });
          return Array.from(map.values());
        });
      });
      onPlacesUpdate((u: any) => {
        setPlaces(prev => prev.map(p => p.id === u.id ? { ...p, ...u } : p));
      });
      onPlaceUpdate((p: any) => {
        setPlaces(prev => prev.map(pl => pl.id === p.id ? { ...pl, ...p } : pl));
      });
      onAdminAlert((a: any) => {
        try {
          // add to local list (most recent first)
          setAlertsList(prev => [a, ...prev].slice(0, 50));
          setAlertCount(c => c + 1);

          const text = a.message || 'Alert';
          const viewAction = {
            label: 'View',
            onClick: () => {
              if (a.place_id) {
                const place = places.find(p => p.id === a.place_id);
                if (place) onNavigate('destination', place);
                else onNavigate('alerts');
              } else {
                onNavigate('alerts');
              }
              // open alerts screen for more details
            }
          };

          if ((toast as any)?.error && a.level === 'critical') (toast as any).error(text, { action: viewAction });
          else if ((toast as any)?.warning && a.level === 'warning') (toast as any).warning(text, { action: viewAction });
          else (toast as any ? (toast as any)(text, { action: viewAction }) : console.log(text));
        } catch (e) {
          console.log('Admin alert received', a);
        }
      });
    }

    return () => {
      mounted = false;
      if (s) {
        unsubscribeRoom('places');
      }
    };
  }, []);


  const regions = ['All Regions', 'North India', 'South India', 'East India', 'West India', 'Central India'];
  const categories = ['All', 'temple', 'museum', 'nature', 'park', 'food'];

  // Filter destinations (use live places)
  const filteredDestinations = places.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.state?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRegion = selectedRegion === 'All Regions' || d.region === selectedRegion;
    const matchesCategory = selectedCategory === 'All' || d.category === selectedCategory;
    const matchesState = !selectedState || d.state === selectedState;
    return matchesSearch && matchesRegion && matchesCategory && matchesState;
  });

  const crowdedPlaces = filteredDestinations.filter(d => d.crowdLevel === 'high').slice(0, 6);
  const peacefulPlaces = filteredDestinations.filter(d => d.crowdLevel === 'low').slice(0, 6);

  const getCrowdColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getCrowdTextColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto p-4 lg:px-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-6 h-6 lg:w-8 lg:h-8 text-blue-600" />
              <div>
                <span className="text-blue-600 lg:text-lg">SmartTrip AI</span>
                <p className="text-xs text-gray-500 hidden lg:block">Explore India Smartly</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-full relative"
              >
                <Filter className="w-6 h-6 text-gray-600" />
                {(selectedRegion !== 'All Regions' || selectedCategory !== 'All') && (
                  <span className="absolute top-0 right-0 w-2 h-2 bg-blue-600 rounded-full"></span>
                )}
              </button>
              <Drawer open={drawerOpen} onOpenChange={(open: boolean) => { setDrawerOpen(open); if (open) setAlertCount(0); }} direction="right">
                <DrawerTrigger>
                  <button className="relative p-2 hover:bg-gray-100 rounded-full">
                    <Bell className="w-5 h-5 lg:w-6 lg:h-6 text-gray-600" />
                    {alertCount > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[18px] h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center px-1">{alertCount}</span>
                    )}
                  </button>
                </DrawerTrigger>

                <DrawerContent>
                  <DrawerHeader>
                    <div className="flex items-center justify-between">
                      <DrawerTitle>Notifications</DrawerTitle>
                      <DrawerClose>
                        <button className="px-3 py-1 bg-gray-100 rounded">Close</button>
                      </DrawerClose>
                    </div>
                    <p className="text-sm text-muted-foreground">Unread: {alertCount}</p>
                  </DrawerHeader>

                  <div className="p-4 space-y-3">
                    {alertsList.length === 0 && (
                      <div className="text-sm text-gray-500">No notifications</div>
                    )}
                    {alertsList.map((a) => (
                      <div key={a.id} className="bg-white rounded-lg p-3 shadow-sm">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-sm text-gray-900 mb-1">{a.message}</div>
                            <div className="text-xs text-gray-500">{a.place_id ? `Place: ${a.place_id}` : 'Broadcast'}</div>
                          </div>
                          <div className="flex gap-2 items-start">
                            <button onClick={() => { if (a.place_id) { const place = places.find(p => p.id === a.place_id); if (place) onNavigate('destination', place); else onNavigate('alerts'); } else onNavigate('alerts'); setDrawerOpen(false); }} className="px-3 py-1 bg-blue-600 text-white rounded">View</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <DrawerFooter>
                    <div className="flex items-center justify-between">
                      <button onClick={() => { setAlertsList([]); setAlertCount(0); }} className="px-3 py-2 text-sm rounded bg-gray-50">Clear</button>
                      <button onClick={() => { setDrawerOpen(false); onNavigate('alerts'); }} className="px-3 py-2 bg-blue-600 text-white rounded">View All</button>
                    </div>
                  </DrawerFooter>
                </DrawerContent>
              </Drawer>
              <button onClick={() => onNavigate('profile')} className="p-2 hover:bg-gray-100 rounded-full">
                <User className="w-5 h-5 lg:w-6 lg:h-6 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-3">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search destinations, temples, monuments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 lg:py-4 bg-gray-100 rounded-xl border-none outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
            />
          </div>

          {/* Desktop Filters */}
          <div className="hidden lg:block mb-3">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-2">
              {regions.map((region) => (
                <button
                  key={region}
                  onClick={() => setSelectedRegion(region)}
                  className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all text-sm ${selectedRegion === region
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  {region}
                </button>
              ))}
            </div>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all text-sm capitalize ${selectedCategory === cat
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Filters Dropdown */}
          {showFilters && (
            <div className="lg:hidden bg-white border border-gray-200 rounded-2xl p-4 mb-3 animate-fadeIn">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-gray-900">Filters</h3>
                <button onClick={() => setShowFilters(false)} className="p-1">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Region</p>
                <div className="flex flex-wrap gap-2">
                  {regions.map((region) => (
                    <button
                      key={region}
                      onClick={() => setSelectedRegion(region)}
                      className={`px-3 py-1.5 rounded-lg text-sm ${selectedRegion === region
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600'
                        }`}
                    >
                      {region}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">Category</p>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-sm capitalize ${selectedCategory === cat
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-600'
                        }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Weather & Date */}
          <div className="flex items-center justify-between text-xs lg:text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Cloud className="w-4 h-4" />
              <span>24°C Partly Cloudy</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Monday, Dec 15</span>
              <span className="sm:hidden">Dec 15</span>
            </div>
          </div>
        </div>
      </div>

      {/* Map Section - Clean Card */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4">
        <IndiaMap
          destinations={places}
          onSelectDestination={(dest) => onNavigate('destination', dest)}
          onSelectState={(state) => setSelectedState(state)}
        />
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Quick Actions - Responsive */}
        <div className="px-4 lg:px-8 -mt-8 mb-6 relative z-10">
          <div className="bg-white rounded-2xl shadow-lg p-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
            <button
              onClick={() => onNavigate('planner')}
              className="flex flex-col items-center gap-2 p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
            >
              <Navigation className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
              <span className="text-xs lg:text-sm text-gray-700">Trip Planner</span>
            </button>
            <button
              onClick={() => onNavigate('destination', places[0])}
              className="flex flex-col items-center gap-2 p-3 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors"
            >
              <TrendingUp className="w-5 h-5 lg:w-6 lg:h-6 text-purple-600" />
              <span className="text-xs lg:text-sm text-gray-700">Predictions</span>
            </button>
            <button
              onClick={() => onNavigate('alerts')}
              className="flex flex-col items-center gap-2 p-3 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
            >
              <Bell className="w-5 h-5 lg:w-6 lg:h-6 text-red-600" />
              <span className="text-xs lg:text-sm text-gray-700">Alerts</span>
            </button>
            <button
              onClick={() => {
                // Show nearby places - filter by distance and sort
                const nearbyPlaces = places
                  .filter(p => p.distance && p.distance < 5)
                  .sort((a, b) => (a.distance || 0) - (b.distance || 0))
                  .slice(0, 6);

                if (nearbyPlaces.length > 0) {
                  // Navigate to alternatives screen with nearby places
                  onNavigate('alternatives', nearbyPlaces[0]);
                } else {
                  // Show first available place
                  if (places.length > 0) {
                    onNavigate('alternatives', places[0]);
                  }
                }
              }}
              className="flex flex-col items-center gap-2 p-3 bg-green-50 rounded-xl hover:bg-green-100 transition-colors"
            >
              <MapPin className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" />
              <span className="text-xs lg:text-sm text-gray-700">Nearby</span>
            </button>
          </div>
        </div>

        {/* Crowded Places - Responsive */}
        <div className="px-4 lg:px-8 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-gray-900 text-sm lg:text-base">🔴 Avoid Now - High Crowd</h3>
            <button className="text-blue-600 text-xs lg:text-sm hover:text-blue-700">View All</button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
            {crowdedPlaces.map((place) => (
              <button
                key={place.id}
                onClick={() => onNavigate('destination', place)}
                className="w-full bg-white rounded-xl shadow-sm p-3 lg:p-4 flex gap-3 hover:shadow-md transition-shadow text-left"
              >
                <img
                  src={place.image}
                  alt={place.name}
                  className="w-20 h-20 lg:w-24 lg:h-24 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-900 text-sm lg:text-base truncate">{place.name}</p>
                      <p className="text-xs text-gray-500">📍 {place.state}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${getCrowdTextColor(place.crowdLevel)} bg-red-50 whitespace-nowrap ml-2`}>
                      HIGH
                    </span>
                  </div>
                  <div className="flex items-center gap-2 lg:gap-4 text-xs text-gray-500 mb-2">
                    <span>⭐ {place.rating}</span>
                    <span>🕐 {place.waitingTime}min</span>
                  </div>
                  <div className="bg-gray-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-red-500 h-full rounded-full"
                      style={{ width: `${(place.crowdCount / place.capacity) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Peaceful Places - Responsive Grid */}
        <div className="px-4 lg:px-8 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-gray-900 text-sm lg:text-base">🟢 Perfect to Visit Now</h3>
            <button className="text-blue-600 text-xs lg:text-sm hover:text-blue-700">View All</button>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {peacefulPlaces.map((place) => (
              <button
                key={place.id}
                onClick={() => onNavigate('destination', place)}
                className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow text-left"
              >
                <img
                  src={place.image}
                  alt={place.name}
                  className="w-full h-32 lg:h-40 object-cover"
                />
                <div className="p-3">
                  <p className="text-gray-900 text-sm mb-1 truncate">{place.name}</p>
                  <p className="text-xs text-gray-500 mb-2 truncate">📍 {place.state}</p>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className={`${getCrowdTextColor(place.crowdLevel)}`}>
                      Low Crowd
                    </span>
                    <span className="text-gray-500">⭐ {place.rating}</span>
                  </div>
                  <button className="w-full bg-green-500 text-white py-2 rounded-lg text-xs hover:bg-green-600 transition-colors">
                    Visit Now
                  </button>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Stats Section - Desktop Only */}
        <div className="hidden lg:block px-8 mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
            <h3 className="mb-4">India Tourism Stats</h3>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <p className="text-3xl mb-1">{places.length}</p>
                <p className="text-white/80 text-sm">Total Destinations</p>
              </div>
              <div>
                <p className="text-3xl mb-1">{places.filter(d => d.category === 'temple').length}</p>
                <p className="text-white/80 text-sm">Temples</p>
              </div>
              <div>
                <p className="text-3xl mb-1">{places.filter(d => d.crowdLevel === 'low').length}</p>
                <p className="text-white/80 text-sm">Low Crowd Now</p>
              </div>
              <div>
                <p className="text-3xl mb-1">5</p>
                <p className="text-white/80 text-sm">Regions Covered</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
