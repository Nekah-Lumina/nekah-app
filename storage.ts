import { UserProfile, MoodEntry, CommunityPost, HealthAnalysis, CravingAnalysis, EmergencyContact, NotificationSettings, PrivacySettings } from './types';

const STORAGE_KEYS = {
  USER_PROFILE: 'nekah_user_profile',
  ONBOARDING_COMPLETED: 'nekah_onboarding_completed',
  MOOD_ENTRIES: 'nekah_mood_entries',
  HEALTH_ANALYSES: 'nekah_health_analyses',
  CRAVING_ANALYSES: 'nekah_craving_analyses',
  EMERGENCY_CONTACTS: 'nekah_emergency_contacts',
  NOTIFICATION_SETTINGS: 'nekah_notification_settings',
  PRIVACY_SETTINGS: 'nekah_privacy_settings',
  CHALLENGE_ACCEPTANCE: 'nekah_challenge_acceptance',
} as const;

export class LocalStorageService {
  static setUserProfile(profile: UserProfile): void {
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
  }

  static getUserProfile(): UserProfile | null {
    const data = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    return data ? JSON.parse(data) : null;
  }

  static setOnboardingCompleted(completed: boolean): void {
    localStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, completed.toString());
  }

  static isOnboardingCompleted(): boolean {
    return localStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED) === 'true';
  }

  static addMoodEntry(entry: MoodEntry): void {
    const entries = this.getMoodEntries();
    entries.push(entry);
    localStorage.setItem(STORAGE_KEYS.MOOD_ENTRIES, JSON.stringify(entries));
  }

  static getMoodEntries(): MoodEntry[] {
    const data = localStorage.getItem(STORAGE_KEYS.MOOD_ENTRIES);
    return data ? JSON.parse(data) : [];
  }

  static addHealthAnalysis(analysis: HealthAnalysis): void {
    const analyses = this.getHealthAnalyses();
    analyses.push(analysis);
    localStorage.setItem(STORAGE_KEYS.HEALTH_ANALYSES, JSON.stringify(analyses));
  }

  static getHealthAnalyses(): HealthAnalysis[] {
    const data = localStorage.getItem(STORAGE_KEYS.HEALTH_ANALYSES);
    return data ? JSON.parse(data) : [];
  }

  static addCravingAnalysis(analysis: CravingAnalysis): void {
    const analyses = this.getCravingAnalyses();
    analyses.push(analysis);
    localStorage.setItem(STORAGE_KEYS.CRAVING_ANALYSES, JSON.stringify(analyses));
  }

  static getCravingAnalyses(): CravingAnalysis[] {
    const data = localStorage.getItem(STORAGE_KEYS.CRAVING_ANALYSES);
    return data ? JSON.parse(data) : [];
  }

  static setEmergencyContacts(contacts: EmergencyContact[]): void {
    localStorage.setItem(STORAGE_KEYS.EMERGENCY_CONTACTS, JSON.stringify(contacts));
  }

  static getEmergencyContacts(): EmergencyContact[] {
    const data = localStorage.getItem(STORAGE_KEYS.EMERGENCY_CONTACTS);
    return data ? JSON.parse(data) : [
      {
        id: '1',
        name: 'Dr. Adebayo (OB/GYN)',
        phone: '+234 801 234 5678',
        type: 'doctor'
      },
      {
        id: '2',
        name: 'Lagos University Hospital',
        phone: '+234 901 876 5432',
        type: 'hospital'
      }
    ];
  }

  // Notification Settings
  static setNotificationSettings(settings: NotificationSettings): void {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATION_SETTINGS, JSON.stringify(settings));
  }

  static getNotificationSettings(): NotificationSettings {
    const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATION_SETTINGS);
    return data ? JSON.parse(data) : {
      pushNotifications: true,
      emailNotifications: false,
      reminderFrequency: 'daily',
      appointmentReminders: true,
      healthTips: true,
      communityUpdates: false
    };
  }

  // Privacy Settings
  static setPrivacySettings(settings: PrivacySettings): void {
    localStorage.setItem(STORAGE_KEYS.PRIVACY_SETTINGS, JSON.stringify(settings));
  }

  static getPrivacySettings(): PrivacySettings {
    const data = localStorage.getItem(STORAGE_KEYS.PRIVACY_SETTINGS);
    return data ? JSON.parse(data) : {
      profileVisibility: 'private',
      shareHealthData: false,
      sharePregnancyJourney: true,
      allowDoctorAccess: true,
      dataAnalytics: false
    };
  }

  static clear(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }

  // Generic methods for challenge system
  static getItem<T>(key: string): T | null {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }

  static setItem<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  static removeItem(key: string): void {
    localStorage.removeItem(key);
  }

  static setChallengeAcceptance(accepted: boolean): void {
    localStorage.setItem(STORAGE_KEYS.CHALLENGE_ACCEPTANCE, JSON.stringify({
      accepted,
      acceptedAt: accepted ? new Date().toISOString() : null,
      userSignedIn: this.isOnboardingCompleted()
    }));
  }

  static getChallengeAcceptance(): { accepted: boolean; acceptedAt: string | null; userSignedIn: boolean } {
    const data = localStorage.getItem(STORAGE_KEYS.CHALLENGE_ACCEPTANCE);
    if (!data) {
      return { accepted: false, acceptedAt: null, userSignedIn: false };
    }
    return JSON.parse(data);
  }

  static hasUserAcceptedChallenges(): boolean {
    const acceptance = this.getChallengeAcceptance();
    return acceptance.accepted && acceptance.userSignedIn && this.isOnboardingCompleted();
  }

  // Community post storage methods
  static addCommunityPost(post: CommunityPost): void {
    const posts = this.getCommunityPosts();
    posts.unshift(post);
    localStorage.setItem('nekah_community_posts', JSON.stringify(posts));
  }

  static getCommunityPosts(): CommunityPost[] {
    const data = localStorage.getItem('nekah_community_posts');
    return data ? JSON.parse(data) : [];
  }

  static updateCommunityPost(postId: string, updatedPost: Partial<CommunityPost>): void {
    const posts = this.getCommunityPosts();
    const index = posts.findIndex(post => post.id === postId);
    if (index !== -1) {
      posts[index] = { ...posts[index], ...updatedPost };
      localStorage.setItem('nekah_community_posts', JSON.stringify(posts));
    }
  }
}

// Pregnancy data by week
export const pregnancyDataByWeek: Record<number, any> = {
  22: {
    week: 22,
    trimester: 'second',
    babySize: 'papaya',
    emoji: '🥭',
    developments: [
      'Your baby\'s hearing is fully developed',
      'Eyelashes and eyebrows are forming',
      'Baby weighs about 1 pound now',
      'Skin is becoming less transparent'
    ],
    tips: [
      'Talk, sing, or play music to your little one',
      'They\'re developing their sense of hearing',
      'May respond to familiar voices'
    ],
    progress: 55
  }
};
