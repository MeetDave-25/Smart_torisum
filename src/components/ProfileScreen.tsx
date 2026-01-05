import { ArrowLeft, User, Globe, Bell, Shield, Heart, MapPin, ChevronRight, LogOut } from 'lucide-react';

interface ProfileScreenProps {
  onBack: () => void;
}

export function ProfileScreen({ onBack }: ProfileScreenProps) {
  const menuItems = [
    {
      icon: <Globe className="w-5 h-5" />,
      label: 'Language',
      value: 'English',
      color: 'text-blue-600'
    },
    {
      icon: <Bell className="w-5 h-5" />,
      label: 'Notifications',
      value: 'Enabled',
      color: 'text-purple-600'
    },
    {
      icon: <Shield className="w-5 h-5" />,
      label: 'Privacy & Security',
      value: '',
      color: 'text-green-600'
    },
    {
      icon: <Heart className="w-5 h-5" />,
      label: 'Saved Places',
      value: '12 places',
      color: 'text-red-600'
    },
    {
      icon: <MapPin className="w-5 h-5" />,
      label: 'Travel Preferences',
      value: '',
      color: 'text-orange-600'
    }
  ];

  const travelStats = [
    { label: 'Places Visited', value: '24', color: 'bg-blue-50 text-blue-700' },
    { label: 'Trips Planned', value: '8', color: 'bg-purple-50 text-purple-700' },
    { label: 'Hours Saved', value: '16', color: 'bg-green-50 text-green-700' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white pb-20">
        <div className="p-4 flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h2>Profile & Settings</h2>
        </div>
      </div>

      {/* Profile Card */}
      <div className="px-6 -mt-16 mb-6">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-gradient-to-br from-blue-500 to-purple-500 w-20 h-20 rounded-full flex items-center justify-center text-white">
              <User className="w-10 h-10" />
            </div>
            <div className="flex-1">
              <h3 className="text-gray-900 mb-1">Guest User</h3>
              <p className="text-sm text-gray-500">guest@smarttrip.ai</p>
              <button className="mt-2 text-blue-600 text-sm hover:text-blue-700">
                Edit Profile
              </button>
            </div>
          </div>

          {/* Travel Stats */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            {travelStats.map((stat, index) => (
              <div key={index} className={`${stat.color} rounded-xl p-3 text-center`}>
                <p className="text-2xl mb-1">{stat.value}</p>
                <p className="text-xs">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="px-6 mb-6">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {menuItems.map((item, index) => (
            <button
              key={index}
              className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
            >
              <div className={`${item.color}`}>{item.icon}</div>
              <div className="flex-1 text-left">
                <p className="text-gray-900">{item.label}</p>
                {item.value && (
                  <p className="text-sm text-gray-500">{item.value}</p>
                )}
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          ))}
        </div>
      </div>

      {/* Preferences */}
      <div className="px-6 mb-6">
        <h3 className="text-gray-700 mb-3">Travel Preferences</h3>
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-900">Avoid Crowds</p>
                <p className="text-sm text-gray-500">Prioritize low crowd places</p>
              </div>
              <button className="w-12 h-6 bg-blue-600 rounded-full">
                <div className="w-5 h-5 bg-white rounded-full translate-x-6"></div>
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-900">Show Walking Distance</p>
                <p className="text-sm text-gray-500">Display walk times</p>
              </div>
              <button className="w-12 h-6 bg-blue-600 rounded-full">
                <div className="w-5 h-5 bg-white rounded-full translate-x-6"></div>
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-900">Offline Maps</p>
                <p className="text-sm text-gray-500">Download for offline use</p>
              </div>
              <button className="w-12 h-6 bg-gray-300 rounded-full">
                <div className="w-5 h-5 bg-white rounded-full translate-x-0.5"></div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="px-6 mb-6">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-100">
            <span className="text-gray-700">Help & Support</span>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
          <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-100">
            <span className="text-gray-700">Terms & Conditions</span>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
          <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
            <span className="text-gray-700">Privacy Policy</span>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Version */}
      <div className="px-6 mb-6">
        <div className="bg-blue-50 rounded-2xl p-5 text-center">
          <p className="text-blue-900 mb-1">SmartTrip AI</p>
          <p className="text-blue-600 text-sm">Version 1.0.0</p>
          <p className="text-blue-700 text-xs mt-2">
            Powered by AI & Real-time Data
          </p>
        </div>
      </div>

      {/* Logout */}
      <div className="px-6 pb-10">
        <button className="w-full bg-red-50 text-red-600 py-4 rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2">
          <LogOut className="w-5 h-5" />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );
}
