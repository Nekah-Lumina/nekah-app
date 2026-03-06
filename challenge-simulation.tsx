import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Minus, Bell, Calendar, TrendingUp, Target, Clock, CheckCircle } from 'lucide-react';
import { Challenge } from '@/lib/types';
import { ChallengeSimulationService, ChallengeProgress } from '@/lib/challenge-simulations';
import { useToast } from '@/hooks/use-toast';

interface ChallengeSimulationProps {
  challenge: Challenge;
  onProgressUpdate?: () => void;
}

export default function ChallengeSimulation({ challenge, onProgressUpdate }: ChallengeSimulationProps) {
  const [progress, setProgress] = useState<ChallengeProgress | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [customNote, setCustomNote] = useState('');
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadProgress();
    
    // Only set up reminder interval if not already running
    const reminderInterval = setInterval(checkReminders, 300000); // 5 minutes
    return () => clearInterval(reminderInterval);
  }, [challenge.id]);

  const loadProgress = () => {
    const currentProgress = ChallengeSimulationService.getTodayProgress(challenge.id);
    setProgress(currentProgress);
  };

  const checkReminders = () => {
    if (!reminderEnabled) return;
    
    if (ChallengeSimulationService.isReminderDue(challenge.id)) {
      const message = ChallengeSimulationService.getReminderMessage(challenge.id);
      showReminder(message);
      ChallengeSimulationService.markReminderSent(challenge.id);
    }
  };

  const showReminder = (message: string) => {
    toast({
      title: `${challenge.icon} ${challenge.title}`,
      description: message,
      duration: 8000,
    });
  };

  const handleIncrement = (value: number = 1) => {
    const updatedProgress = ChallengeSimulationService.recordProgress(challenge.id, value, customNote);
    setProgress(updatedProgress);
    setCustomNote('');
    
    if (updatedProgress.isCompleted) {
      toast({
        title: "Challenge Completed! 🎉",
        description: `Amazing work on ${challenge.title}! You've reached your daily goal.`,
      });
    } else {
      toast({
        title: "Progress Updated!",
        description: `Great job! ${updatedProgress.currentProgress}/${updatedProgress.targetProgress} completed.`,
      });
    }

    onProgressUpdate?.();
  };

  const getTargetValue = (challengeId: string): number => {
    const targets: Record<string, number> = {
      'nutrition-water-intake': 8,
      'nutrition-prenatal-vitamins': 1,
      'mental-baby-bonding': 1,
      'exercise-prenatal-walk': 1,
      'exercise-pelvic-floor': 3,
      'nutrition-calcium-rich': 3,
      'mental-gratitude-journal': 3,
    };
    return targets[challengeId] || 1;
  };

  const getProgressUnit = (challengeId: string): string => {
    const units: Record<string, string> = {
      'nutrition-water-intake': 'glasses',
      'nutrition-prenatal-vitamins': 'dose',
      'mental-baby-bonding': 'session',
      'exercise-prenatal-walk': 'walk',
      'exercise-pelvic-floor': 'sets',
      'nutrition-calcium-rich': 'servings',
      'mental-gratitude-journal': 'entries',
    };
    return units[challengeId] || 'items';
  };

  const getIncrementOptions = (challengeId: string) => {
    const options: Record<string, Array<{value: number; label: string; icon: string}>> = {
      'nutrition-water-intake': [
        { value: 1, label: '1 Glass', icon: '💧' },
        { value: 2, label: '2 Glasses', icon: '💧💧' },
      ],
      'nutrition-prenatal-vitamins': [
        { value: 1, label: 'Taken', icon: '💊' },
      ],
      'mental-baby-bonding': [
        { value: 1, label: '10 min session', icon: '👶' },
      ],
      'exercise-prenatal-walk': [
        { value: 1, label: 'Completed walk', icon: '🚶‍♀️' },
      ],
      'exercise-pelvic-floor': [
        { value: 1, label: '1 Set (10 reps)', icon: '💪' },
      ],
      'nutrition-calcium-rich': [
        { value: 1, label: '1 Serving', icon: '🥛' },
      ],
      'mental-gratitude-journal': [
        { value: 1, label: '1 Gratitude', icon: '📝' },
      ],
    };
    return options[challengeId] || [{ value: 1, label: 'Mark Done', icon: '✅' }];
  };

  if (!progress) {
    return (
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{challenge.icon}</span>
              <div>
                <h4 className="font-semibold text-gray-800">{challenge.title}</h4>
                <p className="text-sm text-gray-600">Ready to start tracking</p>
              </div>
            </div>
            <Button 
              onClick={() => handleIncrement(0)} // Initialize tracking
              className="bg-primary hover:bg-primary/90"
            >
              Start Tracking
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const visualization = ChallengeSimulationService.getProgressVisualization(challenge.id);
  const weeklySummary = ChallengeSimulationService.getWeeklySummary(challenge.id);
  const targetValue = getTargetValue(challenge.id);
  const progressUnit = getProgressUnit(challenge.id);
  const incrementOptions = getIncrementOptions(challenge.id);

  return (
    <Card className={`mb-4 transition-all duration-200 ${
      progress.isCompleted ? 'bg-green-50 border-green-200' : 'hover:shadow-md'
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{challenge.icon}</span>
            <div>
              <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
                {challenge.title}
                {progress.isCompleted && <CheckCircle className="w-4 h-4 text-green-600" />}
              </CardTitle>
              <p className="text-sm text-gray-600">{visualization.motivationalMessage}</p>
            </div>
          </div>
          <Dialog open={showDetails} onOpenChange={setShowDetails}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm">
                <TrendingUp className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <span className="text-xl">{challenge.icon}</span>
                  {challenge.title} - Progress Details
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{weeklySummary.daysCompleted}</div>
                    <div className="text-sm text-blue-800">Days This Week</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{weeklySummary.streak}</div>
                    <div className="text-sm text-green-800">Current Streak</div>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Weekly Average: {weeklySummary.averageCompletion}%</Label>
                  <Progress value={weeklySummary.averageCompletion} className="h-2 mt-1" />
                </div>
                
                {progress.progressEntries.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Today's Entries</Label>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {progress.progressEntries.map((entry) => (
                        <div key={entry.id} className="text-xs bg-gray-50 p-2 rounded">
                          <div className="flex justify-between">
                            <span>{new Date(entry.timestamp).toLocaleTimeString()}</span>
                            <span>+{entry.value}</span>
                          </div>
                          {entry.note && <p className="text-gray-600 mt-1">{entry.note}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Progress Visualization */}
          <div className="text-center">
            <div className="text-2xl font-mono mb-2 tracking-wider">{visualization.visualization}</div>
            <div className="flex items-center justify-center gap-4 text-sm">
              <span className="text-gray-600">{progress.currentProgress}/{targetValue} {progressUnit}</span>
              <Badge variant={progress.isCompleted ? "default" : "secondary"}>
                {visualization.percentage}%
              </Badge>
            </div>
            <Progress value={visualization.percentage} className="h-2 mt-2" />
          </div>

          {/* Quick Actions */}
          {!progress.isCompleted && (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {incrementOptions.map((option) => (
                  <Button
                    key={option.value}
                    onClick={() => handleIncrement(option.value)}
                    className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-sm"
                    size="sm"
                  >
                    <span>{option.icon}</span>
                    {option.label}
                  </Button>
                ))}
              </div>

              {/* Custom Note Input */}
              <div className="space-y-2">
                <Label className="text-xs text-gray-600">Add a note (optional):</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="How did it go? Any thoughts..."
                    value={customNote}
                    onChange={(e) => setCustomNote(e.target.value)}
                    className="text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Completed State */}
          {progress.isCompleted && (
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-green-800 font-medium">Goal achieved for today!</p>
              <p className="text-green-700 text-sm mt-1">
                Completed at {progress.progressEntries[progress.progressEntries.length - 1] && 
                new Date(progress.progressEntries[progress.progressEntries.length - 1].timestamp).toLocaleTimeString()}
              </p>
            </div>
          )}

          {/* Reminder Settings */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              <span className="text-gray-600">Reminders</span>
            </div>
            <Button
              variant={reminderEnabled ? "default" : "outline"}
              size="sm"
              onClick={() => setReminderEnabled(!reminderEnabled)}
            >
              {reminderEnabled ? 'On' : 'Off'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}