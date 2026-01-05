import { Globe, MapPin, Shield } from 'lucide-react';

interface OnboardingScreenProps {
  onComplete: () => void;
  onAdminAccess: () => void;
}

export function OnboardingScreen({ onComplete, onAdminAccess }: OnboardingScreenProps) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="p-6">
        <div className="flex items-center gap-2">
          <MapPin className="w-8 h-8 text-blue-600" />
          <span className="text-blue-600">SmartTrip AI</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-20">
        <div className="max-w-md w-full text-center">
          <div className="mb-8">
            <img 
              src="https://images.unsplash.com/photo-1546661869-cf589fac7085?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmF2ZWwlMjBkZXN0aW5hdGlvbiUyMHRvdXJpc218ZW58MXx8fHwxNzY1ODEwMDc2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Travel"
              className="w-full h-64 object-cover rounded-3xl shadow-lg"
            />
          </div>

          <h2 className="text-gray-900 mb-3">Welcome to Smart Tourism</h2>
          <p className="text-gray-600 mb-8">
            Discover destinations without the crowds. Get real-time crowd insights and personalized recommendations.
          </p>

          {/* Features */}
          <div className="space-y-4 mb-10">
            <div className="flex items-start gap-3 text-left">
              <div className="bg-blue-100 p-2 rounded-lg">
                <MapPin className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-gray-800">Real-time Crowd Tracking</p>
                <p className="text-gray-500 text-sm">Know before you go</p>
              </div>
            </div>
            <div className="flex items-start gap-3 text-left">
              <div className="bg-green-100 p-2 rounded-lg">
                <Globe className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-gray-800">Smart Recommendations</p>
                <p className="text-gray-500 text-sm">AI-powered suggestions</p>
              </div>
            </div>
            <div className="flex items-start gap-3 text-left">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Shield className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-gray-800">Safety Alerts</p>
                <p className="text-gray-500 text-sm">Stay informed and safe</p>
              </div>
            </div>
          </div>

          {/* Login Options */}
          <div className="space-y-3">
            <button
              onClick={onComplete}
              className="w-full bg-blue-600 text-white py-4 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30"
            >
              Continue as Guest
            </button>
            <button
              onClick={onComplete}
              className="w-full bg-white text-gray-700 py-4 rounded-xl border border-gray-300 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
          </div>

          {/* Admin Access */}
          <button
            onClick={onAdminAccess}
            className="mt-6 text-gray-400 text-sm hover:text-gray-600"
          >
            Admin Dashboard Access
          </button>
        </div>
      </div>

      {/* Language Selection */}
      <div className="p-6 border-t border-gray-200">
        <div className="flex items-center justify-center gap-2">
          <Globe className="w-4 h-4 text-gray-400" />
          <select className="text-gray-600 text-sm bg-transparent border-none outline-none">
            <option>English</option>
            <option>हिंदी</option>
            <option>Español</option>
            <option>中文</option>
          </select>
        </div>
      </div>
    </div>
  );
}
