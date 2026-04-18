export type FiveElement = 'wood' | 'fire' | 'earth' | 'metal' | 'water';

export interface UserProfile {
  id: string;
  name: string;
  birthDate: string;
  gender: 'male' | 'female' | 'other';
  dominantElement: FiveElement;
  weakElement: FiveElement;
  riskPreference: 'low' | 'medium' | 'high';
  investmentPreference: string;
}

export interface MoodLog {
  id: string;
  date: string;
  score: number;
  tags: string[];
  note: string;
}

export interface InvestmentLog {
  id: string;
  date: string;
  pnl: number;
  pnlRate: number;
  positionRatio: number;
  strategy: string;
  note: string;
}

export interface DailyAnalysis {
  date: string;
  dominantElement: FiveElement;
  weakestElement: FiveElement;
  scores: Record<FiveElement, number>;
  moodInsight: string;
  investmentInsight: string;
  recommendations: {
    mood: string[];
    investment: string[];
    activities: string[];
    cautions: string[];
  };
}

export interface DailyReport {
  date: string;
  moodSummary: string;
  investmentSummary: string;
  fiveElementSummary: string;
  improvementSuggestions: string[];
  nextDayStrategy: string[];
  activities: string[];
  cautions: string[];
}

export interface OverviewResponse {
  profile: UserProfile;
  mood?: MoodLog;
  investment?: InvestmentLog;
  analysis: DailyAnalysis;
  report: DailyReport;
}

