
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

export interface CognitiveNode {
    id: string;
    label: string;
    type: 'thought' | 'belief' | 'distortion';
    description: string;
    x: number;
    y: number;
}

export interface SandboxScenario {
    id: string;
    titleAr: string;
    titleEn: string;
    icon: string;
    descriptionAr: string;
    descriptionEn: string;
    difficulty: 'easy' | 'medium' | 'hard';
    durationMinutes: number;
    personaAr: string;
    personaEn: string;
}

export interface ViewState {
    type: 'LOGIN' | 'HOME' | 'CHAT' | 'DISCLAIMER' | 'PROFILE' | 'SETTINGS' | 'HELP' | 'BREATHING' | 'GARDEN' | 'DREAM' | 'GROUNDING' | 'BOOKING' | 'SLEEP_TOOL' | 'SUBSCRIPTION' | 'JOURNAL' | 'EMERGENCY_CHAT' | 'FADFADA' | 'ASSESSMENT' | 'PLAN' | 'CBT_CANVAS' | 'SOCIAL_SANDBOX' | 'RELATIONSHIP_HUB' | 'EMPATHY_TRANSLATOR' | 'ATTACHMENT_MAPPER' | 'CO_REGULATOR' | 'MEDIATOR' | 'SLEEP_SANCTUARY';
}

export interface User {
  name: string;
  email: string;
  age: string;
  gender: 'male' | 'female';
  username: string;
  partner?: string;
  registrationDate: string;
  isSubscribed?: boolean;
  pinCode?: string;
  voiceSpeed?: number;
  emergencyContact?: string;
}

export type Language = 'ar' | 'en';
export type ViewStateName = ViewState['type'];
export type Gender = User['gender'];

export interface Question {
  id: string;
  textAr: string;
  textEn: string;
  optionsAr: string[];
  optionsEn: string[];
}

export interface Achievement {
  id: string;
  titleAr: string;
  titleEn: string;
  icon: string;
  unlocked: boolean;
}

export interface MonthlyReport {
  id: string;
  month: string;
  summaryAr: string;
  summaryEn: string;
}

export interface Category {
  id: string;
  icon: string;
  color: string;
}

export interface BookedSession {
  id: string;
  date: Date;
  time: string;
  type: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  categoryId?: string;
}

export interface TherapyPlan {
  category: string;
  severity: string;
  score: number;
}

export interface JournalEntry {
  id: string;
  date: Date | string;
  text: string;
  tags?: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
}

export interface SavedMessage {
  id: string;
  role: Role;
  text: string;
  timestamp: Date;
}

export interface SessionSummary {
  id: string;
  category: string;
  points: string[];
  date: string;
}

export interface Memory {
  id: string;
  content: string;
  tags: string[];
  importance: number;
  timestamp: string;
  embedding?: number[];
}

export interface ClinicalDocument {
  id: string;
  category: string;
  tags: string[];
  contentAr: string;
  contentEn: string;
  source: string;
}
