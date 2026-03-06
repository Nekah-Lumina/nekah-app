import { Trophy, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CelebrationModal({ isOpen, onClose }: CelebrationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-teal-primary via-aqua-gradient to-gold-light flex items-center justify-center z-[9999] animate-fadeIn" style={{
      background: 'linear-gradient(135deg, hsl(180, 65%, 55%) 0%, hsl(185, 80%, 70%) 50%, hsl(48, 85%, 75%) 100%)'
    }}>
      <div className="text-center text-white p-8 relative max-w-lg mx-4 animate-slideInUp">
        {/* Confetti */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-10 text-4xl animate-confetti">🎉</div>
          <div className="absolute top-20 right-20 text-4xl animate-confetti" style={{ animationDelay: '0.2s' }}>✨</div>
          <div className="absolute bottom-20 left-20 text-4xl animate-confetti" style={{ animationDelay: '0.4s' }}>💕</div>
          <div className="absolute bottom-10 right-10 text-4xl animate-confetti" style={{ animationDelay: '0.6s' }}>🌟</div>
          <div className="absolute top-1/2 left-1/4 text-4xl animate-confetti" style={{ animationDelay: '0.8s' }}>🎊</div>
          <div className="absolute top-1/3 right-1/3 text-4xl animate-confetti" style={{ animationDelay: '1s' }}>💐</div>
        </div>

        <div className="animate-bounce mb-6">
          <Trophy className="w-24 h-24 mx-auto mb-4 drop-shadow-2xl" />
        </div>
        
        <h2 className="text-4xl font-bold mb-4 drop-shadow-lg">Congratulations, Mama!</h2>
        <p className="text-xl mb-8 drop-shadow-md">Welcome to your NEKAH journey!</p>
        
        <div className="flex items-center justify-center mb-8">
          <Sparkles className="w-8 h-8 mr-2" />
          <span className="text-lg">Your pregnancy companion is ready</span>
          <Sparkles className="w-8 h-8 ml-2" />
        </div>
        
        <Button
          onClick={onClose}
          className="bg-white/30 hover:bg-white/40 text-white rounded-full px-8 py-4 font-semibold transition-all duration-300 backdrop-blur-sm border-2 border-white/20 shadow-2xl text-lg"
        >
          Continue Journey
        </Button>
      </div>
    </div>
  );
}
