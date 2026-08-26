import React from 'react';
import { 
  Users, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Mail, 
  Star, 
  Upload, 
  Building2, 
  GraduationCap, 
  Calendar,
  Sparkles,
  Filter
} from 'lucide-react';
import { ProfessorLead, ViewFilter } from '../types';
import { calculateReminderInfo } from '../utils/reminderUtils';

interface SidebarProps {
  leads: ProfessorLead[];
  activeFilter: ViewFilter;
  setActiveFilter: (filter: ViewFilter) => void;
  selectedUniversity: string;
  setSelectedUniversity: (uni: string) => void;
  selectedRank: string;
  setSelectedRank: (rank: string) => void;
  onOpenUploadModal: () => void;
  onSelectLead: (lead: ProfessorLead) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  leads,
  activeFilter,
  setActiveFilter,
  selectedUniversity,
  setSelectedUniversity,
  selectedRank,
  setSelectedRank,
  onOpenUploadModal,
  onSelectLead,
}) => {
  // Compute counts
  const totalCount = leads.length;
  const withEmailCount = leads.filter(l => Boolean(l.email)).length;
  const mailedCount = leads.filter(l => l.isMailed).length;
  const pendingReplyCount = leads.filter(l => l.isMailed && !l.isReplied).length;
  const repliedCount = leads.filter(l => l.isReplied).length;
  const favoritesCount = leads.filter(l => (l.rating || 0) > 0).length;

  const remindersDueLeads = leads.filter(l => {
    if (!l.isMailed || l.isReplied) return false;
    const info = calculateReminderInfo(l);
    return info.isOverdue || info.isDueToday;
  });
  const remindersDueCount = remindersDueLeads.length;

  // Universities list
  const universityMap = React.useMemo(() => {
    const map = new Map<string, number>();
    leads.forEach(l => {
      const u = l.university || 'Other';
      map.set(u, (map.get(u) || 0) + 1);
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [leads]);

  // Find next upcoming reminder
  const nextReminder = React.useMemo(() => {
    const mailedPending = leads.filter(l => l.isMailed && !l.isReplied && l.mailedAt);
    if (mailedPending.length === 0) return null;

    let nearestLead: ProfessorLead | null = null;
    let minDaysLeft = Infinity;

    mailedPending.forEach(l => {
      const info = calculateReminderInfo(l);
      if (info.daysLeft !== null && info.daysLeft < minDaysLeft) {
        minDaysLeft = info.daysLeft;
        nearestLead = l;
      }
    });

    return nearestLead ? { lead: nearestLead, info: calculateReminderInfo(nearestLead) } : null;
  }, [leads]);

  return (
    <aside className="w-68 bg-white border-r border-slate-200 p-5 flex flex-col shrink-0 overflow-y-auto select-none h-full">
      {/* Data Source Card */}
      <div className="mb-6">
        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 block">
          Active Dataset
        </label>
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
          <div className="flex items-center justify-center space-x-1.5 text-slate-700 font-medium text-xs">
            <Building2 className="w-3.5 h-3.5 text-indigo-600" />
            <span className="truncate">Japanese Universities CS/EE</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            <strong className="text-slate-800 font-semibold">{totalCount}</strong> Faculty Members Loaded
          </p>
          <button
            onClick={onOpenUploadModal}
            className="mt-2.5 w-full py-1 px-2 text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 bg-white border border-indigo-200 rounded hover:bg-indigo-50 transition-colors flex items-center justify-center space-x-1"
          >
            <Upload className="w-3 h-3" />
            <span>Upload New CSV / XLSX</span>
          </button>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="mb-6">
        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 block">
          Quick Filters
        </label>
        <nav className="space-y-1">
          <button
            onClick={() => setActiveFilter('all')}
            className={`w-full flex items-center justify-between p-2 rounded-lg text-xs font-medium transition-colors ${
              activeFilter === 'all'
                ? 'bg-indigo-50 text-indigo-700 font-semibold'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Users className="w-3.5 h-3.5" />
              <span>All Leads</span>
            </div>
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
              activeFilter === 'all' ? 'bg-indigo-200/70 text-indigo-800' : 'bg-slate-100 text-slate-600'
            }`}>
              {totalCount}
            </span>
          </button>

          <button
            onClick={() => setActiveFilter('with_email')}
            className={`w-full flex items-center justify-between p-2 rounded-lg text-xs font-medium transition-colors ${
              activeFilter === 'with_email'
                ? 'bg-indigo-50 text-indigo-700 font-semibold'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Mail className="w-3.5 h-3.5 text-blue-500" />
              <span>Direct Email Available</span>
            </div>
            <span className="bg-blue-50 text-blue-700 border border-blue-100 px-1.5 py-0.5 rounded text-[10px] font-bold">
              {withEmailCount}
            </span>
          </button>

          <button
            onClick={() => setActiveFilter('pending_reply')}
            className={`w-full flex items-center justify-between p-2 rounded-lg text-xs font-medium transition-colors ${
              activeFilter === 'pending_reply'
                ? 'bg-indigo-50 text-indigo-700 font-semibold'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>Pending Reply</span>
            </div>
            <span className="bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded text-[10px] font-bold">
              {pendingReplyCount}
            </span>
          </button>

          <button
            onClick={() => setActiveFilter('reminders_due')}
            className={`w-full flex items-center justify-between p-2 rounded-lg text-xs font-medium transition-colors ${
              activeFilter === 'reminders_due'
                ? 'bg-rose-50 text-rose-700 font-semibold'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
              <span>7-Day Reminders (Due)</span>
            </div>
            <span className="bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded text-[10px] font-bold">
              {remindersDueCount}
            </span>
          </button>

          <button
            onClick={() => setActiveFilter('replied')}
            className={`w-full flex items-center justify-between p-2 rounded-lg text-xs font-medium transition-colors ${
              activeFilter === 'replied'
                ? 'bg-emerald-50 text-emerald-700 font-semibold'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Replied</span>
            </div>
            <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded text-[10px] font-bold">
              {repliedCount}
            </span>
          </button>

          <button
            onClick={() => setActiveFilter('favorites')}
            className={`w-full flex items-center justify-between p-2 rounded-lg text-xs font-medium transition-colors ${
              activeFilter === 'favorites'
                ? 'bg-amber-50 text-amber-800 font-semibold'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
              <span>Starred Priority</span>
            </div>
            <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px] font-bold">
              {favoritesCount}
            </span>
          </button>
        </nav>
      </div>

      {/* University & Academic Filter */}
      <div className="mb-6 space-y-3">
        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
          Filter by University
        </label>
        <select
          value={selectedUniversity}
          onChange={e => setSelectedUniversity(e.target.value)}
          className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="ALL">All Universities ({universityMap.length})</option>
          {universityMap.map(([uni, count]) => (
            <option key={uni} value={uni}>
              {uni} ({count})
            </option>
          ))}
        </select>

        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block pt-1">
          Filter by Academic Rank
        </label>
        <select
          value={selectedRank}
          onChange={e => setSelectedRank(e.target.value)}
          className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="ALL">All Academic Ranks</option>
          <option value="Professor">Professor</option>
          <option value="Associate Professor">Associate Professor</option>
        </select>
      </div>

      {/* Next Reminder Box */}
      <div className="mt-auto pt-4">
        {nextReminder ? (
          <div 
            onClick={() => onSelectLead(nextReminder.lead)}
            className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Next Follow-Up
              </span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                nextReminder.info.isOverdue 
                  ? 'bg-rose-100 text-rose-700' 
                  : nextReminder.info.isDueToday 
                    ? 'bg-amber-100 text-amber-800 animate-pulse' 
                    : 'bg-indigo-100 text-indigo-700'
              }`}>
                {nextReminder.info.label}
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-900 truncate">
              Prof. {nextReminder.lead.name}
            </p>
            <p className="text-[11px] text-slate-500 truncate">
              {nextReminder.lead.university}
            </p>
          </div>
        ) : (
          <div className="p-3.5 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center">
            <p className="text-[10px] text-slate-400 uppercase font-semibold">No Pending Reminders</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Check off "Mailed" on any professor to start 7-day tracking.</p>
          </div>
        )}
      </div>
    </aside>
  );
};
