import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Star, Bell, Target, Trophy, Heart } from 'lucide-react';
import { LocalStorageService } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';

interface ChallengeAcceptanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
}

export function ChallengeAcceptanceModal({ isOpen, onClose, onAccept }: ChallengeAcceptanceModalProps) {
  const [isAccepting, setIsAccepting] = useState(false);
  const { toast } = useToast();

  const handleAccept = () => {
    setIsAccepting(true);
    
    // Set challenge acceptance in storage
    LocalStorageService.setChallengeAcceptance(true);
    
    toast({
      title: "Welcome to Wellness Challenges! 🌟",
      description: "Your personalized reminders will start appearing soon to help you stay on track.",
    });

    setTimeout(() => {
      setIsAccepting(false);
      onAccept();
      onClose();
    }, 1000);
  };

  const handleDecline = () => {
    LocalStorageService.setChallengeAcceptance(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-gradient-to-br from-pink-50 to-purple-50 border-pink-200">
        <DialogHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full flex items-center justify-center mb-4">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <DialogTitle className="text-2xl font-bold text-pink-800">
            Start Your Wellness Journey
          </DialogTitle>
          <DialogDescription className="text-pink-700 text-base">
            Join our daily wellness challenges designed specifically for expecting mothers
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Card className="border-pink-200 bg-white/80">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Bell className="w-4 h-4 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-800">Smart Reminders</h3>
              </div>
              <p className="text-sm text-gray-600 ml-11">
                Get gentle notifications for hydration, vitamins, and wellness activities at optimal times
              </p>
            </CardContent>
          </Card>

          <Card className="border-pink-200 bg-white/80">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Target className="w-4 h-4 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-800">Daily Goals</h3>
              </div>
              <p className="text-sm text-gray-600 ml-11">
                Track water intake, prenatal vitamins, baby bonding time, and gentle exercise
              </p>
            </CardContent>
          </Card>

          <Card className="border-pink-200 bg-white/80">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Star className="w-4 h-4 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-800">Achievement Badges</h3>
              </div>
              <p className="text-sm text-gray-600 ml-11">
                Earn beautiful badges and maintain streaks to celebrate your progress
              </p>
            </CardContent>
          </Card>

          <div className="bg-pink-100 rounded-lg p-4 border border-pink-200">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-4 h-4 text-pink-600" />
              <Badge variant="secondary" className="bg-pink-200 text-pink-800">
                Pregnancy Safe
              </Badge>
            </div>
            <p className="text-sm text-pink-700">
              All challenges are designed by maternal health specialists and are completely safe for pregnancy
            </p>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={handleDecline}
            className="flex-1 border-gray-300 text-gray-700"
            disabled={isAccepting}
          >
            Maybe Later
          </Button>
          <Button
            onClick={handleAccept}
            disabled={isAccepting}
            className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
          >
            {isAccepting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Starting...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Start My Journey
              </div>
            )}
          </Button>
        </div>

        <p className="text-xs text-gray-500 text-center mt-2">
          You can always adjust reminder settings in your profile
        </p>
      </DialogContent>
    </Dialog>
  );
}