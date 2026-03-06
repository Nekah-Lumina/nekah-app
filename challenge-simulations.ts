import { LocalStorageService } from './storage';

export interface ChallengeProgress {
  challengeId: string;
  date: string;
  currentProgress: number;
  targetProgress: number;
  progressEntries: ProgressEntry[];
  isCompleted: boolean;
  lastReminderSent?: Date;
  nextReminderDue?: Date;
}

export interface ProgressEntry {
  id: string;
  timestamp: Date;
  type: 'increment' | 'note' | 'reminder_response';
  value: number;
  note?: string;
}

export interface ReminderConfig {
  challengeId: string;
  frequency: 'hourly' | 'every-2-hours' | 'every-3-hours' | 'twice-daily' | 'once-daily';
  message: string;
  motivationalQuotes: string[];
  customTimes?: string[]; // For specific times like "09:00", "15:00"
}

export class ChallengeSimulationService {
  private static readonly STORAGE_KEY = 'challenge_progress_tracking';
  private static readonly REMINDERS_KEY = 'challenge_reminders';

  // Predefined reminder configurations for different challenges
  private static readonly REMINDER_CONFIGS: Record<string, ReminderConfig> = {
    'nutrition-water-intake': {
      challengeId: 'nutrition-water-intake',
      frequency: 'every-2-hours',
      message: 'Time for another glass of water! Stay hydrated for you and baby 💧',
      motivationalQuotes: [
        'Every sip nourishes both you and your little one!',
        'Hydration helps with energy and reduces pregnancy fatigue.',
        'You\'re doing amazing! Keep up the healthy habits.',
        'Your baby loves when you stay well-hydrated!'
      ],
      customTimes: ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00']
    },
    'nutrition-prenatal-vitamins': {
      challengeId: 'nutrition-prenatal-vitamins',
      frequency: 'once-daily',
      message: 'Don\'t forget your prenatal vitamins! Best taken with breakfast 💊',
      motivationalQuotes: [
        'Your daily vitamins support healthy baby development!',
        'Consistency with vitamins shows love for your growing baby.',
        'Every vitamin counts toward a healthy pregnancy journey.',
        'You\'re giving your baby the best nutritional start!'
      ],
      customTimes: ['08:30'] // After breakfast
    },
    'mental-baby-bonding': {
      challengeId: 'mental-baby-bonding',
      frequency: 'twice-daily',
      message: 'Take a moment to connect with your baby. They love hearing your voice! 👶',
      motivationalQuotes: [
        'Your voice is the most beautiful sound to your baby.',
        'These bonding moments create lifelong connections.',
        'Talking to baby helps with their brain development.',
        'Your love reaches your baby before they\'re even born!'
      ],
      customTimes: ['10:00', '19:00'] // Morning and evening
    },
    'exercise-prenatal-walk': {
      challengeId: 'exercise-prenatal-walk',
      frequency: 'once-daily',
      message: 'Perfect time for your daily walk! Fresh air awaits 🚶‍♀️',
      motivationalQuotes: [
        'Every step strengthens you for labor and delivery.',
        'Walking boosts mood and reduces pregnancy discomfort.',
        'Your baby enjoys the gentle movement too!',
        'You\'re building stamina for motherhood!'
      ],
      customTimes: ['16:00'] // Afternoon walk
    },
    'exercise-pelvic-floor': {
      challengeId: 'exercise-pelvic-floor',
      frequency: 'twice-daily',
      message: 'Time for your pelvic floor exercises! Strengthen for delivery 💪',
      motivationalQuotes: [
        'Strong pelvic muscles help with delivery and recovery.',
        'These exercises prevent future complications.',
        'You\'re preparing your body for an easier birth.',
        'Consistency now means comfort later!'
      ],
      customTimes: ['09:00', '21:00'] // Morning and evening
    }
  };

  // Get today's progress for a specific challenge
  static getTodayProgress(challengeId: string): ChallengeProgress | null {
    const today = new Date().toDateString();
    const allProgress = this.getAllProgress();
    return allProgress.find(p => p.challengeId === challengeId && p.date === today) || null;
  }

  // Initialize progress tracking for a challenge
  static initializeProgress(challengeId: string, targetProgress: number): ChallengeProgress {
    const today = new Date().toDateString();
    const existingProgress = this.getTodayProgress(challengeId);
    
    if (existingProgress) {
      return existingProgress;
    }

    const newProgress: ChallengeProgress = {
      challengeId,
      date: today,
      currentProgress: 0,
      targetProgress,
      progressEntries: [],
      isCompleted: false
    };

    this.saveProgress(newProgress);
    return newProgress;
  }

  // Record progress increment (e.g., drink water, take vitamin)
  static recordProgress(challengeId: string, increment: number = 1, note?: string): ChallengeProgress {
    let progress = this.getTodayProgress(challengeId);
    
    if (!progress) {
      // Auto-initialize with common target values
      const targets: Record<string, number> = {
        'nutrition-water-intake': 8, // 8 glasses
        'nutrition-prenatal-vitamins': 1, // 1 vitamin
        'mental-baby-bonding': 1, // Once daily
        'exercise-prenatal-walk': 1, // One walk
        'exercise-pelvic-floor': 3, // 3 sets
        'nutrition-calcium-rich': 3, // 3 servings
        'mental-gratitude-journal': 3, // 3 gratitudes
      };
      progress = this.initializeProgress(challengeId, targets[challengeId] || 1);
    }

    const entry: ProgressEntry = {
      id: `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      type: increment > 0 ? 'increment' : 'note',
      value: increment,
      note
    };

    progress.progressEntries.push(entry);
    progress.currentProgress = Math.min(progress.currentProgress + increment, progress.targetProgress);
    progress.isCompleted = progress.currentProgress >= progress.targetProgress;

    this.saveProgress(progress);
    return progress;
  }

  // Get visual progress representation
  static getProgressVisualization(challengeId: string): {
    percentage: number;
    completed: number;
    target: number;
    visualization: string;
    motivationalMessage: string;
  } {
    const progress = this.getTodayProgress(challengeId);
    
    if (!progress) {
      return {
        percentage: 0,
        completed: 0,
        target: 1,
        visualization: '○○○○○○○○',
        motivationalMessage: 'Ready to start your wellness journey today!'
      };
    }

    const percentage = Math.round((progress.currentProgress / progress.targetProgress) * 100);
    const filledCircles = Math.floor((progress.currentProgress / progress.targetProgress) * 8);
    const emptyCircles = 8 - filledCircles;
    
    const visualization = '●'.repeat(filledCircles) + '○'.repeat(emptyCircles);
    
    let motivationalMessage = '';
    if (percentage === 0) {
      motivationalMessage = 'You\'ve got this! Take the first step today.';
    } else if (percentage < 50) {
      motivationalMessage = 'Great start! Keep the momentum going.';
    } else if (percentage < 100) {
      motivationalMessage = 'You\'re doing amazing! Almost there!';
    } else {
      motivationalMessage = 'Fantastic! Goal achieved for today! 🎉';
    }

    return {
      percentage,
      completed: progress.currentProgress,
      target: progress.targetProgress,
      visualization,
      motivationalMessage
    };
  }

  // Get reminder schedule for a challenge
  static getNextReminder(challengeId: string): Date | null {
    const config = this.REMINDER_CONFIGS[challengeId];
    if (!config) return null;

    const now = new Date();
    const today = new Date().toDateString();
    
    if (config.customTimes) {
      for (const timeStr of config.customTimes) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        const reminderTime = new Date();
        reminderTime.setHours(hours, minutes, 0, 0);
        
        if (reminderTime > now) {
          return reminderTime;
        }
      }
      
      // If all times for today have passed, return first time tomorrow
      const tomorrowFirstTime = new Date();
      const [hours, minutes] = config.customTimes[0].split(':').map(Number);
      tomorrowFirstTime.setDate(tomorrowFirstTime.getDate() + 1);
      tomorrowFirstTime.setHours(hours, minutes, 0, 0);
      return tomorrowFirstTime;
    }

    // Fallback to frequency-based reminders
    const intervalMs = {
      'hourly': 60 * 60 * 1000,
      'every-2-hours': 2 * 60 * 60 * 1000,
      'every-3-hours': 3 * 60 * 60 * 1000,
      'twice-daily': 12 * 60 * 60 * 1000,
      'once-daily': 24 * 60 * 60 * 1000
    }[config.frequency];

    return new Date(now.getTime() + intervalMs);
  }

  // Get personalized reminder message
  static getReminderMessage(challengeId: string): string {
    const config = this.REMINDER_CONFIGS[challengeId];
    if (!config) return 'Time for your wellness challenge!';

    const progress = this.getTodayProgress(challengeId);
    const randomQuote = config.motivationalQuotes[
      Math.floor(Math.random() * config.motivationalQuotes.length)
    ];

    if (progress && progress.currentProgress > 0) {
      return `${config.message}\n\n${randomQuote}\n\nProgress today: ${progress.currentProgress}/${progress.targetProgress}`;
    }

    return `${config.message}\n\n${randomQuote}`;
  }

  // Check if reminder is due
  static isReminderDue(challengeId: string): boolean {
    const progress = this.getTodayProgress(challengeId);
    const config = this.REMINDER_CONFIGS[challengeId];
    
    if (!config || (progress && progress.isCompleted)) {
      return false; // Don't remind if completed
    }

    const now = new Date();
    const lastReminder = progress?.lastReminderSent ? new Date(progress.lastReminderSent) : null;
    
    if (!lastReminder) {
      return true; // First reminder of the day
    }

    const nextReminder = this.getNextReminder(challengeId);
    return nextReminder ? now >= nextReminder : false;
  }

  // Mark reminder as sent
  static markReminderSent(challengeId: string): void {
    let progress = this.getTodayProgress(challengeId);
    if (!progress) {
      progress = this.initializeProgress(challengeId, 1);
    }

    progress.lastReminderSent = new Date();
    progress.nextReminderDue = this.getNextReminder(challengeId) || undefined;
    this.saveProgress(progress);
  }

  // Get weekly summary
  static getWeeklySummary(challengeId: string): {
    daysCompleted: number;
    totalDays: number;
    averageCompletion: number;
    streak: number;
  } {
    const allProgress = this.getAllProgress();
    const challengeProgress = allProgress.filter(p => p.challengeId === challengeId);
    
    // Get last 7 days
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      last7Days.push(date.toDateString());
    }

    const weekProgress = last7Days.map(date => 
      challengeProgress.find(p => p.date === date)
    );

    const daysCompleted = weekProgress.filter(p => p && p.isCompleted).length;
    const totalDays = 7;
    const averageCompletion = weekProgress.reduce((sum, p) => {
      if (!p) return sum;
      return sum + (p.currentProgress / p.targetProgress);
    }, 0) / totalDays * 100;

    // Calculate current streak
    let streak = 0;
    for (let i = weekProgress.length - 1; i >= 0; i--) {
      if (weekProgress[i] && weekProgress[i]!.isCompleted) {
        streak++;
      } else {
        break;
      }
    }

    return {
      daysCompleted,
      totalDays,
      averageCompletion: Math.round(averageCompletion),
      streak
    };
  }

  // Private helper methods
  private static getAllProgress(): ChallengeProgress[] {
    return LocalStorageService.getItem<ChallengeProgress[]>(this.STORAGE_KEY) || [];
  }

  private static saveProgress(progress: ChallengeProgress): void {
    const allProgress = this.getAllProgress();
    const existingIndex = allProgress.findIndex(
      p => p.challengeId === progress.challengeId && p.date === progress.date
    );

    if (existingIndex >= 0) {
      allProgress[existingIndex] = progress;
    } else {
      allProgress.push(progress);
    }

    LocalStorageService.setItem(this.STORAGE_KEY, allProgress);
  }

  // Get all active reminders for today
  static getDueReminders(): Array<{challengeId: string; message: string; config: ReminderConfig}> {
    return Object.keys(this.REMINDER_CONFIGS)
      .filter(challengeId => this.isReminderDue(challengeId))
      .map(challengeId => ({
        challengeId,
        message: this.getReminderMessage(challengeId),
        config: this.REMINDER_CONFIGS[challengeId]
      }));
  }

  // Reset daily progress (for testing)
  static resetTodayProgress(): void {
    const today = new Date().toDateString();
    const allProgress = this.getAllProgress();
    const filteredProgress = allProgress.filter(p => p.date !== today);
    LocalStorageService.setItem(this.STORAGE_KEY, filteredProgress);
  }
}