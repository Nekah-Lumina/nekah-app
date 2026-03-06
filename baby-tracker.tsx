import { useLocation } from 'wouter';
import { ArrowLeft, Baby, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { pregnancyDataByWeek, LocalStorageService } from '@/lib/storage';

export default function BabyTracker() {
  const [, setLocation] = useLocation();
  const userProfile = LocalStorageService.getUserProfile();
  const currentWeek = userProfile?.pregnancyWeek || 32;
  const pregnancyData = pregnancyDataByWeek[currentWeek] || pregnancyDataByWeek[32] || {
    week: currentWeek,
    babySize: "papaya",
    emoji: "🥭",
    developments: [
      "Baby's bones are hardening",
      "Fingernails are developing",
      "Baby can hear sounds from outside"
    ],
    tips: [
      "Stay hydrated and eat nutritious meals",
      "Get plenty of rest and gentle exercise",
      "Attend all prenatal appointments",
      "Practice relaxation techniques for labor"
    ],
    progress: Math.min((currentWeek / 40) * 100, 100)
  };

  return (
    <div className="screen-container">
      <div className="px-6 py-8">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation('/home')}
            className="mr-4"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h2 className="text-2xl font-bold text-gray-800">Baby Tracker</h2>
        </div>

        {/* Current Week Info */}
        <div className="bg-gradient-to-r from-green-100 to-green-200 rounded-2xl p-6 text-green-800 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">Week {pregnancyData?.week || currentWeek}</h3>
              <p className="text-green-700">
                Your baby is the size of a {pregnancyData?.babySize || "papaya"}!
              </p>
            </div>
            <div className="text-4xl">{pregnancyData?.emoji || "🥭"}</div>
          </div>
        </div>

        {/* Development Milestones */}
        <Card className="card-shadow mb-6">
          <CardContent className="p-6">
            <h4 className="font-semibold text-gray-800 mb-4">This Week's Developments</h4>
            <div className="space-y-3">
              {(pregnancyData?.developments || []).map((development: string, index: number) => (
                <div key={index} className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <p className="text-gray-700">{development}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Progress Visualization */}
        <Card className="card-shadow mb-6">
          <CardContent className="p-6">
            <h4 className="font-semibold text-gray-800 mb-4">Pregnancy Progress</h4>
            <div className="space-y-4">
              <Progress value={pregnancyData?.progress || 0} className="h-3" />
              <div className="flex justify-between text-sm text-gray-600">
                <span>{pregnancyData?.week || currentWeek} weeks</span>
                <span>40 weeks</span>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  {Math.round(pregnancyData?.progress || 0)}% complete
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Button 
            className="h-16 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg"
            onClick={() => setLocation('/growth-scan')}
          >
            <div className="text-center">
              <div className="text-2xl mb-1">📊</div>
              <div>Growth Scan</div>
            </div>
          </Button>
          <Button 
            className="h-16 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg"
            onClick={() => setLocation('/birth-plan')}
          >
            <div className="text-center">
              <div className="text-2xl mb-1">📋</div>
              <div>Birth Plan</div>
            </div>
          </Button>
        </div>

        {/* Weekly Tips */}
        <Card className="card-shadow">
          <CardContent className="p-6">
            <h4 className="font-semibold text-gray-800 mb-4">Tips for This Week</h4>
            <div className="space-y-3">
              {(pregnancyData?.tips || []).map((tip: string, index: number) => (
                <div key={index} className="flex items-start space-x-3">
                  <Baby className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <p className="text-gray-700">{tip}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
