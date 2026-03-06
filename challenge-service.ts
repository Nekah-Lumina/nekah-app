import { Challenge, UserChallenge, Achievement, UserAchievement, WellnessStats } from '@/lib/types';
import { pregnancyChallenges, achievements } from '@/lib/challenge-data';
import { LocalStorageService } from '@/lib/storage';

export class ChallengeService {
  private static readonly STORAGE_KEYS = {
    USER_CHALLENGES: 'user_challenges',
    USER_ACHIEVEMENTS: 'user_achievements',
    WELLNESS_STATS: 'wellness_stats'
  };

  // Get challenges suitable for current pregnancy week
  static getChallengesForWeek(pregnancyWeek: number): Challenge[] {
    return pregnancyChallenges.filter(challenge => 
      challenge.pregnancyWeeks.includes(pregnancyWeek)
    );
  }

  // Get daily challenges for today
  static getDailyChallenges(pregnancyWeek: number): Challenge[] {
    return this.getChallengesForWeek(pregnancyWeek)
      .filter(challenge => challenge.isDaily)
      .slice(0, 4); // Limit to 4 daily challenges
  }

  // Get optional challenges (non-daily)
  static getOptionalChallenges(pregnancyWeek: number): Challenge[] {
    return this.getChallengesForWeek(pregnancyWeek)
      .filter(challenge => !challenge.isDaily)
      .slice(0, 6); // Limit to 6 optional challenges
  }

  // Get user's challenge progress
  static getUserChallenges(): UserChallenge[] {
    return LocalStorageService.getItem(this.STORAGE_KEYS.USER_CHALLENGES) || [];
  }

  // Get user challenge for specific challenge ID
  static getUserChallenge(challengeId: string): UserChallenge | null {
    const userChallenges = this.getUserChallenges();
    return userChallenges.find(uc => uc.challengeId === challengeId) || null;
  }

  // Complete a challenge
  static completeChallenge(challengeId: string, notes?: string): { points: number; achievements: Achievement[] } {
    const challenge = pregnancyChallenges.find(c => c.id === challengeId);
    if (!challenge) throw new Error('Challenge not found');

    const userChallenges = this.getUserChallenges();
    const existingIndex = userChallenges.findIndex(uc => uc.challengeId === challengeId);
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    let userChallenge: UserChallenge;
    
    if (existingIndex >= 0) {
      userChallenge = userChallenges[existingIndex];
      
      // Check if already completed today
      if (userChallenge.completedAt && 
          new Date(userChallenge.completedAt).toDateString() === today.toDateString()) {
        return { points: 0, achievements: [] }; // Already completed today
      }
      
      // Update streak
      const lastCompleted = userChallenge.lastCompletedDate ? new Date(userChallenge.lastCompletedDate) : null;
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (lastCompleted && lastCompleted.toDateString() === yesterday.toDateString()) {
        userChallenge.streak += 1;
      } else if (lastCompleted && lastCompleted.toDateString() !== today.toDateString()) {
        userChallenge.streak = 1; // Reset streak if not consecutive
      } else {
        userChallenge.streak = 1;
      }
      
      userChallenge.status = 'completed';
      userChallenge.completedAt = now;
      userChallenge.lastCompletedDate = now;
      userChallenge.progress = 100;
      userChallenge.notes = notes;
      
      userChallenges[existingIndex] = userChallenge;
    } else {
      userChallenge = {
        id: `uc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        challengeId,
        userId: 'current_user', // In a real app, this would be the actual user ID
        status: 'completed',
        completedAt: now,
        streak: 1,
        lastCompletedDate: now,
        progress: 100,
        notes
      };
      
      userChallenges.push(userChallenge);
    }
    
    LocalStorageService.setItem(this.STORAGE_KEYS.USER_CHALLENGES, userChallenges);
    
    // Update wellness stats
    this.updateWellnessStats(challenge.points, challenge.category);
    
    // Check for new achievements
    const newAchievements = this.checkForNewAchievements();
    
    return { points: challenge.points, achievements: newAchievements };
  }

  // Skip a challenge
  static skipChallenge(challengeId: string): void {
    const userChallenges = this.getUserChallenges();
    const existingIndex = userChallenges.findIndex(uc => uc.challengeId === challengeId);
    
    if (existingIndex >= 0) {
      userChallenges[existingIndex].status = 'skipped';
      userChallenges[existingIndex].progress = 0;
    } else {
      const userChallenge: UserChallenge = {
        id: `uc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        challengeId,
        userId: 'current_user',
        status: 'skipped',
        streak: 0,
        progress: 0
      };
      userChallenges.push(userChallenge);
    }
    
    LocalStorageService.setItem(this.STORAGE_KEYS.USER_CHALLENGES, userChallenges);
  }

  // Get wellness stats
  static getWellnessStats(): WellnessStats {
    const stats = LocalStorageService.getItem(this.STORAGE_KEYS.WELLNESS_STATS) as WellnessStats | null;
    if (stats && stats.totalPoints !== undefined) return stats;
    
    // Initialize default stats
    const defaultStats: WellnessStats = {
      totalPoints: 0,
      currentStreak: 0,
      longestStreak: 0,
      challengesCompleted: 0,
      achievementsUnlocked: 0,
      weeklyProgress: [],
      categoryStats: [
        { category: 'nutrition', completed: 0, total: 0 },
        { category: 'exercise', completed: 0, total: 0 },
        { category: 'mental-health', completed: 0, total: 0 },
        { category: 'medical', completed: 0, total: 0 },
        { category: 'self-care', completed: 0, total: 0 }
      ]
    };
    
    LocalStorageService.setItem(this.STORAGE_KEYS.WELLNESS_STATS, defaultStats);
    return defaultStats;
  }

  // Update wellness stats
  private static updateWellnessStats(points: number, category: string): void {
    const stats = this.getWellnessStats();
    
    stats.totalPoints += points;
    stats.challengesCompleted += 1;
    
    // Update category stats
    const categoryIndex = stats.categoryStats.findIndex(cs => cs.category === category);
    if (categoryIndex >= 0) {
      stats.categoryStats[categoryIndex].completed += 1;
      stats.categoryStats[categoryIndex].total += 1;
    }
    
    // Update current streak
    const today = new Date().toDateString();
    const userChallenges = this.getUserChallenges();
    const todayCompletions = userChallenges.filter(uc => 
      uc.completedAt && new Date(uc.completedAt).toDateString() === today && uc.status === 'completed'
    );
    
    if (todayCompletions.length > 0) {
      // Calculate current streak
      let currentStreak = 0;
      let checkDate = new Date();
      
      while (true) {
        const dateStr = checkDate.toDateString();
        const dayCompletions = userChallenges.filter(uc => 
          uc.completedAt && new Date(uc.completedAt).toDateString() === dateStr && uc.status === 'completed'
        );
        
        if (dayCompletions.length > 0) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
      
      stats.currentStreak = currentStreak;
      if (currentStreak > stats.longestStreak) {
        stats.longestStreak = currentStreak;
      }
    }
    
    LocalStorageService.setItem(this.STORAGE_KEYS.WELLNESS_STATS, stats);
  }

  // Get user achievements
  static getUserAchievements(): UserAchievement[] {
    return LocalStorageService.getItem(this.STORAGE_KEYS.USER_ACHIEVEMENTS) || [];
  }

  // Check for new achievements
  static checkForNewAchievements(): Achievement[] {
    const stats = this.getWellnessStats();
    const userAchievements = this.getUserAchievements();
    const unlockedAchievementIds = userAchievements.map(ua => ua.achievementId);
    const newAchievements: Achievement[] = [];
    
    for (const achievement of achievements) {
      if (unlockedAchievementIds.includes(achievement.id)) continue;
      
      let isUnlocked = false;
      
      switch (achievement.requirements.type) {
        case 'complete_challenges':
          isUnlocked = stats.challengesCompleted >= achievement.requirements.target;
          break;
        case 'maintain_streak':
          isUnlocked = stats.currentStreak >= achievement.requirements.target;
          break;
        case 'points_earned':
          isUnlocked = stats.totalPoints >= achievement.requirements.target;
          break;
        case 'category_mastery':
          const categoryStats = stats.categoryStats.find(cs => cs.category === achievement.requirements.category);
          isUnlocked = categoryStats ? categoryStats.completed >= achievement.requirements.target : false;
          break;
      }
      
      if (isUnlocked) {
        const userAchievement: UserAchievement = {
          id: `ua_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          achievementId: achievement.id,
          userId: 'current_user',
          unlockedAt: new Date(),
          progress: 100
        };
        
        userAchievements.push(userAchievement);
        newAchievements.push(achievement);
        
        // Add achievement points to stats
        stats.totalPoints += achievement.points;
        stats.achievementsUnlocked += 1;
      }
    }
    
    if (newAchievements.length > 0) {
      LocalStorageService.setItem(this.STORAGE_KEYS.USER_ACHIEVEMENTS, userAchievements);
      LocalStorageService.setItem(this.STORAGE_KEYS.WELLNESS_STATS, stats);
    }
    
    return newAchievements;
  }

  // Get challenges by category
  static getChallengesByCategory(category: string, pregnancyWeek: number): Challenge[] {
    return this.getChallengesForWeek(pregnancyWeek)
      .filter(challenge => challenge.category === category);
  }

  // Get completion rate for a date range
  static getCompletionRate(startDate: Date, endDate: Date): number {
    const userChallenges = this.getUserChallenges();
    const completedInRange = userChallenges.filter(uc => {
      if (!uc.completedAt || uc.status !== 'completed') return false;
      const completedDate = new Date(uc.completedAt);
      return completedDate >= startDate && completedDate <= endDate;
    });
    
    const totalPossible = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) * 4; // 4 daily challenges per day
    return totalPossible > 0 ? (completedInRange.length / totalPossible) * 100 : 0;
  }

  // Reset user data (for testing or new users)
  static resetUserData(): void {
    LocalStorageService.removeItem(this.STORAGE_KEYS.USER_CHALLENGES);
    LocalStorageService.removeItem(this.STORAGE_KEYS.USER_ACHIEVEMENTS);
    LocalStorageService.removeItem(this.STORAGE_KEYS.WELLNESS_STATS);
  }
}