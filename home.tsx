import { useLocation } from 'wouter';
import { Heart, Camera, Baby, Apple, Sparkles, BookOpen, Trophy, Activity, Globe, Volume2, ChevronRight, ArrowRight, Calendar, MessageCircle, Shield, Phone, User, Search, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LocalStorageService } from '@/lib/storage';
import { useEffect, useState } from 'react';
import { UserProfile } from '@/lib/types';
import { getBabyDevelopment, getTrimesterInfo, getPregnancyProgress } from '@/lib/baby-development';
import { I18nService } from '@/lib/i18n';
import { OfflineService, AccessibilityService, PerformanceService } from '@/lib/offline';
import { ScanAnalyzer } from '@/components/scan-analyzer';
import nekahLogo from '@assets/image_1754317512268.png';

export default function Home() {
  const [, setLocation] = useLocation();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showScanAnalyzer, setShowScanAnalyzer] = useState(false);

  useEffect(() => {
    // Initialize services
    OfflineService.init();
    AccessibilityService.init();
    I18nService.loadLanguage();
    PerformanceService.trackPageLoad('Home');
    
    const profile = LocalStorageService.getUserProfile();
    setUserProfile(profile);
    setCurrentLanguage(I18nService.getCurrentLanguage());
    
    // Monitor connection status
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleFeatureClick = (feature: string) => {
    PerformanceService.trackUserInteraction(`navigate_to_${feature}`);
    const routes = {
      'glow-talk': '/glow-talk',
      'bump-check': '/bump-check',
      'baby-tracker': '/baby-tracker',
      'cravings': '/cravings',
      'community': '/community',
      'challenges': '/challenges',
      'doctor-eye': '/doctor-eye',
      'emergency': '/emergency',
      'profile': '/profile'
    };
    setLocation(routes[feature as keyof typeof routes]);
  };

  const handleLanguageChange = (language: string) => {
    I18nService.setLanguage(language);
    setCurrentLanguage(language);
    AccessibilityService.announce(`Language changed to ${language}`);
  };

  // Get current pregnancy data
  const pregnancyWeek = userProfile?.pregnancyWeek || 20;
  const babyDevelopment = getBabyDevelopment(pregnancyWeek);
  const trimesterInfo = getTrimesterInfo(pregnancyWeek);
  const pregnancyProgress = getPregnancyProgress(pregnancyWeek);
  const daysLeft = Math.max(0, (40 - pregnancyWeek) * 7);

  return (
    <div 
      id="main-content" 
      className="screen-container w-full overflow-x-hidden"
      role="main"
      aria-label={I18nService.t('home.welcome')}
    >
      {/* Offline indicator */}
      {isOffline && (
        <div className="bg-orange-500 text-white text-center py-2 px-4 text-sm">
          You're offline. Some features may be limited.
        </div>
      )}

      {/* Language and accessibility controls */}
      <div className="flex justify-between items-center p-4 bg-white/50 backdrop-blur-sm">
        <Select value={currentLanguage} onValueChange={handleLanguageChange}>
          <SelectTrigger className="w-32" aria-label="Select language">
            <Globe className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {I18nService.getAvailableLanguages().map(lang => (
              <SelectItem key={lang.code} value={lang.code}>
                {lang.nativeName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const utterance = new SpeechSynthesisUtterance(
              `Welcome to NEKAH. You are ${pregnancyWeek} weeks pregnant. Your baby is the size of ${babyDevelopment?.size.description || 'a growing miracle'}.`
            );
            speechSynthesis.speak(utterance);
          }}
          aria-label="Listen to pregnancy summary"
        >
          <Volume2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Enhanced Header with Baby Development */}
      <div className="gradient-bg px-4 py-6 sm:px-6 sm:py-8 rounded-b-3xl mb-6 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-32 h-32 rounded-full bg-white/20 -translate-x-16 -translate-y-16"></div>
          <div className="absolute bottom-0 right-0 w-24 h-24 rounded-full bg-white/20 translate-x-12 translate-y-12"></div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <img 
                  src={nekahLogo} 
                  alt="NEKAH Logo" 
                  className="w-8 h-8 flex-shrink-0"
                />
                <h1 className="text-2xl font-bold text-white truncate">
                  {I18nService.t('home.welcome')}, {userProfile?.name || 'Mama'}! 👋
                </h1>
              </div>
              <p className="text-white/90 text-base flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {I18nService.t('home.pregnancyWeek')} {pregnancyWeek} {I18nService.t('common.weeks')} • {trimesterInfo.name}
              </p>
            </div>
          </div>

          {/* Baby Development Visualization */}
          {babyDevelopment && (
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <Baby className="w-5 h-5 text-primary" />
                      {I18nService.t('baby.development')}
                    </h2>
                    <p className="text-gray-600 text-sm">
                      {trimesterInfo.name} • {daysLeft} {I18nService.t('home.daysLeft')}
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl mb-1">{babyDevelopment.size.emoji}</div>
                    <p className="text-xs text-gray-500 font-medium">Week {pregnancyWeek}</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Pregnancy Progress</span>
                    <span>{pregnancyProgress}%</span>
                  </div>
                  <Progress value={pregnancyProgress} className="h-2" style={{
                    backgroundColor: '#f1f5f9'
                  }} />
                </div>

                {/* Baby size and development */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-16 h-16 rounded-2xl flex items-center justify-center relative overflow-hidden"
                        style={{ backgroundColor: babyDevelopment.illustration.color + '20' }}
                      >
                        <div 
                          className="w-full h-full flex items-center justify-center"
                          dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 100 100" className="w-12 h-12">${babyDevelopment.illustration.svg}</svg>` }}
                        />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{I18nService.t('home.babySize')}</p>
                        <p className="text-primary font-bold">{babyDevelopment.size.description}</p>
                        <p className="text-xs text-gray-500">
                          {babyDevelopment.size.length} • {babyDevelopment.size.weight}
                        </p>
                      </div>
                    </div>

                    {babyDevelopment.development.major.length > 0 && (
                      <div className="bg-gray-50 rounded-xl p-3">
                        <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-yellow-500" />
                          {I18nService.t('home.keyDevelopments')}
                        </h4>
                        <ul className="space-y-1">
                          {babyDevelopment.development.major.slice(0, 2).map((dev, index) => (
                            <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                              {dev}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    {babyDevelopment.motherChanges.physical.length > 0 && (
                      <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl p-3">
                        <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                          <Heart className="w-4 h-4 text-pink-500" />
                          {I18nService.t('home.motherTips')}
                        </h4>
                        <ul className="space-y-1">
                          {babyDevelopment.motherChanges.physical.slice(0, 2).map((change, index) => (
                            <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-pink-500 mt-2 flex-shrink-0"></div>
                              {change}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {babyDevelopment.tips.length > 0 && (
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-3">
                        <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                          <Activity className="w-4 h-4 text-green-500" />
                          Weekly Tips
                        </h4>
                        <ul className="space-y-1">
                          {babyDevelopment.tips.slice(0, 2).map((tip, index) => (
                            <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  onClick={() => handleFeatureClick('baby-tracker')}
                  className="w-full mt-4 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                  aria-label="View detailed baby development tracker"
                >
                  <Baby className="w-4 h-4 mr-2" />
                  View Full Development Timeline
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Enhanced Feature Grid */}
      <div className="px-4 sm:px-6 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            {I18nService.t('home.quickActions')}
          </h2>
          
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {/* Primary features */}
            <Card 
              className="feature-card bg-gradient-to-br from-pink-50 to-rose-50 border-pink-200 hover:shadow-lg transition-all duration-300 cursor-pointer"
              onClick={() => handleFeatureClick('glow-talk')}
              role="button"
              tabIndex={0}
              aria-label="GlowTalk - Mood tracking and postpartum support"
              onKeyDown={(e) => e.key === 'Enter' && handleFeatureClick('glow-talk')}
            >
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
                    <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
                <h3 className="font-semibold text-gray-800 text-sm sm:text-base mb-1">
                  {I18nService.t('navigation.glowTalk')}
                </h3>
                <p className="text-gray-600 text-xs sm:text-sm">
                  Mental health & community support
                </p>
              </CardContent>
            </Card>

            <Card 
              className="feature-card bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 hover:shadow-lg transition-all duration-300 cursor-pointer"
              onClick={() => handleFeatureClick('bump-check')}
              role="button"
              tabIndex={0}
              aria-label="BumpCheck - AI health analysis"
              onKeyDown={(e) => e.key === 'Enter' && handleFeatureClick('bump-check')}
            >
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                    <Camera className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
                <h3 className="font-semibold text-gray-800 text-sm sm:text-base mb-1">
                  {I18nService.t('navigation.bumpCheck')}
                </h3>
                <p className="text-gray-600 text-xs sm:text-sm">
                  AI health analysis
                </p>
              </CardContent>
            </Card>

            {/* Medical Scan Analyzer - NEW FEATURE */}
            <Card 
              className="feature-card bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-200 hover:shadow-lg transition-all duration-300 cursor-pointer"
              onClick={() => setShowScanAnalyzer(true)}
              role="button"
              tabIndex={0}
              aria-label="Medical Scan Analyzer - X-ray and ultrasound analysis"
              onKeyDown={(e) => e.key === 'Enter' && setShowScanAnalyzer(true)}
            >
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                    <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
                <h3 className="font-semibold text-gray-800 text-sm sm:text-base mb-1">
                  Scan Analyzer
                </h3>
                <p className="text-gray-600 text-xs sm:text-sm">
                  X-ray & ultrasound AI analysis
                </p>
              </CardContent>
            </Card>

            <Card 
              className="feature-card bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:shadow-lg transition-all duration-300 cursor-pointer"
              onClick={() => handleFeatureClick('cravings')}
              role="button"
              tabIndex={0}
              aria-label="Cravings - Nutritional guidance"
              onKeyDown={(e) => e.key === 'Enter' && handleFeatureClick('cravings')}
            >
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                    <Apple className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
                <h3 className="font-semibold text-gray-800 text-sm sm:text-base mb-1">
                  {I18nService.t('navigation.cravings')}
                </h3>
                <p className="text-gray-600 text-xs sm:text-sm">
                  Nutritional guidance
                </p>
              </CardContent>
            </Card>

            <Card 
              className="feature-card bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200 hover:shadow-lg transition-all duration-300 cursor-pointer"
              onClick={() => handleFeatureClick('community')}
              role="button"
              tabIndex={0}
              aria-label="Community - Connect with other mothers"
              onKeyDown={(e) => e.key === 'Enter' && handleFeatureClick('community')}
            >
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
                <h3 className="font-semibold text-gray-800 text-sm sm:text-base mb-1">
                  {I18nService.t('navigation.community')}
                </h3>
                <p className="text-gray-600 text-xs sm:text-sm">
                  Connect & share
                </p>
              </CardContent>
            </Card>

            <Card 
              className="feature-card bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200 hover:shadow-lg transition-all duration-300 cursor-pointer"
              onClick={() => handleFeatureClick('challenges')}
              role="button"
              tabIndex={0}
              aria-label="Wellness Challenges"
              onKeyDown={(e) => e.key === 'Enter' && handleFeatureClick('challenges')}
            >
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
                    <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
                <h3 className="font-semibold text-gray-800 text-sm sm:text-base mb-1">
                  {I18nService.t('navigation.challenges')}
                </h3>
                <p className="text-gray-600 text-xs sm:text-sm">
                  Wellness goals
                </p>
              </CardContent>
            </Card>

            <Card 
              className="feature-card bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-200 hover:shadow-lg transition-all duration-300 cursor-pointer"
              onClick={() => handleFeatureClick('search')}
              role="button"
              tabIndex={0}
              aria-label="Search - Find articles and videos"
              onKeyDown={(e) => e.key === 'Enter' && handleFeatureClick('search')}
            >
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center">
                    <Search className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
                <h3 className="font-semibold text-gray-800 text-sm sm:text-base mb-1">
                  Search Articles
                </h3>
                <p className="text-gray-600 text-xs sm:text-sm">
                  Find helpful content
                </p>
              </CardContent>
            </Card>

            <Card 
              className="feature-card bg-gradient-to-br from-red-50 to-pink-50 border-red-200 hover:shadow-lg transition-all duration-300 cursor-pointer"
              onClick={() => handleFeatureClick('emergency')}
              role="button"
              tabIndex={0}
              aria-label="Emergency - Get immediate help"
              onKeyDown={(e) => e.key === 'Enter' && handleFeatureClick('emergency')}
            >
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center">
                    <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
                <h3 className="font-semibold text-gray-800 text-sm sm:text-base mb-1">
                  {I18nService.t('navigation.emergency')}
                </h3>
                <p className="text-gray-600 text-xs sm:text-sm">
                  Immediate help
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick stats or upcoming appointments */}
        {babyDevelopment?.appointments && babyDevelopment.appointments.length > 0 && (
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                {I18nService.t('home.upcomingAppointments')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {babyDevelopment.appointments.slice(0, 2).map((appointment, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 bg-white/50 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="text-sm text-gray-700">{appointment}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Bottom padding for navigation */}
      <div className="h-24"></div>

      {/* Medical Scan Analyzer Modal */}
      <ScanAnalyzer
        isOpen={showScanAnalyzer}
        onClose={() => setShowScanAnalyzer(false)}
        onAnalysisComplete={(analysis) => {
          console.log('Scan analysis completed:', analysis);
          // Store analysis in local storage
          const existingAnalyses = JSON.parse(localStorage.getItem('medicalScanAnalyses') || '[]');
          existingAnalyses.push(analysis);
          localStorage.setItem('medicalScanAnalyses', JSON.stringify(existingAnalyses));
          setShowScanAnalyzer(false);
        }}
      />
    </div>
  );
}