
export enum Role {
  USER = 'user',
  MODEL = 'model',
  PARTNER = 'partner'
}

export interface Message {
  id: string;
  role: Role;
  text: string;
  timestamp: Date;
  senderName?: string;
}

export type Gender = 'male' | 'female';
export type OutputMode = 'text' | 'audio';

export interface User {
  id: string; 
  name: string;
  childName?: string;
  childAge?: string;
  childCondition?: 'ASD' | 'ADHD';
  email: string;
  age: string;
  gender: Gender;
  username: string;
  registrationDate: string;
  isSubscribed?: boolean;
  partnerId?: string;
  partnerName?: string;
  pendingInviteFrom?: string;
  pin?: string;
  preferredOutput?: OutputMode;
}

export type Language = 'ar' | 'en';

export type TherapyCategory = 
  | 'DEPRESSION' 
  | 'ANXIETY' 
  | 'OCD' 
  | 'BIPOLAR' 
  | 'SOCIAL_PHOBIA';

export type ViewStateName = 
  | 'LOGIN' 
  | 'HOME' 
  | 'THERAPY' 
  | 'FADFADA' 
  | 'DREAM' 
  | 'RELATIONSHIPS' 
  | 'JOINT_SESSION'
  | 'PARTNER_MANAGER' 
  | 'SLEEP' 
  | 'STORYTELLING'
  | 'CONFRONTATION' 
  | 'DISTINCT_MINDS'
  | 'AUTISM'
  | 'ADHD'
  | 'SETTINGS' 
  | 'PROFILE'
  | 'ROUTINE_HERO'
  | 'BREATHING'
  | 'MEDIATOR'
  | 'EMPATHY_TRANSLATOR'
  | 'ATTACHMENT_MAPPER'
  | 'SOCIAL_SANDBOX';

export interface Category {
  id: ViewStateName;
  icon: string;
  color: string;
}

export interface CaseReportData {
  summary: string;
  behavioralGoals: string[];
  practicalSteps: string[];
  primaryStrategy: string;
  nextSessionFocus: string;
  timestamp: string;
  category: string;
}

export interface MonthlyClinicalReport {
  id: string;
  month: string;
  conditionSummary: string;
  progressAchieved: string;
  attentionRequired: string;
  homeRecommendations: string[];
  schoolStrategies: string[];
  timestamp: string;
  type: 'MONTHLY';
  category?: string;
}

export interface SessionSummary {
  id: string;
  category: string;
  date: string;
  observations: string[];
  symptoms: string[];
  recommendations: string[];
  type: 'SESSION';
}

export interface BookedSession {
  id: string;
  date: Date | string;
  time: string;
  type: 'ai_guided' | 'human';
  status: 'upcoming' | 'completed';
  categoryId?: string;
}

export interface Question {
  id: string;
  textAr: string;
  textEn: string;
  optionsAr: string[];
  optionsEn: string[];
}

export interface JournalEntry {
  id: string;
  date: Date;
  text: string;
  tags: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
}

export interface AppNotification {
  id: string;
  type: 'insight' | 'garden' | 'routine' | 'sensory' | 'achievement' | 'alert' | 'generic';
  titleAr: string;
  titleEn: string;
  bodyAr: string;
  bodyEn: string;
  timestamp: Date;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  actionView?: ViewStateName;
}

export interface ClinicalDocument {
  id: string;
  category: string;
  tags: string[];
  contentAr: string;
  contentEn: string;
  source: string;
}

export interface Memory {
  id: string;
  content: string;
  tags: string[];
  importance: number;
  timestamp: string;
  embedding?: number[];
}

export interface CognitiveNode {
  id: string;
  x: number;
  y: number;
  label: string;
  type: 'thought' | 'distortion' | 'belief';
  description: string;
}

export interface SandboxScenario {
  id: string;
  titleAr: string;
  titleEn: string;
  personaAr: string;
  personaEn: string;
  descriptionAr: string;
  descriptionEn: string;
  icon: string;
}
