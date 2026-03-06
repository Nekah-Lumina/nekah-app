import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect, useState, lazy } from "react";

// Pages
import Welcome from "@/pages/welcome";
import Home from "@/pages/home";
import GlowTalk from "@/pages/glow-talk";
import BumpCheck from "@/pages/bump-check";
import BabyTracker from "@/pages/baby-tracker";
import Cravings from "@/pages/cravings";
import Community from "@/pages/community";
import Profile from "@/pages/profile";
import Emergency from "@/pages/emergency";
import DoctorEye from "@/pages/doctor-eye";
import DoctorEyeAdvanced from "@/pages/doctor-eye-advanced";
import HealthJournal from "@/pages/health-journal";
import Challenges from "@/pages/challenges";
import Search from "@/pages/search";

// Components
import BottomNavigation from "@/components/bottom-navigation";
import OnboardingModal from "@/components/onboarding-modal";
import CelebrationModal from "@/components/celebration-modal";
import { GlobalReminderSystem } from "@/components/reminder-notification";
import { ViewportSetup } from "@/components/viewport-setup";

// Storage
import { LocalStorageService } from "@/lib/storage";

function Router() {
  const [location, setLocation] = useLocation();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [isOnboardingCompleted] = useState(LocalStorageService.isOnboardingCompleted());

  // Handle initial routing and onboarding
  useEffect(() => {
    // If user lands on root and onboarding is completed, redirect to home
    if (location === '/' && isOnboardingCompleted) {
      setLocation('/home');
      return;
    }
    
    // Show onboarding modal when entering home (if not completed)
    if (location === '/home' && !isOnboardingCompleted) {
      setShowOnboarding(true);
    }
  }, [location, isOnboardingCompleted, setLocation]);

  const handleOnboardingComplete = () => {
    LocalStorageService.setOnboardingCompleted(true);
    setShowOnboarding(false);
    
    // Show celebration immediately after onboarding closes
    setTimeout(() => {
      setShowCelebration(true);
      
      // Auto-hide celebration after 6 seconds (increased time)
      setTimeout(() => {
        setShowCelebration(false);
      }, 6000);
    }, 200); // Reduced delay
  };

  const isMainPage = ['/home', '/community', '/bump-check', '/emergency', '/profile', '/challenges', '/search'].includes(location);

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <Switch>
        <Route path="/" component={Welcome} />
        <Route path="/home" component={Home} />
        <Route path="/glow-talk" component={GlowTalk} />
        <Route path="/bump-check" component={BumpCheck} />
        <Route path="/baby-tracker" component={BabyTracker} />
        <Route path="/growth-scan" component={lazy(() => import('./pages/growth-scan'))} />
        <Route path="/birth-plan" component={lazy(() => import('./pages/birth-plan'))} />
        <Route path="/cravings" component={Cravings} />
        <Route path="/community" component={Community} />
        <Route path="/profile" component={Profile} />
        <Route path="/emergency" component={Emergency} />
        <Route path="/doctor-eye" component={DoctorEye} />
        <Route path="/doctor-eye-advanced" component={DoctorEyeAdvanced} />
        <Route path="/health-journal" component={HealthJournal} />
        <Route path="/challenges" component={Challenges} />
        <Route path="/search" component={Search} />
        <Route>
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-800 mb-4">Page Not Found</h1>
              <p className="text-gray-600">The page you're looking for doesn't exist.</p>
            </div>
          </div>
        </Route>
      </Switch>

      {isMainPage && <BottomNavigation />}

      <OnboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={handleOnboardingComplete}
      />

      <CelebrationModal
        isOpen={showCelebration}
        onClose={() => setShowCelebration(false)}
      />

      {/* Global reminder notifications */}
      <GlobalReminderSystem />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ViewportSetup />
        <Toaster />
        <Router />
      </TooltipProvider>  
    </QueryClientProvider>
  );
}

export default App;
