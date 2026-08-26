export interface EmailInteraction {
  id: string;
  type: 'sent' | 'reply' | 'note' | 'followup';
  subject?: string;
  content: string;
  timestamp: string; // ISO string
  templateId?: string;
  sentiment?: 'positive' | 'neutral' | 'negative' | 'declined';
  outcome?: string;
}

export type OutreachStatus = 
  | 'not_started' 
  | 'mailed_pending' 
  | 'reminder_due' 
  | 'followup_sent' 
  | 'replied' 
  | 'meeting_scheduled' 
  | 'accepted' 
  | 'rejected'
  | 'fallback_needed';

export interface ProfessorLead {
  id: string;
  university: string;
  department: string;
  name: string;
  rank: string; // 'Professor' | 'Associate Professor' | etc.
  email: string;
  researchInterest: string;
  officialSource: string;
  additionalInfo: string;
  directEmailStatus: string;
  fallbackOfficeEmail: string;
  fallbackContactUrl: string;
  fallbackPhone: string;
  howToContact: string;
  profileUrl: string;
  researchInfoStatus: string;
  publicationLookupInstructions: string;
  contactReadiness: string;
  researchMethods: string;
  verificationSources: string;
  coverageStatus: string;

  // Outreach tracker fields
  isMailed: boolean;
  mailedAt: string | null;
  isReplied: boolean;
  repliedAt: string | null;
  status: OutreachStatus;
  reminderDays: number; // default 7
  customReminderDate: string | null;
  notes: string;
  tags: string[];
  emailThread: EmailInteraction[];
  rating: number; // 1-5 priority star
  updatedAt: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  category: 'initial' | 'followup' | 'meeting' | 'thanks';
  subject: string;
  body: string;
}

export type ViewFilter = 
  | 'all' 
  | 'with_email' 
  | 'no_email'
  | 'mailed' 
  | 'pending_reply' 
  | 'reminders_due' 
  | 'replied' 
  | 'favorites';
