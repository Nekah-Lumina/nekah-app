import { Challenge, Achievement } from '@/lib/types';

export const pregnancyChallenges: Challenge[] = [
  // Nutrition Challenges
  {
    id: 'nutrition-water-intake',
    title: 'Hydration Hero',
    description: 'Drink 8-10 glasses of water throughout the day',
    category: 'nutrition',
    difficulty: 'easy',
    points: 10,
    icon: '💧',
    requirements: ['Track water intake', 'Aim for 2-3 liters daily'],
    isDaily: true,
    pregnancyWeeks: Array.from({length: 40}, (_, i) => i + 1),
    estimatedTime: '5 minutes'
  },
  {
    id: 'nutrition-prenatal-vitamins',
    title: 'Vitamin Victory',
    description: 'Take your daily prenatal vitamins',
    category: 'nutrition',
    difficulty: 'easy',
    points: 15,
    icon: '💊',
    requirements: ['Take prescribed prenatal vitamins', 'Best with food'],
    isDaily: true,
    pregnancyWeeks: Array.from({length: 40}, (_, i) => i + 1),
    estimatedTime: '2 minutes'
  },
  {
    id: 'nutrition-healthy-breakfast',
    title: 'Morning Nourishment',
    description: 'Start your day with a balanced, nutritious breakfast',
    category: 'nutrition',
    difficulty: 'medium',
    points: 20,
    icon: '🥣',
    requirements: ['Include protein, whole grains, and fruits/vegetables', 'Eat within 2 hours of waking'],
    isDaily: true,
    pregnancyWeeks: Array.from({length: 40}, (_, i) => i + 1),
    estimatedTime: '15 minutes'
  },
  {
    id: 'nutrition-calcium-rich',
    title: 'Calcium Champion',
    description: 'Include 3 servings of calcium-rich foods today',
    category: 'nutrition',
    difficulty: 'medium',
    points: 25,
    icon: '🥛',
    requirements: ['Dairy products, leafy greens, or fortified foods', 'Aim for 1000mg calcium'],
    isDaily: true,
    pregnancyWeeks: Array.from({length: 40}, (_, i) => i + 1),
    estimatedTime: '10 minutes'
  },

  // Exercise Challenges
  {
    id: 'exercise-prenatal-walk',
    title: 'Gentle Steps',
    description: 'Take a 15-20 minute walk outdoors or indoors',
    category: 'exercise',
    difficulty: 'easy',
    points: 15,
    icon: '🚶‍♀️',
    requirements: ['Moderate pace', 'Stay hydrated', 'Stop if uncomfortable'],
    isDaily: true,
    pregnancyWeeks: Array.from({length: 40}, (_, i) => i + 1),
    estimatedTime: '20 minutes'
  },
  {
    id: 'exercise-prenatal-yoga',
    title: 'Yoga Flow',
    description: 'Practice 10 minutes of prenatal yoga or stretching',
    category: 'exercise',
    difficulty: 'medium',
    points: 20,
    icon: '🧘‍♀️',
    requirements: ['Prenatal-safe poses only', 'Listen to your body', 'Use props as needed'],
    isDaily: false,
    pregnancyWeeks: Array.from({length: 40}, (_, i) => i + 1),
    estimatedTime: '15 minutes'
  },
  {
    id: 'exercise-pelvic-floor',
    title: 'Pelvic Power',
    description: 'Complete pelvic floor exercises (Kegels)',
    category: 'exercise',
    difficulty: 'easy',
    points: 10,
    icon: '💪',
    requirements: ['3 sets of 10 repetitions', 'Hold for 3-5 seconds each'],
    isDaily: true,
    pregnancyWeeks: Array.from({length: 40}, (_, i) => i + 1),
    estimatedTime: '5 minutes'
  },
  {
    id: 'exercise-swimming',
    title: 'Aqua Wellness',
    description: 'Enjoy 20-30 minutes of swimming or water aerobics',
    category: 'exercise',
    difficulty: 'medium',
    points: 30,
    icon: '🏊‍♀️',
    requirements: ['Low-impact water exercise', 'Check water temperature', 'Avoid diving'],
    isDaily: false,
    pregnancyWeeks: Array.from({length: 35}, (_, i) => i + 1), // Up to week 35
    estimatedTime: '30 minutes'
  },

  // Mental Health Challenges
  {
    id: 'mental-gratitude-journal',
    title: 'Gratitude Glow',
    description: 'Write down 3 things you\'re grateful for today',
    category: 'mental-health',
    difficulty: 'easy',
    points: 15,
    icon: '📝',
    requirements: ['Focus on positive moments', 'Include pregnancy experiences'],
    isDaily: true,
    pregnancyWeeks: Array.from({length: 40}, (_, i) => i + 1),
    estimatedTime: '5 minutes'
  },
  {
    id: 'mental-meditation',
    title: 'Mindful Moments',
    description: 'Practice 10 minutes of meditation or deep breathing',
    category: 'mental-health',
    difficulty: 'medium',
    points: 20,
    icon: '🕯️',
    requirements: ['Find quiet space', 'Focus on breath', 'Use guided meditation if helpful'],
    isDaily: false,
    pregnancyWeeks: Array.from({length: 40}, (_, i) => i + 1),
    estimatedTime: '10 minutes'
  },
  {
    id: 'mental-partner-connection',
    title: 'Love Link',
    description: 'Spend quality time connecting with your partner',
    category: 'mental-health',
    difficulty: 'easy',
    points: 25,
    icon: '💕',
    requirements: ['Device-free time together', 'Share pregnancy feelings and thoughts'],
    isDaily: false,
    pregnancyWeeks: Array.from({length: 40}, (_, i) => i + 1),
    estimatedTime: '30 minutes'
  },
  {
    id: 'mental-baby-bonding',
    title: 'Baby Talk',
    description: 'Spend time talking or singing to your baby',
    category: 'mental-health',
    difficulty: 'easy',
    points: 15,
    icon: '👶',
    requirements: ['Place hands on belly', 'Share your day or sing lullabies'],
    isDaily: false,
    pregnancyWeeks: Array.from({length: 22}, (_, i) => i + 18), // Weeks 18-40
    estimatedTime: '10 minutes'
  },

  // Medical Challenges
  {
    id: 'medical-symptom-tracking',
    title: 'Body Awareness',
    description: 'Log any symptoms or changes you\'re experiencing',
    category: 'medical',
    difficulty: 'easy',
    points: 10,
    icon: '📊',
    requirements: ['Note physical changes', 'Track mood and energy levels'],
    isDaily: true,
    pregnancyWeeks: Array.from({length: 40}, (_, i) => i + 1),
    estimatedTime: '5 minutes'
  },
  {
    id: 'medical-appointment-prep',
    title: 'Appointment Ready',
    description: 'Prepare questions for your next prenatal appointment',
    category: 'medical',
    difficulty: 'medium',
    points: 20,
    icon: '📋',
    requirements: ['Write down concerns', 'Prepare symptom list', 'Note questions about baby development'],
    isDaily: false,
    pregnancyWeeks: Array.from({length: 40}, (_, i) => i + 1),
    estimatedTime: '15 minutes'
  },
  {
    id: 'medical-blood-pressure',
    title: 'Pressure Check',
    description: 'Monitor and record your blood pressure if recommended',
    category: 'medical',
    difficulty: 'medium',
    points: 15,
    icon: '🩺',
    requirements: ['Use proper technique', 'Record results', 'Report concerns to healthcare provider'],
    isDaily: false,
    pregnancyWeeks: Array.from({length: 20}, (_, i) => i + 20), // Weeks 20-40
    estimatedTime: '10 minutes'
  },

  // Self-Care Challenges
  {
    id: 'selfcare-skin-care',
    title: 'Glow Routine',
    description: 'Complete your pregnancy-safe skincare routine',
    category: 'self-care',
    difficulty: 'easy',
    points: 10,
    icon: '✨',
    requirements: ['Use pregnancy-safe products', 'Include moisturizing for stretch marks'],
    isDaily: true,
    pregnancyWeeks: Array.from({length: 40}, (_, i) => i + 1),
    estimatedTime: '10 minutes'
  },
  {
    id: 'selfcare-warm-bath',
    title: 'Relaxation Soak',
    description: 'Enjoy a warm (not hot) bath with calming scents',
    category: 'self-care',
    difficulty: 'easy',
    points: 20,
    icon: '🛁',
    requirements: ['Water temperature under 100°F', 'Limit to 15-20 minutes', 'Use pregnancy-safe bath products'],
    isDaily: false,
    pregnancyWeeks: Array.from({length: 40}, (_, i) => i + 1),
    estimatedTime: '20 minutes'
  },
  {
    id: 'selfcare-massage',
    title: 'Comfort Touch',
    description: 'Give yourself or receive a gentle pregnancy massage',
    category: 'self-care',
    difficulty: 'medium',
    points: 25,
    icon: '💆‍♀️',
    requirements: ['Focus on shoulders, feet, or hands', 'Use gentle pressure', 'Avoid pressure points'],
    isDaily: false,
    pregnancyWeeks: Array.from({length: 40}, (_, i) => i + 1),
    estimatedTime: '15 minutes'
  },
  {
    id: 'selfcare-reading',
    title: 'Knowledge Quest',
    description: 'Read about pregnancy, parenting, or enjoy leisure reading',
    category: 'self-care',
    difficulty: 'easy',
    points: 15,
    icon: '📚',
    requirements: ['15-30 minutes of reading', 'Choose educational or relaxing content'],
    isDaily: false,
    pregnancyWeeks: Array.from({length: 40}, (_, i) => i + 1),
    estimatedTime: '20 minutes'
  }
];

export const achievements: Achievement[] = [
  // Streak Achievements
  {
    id: 'streak-3-days',
    title: 'Getting Started',
    description: 'Complete challenges for 3 days in a row',
    icon: '🔥',
    category: 'streak',
    requirements: {
      type: 'maintain_streak',
      target: 3
    },
    points: 50,
    badge: '🥉'
  },
  {
    id: 'streak-7-days',
    title: 'Week Warrior',
    description: 'Complete challenges for 7 days in a row',
    icon: '🔥',
    category: 'streak',
    requirements: {
      type: 'maintain_streak',
      target: 7
    },
    points: 100,
    badge: '🥈'
  },
  {
    id: 'streak-14-days',
    title: 'Habit Builder',
    description: 'Complete challenges for 14 days in a row',
    icon: '🔥',
    category: 'streak',
    requirements: {
      type: 'maintain_streak',
      target: 14
    },
    points: 200,
    badge: '🥇'
  },
  {
    id: 'streak-30-days',
    title: 'Consistency Champion',
    description: 'Complete challenges for 30 days in a row',
    icon: '👑',
    category: 'streak',
    requirements: {
      type: 'maintain_streak',
      target: 30
    },
    points: 500,
    badge: '👑'
  },

  // Milestone Achievements
  {
    id: 'challenges-10',
    title: 'Challenge Explorer',
    description: 'Complete 10 total challenges',
    icon: '🎯',
    category: 'milestone',
    requirements: {
      type: 'complete_challenges',
      target: 10
    },
    points: 100,
    badge: '🎯'
  },
  {
    id: 'challenges-50',
    title: 'Wellness Warrior',
    description: 'Complete 50 total challenges',
    icon: '⭐',
    category: 'milestone',
    requirements: {
      type: 'complete_challenges',
      target: 50
    },
    points: 300,
    badge: '⭐'
  },
  {
    id: 'challenges-100',
    title: 'Pregnancy Pro',
    description: 'Complete 100 total challenges',
    icon: '🏆',
    category: 'milestone',
    requirements: {
      type: 'complete_challenges',
      target: 100
    },
    points: 500,
    badge: '🏆'
  },

  // Category Mastery Achievements
  {
    id: 'nutrition-master',
    title: 'Nutrition Ninja',
    description: 'Complete 20 nutrition challenges',
    icon: '🥗',
    category: 'category',
    requirements: {
      type: 'category_mastery',
      target: 20,
      category: 'nutrition'
    },
    points: 200,
    badge: '🥗'
  },
  {
    id: 'exercise-master',
    title: 'Fitness Goddess',
    description: 'Complete 20 exercise challenges',
    icon: '💪',
    category: 'category',
    requirements: {
      type: 'category_mastery',
      target: 20,
      category: 'exercise'
    },
    points: 200,
    badge: '💪'
  },
  {
    id: 'mental-health-master',
    title: 'Mindfulness Maven',
    description: 'Complete 20 mental health challenges',
    icon: '🧘‍♀️',
    category: 'category',
    requirements: {
      type: 'category_mastery',
      target: 20,
      category: 'mental-health'
    },
    points: 200,
    badge: '🧘‍♀️'
  },
  {
    id: 'selfcare-master',
    title: 'Self-Care Queen',
    description: 'Complete 20 self-care challenges',
    icon: '👸',
    category: 'category',
    requirements: {
      type: 'category_mastery',
      target: 20,
      category: 'self-care'
    },
    points: 200,
    badge: '👸'
  },

  // Special Achievements
  {
    id: 'points-1000',
    title: 'Point Collector',
    description: 'Earn 1000 wellness points',
    icon: '💎',
    category: 'special',
    requirements: {
      type: 'points_earned',
      target: 1000
    },
    points: 100,
    badge: '💎'
  },
  {
    id: 'points-5000',
    title: 'Wellness Expert',
    description: 'Earn 5000 wellness points',
    icon: '💍',
    category: 'special',
    requirements: {
      type: 'points_earned',
      target: 5000
    },
    points: 300,
    badge: '💍'
  },
  {
    id: 'trimester-completion',
    title: 'Trimester Triumph',
    description: 'Complete challenges throughout an entire trimester',
    icon: '🌟',
    category: 'special',
    requirements: {
      type: 'complete_challenges',
      target: 84 // 12 weeks × 7 days
    },
    points: 1000,
    badge: '🌟'
  }
];