import { useState, useEffect } from 'react';
import { Bell, X, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChallengeSimulationService } from '@/lib/challenge-simulations';
import { LocalStorageService } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';

interface ReminderNotificationProps {
  challengeId: string;
  challengeTitle: string;
  challengeIcon: string;
  message: string;
  onDismiss: () => void;
  onQuickAction: () => void;
}

export function ReminderNotification({ 
  challengeId, 
  challengeTitle, 
  challengeIcon, 
  message, 
  onDismiss, 
  onQuickAction 
}: ReminderNotificationProps) {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    const updateTimer = () => {
      const nextReminder = ChallengeSimulationService.getNextReminder(challengeId);
      if (nextReminder) {
        const now = new Date();
        const diff = nextReminder.getTime() - now.getTime();
        
        if (diff > 0) {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          setTimeLeft(`Next reminder in ${hours}h ${minutes}m`);
        } else {
          setTimeLeft('Reminder due now');
        }
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [challengeId]);

  const handleQuickAction = () => {
    onQuickAction();
    toast({
      title: "Great job!",
      description: `Progress recorded for ${challengeTitle}`,
    });
  };

  return (
    <Card className="mb-4 border-orange-200 bg-orange-50 animate-pulse-soft">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <span className="text-lg">{challengeIcon}</span>
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Bell className="w-4 h-4 text-orange-600" />
              <h4 className="font-semibold text-orange-800 text-sm">{challengeTitle}</h4>
              <Badge variant="outline" className="text-xs border-orange-300 text-orange-700">
                Reminder
              </Badge>
            </div>
            
            <p className="text-orange-700 text-sm mb-3 leading-relaxed">
              {message}
            </p>
            
            {timeLeft && (
              <div className="flex items-center gap-1 text-xs text-orange-600 mb-3">
                <Clock className="w-3 h-3" />
                <span>{timeLeft}</span>
              </div>
            )}
            
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleQuickAction}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                <CheckCircle className="w-3 h-3 mr-1" />
                Mark Done
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={onDismiss}
                className="border-orange-300 text-orange-700 hover:bg-orange-100"
              >
                <X className="w-3 h-3 mr-1" />
                Dismiss
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Global reminder system component
export function GlobalReminderSystem() {
  const [activeReminders, setActiveReminders] = useState<Array<{
    challengeId: string;
    message: string;
    config: any;
  }>>([]);

  useEffect(() => {
    const checkReminders = () => {
      // Only show reminders if user has signed in and accepted challenges
      if (!LocalStorageService.hasUserAcceptedChallenges()) {
        setActiveReminders([]);
        return;
      }

      const dueReminders = ChallengeSimulationService.getDueReminders();
      setActiveReminders(dueReminders);
    };

    checkReminders();
    const interval = setInterval(checkReminders, 2 * 60 * 1000); // Check every 2 minutes
    return () => clearInterval(interval);
  }, []);

  const handleDismiss = (challengeId: string) => {
    setActiveReminders(reminders => 
      reminders.filter(r => r.challengeId !== challengeId)
    );
    ChallengeSimulationService.markReminderSent(challengeId);
  };

  const handleQuickAction = (challengeId: string) => {
    // Record progress for the challenge
    ChallengeSimulationService.recordProgress(challengeId, 1);
    handleDismiss(challengeId);
  };

  if (activeReminders.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 w-80 max-h-[80vh] z-50 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-orange-300 scrollbar-track-orange-100">
      {activeReminders.map(({ challengeId, message, config }) => {
        // Get challenge details (would need to pass this data or retrieve it)
        const challengeData = {
          'nutrition-water-intake': { title: 'Hydration Hero', icon: '💧' },
          'nutrition-prenatal-vitamins': { title: 'Vitamin Victory', icon: '💊' },
          'mental-baby-bonding': { title: 'Baby Talk', icon: '👶' },
          'exercise-prenatal-walk': { title: 'Gentle Steps', icon: '🚶‍♀️' },
          'exercise-pelvic-floor': { title: 'Pelvic Power', icon: '💪' },
        };

        const challenge = challengeData[challengeId as keyof typeof challengeData] || 
          { title: 'Wellness Challenge', icon: '⭐' };

        return (
          <ReminderNotification
            key={challengeId}
            challengeId={challengeId}
            challengeTitle={challenge.title}
            challengeIcon={challenge.icon}
            message={message}
            onDismiss={() => handleDismiss(challengeId)}
            onQuickAction={() => handleQuickAction(challengeId)}
          />
        );
      })}
    </div>
  );
}