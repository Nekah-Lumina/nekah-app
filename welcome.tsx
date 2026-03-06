import { useLocation } from 'wouter';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import nekahLogo from '@assets/image_1754317512268.png';

export default function Welcome() {
  const [, setLocation] = useLocation();

  const handleGetStarted = () => {
    setLocation('/home');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center screen-container">
      <div className="animate-float mb-8">
        <img 
          src={nekahLogo} 
          alt="NEKAH Logo" 
          className="w-32 h-auto mb-4"
        />
      </div>
      
      <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4 leading-tight">
        Welcome to <span className="text-primary">NEKAH</span>
      </h1>
      
      <p className="text-xl text-gray-600 mb-8 animate-pulse-soft">
        Where Mothers Matter Most 💕
      </p>
      
      <Button 
        onClick={handleGetStarted}
        className="bg-gradient-to-r from-primary to-rose-gold text-white px-8 py-4 rounded-full text-lg font-semibold glow-effect"
        size="lg"
      >
        Let's Begin
      </Button>
    </div>
  );
}
