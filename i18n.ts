// Internationalization service for NEKAH
export interface Language {
  code: string;
  name: string;
  nativeName: string;
  rtl?: boolean;
}

export interface Translations {
  [key: string]: string | Translations;
}

export class I18nService {
  private static currentLanguage = 'en';
  private static translations: Record<string, Translations> = {};
  private static fallbackLanguage = 'en';
  
  static readonly languages: Language[] = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'es', name: 'Spanish', nativeName: 'Español' },
    { code: 'fr', name: 'French', nativeName: 'Français' },
    { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', rtl: true },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
    { code: 'zh', name: 'Chinese', nativeName: '中文' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語' },
    { code: 'ko', name: 'Korean', nativeName: '한국어' },
    { code: 'de', name: 'German', nativeName: 'Deutsch' },
    { code: 'it', name: 'Italian', nativeName: 'Italiano' },
    { code: 'ru', name: 'Russian', nativeName: 'Русский' },
    { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili' },
    { code: 'ha', name: 'Hausa', nativeName: 'Hausa' },
    { code: 'yo', name: 'Yoruba', nativeName: 'Yorùbá' },
    { code: 'ig', name: 'Igbo', nativeName: 'Igbo' }
  ];

  // English translations (base)
  private static baseTranslations: Translations = {
    common: {
      weeks: 'weeks',
      days: 'days',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      cancel: 'Cancel',
      save: 'Save',
      close: 'Close',
      yes: 'Yes',
      no: 'No',
      next: 'Next',
      back: 'Back',
      submit: 'Submit'
    },
    navigation: {
      home: 'Home',
      glowTalk: 'GlowTalk',
      bumpCheck: 'BumpCheck',
      baby: 'Baby',
      cravings: 'Cravings',
      community: 'Community',
      challenges: 'Challenges',
      emergency: 'Emergency',
      profile: 'Profile'
    },
    home: {
      welcome: 'Welcome',
      pregnancyWeek: 'Week',
      daysLeft: 'days to go',
      babySize: 'Baby Size',
      keyDevelopments: 'Key Developments',
      motherTips: 'For You',
      quickActions: 'Quick Actions',
      upcomingAppointments: 'Upcoming Appointments'
    },
    baby: {
      development: 'Baby Development',
      size: 'Size',
      length: 'Length',
      weight: 'Weight',
      movements: 'Movements',
      senses: 'Senses',
      organs: 'Organ Development'
    },
    mood: {
      track: 'Track Your Mood',
      happy: 'Happy',
      excited: 'Excited',
      calm: 'Calm',
      worried: 'Worried',
      tired: 'Tired',
      emotional: 'Emotional',
      share: 'Share your feelings',
      affirmation: 'Daily Affirmation'
    },
    health: {
      analysis: 'Health Analysis',
      symptoms: 'Symptoms',
      recommendations: 'Recommendations',
      emergency: 'Seek immediate medical attention',
      normal: 'Everything looks normal',
      monitor: 'Keep monitoring'
    },
    community: {
      posts: 'Community Posts',
      share: 'Share with community',
      support: 'Support & Advice',
      connect: 'Connect with other moms',
      newPost: 'New Post',
      comment: 'Comment',
      like: 'Like'
    },
    challenges: {
      wellness: 'Wellness Challenges',
      daily: 'Daily Goals',
      weekly: 'Weekly Goals',
      progress: 'Progress',
      complete: 'Complete',
      streak: 'Current Streak'
    },
    profile: {
      settings: 'Settings',
      notifications: 'Notifications',
      privacy: 'Privacy',
      language: 'Language',
      theme: 'Theme',
      help: 'Help & Support'
    },
    offline: {
      noConnection: 'No internet connection',
      limitedFeatures: 'Some features may be limited',
      syncWhenOnline: 'Data will sync when you\'re back online'
    }
  };

  // Spanish translations
  private static spanishTranslations: Translations = {
    common: {
      weeks: 'semanas',
      days: 'días',
      loading: 'Cargando...',
      error: 'Error',
      success: 'Éxito',
      cancel: 'Cancelar',
      save: 'Guardar',
      close: 'Cerrar',
      yes: 'Sí',
      no: 'No',
      next: 'Siguiente',
      back: 'Atrás',
      submit: 'Enviar'
    },
    navigation: {
      home: 'Inicio',
      glowTalk: 'GlowTalk',
      bumpCheck: 'BumpCheck',
      baby: 'Bebé',
      cravings: 'Antojos',
      community: 'Comunidad',
      challenges: 'Desafíos',
      emergency: 'Emergencia',
      profile: 'Perfil'
    },
    home: {
      welcome: 'Bienvenida',
      pregnancyWeek: 'Semana',
      daysLeft: 'días para el parto',
      babySize: 'Tamaño del Bebé',
      keyDevelopments: 'Desarrollos Clave',
      motherTips: 'Para Ti',
      quickActions: 'Acciones Rápidas',
      upcomingAppointments: 'Próximas Citas'
    },
    baby: {
      development: 'Desarrollo del Bebé',
      size: 'Tamaño',
      length: 'Longitud',
      weight: 'Peso',
      movements: 'Movimientos',
      senses: 'Sentidos',
      organs: 'Desarrollo de Órganos'
    },
    mood: {
      track: 'Rastrea tu Estado de Ánimo',
      happy: 'Feliz',
      excited: 'Emocionada',
      calm: 'Tranquila',
      worried: 'Preocupada',
      tired: 'Cansada',
      emotional: 'Emocional',
      share: 'Comparte tus sentimientos',
      affirmation: 'Afirmación Diaria'
    },
    health: {
      analysis: 'Análisis de Salud',
      symptoms: 'Síntomas',
      recommendations: 'Recomendaciones',
      emergency: 'Busca atención médica inmediata',
      normal: 'Todo se ve normal',
      monitor: 'Sigue monitoreando'
    }
  };

  // Arabic translations (RTL)
  private static arabicTranslations: Translations = {
    common: {
      weeks: 'أسابيع',
      days: 'أيام',
      loading: 'جاري التحميل...',
      error: 'خطأ',
      success: 'نجح',
      cancel: 'إلغاء',
      save: 'حفظ',
      close: 'إغلاق',
      yes: 'نعم',
      no: 'لا',
      next: 'التالي',
      back: 'السابق',
      submit: 'إرسال'
    },
    navigation: {
      home: 'الرئيسية',
      glowTalk: 'GlowTalk',
      bumpCheck: 'BumpCheck',
      baby: 'الطفل',
      cravings: 'الرغبة الشديدة',
      community: 'المجتمع',
      challenges: 'التحديات',
      emergency: 'الطوارئ',
      profile: 'الملف الشخصي'
    },
    home: {
      welcome: 'مرحباً',
      pregnancyWeek: 'الأسبوع',
      daysLeft: 'يوم متبقي',
      babySize: 'حجم الطفل',
      keyDevelopments: 'التطورات الرئيسية',
      motherTips: 'نصائح لك',
      quickActions: 'إجراءات سريعة',
      upcomingAppointments: 'المواعيد القادمة'
    }
  };

  // French translations
  private static frenchTranslations: Translations = {
    common: {
      weeks: 'semaines',
      days: 'jours',
      loading: 'Chargement...',
      error: 'Erreur',
      success: 'Succès',
      cancel: 'Annuler',
      save: 'Sauvegarder',
      close: 'Fermer',
      yes: 'Oui',
      no: 'Non',
      next: 'Suivant',
      back: 'Retour',
      submit: 'Soumettre'
    },
    navigation: {
      home: 'Accueil',
      glowTalk: 'GlowTalk',
      bumpCheck: 'BumpCheck',
      baby: 'Bébé',
      cravings: 'Envies',
      community: 'Communauté',
      challenges: 'Défis',
      emergency: 'Urgence',
      profile: 'Profil'
    },
    home: {
      welcome: 'Bienvenue',
      pregnancyWeek: 'Semaine',
      daysLeft: 'jours restants',
      babySize: 'Taille du Bébé',
      keyDevelopments: 'Développements Clés',
      motherTips: 'Pour Vous',
      quickActions: 'Actions Rapides',
      upcomingAppointments: 'Rendez-vous à Venir'
    }
  };

  static init(): void {
    // Load translations
    this.translations = {
      en: this.baseTranslations,
      es: this.spanishTranslations,
      ar: this.arabicTranslations,
      fr: this.frenchTranslations
    };

    // Load saved language preference
    const savedLanguage = localStorage.getItem('nekah_language');
    if (savedLanguage && this.isLanguageSupported(savedLanguage)) {
      this.currentLanguage = savedLanguage;
    } else {
      // Auto-detect browser language
      const browserLanguage = navigator.language.split('-')[0];
      if (this.isLanguageSupported(browserLanguage)) {
        this.currentLanguage = browserLanguage;
      }
    }

    this.applyLanguageSettings();
  }

  static getCurrentLanguage(): string {
    return this.currentLanguage;
  }

  static setLanguage(languageCode: string): void {
    if (this.isLanguageSupported(languageCode)) {
      this.currentLanguage = languageCode;
      localStorage.setItem('nekah_language', languageCode);
      this.applyLanguageSettings();
      
      // Announce language change for screen readers
      const languageName = this.languages.find(lang => lang.code === languageCode)?.nativeName;
      this.announceToScreenReader(`Language changed to ${languageName}`);
    }
  }

  static getAvailableLanguages(): Language[] {
    return this.languages;
  }

  static isLanguageSupported(languageCode: string): boolean {
    return this.languages.some(lang => lang.code === languageCode);
  }

  static t(key: string, params?: Record<string, string | number>): string {
    const translation = this.getTranslation(key, this.currentLanguage) || 
                       this.getTranslation(key, this.fallbackLanguage) || 
                       key;

    if (params) {
      return this.interpolate(translation, params);
    }

    return translation;
  }

  static loadLanguage(): void {
    // This method can be used to lazy-load language files in the future
    this.init();
  }

  private static getTranslation(key: string, languageCode: string): string | null {
    const translations = this.translations[languageCode];
    if (!translations) return null;

    const keys = key.split('.');
    let current: any = translations;

    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k];
      } else {
        return null;
      }
    }

    return typeof current === 'string' ? current : null;
  }

  private static interpolate(template: string, params: Record<string, string | number>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return params[key]?.toString() || match;
    });
  }

  private static applyLanguageSettings(): void {
    const currentLang = this.languages.find(lang => lang.code === this.currentLanguage);
    
    if (currentLang) {
      // Set document language
      document.documentElement.lang = this.currentLanguage;
      
      // Set text direction for RTL languages
      if (currentLang.rtl) {
        document.documentElement.dir = 'rtl';
        document.body.classList.add('rtl');
      } else {
        document.documentElement.dir = 'ltr';
        document.body.classList.remove('rtl');
      }
      
      // Update meta tags
      this.updateMetaTags(currentLang);
    }
  }

  private static updateMetaTags(language: Language): void {
    // Update or create meta tags for language
    let langMeta = document.querySelector('meta[name="language"]');
    if (!langMeta) {
      langMeta = document.createElement('meta');
      langMeta.setAttribute('name', 'language');
      document.head.appendChild(langMeta);
    }
    langMeta.setAttribute('content', language.code);

    // Update content language
    let contentLangMeta = document.querySelector('meta[http-equiv="content-language"]');
    if (!contentLangMeta) {
      contentLangMeta = document.createElement('meta');
      contentLangMeta.setAttribute('http-equiv', 'content-language');
      document.head.appendChild(contentLangMeta);
    }
    contentLangMeta.setAttribute('content', language.code);
  }

  private static announceToScreenReader(message: string): void {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }

  // Number and date formatting
  static formatNumber(number: number): string {
    try {
      return new Intl.NumberFormat(this.currentLanguage).format(number);
    } catch {
      return number.toString();
    }
  }

  static formatDate(date: Date): string {
    try {
      return new Intl.DateTimeFormat(this.currentLanguage, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(date);
    } catch {
      return date.toLocaleDateString();
    }
  }

  static formatRelativeTime(date: Date): string {
    try {
      const rtf = new Intl.RelativeTimeFormat(this.currentLanguage, { numeric: 'auto' });
      const diffInDays = Math.floor((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      
      if (Math.abs(diffInDays) < 1) {
        return this.t('common.today') || 'Today';
      } else if (diffInDays === 1) {
        return rtf.format(1, 'day');
      } else if (diffInDays === -1) {
        return rtf.format(-1, 'day');
      } else if (Math.abs(diffInDays) < 7) {
        return rtf.format(diffInDays, 'day');
      } else {
        const diffInWeeks = Math.floor(diffInDays / 7);
        return rtf.format(diffInWeeks, 'week');
      }
    } catch {
      return date.toLocaleDateString();
    }
  }

  // Pluralization helper
  static plural(count: number, key: string): string {
    // Simple pluralization - can be extended for complex rules
    if (count === 1) {
      return this.t(key);
    } else {
      return this.t(key + 's') || this.t(key);
    }
  }
}