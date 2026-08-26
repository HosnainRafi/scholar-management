import { ProfessorLead } from '../types';

export interface ReminderInfo {
  status: 'none' | 'pending' | 'due_today' | 'overdue' | 'replied';
  label: string;
  badgeClass: string;
  daysLeft: number | null;
  isOverdue: boolean;
  isDueToday: boolean;
  formattedTargetDate: string | null;
}

export function getDaysDifference(targetDate: Date, baseDate: Date = new Date()): number {
  const diffTime = targetDate.getTime() - baseDate.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function calculateReminderInfo(lead: ProfessorLead): ReminderInfo {
  if (lead.isReplied) {
    return {
      status: 'replied',
      label: 'Replied',
      badgeClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
      daysLeft: null,
      isOverdue: false,
      isDueToday: false,
      formattedTargetDate: null,
    };
  }

  if (!lead.isMailed || !lead.mailedAt) {
    return {
      status: 'none',
      label: '—',
      badgeClass: 'text-slate-300 font-normal',
      daysLeft: null,
      isOverdue: false,
      isDueToday: false,
      formattedTargetDate: null,
    };
  }

  const mailedDate = new Date(lead.mailedAt);
  const reminderDays = lead.reminderDays || 7;
  
  let targetDate: Date;
  if (lead.customReminderDate) {
    targetDate = new Date(lead.customReminderDate);
  } else {
    targetDate = new Date(mailedDate);
    targetDate.setDate(targetDate.getDate() + reminderDays);
  }

  const now = new Date();
  // Strip hours to compare calendar days
  const targetMidnight = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
  const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const daysLeft = Math.round((targetMidnight.getTime() - nowMidnight.getTime()) / (1000 * 60 * 60 * 24));
  const formattedTargetDate = targetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  if (daysLeft < 0) {
    const overdueDays = Math.abs(daysLeft);
    return {
      status: 'overdue',
      label: overdueDays === 1 ? 'Overdue (1 Day)' : `Overdue (${overdueDays} Days)`,
      badgeClass: 'bg-rose-50 text-rose-700 border border-rose-200 font-semibold',
      daysLeft,
      isOverdue: true,
      isDueToday: false,
      formattedTargetDate,
    };
  }

  if (daysLeft === 0) {
    return {
      status: 'due_today',
      label: 'Due Today',
      badgeClass: 'bg-amber-100 text-amber-900 border border-amber-300 font-bold animate-pulse',
      daysLeft: 0,
      isOverdue: false,
      isDueToday: true,
      formattedTargetDate,
    };
  }

  if (daysLeft === 1) {
    return {
      status: 'pending',
      label: 'Tomorrow',
      badgeClass: 'bg-amber-50 text-amber-700 border border-amber-200 font-medium',
      daysLeft: 1,
      isOverdue: false,
      isDueToday: false,
      formattedTargetDate,
    };
  }

  return {
    status: 'pending',
    label: `In ${daysLeft} Days`,
    badgeClass: 'bg-sky-50 text-sky-700 border border-sky-200 font-medium',
    daysLeft,
    isOverdue: false,
    isDueToday: false,
    formattedTargetDate,
  };
}

export function formatTimeAgo(isoString: string | null): string {
  if (!isoString) return 'Never';
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 2) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
