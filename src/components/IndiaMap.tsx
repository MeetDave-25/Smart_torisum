import { Destination } from '../App';
import { useState } from 'react';

interface IndiaMapProps {
  destinations: Destination[];
  selectedDestination?: Destination | null;
  onSelectDestination?: (dest: Destination) => void;
  onSelectState?: (state: string | null) => void;
  className?: string;
  showLabels?: boolean;
  interactive?: boolean;
}

// Convert lat/lng to SVG coordinates
function geoToSvg(lat: number, lng: number): { x: number; y: number } {
  const minLat = 8, maxLat = 35;
  const minLng = 68, maxLng = 97;
  const x = ((lng - minLng) / (maxLng - minLng)) * 280 + 10;
  const y = ((maxLat - lat) / (maxLat - minLat)) * 280 + 10;
  return { x, y };
}

function getCrowdColor(level: string): string {
  switch (level) {
    case 'low': return '#22c55e';
    case 'medium': return '#f59e0b';
    case 'high': return '#ef4444';
    default: return '#6b7280';
  }
}

export function IndiaMap({ 
  destinations, 
  onSelectDestination,
  onSelectState,
  className = '',
}: IndiaMapProps) {
  const [hoveredDest, setHoveredDest] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState<string | null>(null);

  // Group destinations by state
  const stateGroups = destinations.reduce((acc, dest) => {
    const state = dest.state || 'Other';
    if (!acc[state]) acc[state] = [];
    acc[state].push(dest);
    return acc;
  }, {} as Record<string, Destination[]>);

  const handleStateClick = (state: string) => {
    const newState = selectedState === state ? null : state;
    setSelectedState(newState);
    onSelectState?.(newState);
  };

  const filteredDestinations = selectedState 
    ? destinations.filter(d => d.state === selectedState)
    : destinations;

  return (
    <div className={`relative ${className}`}>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-800">Live Crowd Map</h3>
          {selectedState && (
            <button 
              onClick={() => handleStateClick(selectedState)}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Clear filter
            </button>
          )}
        </div>

        {/* Map Container */}
        <div className="relative bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl overflow-hidden" style={{ height: '200px' }}>
          <svg viewBox="0 0 300 300" className="w-full h-full">
            <defs>
              <linearGradient id="mapBg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#dbeafe" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#e0e7ff" stopOpacity="0.5" />
              </linearGradient>
            </defs>
            
            {/* Simple India outline */}
            <path
              d="M150 15 L180 12 L210 18 L235 25 L255 35 L268 55 L272 80 L265 100 
                 L270 120 L260 140 L265 160 L255 180 L260 205 L250 230 L255 255 
                 L240 275 L215 285 L185 290 L155 288 L125 280 L100 265 L85 240 
                 L75 210 L70 175 L78 145 L70 115 L82 85 L100 60 L125 40 L150 15 Z"
              fill="url(#mapBg)"
              stroke="#a5b4fc"
              strokeWidth="1.5"
              className="drop-shadow-sm"
            />

            {/* Destination dots */}
            {filteredDestinations.map((dest) => {
              const coords = dest.coordinates || { lat: 20, lng: 78 };
              const { x, y } = geoToSvg(coords.lat, coords.lng);
              const isHovered = hoveredDest === dest.id;
              const color = getCrowdColor(dest.crowdLevel);
              
              return (
                <g 
                  key={dest.id}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredDest(dest.id)}
                  onMouseLeave={() => setHoveredDest(null)}
                  onClick={() => onSelectDestination?.(dest)}
                >
                  {/* Pulse effect */}
                  <circle
                    cx={x}
                    cy={y}
                    r={isHovered ? 12 : 8}
                    fill={color}
                    opacity="0.25"
                    className={isHovered ? "" : "animate-ping"}
                  />
                  {/* Main dot */}
                  <circle
                    cx={x}
                    cy={y}
                    r={isHovered ? 6 : 4}
                    fill={color}
                    stroke="white"
                    strokeWidth="1.5"
                    className="transition-all duration-150"
                  />
                  {/* Tooltip */}
                  {isHovered && (
                    <g>
                      <rect
                        x={x - 45}
                        y={y - 28}
                        width="90"
                        height="20"
                        rx="4"
                        fill="white"
                        stroke="#e5e7eb"
                        className="drop-shadow-md"
                      />
                      <text
                        x={x}
                        y={y - 14}
                        textAnchor="middle"
                        fill="#1f2937"
                        fontSize="9"
                        fontWeight="500"
                      >
                        {dest.name.length > 16 ? dest.name.substring(0, 16) + '…' : dest.name}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* State pills */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {Object.entries(stateGroups).slice(0, 6).map(([state, dests]) => (
            <button
              key={state}
              onClick={() => handleStateClick(state)}
              className={`px-2 py-1 text-[10px] rounded-full transition-all ${
                selectedState === state 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {state} ({dests.length})
            </button>
          ))}
          {Object.keys(stateGroups).length > 6 && (
            <span className="px-2 py-1 text-[10px] text-gray-400">
              +{Object.keys(stateGroups).length - 6} more
            </span>
          )}
        </div>

        {/* Legend */}
        <div className="mt-3 flex items-center justify-between text-[10px] text-gray-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500"></span> Low
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span> Medium
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500"></span> High
            </span>
          </div>
          <span>{filteredDestinations.length} places</span>
        </div>
      </div>
    </div>
  );
}
