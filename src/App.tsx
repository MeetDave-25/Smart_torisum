import { useState } from 'react';
import { SplashScreen } from './components/SplashScreen';
import { OnboardingScreen } from './components/OnboardingScreen';
import { HomeDashboard } from './components/HomeDashboard';
import { DestinationDetail } from './components/DestinationDetail';
import { CrowdPrediction } from './components/CrowdPrediction';
import { NearbyAlternatives } from './components/NearbyAlternatives';
import { TripPlanner } from './components/TripPlanner';
import { AlertsScreen } from './components/AlertsScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { AdminDashboard } from './components/AdminDashboard';
import { Toaster } from './components/ui/sonner';

export type Screen = 
  | 'splash' 
  | 'onboarding' 
  | 'home' 
  | 'destination' 
  | 'prediction' 
  | 'alternatives' 
  | 'planner' 
  | 'alerts' 
  | 'profile'
  | 'admin';

export interface Destination {
  id: string;
  name: string;
  image: string;
  crowdLevel: 'low' | 'medium' | 'high';
  crowdCount: number;
  capacity: number;
  waitingTime: number;
  bestTime: string;
  distance?: number;
  rating: number;
  category: 'temple' | 'nature' | 'food' | 'museum' | 'park';
  coordinates: { lat: number; lng: number };
  region?: string;
  state?: string;
  description?: string;
}

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('splash');
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const navigateTo = (screen: Screen, destination?: Destination) => {
    // debug helper: log navigation changes to browser console
    console.log('navigateTo ->', screen, destination);
    setCurrentScreen(screen);
    if (destination) {
      setSelectedDestination(destination);
    }
  };

  const renderScreen = () => {
    if (isAdmin) {
      return <AdminDashboard onBack={() => setIsAdmin(false)} />;
    }

    switch (currentScreen) {
      case 'splash':
        return <SplashScreen onComplete={() => navigateTo('onboarding')} />;
      case 'onboarding':
        return <OnboardingScreen onComplete={() => navigateTo('home')} onAdminAccess={() => setIsAdmin(true)} />;
      case 'home':
        return <HomeDashboard onNavigate={navigateTo} />;
      case 'destination':
        return <DestinationDetail destination={selectedDestination} onNavigate={navigateTo} />;
      case 'prediction':
        return <CrowdPrediction destination={selectedDestination} onBack={() => navigateTo('destination')} />;
      case 'alternatives':
        return <NearbyAlternatives destination={selectedDestination} onNavigate={navigateTo} onBack={() => navigateTo('destination')} />;
      case 'planner':
        return <TripPlanner onBack={() => navigateTo('home')} />;
      case 'alerts':
        return <AlertsScreen onBack={() => navigateTo('home')} />;
      case 'profile':
        return <ProfileScreen onBack={() => navigateTo('home')} />;
      default:
        return <HomeDashboard onNavigate={navigateTo} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster />
      {renderScreen()}
    </div>
  );
}

export default App;