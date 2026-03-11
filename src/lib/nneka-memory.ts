export interface NnekaMemory {
  summary: string;
  emotionalThemes: string[];
  supportNeeds: string[];
  pregnancyContext?: string;
  lastRisk?: "low" | "moderate" | "high" | "crisis";
  updatedAt: string;
}

const MEMORY_KEY = "nneka-memory";
const HISTORY_KEY = "nneka-chat-history";

export interface StoredChatMessage {
  id: string;
  role: "user" | "nneka";
  text: string;
  createdAt: string;
}

export function getNnekaMemory(): NnekaMemory | null {
  const raw = localStorage.getItem(MEMORY_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as NnekaMemory;
  } catch {
    return null;
  }
}

export function saveNnekaMemory(memory: NnekaMemory) {
  localStorage.setItem(MEMORY_KEY, JSON.stringify(memory));
}

export function getNnekaHistory(): StoredChatMessage[] {
  const raw = localStorage.getItem(HISTORY_KEY);
  if (!raw) return [];

  try {
    return JSON.parse(raw) as StoredChatMessage[];
  } catch {
    return [];
  }
}

export function saveNnekaHistory(messages: StoredChatMessage[]) {
  // keep only the latest 20 messages
  localStorage.setItem(HISTORY_KEY, JSON.stringify(messages.slice(-20)));
}

export function buildMemoryFromMessages(messages: StoredChatMessage[]): NnekaMemory {
  const userTexts = messages
    .filter((m) => m.role === "user")
    .map((m) => m.text.toLowerCase());

  const emotionalThemes = new Set<string>();
  const supportNeeds = new Set<string>();
  let pregnancyContext: string | undefined;
  let summary = "Mother is using Talk to Nneka for emotional and maternal support.";

  for (const text of userTexts) {
    if (text.includes("pregnant")) pregnancyContext = "pregnant";
    if (text.includes("postpartum") || text.includes("after birth")) pregnancyContext = "postpartum";

    if (text.includes("ugly") || text.includes("unattractive") || text.includes("my body")) {
      emotionalThemes.add("body image concerns");
      supportNeeds.add("gentle reassurance");
    }

    if (text.includes("anxious") || text.includes("afraid") || text.includes("panic")) {
      emotionalThemes.add("anxiety");
      supportNeeds.add("calming emotional support");
    }

    if (text.includes("overwhelmed") || text.includes("tired") || text.includes("exhausted")) {
      emotionalThemes.add("overwhelm");
      supportNeeds.add("practical step-by-step support");
    }

    if (text.includes("crying") || text.includes("sad") || text.includes("lonely")) {
      emotionalThemes.add("low mood");
      supportNeeds.add("emotional check-ins");
    }

    if (text.includes("baby") && text.includes("bond")) {
      emotionalThemes.add("bonding concern");
      supportNeeds.add("maternal mental health support");
    }
  }

  if (emotionalThemes.size > 0) {
    summary = `Mother has previously shared ${Array.from(emotionalThemes).join(", ")} and may need continued supportive follow-up.`;
  }

  return {
    summary,
    emotionalThemes: Array.from(emotionalThemes),
    supportNeeds: Array.from(supportNeeds),
    pregnancyContext,
    updatedAt: new Date().toISOString(),
  };
}
