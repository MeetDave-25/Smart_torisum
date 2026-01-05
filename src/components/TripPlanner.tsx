import { ArrowLeft, Calendar, Clock, MapPin, Sparkles, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { destinations } from '../data/mockData';

interface TripPlannerProps {
  onBack: () => void;
}

export function TripPlanner({ onBack }: TripPlannerProps) {
  const [selectedDate, setSelectedDate] = useState('2025-12-16');
  const [selectedTime, setSelectedTime] = useState('09:00');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [showItinerary, setShowItinerary] = useState(false);

  const interests = [
    { id: 'temple', label: '🛕 Temples', color: 'bg-orange-100 text-orange-700 border-orange-300' },
    { id: 'nature', label: '🌳 Nature', color: 'bg-green-100 text-green-700 border-green-300' },
    { id: 'museum', label: '🏛️ Museums', color: 'bg-purple-100 text-purple-700 border-purple-300' },
    { id: 'food', label: '🍜 Food', color: 'bg-red-100 text-red-700 border-red-300' },
    { id: 'park', label: '🏞️ Parks', color: 'bg-blue-100 text-blue-700 border-blue-300' }
  ];

  const toggleInterest = (id: string) => {
    setSelectedInterests(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const generateItinerary = () => {
    setShowItinerary(true);
  };

  // Generate suggested itinerary based on selections
  const suggestedPlaces = destinations
    .filter(d => selectedInterests.length === 0 || selectedInterests.includes(d.category))
    .filter(d => d.crowdLevel !== 'high')
    .slice(0, 4);

  const timeSlots = ['09:00 AM', '11:30 AM', '02:00 PM', '04:30 PM'];

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
            <h2 className="text-gray-900">Smart Trip Planner</h2>
            <p className="text-sm text-gray-500">AI-optimized itinerary</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 lg:p-6">
        {!showItinerary ? (
          <>
            {/* AI Banner */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-5 mb-6 text-white">
              <div className="flex items-start gap-3">
                <Sparkles className="w-6 h-6 flex-shrink-0" />
                <div>
                  <p className="mb-2">AI-Powered Planning</p>
                  <p className="text-white/90 text-sm">
                    We'll create a crowd-optimized itinerary based on your preferences and real-time data.
                  </p>
                </div>
              </div>
            </div>

            {/* Date Selection */}
            <div className="bg-white rounded-2xl p-5 mb-4 shadow-sm">
              <label className="text-gray-700 mb-3 block">Select Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Time Selection */}
            <div className="bg-white rounded-2xl p-5 mb-4 shadow-sm">
              <label className="text-gray-700 mb-3 block">Start Time</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Interests Selection */}
            <div className="bg-white rounded-2xl p-5 mb-6 shadow-sm">
              <label className="text-gray-700 mb-3 block">Choose Your Interests</label>
              <div className="flex flex-wrap gap-2">
                {interests.map((interest) => (
                  <button
                    key={interest.id}
                    onClick={() => toggleInterest(interest.id)}
                    className={`px-4 py-2 rounded-xl border-2 transition-all ${
                      selectedInterests.includes(interest.id)
                        ? interest.color + ' border-current'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {interest.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-3">
                {selectedInterests.length === 0 ? 'Select at least one interest' : `${selectedInterests.length} selected`}
              </p>
            </div>

            {/* Duration */}
            <div className="bg-white rounded-2xl p-5 mb-6 shadow-sm">
              <label className="text-gray-700 mb-3 block">Trip Duration</label>
              <div className="grid grid-cols-3 gap-3">
                {['Half Day', 'Full Day', 'Custom'].map((duration) => (
                  <button
                    key={duration}
                    className="px-4 py-3 bg-gray-50 rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all"
                  >
                    {duration}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={generateItinerary}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <Sparkles className="w-5 h-5" />
              <span>Generate Smart Itinerary</span>
            </button>
          </>
        ) : (
          <>
            {/* Generated Itinerary */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-5 mb-6 text-white">
              <p className="mb-2">✨ Your Optimized Itinerary</p>
              <p className="text-white/90 text-sm">
                Planned for {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>

            {/* Itinerary Timeline */}
            <div className="space-y-4 mb-6">
              {suggestedPlaces.map((place, index) => (
                <div key={place.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <div className="p-5">
                    <div className="flex items-start gap-4">
                      {/* Timeline */}
                      <div className="flex flex-col items-center">
                        <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                          {index + 1}
                        </div>
                        {index < suggestedPlaces.length - 1 && (
                          <div className="w-0.5 h-16 bg-blue-200 my-2"></div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="text-gray-900">{place.name}</p>
                            <p className="text-sm text-blue-600">{timeSlots[index]}</p>
                          </div>
                          <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                            Low Crowd
                          </span>
                        </div>

                        <img
                          src={place.image}
                          alt={place.name}
                          className="w-full h-32 object-cover rounded-xl mb-3"
                        />

                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>2 hours</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{place.distance} km</span>
                          </div>
                        </div>

                        <div className="bg-blue-50 rounded-lg p-3">
                          <p className="text-blue-900 text-sm">
                            💡 Best time to visit - minimal crowd expected
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary Stats */}
            <div className="bg-white rounded-2xl p-5 mb-6 shadow-sm">
              <h3 className="text-gray-900 mb-4">Trip Summary</h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <p className="text-2xl text-blue-600">{suggestedPlaces.length}</p>
                  <p className="text-xs text-gray-600">Places</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl text-green-600">8h</p>
                  <p className="text-xs text-gray-600">Duration</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl text-purple-600">12km</p>
                  <p className="text-xs text-gray-600">Distance</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button className="w-full bg-blue-600 text-white py-4 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                <MapPin className="w-5 h-5" />
                <span>Start Navigation</span>
              </button>
              <button
                onClick={() => setShowItinerary(false)}
                className="w-full bg-gray-100 text-gray-700 py-4 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Create New Plan
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}