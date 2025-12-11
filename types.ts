
export enum Role {
  USER = 'user',
  MODEL = 'model'
}

export interface Message {
  id: string;
  role: Role;
  text: string;
  timestamp: Date;
  isBookmarked?: boolean;
}

export interface SavedMessage {
  id: string;
  text: string;
  category: string;
  timestamp: Date;
}

export interface SessionSummary {
  id: string;
  date: Date;
  category: string;
  points: string[];
  mood?: string;
}

export interface BookedSession {
  id: string;
  date: Date;
  time: string;
  type: 'ai_guided' | 'human_expert';
  status: 'upcoming' | 'completed';
  doctorName?: string;
}

export interface Category {
  id: string;
  icon: string; // Lucide icon name or emoji
  color: string;
  isSpecialized?: boolean; // For Baraem or Relationships
}

export type Gender = 'male' | 'female';
export type Language = 'ar' | 'en';

export interface User {
  name: string;
  email: string;
  age: string;
  gender: Gender;
  username: string; // New: Unique ID
  partner?: string; // New: Linked Partner
  registrationDate: string; // ISO Date String
  isSubscribed?: boolean; // True if paid
  pinCode?: string; // Encrypted/Stored PIN for App Lock
  voiceSpeed?: number; // 0.5 to 2.0
  emergencyContact?: string; // Custom number
}

export interface Question {
  id: string;
  textAr: string;
  textEn: string;
  optionsAr: string[];
  optionsEn: string[];
}

export interface AssessmentResult {
  [key: string]: string;
}

export interface TherapyPlan {
  category: string;
  severity: string;
  sessionsPerWeek: number;
  sessionDuration: number; // Minutes
  focusArea: string;
  nextMilestone: string;
}

export interface MonthlyReport {
  id: string;
  month: string;
  childName: string;
  diagnosis: string;
  progressScore: number; // 0-100
  behavioralImprovements: string[];
  academicRecommendations: string[];
  socialSkillsStatus: string;
  clinicalNotes: string;
}

export interface Achievement {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  icon: string;
  unlocked: boolean;
}

export interface JournalEntry {
    id: string;
    date: Date;
    text: string;
    tags: string[];
    sentiment: 'positive' | 'neutral' | 'negative';
}

export interface DailyChallenge {
  id: string;
  titleAr: string;
  titleEn: string;
  icon: string;
  color: string;
}

// --- NEW: Long Term Memory ---
export interface Memory {
    id: string;
    content: string; // The fact (e.g., "Boss name is Ahmed")
    tags: string[]; // Keywords for retrieval (e.g., "work", "boss", "stress")
    importance: number; // 1-5
    timestamp: string;
}

export type ViewState = 'LOGIN' | 'HOME' | 'CHAT' | 'DISCLAIMER' | 'PROFILE' | 'SETTINGS' | 'HELP' | 'BREATHING' | 'GARDEN' | 'DREAM' | 'GROUNDING' | 'BOOKING' | 'SLEEP_TOOL' | 'SUBSCRIPTION' | 'JOURNAL' | 'EMERGENCY_CHAT' | 'FADFADA';
