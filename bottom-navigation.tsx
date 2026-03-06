import { useLocation } from 'wouter';
import { Home, Users, Camera, AlertTriangle, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

const navItems = [
  { id: 'home', icon: Home, label: 'Home', path: '/home' },
  { id: 'community', icon: Users, label: 'Community', path: '/community' },
  { id: 'bumpCheck', icon: Camera, label: 'BumpCheck', path: '/bump-check' },
  { id: 'emergency', icon: AlertTriangle, label: 'Emergency', path: '/emergency' },
  { id: 'profile', icon: User, label: 'Profile', path: '/profile' }
];

export default function BottomNavigation() {
  const [location, setLocation] = useLocation();

  return (
    <>
      {/* Emergency Floating Button - Mobile Friendly */}
      <div className="fixed bottom-20 right-4 z-50 sm:bottom-24 sm:right-6">
        <Button
          onClick={() => setLocation('/emergency')}
          className="bg-red-500 hover:bg-red-600 text-white rounded-full w-12 h-12 sm:w-14 sm:h-14 shadow-lg touch-target"
          size="icon"
        >
          <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6" />
        </Button>
      </div>

      {/* Bottom Navigation - Universal Device Friendly */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-primary/20 px-2 py-2 sm:px-4 md:px-6 lg:desktop-container lg:px-8 sm:py-3 z-40 shadow-lg">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const isActive = location === item.path;
            const IconComponent = item.icon;
            
            return (
              <Button
                key={item.id}
                variant="ghost"
                onClick={() => setLocation(item.path)}
                className={`flex flex-col items-center space-y-1 h-auto p-2 sm:p-3 min-w-[60px] touch-target mobile-button ${
                  isActive ? 'text-primary nav-btn-active' : 'text-gray-400'
                }`}
                style={isActive ? { color: 'hsl(180, 65%, 55%)' } : {}}
              >
                <IconComponent className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="text-xs font-medium">{item.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </>
  );
}
