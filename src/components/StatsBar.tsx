import React, { useState } from 'react';
import { Mail, Clock, AlertCircle, CheckCircle2, Award, Percent, Send, ChevronDown, ChevronUp } from 'lucide-react';
import { ProfessorLead } from '../types';
import { calculateReminderInfo } from '../utils/reminderUtils';

interface StatsBarProps {
  leads: ProfessorLead[];
  onFilterClick?: (filter: any) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const StatsBar: React.FC<StatsBarProps> = ({ 
  leads, 
  onFilterClick,
  isCollapsed = false,
  onToggleCollapse
}) => {
  const total = leads.length;
  const withEmail = leads.filter(l => Boolean(l.email)).length;
  const mailed = leads.filter(l => l.isMailed).length;
  const replied = leads.filter(l => l.isReplied).length;
  const awaitingReply = leads.filter(l => l.isMailed && !l.isReplied).length;

  const overdue = leads.filter(l => {
    if (!l.isMailed || l.isReplied) return false;
    const info = calculateReminderInfo(l);
    return info.isOverdue || info.isDueToday;
  }).length;

  const responseRate = mailed > 0 ? Math.round((replied / mailed) * 100) : 0;

  if (isCollapsed) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl px-4 py-2 mb-3 shadow-2xs flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-4 text-xs overflow-x-auto py-0.5">
          <button 
            onClick={() => onFilterClick && onFilterClick('all')}
            className="flex items-center space-x-1.5 text-slate-600 hover:text-slate-900 font-medium"
          >
            <span className="text-slate-400">Total:</span>
            <span className="font-bold text-slate-900">{total}</span>
          </button>
          <span className="text-slate-300">•</span>
          <button 
            onClick={() => onFilterClick && onFilterClick('mailed')}
            className="flex items-center space-x-1.5 text-indigo-600 hover:text-indigo-800 font-medium"
          >
            <span>Mailed:</span>
            <span className="font-bold">{mailed}</span>
          </button>
          <span className="text-slate-300">•</span>
          <button 
            onClick={() => onFilterClick && onFilterClick('pending_reply')}
            className="flex items-center space-x-1.5 text-amber-600 hover:text-amber-800 font-medium"
          >
            <span>Awaiting Reply:</span>
            <span className="font-bold">{awaitingReply}</span>
          </button>
          <span className="text-slate-300">•</span>
          <button 
            onClick={() => onFilterClick && onFilterClick('reminders_due')}
            className={`flex items-center space-x-1.5 font-medium ${overdue > 0 ? 'text-rose-600 font-bold' : 'text-slate-600'}`}
          >
            <span>7-Day Overdue:</span>
            <span className="font-bold">{overdue}</span>
          </button>
          <span className="text-slate-300">•</span>
          <button 
            onClick={() => onFilterClick && onFilterClick('replied')}
            className="flex items-center space-x-1.5 text-emerald-600 hover:text-emerald-800 font-medium"
          >
            <span>Replies:</span>
            <span className="font-bold">{replied}</span>
          </button>
          <span className="text-slate-300">•</span>
          <div className="flex items-center space-x-1.5 text-slate-600">
            <span>Response Rate:</span>
            <span className="font-bold text-slate-900">{responseRate}%</span>
          </div>
        </div>

        {onToggleCollapse && (
          <button 
            onClick={onToggleCollapse}
            className="text-xs text-slate-400 hover:text-slate-700 flex items-center space-x-1 px-2 py-1 rounded hover:bg-slate-50 transition-colors"
            title="Expand stats summary"
          >
            <span>Show Stats Cards</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="mb-4 shrink-0">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {/* 1. Total Faculty */}
        <div 
          onClick={() => onFilterClick && onFilterClick('all')}
          className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs hover:border-slate-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Total Faculty
            </span>
            <div className="w-5 h-5 rounded bg-slate-100 flex items-center justify-center text-slate-600">
              <Award className="w-3 h-3" />
            </div>
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-lg font-bold text-slate-900">{total}</span>
            <span className="text-[10px] text-slate-500 font-medium">{withEmail} direct</span>
          </div>
        </div>

        {/* 2. Emails Sent */}
        <div 
          onClick={() => onFilterClick && onFilterClick('mailed')}
          className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs hover:border-slate-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Mailed (Contacted)
            </span>
            <div className="w-5 h-5 rounded bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Send className="w-3 h-3" />
            </div>
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-lg font-bold text-indigo-600">{mailed}</span>
            <span className="text-[10px] text-indigo-500 font-medium">
              {total > 0 ? Math.round((mailed / total) * 100) : 0}% list
            </span>
          </div>
        </div>

        {/* 3. Awaiting Reply */}
        <div 
          onClick={() => onFilterClick && onFilterClick('pending_reply')}
          className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs hover:border-slate-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Awaiting Reply
            </span>
            <div className="w-5 h-5 rounded bg-amber-50 flex items-center justify-center text-amber-600">
              <Clock className="w-3 h-3" />
            </div>
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-lg font-bold text-amber-600">{awaitingReply}</span>
            <span className="text-[10px] text-amber-600 font-medium">in window</span>
          </div>
        </div>

        {/* 4. 7-Day Overdue Reminders */}
        <div 
          onClick={() => onFilterClick && onFilterClick('reminders_due')}
          className={`bg-white border rounded-xl p-3 shadow-2xs transition-all cursor-pointer ${
            overdue > 0 ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-semibold uppercase tracking-wider ${overdue > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
              7-Day Overdue
            </span>
            <div className={`w-5 h-5 rounded flex items-center justify-center ${overdue > 0 ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-500'}`}>
              <AlertCircle className="w-3 h-3" />
            </div>
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className={`text-lg font-bold ${overdue > 0 ? 'text-rose-600' : 'text-slate-900'}`}>{overdue}</span>
            <span className={`text-[10px] font-medium ${overdue > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
              {overdue > 0 ? 'Action needed' : 'All clear'}
            </span>
          </div>
        </div>

        {/* 5. Replies Received */}
        <div 
          onClick={() => onFilterClick && onFilterClick('replied')}
          className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs hover:border-slate-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Replies Received
            </span>
            <div className="w-5 h-5 rounded bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-3 h-3" />
            </div>
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-lg font-bold text-emerald-600">{replied}</span>
            <span className="text-[10px] text-emerald-600 font-medium">responded</span>
          </div>
        </div>

        {/* 6. Conversion Rate */}
        <div 
          onClick={() => onFilterClick && onFilterClick('all')}
          className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs hover:border-slate-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Response Rate
            </span>
            <div className="w-5 h-5 rounded bg-slate-100 flex items-center justify-center text-slate-600">
              <Percent className="w-3 h-3" />
            </div>
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-lg font-bold text-slate-900">{responseRate}%</span>
            <span className="text-[10px] text-slate-400 font-medium">{replied}/{mailed}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
