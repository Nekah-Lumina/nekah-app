import { useState, useEffect } from 'react';
import { Trophy, Target, Star, Calendar, Flame, Award, ArrowLeft, Bell, Settings } from 'lucide-react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { ChallengeService } from '@/lib/challenge-service';
import { Challenge, UserChallenge, WellnessStats, Achievement } from '@/lib/types';
import { LocalStorageService } from '@/lib/storage';
import { ChallengeSimulationService } from '@/lib/challenge-simulations';
import { ChallengeAcceptanceModal } from '@/components/challenge-acceptance-modal';
import ExerciseMap from '@/components/exercise-map';
import nekahLogo from '@assets/image_1754317512268.png';

export default function Challenges() {
  const [, setLocation] = useLocation();
  const [dailyChallenges, setDailyChallenges] = useState<Challenge[]>([]);
  const [optionalChallenges, setOptionalChallenges] = useState<Challenge[]>([]);
  const [userChallenges, setUserChallenges] = useState<UserChallenge[]>([]);
  const [wellnessStats, setWellnessStats] = useState<WellnessStats | null>(null);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [completionNotes, setCompletionNotes] = useState('');
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);
  const [showAchievementDialog, setShowAchievementDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('today');
  const [reminderCount, setReminderCount] = useState(0);
  const [showAcceptanceModal, setShowAcceptanceModal] = useState(false);
  const [showExerciseMap, setShowExerciseMap] = useState<{challengeId: string, type: any} | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadChallengeData();
    checkReminders();
    
    if (LocalStorageService.isOnboardingCompleted() && !LocalStorageService.hasUserAcceptedChallenges()) {
      setShowAcceptanceModal(true);
    }
    
    const reminderInterval = setInterval(checkReminders, 5 * 60 * 1000);
    return () => clearInterval(reminderInterval);
  }, []);

  const checkReminders = () => {
    try {
      if (!LocalStorageService.hasUserAcceptedChallenges()) {
        setReminderCount(0);
        return;
      }

      const dueReminders = ChallengeSimulationService.getDueReminders();
      setReminderCount(dueReminders.length);
      
      dueReminders.slice(0, 2).forEach(({ challengeId, message }) => {
        const challenge = [...dailyChallenges, ...optionalChallenges].find(c => c.id === challengeId);
        if (challenge) {
          toast({
            title: `${challenge.icon} Wellness Reminder`,
            description: message,
            duration: 8000,
          });
          ChallengeSimulationService.markReminderSent(challengeId);
        }
      });
    } catch (error) {
      console.error('Error checking reminders:', error);
    }
  };

  const loadChallengeData = () => {
    try {
      const profile = LocalStorageService.getUserProfile();
      const pregnancyWeek = profile?.pregnancyWeek || 20;
      
      const daily = ChallengeService.getDailyChallenges(pregnancyWeek);
      const optional = ChallengeService.getOptionalChallenges(pregnancyWeek);
      const userProgress = ChallengeService.getUserChallenges();
      const stats = ChallengeService.getWellnessStats();
      
      setDailyChallenges(daily);
      setOptionalChallenges(optional);
      setUserChallenges(userProgress);
      setWellnessStats(stats);
    } catch (error) {
      console.error('Error loading challenge data:', error);
      toast({
        title: "Error Loading Challenges",
        description: "There was a problem loading the wellness challenges. Please refresh the page.",
        variant: "destructive"
      });
    }
  };

  const getChallengeStatus = (challengeId: string): 'not-started' | 'completed' | 'skipped' => {
    const userChallenge = userChallenges.find(uc => uc.challengeId === challengeId);
    if (!userChallenge) return 'not-started';
    
    const today = new Date().toDateString();
    const completedToday = userChallenge.completedAt && 
      new Date(userChallenge.completedAt).toDateString() === today;
    
    if (completedToday && userChallenge.status === 'completed') return 'completed';
    if (userChallenge.status === 'skipped') return 'skipped';
    return 'not-started';
  };

  const handleCompleteChallenge = (challenge: Challenge) => {
    try {
      const result = ChallengeService.completeChallenge(challenge.id, completionNotes);
      
      if (result.points > 0) {
        toast({
          title: "Challenge Completed! 🎉",
          description: `Great job! You earned ${result.points} points.`,
        });
        
        if (result.achievements.length > 0) {
          setNewAchievements(result.achievements);
          setShowAchievementDialog(true);
        }
      } else {
        toast({
          title: "Challenge Already Completed",
          description: "You've already completed this challenge today. Try again tomorrow!",
          variant: "destructive"
        });
      }
      
      setCompletionNotes('');
      loadChallengeData();
    } catch (error) {
      console.error('Error completing challenge:', error);
      toast({
        title: "Error",
        description: "Failed to complete challenge. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSkipChallenge = (challengeId: string) => {
    try {
      ChallengeService.skipChallenge(challengeId);
      toast({
        title: "Challenge Skipped",
        description: "You can try this challenge again tomorrow!",
      });
      loadChallengeData();
    } catch (error) {
      console.error('Error skipping challenge:', error);
    }
  };

  const renderChallengeCard = (challenge: Challenge, isDaily: boolean = false) => {
    const status = getChallengeStatus(challenge.id);
    const isCompleted = status === 'completed';
    const isSkipped = status === 'skipped';

    return (
      <Card key={challenge.id} className={`relative transition-all duration-200 ${
        isCompleted ? 'bg-green-50 border-green-200' : 
        isSkipped ? 'bg-gray-50 border-gray-200' : 
        'hover:shadow-md'
      }`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{challenge.icon}</span>
              <div>
                <CardTitle className="text-base font-semibold text-gray-800">
                  {challenge.title}
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">{challenge.description}</p>
              </div>
            </div>
            {isDaily && (
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                Daily
              </Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="flex gap-2">
            {!isCompleted && !isSkipped && (
              <>
                {challenge.category === 'exercise' ? (
                  <Button 
                    onClick={() => setShowExerciseMap({
                      challengeId: challenge.id, 
                      type: challenge.title.toLowerCase().includes('walk') ? 'walking' : 
                            challenge.title.toLowerCase().includes('yoga') ? 'prenatal-yoga' : 
                            challenge.title.toLowerCase().includes('swim') ? 'swimming' : 'stretching'
                    })}
                    className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                  >
                    <Target className="w-4 h-4 mr-2" />
                    Start GPS Tracking
                  </Button>
                ) : (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        onClick={() => setSelectedChallenge(challenge)}
                        className="flex-1 bg-primary hover:bg-primary/90"
                      >
                        <Target className="w-4 h-4 mr-2" />
                        Complete
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <span className="text-xl">{challenge.icon}</span>
                          Complete: {challenge.title}
                        </DialogTitle>
                        <DialogDescription>
                          {challenge.description}
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-2 block">
                            How did it go? (Optional)
                          </label>
                          <Textarea
                            placeholder="Share your experience, thoughts, or how you feel after completing this challenge..."
                            value={completionNotes}
                            onChange={(e) => setCompletionNotes(e.target.value)}
                            rows={3}
                          />
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => handleCompleteChallenge(challenge)}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            <Trophy className="w-4 h-4 mr-2" />
                            Mark Complete (+{challenge.points} pts)
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleSkipChallenge(challenge.id)}
                  className="text-gray-600 hover:text-gray-800"
                >
                  Skip
                </Button>
              </>
            )}
            
            {isCompleted && (
              <div className="flex items-center gap-2 text-green-600 font-medium">
                <Trophy className="w-4 h-4" />
                <span>Completed! +{challenge.points} pts</span>
              </div>
            )}
            
            {isSkipped && (
              <div className="flex items-center gap-2 text-gray-500">
                <span>Skipped - Try again tomorrow!</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const todayCompletions = dailyChallenges.filter(c => getChallengeStatus(c.id) === 'completed').length;
  const dailyProgress = dailyChallenges.length > 0 ? (todayCompletions / dailyChallenges.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="px-6 py-8 max-w-4xl mx-auto h-screen overflow-y-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation('/home')}
            className="mr-4"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="flex items-center gap-3 flex-1">
            <img 
              src={nekahLogo} 
              alt="NEKAH" 
              className="w-8 h-8"
            />
            <h2 className="text-2xl font-bold text-gray-800">Wellness Challenges</h2>
          </div>
        </div>

        {/* Stats Overview */}
        {wellnessStats && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Flame className="w-5 h-5 text-orange-500" />
                  <span className="text-2xl font-bold text-gray-800">{wellnessStats.currentStreak}</span>
                </div>
                <p className="text-sm text-gray-600">Day Streak</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-yellow-100 to-yellow-50">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span className="text-2xl font-bold text-gray-800">{wellnessStats.totalPoints}</span>
                </div>
                <p className="text-sm text-gray-600">Total Points</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Daily Progress */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold">Today's Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-2">
              <span className="text-sm font-medium text-gray-700">
                {todayCompletions} of {dailyChallenges.length} daily challenges completed
              </span>
              <span className="text-sm text-primary font-medium">
                {Math.round(dailyProgress)}%
              </span>
            </div>
            <Progress value={dailyProgress} className="h-2" />
          </CardContent>
        </Card>

        {/* Challenge Tabs */}
        <div className="mb-8">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 mb-4 bg-white/95 backdrop-blur-sm">
              <TabsTrigger value="today">Today's Tracking</TabsTrigger>
              <TabsTrigger value="daily">Daily Goals</TabsTrigger>
              <TabsTrigger value="bonus">Bonus Challenges</TabsTrigger>
            </TabsList>
            
            <TabsContent value="today" className="space-y-4 mt-6 pb-32">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Live Progress Tracking
              </h3>
              <div className="space-y-4">
                {dailyChallenges.map(challenge => renderChallengeCard(challenge, true))}
              </div>
            </TabsContent>
            
            <TabsContent value="daily" className="space-y-4 mt-6 pb-32">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Daily Challenges
              </h3>
              <div className="space-y-4">
                {dailyChallenges.map(challenge => renderChallengeCard(challenge, true))}
              </div>
            </TabsContent>
            
            <TabsContent value="bonus" className="space-y-4 mt-6 pb-32">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                Bonus Challenges
              </h3>
              <div className="space-y-4">
                {optionalChallenges.map(challenge => renderChallengeCard(challenge, false))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Exercise Map Modal */}
        {showExerciseMap && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-800">Exercise Tracking</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowExerciseMap(null)}
                  >
                    ✕
                  </Button>
                </div>
                
                <ExerciseMap
                  challengeId={showExerciseMap.challengeId}
                  exerciseType={showExerciseMap.type}
                  onComplete={(session) => {
                    const challenge = [...dailyChallenges, ...optionalChallenges].find(c => c.id === showExerciseMap.challengeId);
                    if (challenge) {
                      handleCompleteChallenge(challenge);
                      toast({
                        title: "Exercise Completed! 🏃‍♀️",
                        description: `Great workout! You completed ${Math.round(session.duration/60)} minutes of ${session.type} and earned ${challenge.points} points.`,
                      });
                    }
                    setShowExerciseMap(null);
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Achievement Dialog */}
        <Dialog open={showAchievementDialog} onOpenChange={setShowAchievementDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-center">🎉 New Achievement Unlocked! 🎉</DialogTitle>
            </DialogHeader>
            
            <div className="text-center space-y-4">
              {newAchievements.map(achievement => (
                <div key={achievement.id} className="bg-gradient-to-r from-yellow-100 to-yellow-50 p-6 rounded-lg">
                  <div className="text-4xl mb-2">{achievement.badge}</div>
                  <h3 className="text-xl font-bold text-gray-800">{achievement.title}</h3>
                  <p className="text-gray-600 mb-2">{achievement.description}</p>
                  <Badge className="bg-yellow-500 text-white">+{achievement.points} bonus points!</Badge>
                </div>
              ))}
              
              <Button 
                onClick={() => setShowAchievementDialog(false)}
                className="w-full bg-primary hover:bg-primary/90"
              >
                <Award className="w-4 h-4 mr-2" />
                Awesome!
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Challenge Acceptance Modal */}
        {showAcceptanceModal && (
          <ChallengeAcceptanceModal
            isOpen={showAcceptanceModal}
            onClose={() => setShowAcceptanceModal(false)}
            onAccept={() => {
              setShowAcceptanceModal(false);
              loadChallengeData();
              toast({
                title: "Welcome to Wellness Challenges! 🌟",
                description: "Your wellness journey starts now. Complete daily challenges to earn points and unlock achievements.",
              });
            }}
          />
        )}
      </div>
    </div>
  );
}