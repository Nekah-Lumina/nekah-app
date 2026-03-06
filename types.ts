export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  contact: string;
  dateOfBirth?: string;
  maritalStatus: 'single' | 'married' | 'relationship';
  isPregnant: boolean;
  pregnancyWeek?: number;
  dueDate?: string;
  numberOfChildren: number;
  hospitalInfo: string;
  emergencyContact: string;
  profilePhotoUrl?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface NotificationSettings {
  pushNotifications: boolean;
  emailNotifications: boolean;
  reminderFrequency: 'daily' | 'weekly' | 'never';
  appointmentReminders: boolean;
  healthTips: boolean;
  communityUpdates: boolean;
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'friends-only';
  shareHealthData: boolean;
  sharePregnancyJourney: boolean;
  allowDoctorAccess: boolean;
  dataAnalytics: boolean;
}

export interface PregnancyData {
  week: number;
  trimester: 'first' | 'second' | 'third';
  babySize: string;
  developments: string[];
  tips: string[];
  progress: number;
}

export interface MoodEntry {
  id: string;
  mood: 'happy' | 'tired' | 'worried' | 'excited' | 'insecure' | 'overwhelmed' | 'confident' | 'anxious' | 'hopeless' | 'isolated' | 'guilty' | 'numb';
  timestamp: Date;
  affirmation?: string;
  emotionalLevel?: number; // 1-10 scale
  selfieUrl?: string;
  insecurities?: string[];
  beautyAffirmations?: string[];
  sharedToCommunity?: boolean;
  postpartumIndicators?: {
    sleepQuality: 'poor' | 'fair' | 'good';
    appetiteChanges: boolean;
    bondingConcerns: boolean;
    overwhelmingGuilt: boolean;
    socialWithdrawal: boolean;
    panicAttacks: boolean;
    thoughtsOfHarm: boolean;
  };
  deeperEmotions?: {
    primaryEmotion: string;
    triggers?: string[];
    copingStrategies?: string[];
    supportLevel: 'low' | 'medium' | 'high' | 'crisis';
    professionalHelpNeeded?: boolean;
  };
  riskAssessment?: {
    level: 'low' | 'moderate' | 'high' | 'crisis';
    immediateAction?: string;
    resourcesProvided?: string[];
  };
}

export interface CommunityPost {
  id: string;
  author: {
    id: string;
    name: string;
    profileImageUrl?: string;
    pregnancyWeek?: number;
    isPostpartum?: boolean;
  };
  content: string;
  mediaUrls?: string[]; // Support multiple images/videos
  mediaType?: 'photo' | 'video' | 'text';
  videoUrl?: string;
  videoDuration?: number;
  timestamp: Date;
  likes: PostLike[];
  comments: PostComment[];
  isSupport?: boolean; // Mark posts that need extra support
  tags?: string[]; // hashtags like #postpartum #newmom #support
  privacy: 'public' | 'community' | 'support-group';
  reactions?: { [key: string]: number };
  userReaction?: string;
}

export interface PostLike {
  id: string;
  userId: string;
  username: string;
  timestamp: Date;
}

export interface PostComment {
  id: string;
  postId: string;
  author: {
    id: string;
    name: string;
    profileImageUrl?: string;
  };
  content: string;
  timestamp: Date;
  likes: number;
  replies?: PostReply[];
}

export interface PostReply {
  id: string;
  commentId: string;
  author: {
    id: string;
    name: string;
    profileImageUrl?: string;
  };
  content: string;
  timestamp: Date;
  likes: number;
}

export interface HealthAnalysis {
  id: string;
  imageUrl?: string;
  symptoms: string[];
  analysis: string;
  recommendations: string[];
  severity: 'low' | 'medium' | 'high';
  timestamp: Date;
}

export interface CravingAnalysis {
  id: string;
  craving: string;
  safety: 'safe' | 'moderate' | 'avoid';
  meaning?: string;
  alternatives: string[];
  timestamp: Date;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  type: 'doctor' | 'hospital' | 'family' | 'other';
}

export interface NearbyClinic {
  id: string;
  name: string;
  address: string;
  phone: string;
  distance: number;
  type: 'hospital' | 'clinic' | 'maternity';
}

// Wellness Challenge System Types
export interface Challenge {
  id: string;
  title: string;
  description: string;
  category: 'nutrition' | 'exercise' | 'mental-health' | 'medical' | 'self-care';
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  icon: string;
  requirements: string[];
  isDaily: boolean;
  pregnancyWeeks: number[]; // Which weeks this challenge is suitable for
  estimatedTime: string; // e.g., "5 minutes", "15 minutes"
}

export interface UserChallenge {
  id: string;
  challengeId: string;
  userId: string;
  status: 'not-started' | 'in-progress' | 'completed' | 'skipped';
  completedAt?: Date;
  streak: number;
  lastCompletedDate?: Date;
  progress: number; // 0-100
  notes?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'streak' | 'milestone' | 'category' | 'special';
  requirements: {
    type: 'complete_challenges' | 'maintain_streak' | 'points_earned' | 'category_mastery';
    target: number;
    category?: string;
  };
  points: number;
  badge: string;
}

export interface UserAchievement {
  id: string;
  achievementId: string;
  userId: string;
  unlockedAt: Date;
  progress: number; // 0-100
}

export interface WellnessStats {
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  challengesCompleted: number;
  achievementsUnlocked: number;
  weeklyProgress: {
    week: string;
    completed: number;
    total: number;
  }[];
  categoryStats: {
    category: string;
    completed: number;
    total: number;
  }[];
}
