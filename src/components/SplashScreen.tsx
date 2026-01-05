import { useEffect } from 'react';
import { MapPin, Sparkles } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 flex items-center justify-center relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      {/* Content */}
      <div className="text-center z-10 px-6">
        <div className="mb-8 relative inline-block">
          <div className="absolute inset-0 bg-white/20 rounded-full blur-2xl animate-pulse"></div>
          <div className="relative bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20">
            <MapPin className="w-20 h-20 text-white" strokeWidth={1.5} />
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 mb-4">
          <h1 className="text-white text-5xl tracking-tight">SmartTrip AI</h1>
          <Sparkles className="w-8 h-8 text-yellow-300 animate-pulse" />
        </div>

        <p className="text-white/90 text-xl mb-8 max-w-md mx-auto">
          Travel Smart. Avoid Crowds. Explore More.
        </p>

        {/* Loading animation */}
        <div className="flex gap-2 justify-center">
          <div className="w-3 h-3 bg-white rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-white rounded-full animate-bounce delay-100"></div>
          <div className="w-3 h-3 bg-white rounded-full animate-bounce delay-200"></div>
        </div>
      </div>
    </div>
  );
}
