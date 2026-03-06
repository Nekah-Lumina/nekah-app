// Baby development data by pregnancy week
export interface BabyDevelopment {
  week: number;
  trimester: 1 | 2 | 3;
  size: {
    description: string;
    emoji: string;
    length: string;
    weight: string;
  };
  development: {
    major: string[];
    organs: string[];
    senses: string[];
    movement: string[];
  };
  motherChanges: {
    physical: string[];
    emotional: string[];
    symptoms: string[];
  };
  tips: string[];
  appointments: string[];
  illustration: {
    svg: string;
    color: string;
    scale: number;
  };
}

export const babyDevelopmentData: Record<number, BabyDevelopment> = {
  4: {
    week: 4,
    trimester: 1,
    size: {
      description: "Poppy seed",
      emoji: "🌱",
      length: "2mm",
      weight: "Less than 1g"
    },
    development: {
      major: ["Neural tube formation", "Heart begins to beat"],
      organs: ["Brain development starts", "Spinal cord forming"],
      senses: [],
      movement: []
    },
    motherChanges: {
      physical: ["Missed period", "Possible implantation bleeding"],
      emotional: ["Early pregnancy symptoms"],
      symptoms: ["Fatigue", "Breast tenderness"]
    },
    tips: ["Start taking folic acid", "Schedule first prenatal appointment"],
    appointments: ["Confirm pregnancy", "Blood tests"],
    illustration: {
      svg: `<circle cx="50" cy="50" r="8" fill="#FFB6C1" opacity="0.8"/>`,
      color: "#FFB6C1",
      scale: 0.1
    }
  },
  8: {
    week: 8,
    trimester: 1,
    size: {
      description: "Raspberry",
      emoji: "🫐",
      length: "16mm",
      weight: "1g"
    },
    development: {
      major: ["All major organs present", "Limbs clearly visible"],
      organs: ["Heart has 4 chambers", "Kidneys function", "Liver produces blood cells"],
      senses: ["Eyes forming", "Inner ear developing"],
      movement: ["First movements (not felt yet)"]
    },
    motherChanges: {
      physical: ["Uterus expanding", "Weight may start increasing"],
      emotional: ["Mood swings common", "Excitement and anxiety"],
      symptoms: ["Morning sickness peak", "Food aversions", "Frequent urination"]
    },
    tips: ["Continue prenatal vitamins", "Stay hydrated", "Rest when needed"],
    appointments: ["First ultrasound", "Comprehensive blood work"],
    illustration: {
      svg: `<ellipse cx="50" cy="45" rx="12" ry="16" fill="#DDA0DD" opacity="0.9"/>
             <circle cx="46" cy="40" r="2" fill="#8B4513"/>
             <circle cx="54" cy="40" r="2" fill="#8B4513"/>`,
      color: "#DDA0DD",
      scale: 0.2
    }
  },
  12: {
    week: 12,
    trimester: 1,
    size: {
      description: "Lime",
      emoji: "🍋",
      length: "54mm",
      weight: "14g"
    },
    development: {
      major: ["All organs formed", "Reflexes developing", "Fingerprints forming"],
      organs: ["Kidneys producing urine", "Intestines in position"],
      senses: ["Can hear your voice", "Eyes moving"],
      movement: ["Kicks and stretches", "Somersaults"]
    },
    motherChanges: {
      physical: ["Morning sickness often improves", "Energy returning"],
      emotional: ["Feeling more stable", "Excitement about pregnancy"],
      symptoms: ["Decreased nausea", "Glowing skin"]
    },
    tips: ["Share pregnancy news", "Continue healthy eating", "Start prenatal exercises"],
    appointments: ["NT scan", "First trimester screening"],
    illustration: {
      svg: `<ellipse cx="50" cy="50" rx="18" ry="24" fill="#98FB98" opacity="0.9"/>
             <circle cx="44" cy="42" r="3" fill="#4169E1"/>
             <circle cx="56" cy="42" r="3" fill="#4169E1"/>
             <path d="M 40 65 Q 50 70 60 65" stroke="#8B4513" stroke-width="2" fill="none"/>`,
      color: "#98FB98",
      scale: 0.35
    }
  },
  16: {
    week: 16,
    trimester: 2,
    size: {
      description: "Avocado",
      emoji: "🥑",
      length: "116mm",
      weight: "100g"
    },
    development: {
      major: ["Skeleton hardening", "Muscles strengthening", "Facial expressions"],
      organs: ["Heart pumping 25 quarts daily", "Liver and pancreas working"],
      senses: ["Hearing sounds", "Eyes sensitive to light"],
      movement: ["You might feel first kicks", "Thumb sucking"]
    },
    motherChanges: {
      physical: ["Baby bump showing", "Weight gain steady"],
      emotional: ["Feeling great", "Bonding with baby"],
      symptoms: ["Increased appetite", "Skin changes", "Hair growth"]
    },
    tips: ["Start talking to baby", "Consider maternity clothes", "Stay active"],
    appointments: ["Anatomy scan preparation", "Maternal serum screening"],
    illustration: {
      svg: `<ellipse cx="50" cy="50" rx="22" ry="30" fill="#FFE4B5" opacity="0.9"/>
             <circle cx="42" cy="40" r="4" fill="#4169E1"/>
             <circle cx="58" cy="40" r="4" fill="#4169E1"/>
             <ellipse cx="50" cy="50" rx="8" ry="12" fill="#FFA07A" opacity="0.7"/>
             <path d="M 35 75 Q 50 85 65 75" stroke="#8B4513" stroke-width="3" fill="none"/>`,
      color: "#FFE4B5",
      scale: 0.5
    }
  },
  20: {
    week: 20,
    trimester: 2,
    size: {
      description: "Banana",
      emoji: "🍌",
      length: "166mm",
      weight: "300g"
    },
    development: {
      major: ["Halfway point!", "Gender can be determined", "Brain developing rapidly"],
      organs: ["Digestive system practicing", "Immune system developing"],
      senses: ["Can hear music and voices", "Taste buds developing"],
      movement: ["Regular kicks felt", "Sleep-wake cycles"]
    },
    motherChanges: {
      physical: ["Belly button may pop out", "Skin stretching"],
      emotional: ["Excitement about anatomy scan", "Feeling connected"],
      symptoms: ["Round ligament pain", "Leg cramps", "Heartburn"]
    },
    tips: ["Anatomy scan week", "Start nursery planning", "Consider baby names"],
    appointments: ["Anatomy scan", "Gender reveal possible"],
    illustration: {
      svg: `<ellipse cx="50" cy="50" rx="26" ry="35" fill="#FFD700" opacity="0.9"/>
             <circle cx="40" cy="35" r="5" fill="#4169E1"/>
             <circle cx="60" cy="35" r="5" fill="#4169E1"/>
             <ellipse cx="50" cy="50" rx="12" ry="18" fill="#FFA07A" opacity="0.8"/>
             <path d="M 30 80 Q 50 90 70 80" stroke="#8B4513" stroke-width="3" fill="none"/>
             <circle cx="45" cy="25" r="8" fill="#F4A460" opacity="0.6"/>`,
      color: "#FFD700",
      scale: 0.65
    }
  },
  24: {
    week: 24,
    trimester: 2,
    size: {
      description: "Corn",
      emoji: "🌽",
      length: "300mm",
      weight: "600g"
    },
    development: {
      major: ["Viability milestone", "Lungs developing surfactant", "Brain growth spurt"],
      organs: ["Airways branching", "Blood vessels in lungs developing"],
      senses: ["Inner ear fully developed", "Responds to sounds"],
      movement: ["Strong kicks", "Hiccups common"]
    },
    motherChanges: {
      physical: ["Glucose screening", "Baby movements obvious"],
      emotional: ["Feeling baby's personality", "Preparing for third trimester"],
      symptoms: ["Back pain", "Constipation", "Trouble sleeping"]
    },
    tips: ["Glucose tolerance test", "Start childbirth classes", "Baby shower planning"],
    appointments: ["Glucose screening", "Blood pressure monitoring"],
    illustration: {
      svg: `<ellipse cx="50" cy="50" rx="30" ry="40" fill="#F0E68C" opacity="0.9"/>
             <circle cx="38" cy="30" r="6" fill="#4169E1"/>
             <circle cx="62" cy="30" r="6" fill="#4169E1"/>
             <ellipse cx="50" cy="55" rx="16" ry="22" fill="#FFA07A" opacity="0.8"/>
             <path d="M 25 85 Q 50 95 75 85" stroke="#8B4513" stroke-width="4" fill="none"/>
             <ellipse cx="50" cy="20" rx="12" ry="8" fill="#DEB887" opacity="0.7"/>`,
      color: "#F0E68C",
      scale: 0.8
    }
  },
  28: {
    week: 28,
    trimester: 3,
    size: {
      description: "Eggplant",
      emoji: "🍆",
      length: "375mm",
      weight: "1kg"
    },
    development: {
      major: ["Eyes can open", "Brain very active", "Lungs capable of breathing"],
      organs: ["Fat deposits forming", "Bone marrow producing red blood cells"],
      senses: ["Can see light through belly", "Recognizes your voice"],
      movement: ["Less room to move", "Rhythmic movements"]
    },
    motherChanges: {
      physical: ["Third trimester begins", "Baby bump prominent"],
      emotional: ["Nesting instinct starting", "Some anxiety about birth"],
      symptoms: ["Shortness of breath", "Heartburn", "Hemorrhoids"]
    },
    tips: ["Start birth plan", "Hospital tour", "Prepare for maternity leave"],
    appointments: ["Third trimester begins", "RhoGAM if needed"],
    illustration: {
      svg: `<ellipse cx="50" cy="55" rx="34" ry="45" fill="#9370DB" opacity="0.9"/>
             <circle cx="36" cy="25" r="7" fill="#4169E1"/>
             <circle cx="64" cy="25" r="7" fill="#4169E1"/>
             <ellipse cx="50" cy="60" rx="20" ry="28" fill="#FFA07A" opacity="0.8"/>
             <path d="M 20 90 Q 50 100 80 90" stroke="#8B4513" stroke-width="4" fill="none"/>
             <ellipse cx="50" cy="15" rx="16" ry="10" fill="#DEB887" opacity="0.8"/>`,
      color: "#9370DB",
      scale: 0.9
    }
  },
  32: {
    week: 32,
    trimester: 3,
    size: {
      description: "Coconut",
      emoji: "🥥",
      length: "425mm",
      weight: "1.7kg"
    },
    development: {
      major: ["Practicing breathing", "Immune system developing", "Fingernails and toenails"],
      organs: ["Lungs nearly mature", "Digestive system almost complete"],
      senses: ["Can distinguish between light and dark", "Hearing well developed"],
      movement: ["Slower but stronger movements", "Head down position likely"]
    },
    motherChanges: {
      physical: ["Belly stretching significantly", "Braxton Hicks contractions"],
      emotional: ["Excitement and nervousness", "Preparing for baby"],
      symptoms: ["Trouble sleeping", "Frequent urination", "Swelling"]
    },
    tips: ["Pack hospital bag", "Install car seat", "Finalize baby names"],
    appointments: ["Growth scan", "Birth plan discussion"],
    illustration: {
      svg: `<ellipse cx="50" cy="60" rx="38" ry="50" fill="#8B4513" opacity="0.9"/>
             <circle cx="34" cy="20" r="8" fill="#4169E1"/>
             <circle cx="66" cy="20" r="8" fill="#4169E1"/>
             <ellipse cx="50" cy="65" rx="24" ry="32" fill="#FFA07A" opacity="0.8"/>
             <path d="M 15 95 Q 50 105 85 95" stroke="#8B4513" stroke-width="5" fill="none"/>
             <ellipse cx="50" cy="10" rx="20" ry="12" fill="#DEB887" opacity="0.8"/>`,
      color: "#8B4513",
      scale: 1.0
    }
  },
  36: {
    week: 36,
    trimester: 3,
    size: {
      description: "Papaya",
      emoji: "🥭",
      length: "475mm",
      weight: "2.6kg"
    },
    development: {
      major: ["Considered full-term soon", "Lungs almost ready", "Fat accumulation"],
      organs: ["Kidneys fully developed", "Liver storing iron"],
      senses: ["Can focus on objects", "Responds to light"],
      movement: ["Less space, stronger kicks", "Head down (hopefully)"]
    },
    motherChanges: {
      physical: ["Weekly appointments", "Cervical checks begin"],
      emotional: ["Anticipation building", "Final preparations"],
      symptoms: ["Pelvic pressure", "Trouble sleeping", "Nesting urges"]
    },
    tips: ["Final preparations", "Review birth plan", "Rest as much as possible"],
    appointments: ["Weekly checkups begin", "Group B strep test"],
    illustration: {
      svg: `<ellipse cx="50" cy="65" rx="40" ry="55" fill="#FF8C00" opacity="0.9"/>
             <circle cx="32" cy="15" r="9" fill="#4169E1"/>
             <circle cx="68" cy="15" r="9" fill="#4169E1"/>
             <ellipse cx="50" cy="70" rx="26" ry="36" fill="#FFA07A" opacity="0.8"/>
             <path d="M 12 100 Q 50 110 88 100" stroke="#8B4513" stroke-width="5" fill="none"/>
             <ellipse cx="50" cy="5" rx="22" ry="14" fill="#DEB887" opacity="0.9"/>`,
      color: "#FF8C00",
      scale: 1.1
    }
  },
  40: {
    week: 40,
    trimester: 3,
    size: {
      description: "Watermelon",
      emoji: "🍉",
      length: "510mm",
      weight: "3.4kg"
    },
    development: {
      major: ["Full term!", "Ready for birth", "All systems mature"],
      organs: ["Lungs fully mature", "Brain continues development"],
      senses: ["All senses fully developed", "Ready for outside world"],
      movement: ["Very limited space", "Preparing for delivery"]
    },
    motherChanges: {
      physical: ["Engagement/lightening", "Labor signs possible"],
      emotional: ["Ready to meet baby", "Mix of excitement and nervousness"],
      symptoms: ["Lightning crotch", "Increased discharge", "Possible contractions"]
    },
    tips: ["Watch for labor signs", "Stay close to hospital", "Trust your body"],
    appointments: ["Non-stress tests", "Biophysical profiles if needed"],
    illustration: {
      svg: `<ellipse cx="50" cy="70" rx="42" ry="60" fill="#FF69B4" opacity="0.9"/>
             <circle cx="30" cy="10" r="10" fill="#4169E1"/>
             <circle cx="70" cy="10" r="10" fill="#4169E1"/>
             <ellipse cx="50" cy="75" rx="28" ry="40" fill="#FFA07A" opacity="0.8"/>
             <path d="M 10 105 Q 50 115 90 105" stroke="#8B4513" stroke-width="6" fill="none"/>
             <ellipse cx="50" cy="0" rx="24" ry="16" fill="#DEB887" opacity="0.9"/>`,
      color: "#FF69B4",
      scale: 1.2
    }
  }
};

export const getBabyDevelopment = (week: number): BabyDevelopment | null => {
  // Find the closest week data
  const availableWeeks = Object.keys(babyDevelopmentData).map(Number).sort((a, b) => a - b);
  
  if (week < availableWeeks[0]) return null;
  if (week > availableWeeks[availableWeeks.length - 1]) {
    return babyDevelopmentData[availableWeeks[availableWeeks.length - 1]];
  }
  
  // Find the exact week or the closest lower week
  for (let i = availableWeeks.length - 1; i >= 0; i--) {
    if (week >= availableWeeks[i]) {
      return babyDevelopmentData[availableWeeks[i]];
    }
  }
  
  return null;
};

export const getTrimesterInfo = (week: number) => {
  if (week <= 12) return { trimester: 1, name: "First Trimester", color: "#FFB6C1" };
  if (week <= 27) return { trimester: 2, name: "Second Trimester", color: "#98FB98" };
  return { trimester: 3, name: "Third Trimester", color: "#DDA0DD" };
};

export const getPregnancyProgress = (week: number) => {
  return Math.min(Math.round((week / 40) * 100), 100);
};