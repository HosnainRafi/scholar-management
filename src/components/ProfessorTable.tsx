import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Mail, 
  ExternalLink, 
  Copy, 
  Check, 
  Star, 
  Send, 
  MessageSquare, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Filter,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Phone,
  Eye
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ProfessorLead } from '../types';
import { calculateReminderInfo, formatTimeAgo } from '../utils/reminderUtils';

interface ProfessorTableProps {
  leads: ProfessorLead[];
  onUpdateLead: (lead: ProfessorLead) => void;
  onOpenEmailModal: (lead: ProfessorLead) => void;
  onOpenDetailModal: (lead: ProfessorLead) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const ProfessorTable: React.FC<ProfessorTableProps> = ({
  leads,
  onUpdateLead,
  onOpenEmailModal,
  onOpenDetailModal,
  searchQuery,
  setSearchQuery,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Sorting
  const [sortBy, setSortBy] = useState<'default' | 'name' | 'university' | 'status' | 'reminder'>('default');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Copy email to clipboard
  const handleCopyEmail = (e: React.MouseEvent, email: string, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(email);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Toggle Mailed status checkbox
  const handleToggleMailed = (lead: ProfessorLead, e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    const now = new Date().toISOString();

    const updatedThread = [...(lead.emailThread || [])];
    if (isChecked && updatedThread.length === 0) {
      updatedThread.push({
        id: `email-${Date.now()}`,
        type: 'sent',
        subject: 'Initial Outreach Inquiry',
        content: `Contact logged on ${new Date().toLocaleDateString()}`,
        timestamp: now,
      });
    }

    const updated: ProfessorLead = {
      ...lead,
      isMailed: isChecked,
      mailedAt: isChecked ? (lead.mailedAt || now) : null,
      status: isChecked ? (lead.isReplied ? 'replied' : 'mailed_pending') : 'not_started',
      emailThread: updatedThread,
      updatedAt: now,
    };

    onUpdateLead(updated);
  };

  // Toggle Replied status checkbox
  const handleToggleReplied = (lead: ProfessorLead, e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    const now = new Date().toISOString();

    if (isChecked) {
      // Confetti burst for celebrating response!
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#4f46e5', '#10b981', '#38bdf8', '#fbbf24']
      });
    }

    const updatedThread = [...(lead.emailThread || [])];
    if (isChecked) {
      updatedThread.push({
        id: `reply-${Date.now()}`,
        type: 'reply',
        subject: 'Professor Response Logged',
        content: `Response received on ${new Date().toLocaleDateString()}`,
        timestamp: now,
        sentiment: 'positive',
      });
    }

    const updated: ProfessorLead = {
      ...lead,
      isReplied: isChecked,
      repliedAt: isChecked ? (lead.repliedAt || now) : null,
      status: isChecked ? 'replied' : (lead.isMailed ? 'mailed_pending' : 'not_started'),
      emailThread: updatedThread,
      updatedAt: now,
    };

    onUpdateLead(updated);
  };

  // Toggle Favorite Star
  const handleToggleStar = (lead: ProfessorLead, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated: ProfessorLead = {
      ...lead,
      rating: lead.rating > 0 ? 0 : 5,
      updatedAt: new Date().toISOString(),
    };
    onUpdateLead(updated);
  };

  // Filtered & Sorted Leads
  const processedLeads = useMemo(() => {
    let result = [...leads];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(lead => 
        lead.name.toLowerCase().includes(q) ||
        lead.university.toLowerCase().includes(q) ||
        lead.department.toLowerCase().includes(q) ||
        lead.email.toLowerCase().includes(q) ||
        lead.researchInterest.toLowerCase().includes(q) ||
        (lead.notes && lead.notes.toLowerCase().includes(q))
      );
    }

    if (sortBy === 'name') {
      result.sort((a, b) => sortOrder === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));
    } else if (sortBy === 'university') {
      result.sort((a, b) => sortOrder === 'asc' ? a.university.localeCompare(b.university) : b.university.localeCompare(a.university));
    } else if (sortBy === 'reminder') {
      result.sort((a, b) => {
        const infoA = calculateReminderInfo(a);
        const infoB = calculateReminderInfo(b);
        const daysA = infoA.daysLeft ?? 999;
        const daysB = infoB.daysLeft ?? 999;
        return sortOrder === 'asc' ? daysA - daysB : daysB - daysA;
      });
    }

    return result;
  }, [leads, searchQuery, sortBy, sortOrder]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(processedLeads.length / pageSize));
  const paginatedLeads = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedLeads.slice(start, start + pageSize);
  }, [processedLeads, currentPage, pageSize]);

  // Auto reset page if query reduces pages
  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-white border border-slate-200 rounded-xl shadow-xs">
      {/* Top Search & Filter Bar */}
      <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white shrink-0">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search leads by professor name, university, email, research topic..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600 font-bold"
            >
              ×
            </button>
          )}
        </div>

        {/* View Controls & Page Size */}
        <div className="flex items-center space-x-3 text-xs text-slate-500 justify-between sm:justify-end">
          <div className="flex items-center space-x-1.5">
            <span>Show</span>
            <select
              value={pageSize}
              onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
              className="border border-slate-200 rounded-md p-1 bg-slate-50 focus:outline-none text-slate-700 font-medium"
            >
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>per page</span>
          </div>

          <div className="text-slate-400 hidden md:inline">|</div>

          <div className="flex items-center space-x-2 font-medium">
            <span>Sort:</span>
            <button
              onClick={() => {
                if (sortBy === 'university') setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
                else { setSortBy('university'); setSortOrder('asc'); }
              }}
              className={`px-2 py-1 rounded border transition-colors ${
                sortBy === 'university' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}
            >
              Uni {sortBy === 'university' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
            <button
              onClick={() => {
                if (sortBy === 'reminder') setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
                else { setSortBy('reminder'); setSortOrder('asc'); }
              }}
              className={`px-2 py-1 rounded border transition-colors ${
                sortBy === 'reminder' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}
            >
              Reminder {sortBy === 'reminder' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
          </div>
        </div>
      </div>

      {/* Main Table Area */}
      <div className="overflow-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-10">
            <tr className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <th className="px-4 py-3.5 w-10 text-center">★</th>
              <th className="px-5 py-3.5 min-w-[200px]">Faculty Contact</th>
              <th className="px-4 py-3.5 min-w-[170px]">University & Dept</th>
              <th className="px-4 py-3.5 min-w-[220px]">Research Domain</th>
              <th className="px-4 py-3.5 w-24 text-center">Mailed</th>
              <th className="px-4 py-3.5 w-24 text-center">Replied</th>
              <th className="px-4 py-3.5 min-w-[130px]">Last Activity</th>
              <th className="px-4 py-3.5 min-w-[130px]">7-Day Reminder</th>
              <th className="px-5 py-3.5 text-right min-w-[140px]">Outreach Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {paginatedLeads.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-16 text-center text-slate-400">
                  <div className="max-w-xs mx-auto space-y-2">
                    <Mail className="w-8 h-8 mx-auto text-slate-300" />
                    <p className="text-sm font-semibold text-slate-700">No matching professors found</p>
                    <p className="text-xs text-slate-500">Try refining your search query or reset the filter selection.</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedLeads.map(lead => {
                const reminder = calculateReminderInfo(lead);
                const hasEmail = Boolean(lead.email);
                const isOverdue = reminder.isOverdue;

                return (
                  <tr
                    key={lead.id}
                    className={`transition-colors cursor-pointer group ${
                      isOverdue
                        ? 'bg-rose-50/30 hover:bg-rose-50/60'
                        : lead.isReplied
                        ? 'bg-emerald-50/15 hover:bg-emerald-50/40'
                        : 'hover:bg-slate-50/80'
                    }`}
                    onClick={() => onOpenDetailModal(lead)}
                  >
                    {/* Star Priority */}
                    <td className="px-4 py-3 text-center" onClick={e => handleToggleStar(lead, e)}>
                      <Star
                        className={`w-4 h-4 mx-auto transition-transform active:scale-125 ${
                          lead.rating > 0
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-300 hover:text-slate-400'
                        }`}
                      />
                    </td>

                    {/* Faculty Contact Info */}
                    <td className="px-5 py-3">
                      <div className="flex items-center space-x-2">
                        <div className="font-semibold text-slate-900 leading-tight">
                          {lead.name}
                        </div>
                        <span className="text-[10px] px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded font-medium">
                          {lead.rank.includes('Associate') ? 'Assoc. Prof' : 'Professor'}
                        </span>
                      </div>

                      {hasEmail ? (
                        <div className="flex items-center space-x-1.5 mt-1 text-xs text-slate-500">
                          <span className="text-slate-600 font-mono select-all truncate max-w-[200px]" title={lead.email}>
                            {lead.email}
                          </span>
                          <button
                            onClick={e => handleCopyEmail(e, lead.email, lead.id)}
                            className="text-slate-400 hover:text-indigo-600 p-0.5 rounded transition-colors"
                            title="Copy email address"
                          >
                            {copiedId === lead.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      ) : (
                        <div className="mt-1 flex items-center space-x-1 text-[11px] text-amber-700">
                          <span className="bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                            {lead.fallbackOfficeEmail ? `Lab: ${lead.fallbackOfficeEmail}` : 'Office fallback needed'}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* University & Department */}
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-800 text-xs leading-tight">
                        {lead.university}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[200px] mt-0.5" title={lead.department}>
                        {lead.department || 'Graduate School'}
                      </div>
                    </td>

                    {/* Research Interest Preview */}
                    <td className="px-4 py-3">
                      <p 
                        className="text-xs text-slate-600 line-clamp-2 max-w-[280px] leading-relaxed" 
                        title={lead.researchInterest}
                      >
                        {lead.researchInterest || 'Consult official faculty profile for detailed lab projects and topics.'}
                      </p>
                    </td>

                    {/* Mailed Checkbox */}
                    <td className="px-4 py-3 text-center" onClick={e => e.stopPropagation()}>
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={lead.isMailed}
                          onChange={e => handleToggleMailed(lead, e)}
                          className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                      </label>
                    </td>

                    {/* Replied Checkbox */}
                    <td className="px-4 py-3 text-center" onClick={e => e.stopPropagation()}>
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={lead.isReplied}
                          onChange={e => handleToggleReplied(lead, e)}
                          className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        />
                      </label>
                    </td>

                    {/* Last Activity */}
                    <td className="px-4 py-3">
                      {lead.isReplied ? (
                        <div>
                          <div className="text-xs text-emerald-600 font-semibold flex items-center space-x-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Reply Received</span>
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {formatTimeAgo(lead.repliedAt || lead.updatedAt)}
                          </div>
                        </div>
                      ) : lead.isMailed ? (
                        <div>
                          <div className="text-xs text-slate-800 font-medium flex items-center space-x-1">
                            <Send className="w-3 h-3 text-indigo-500" />
                            <span>Outreach Sent</span>
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {formatTimeAgo(lead.mailedAt)}
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs italic text-slate-400">
                          Not started
                        </div>
                      )}
                    </td>

                    {/* 7-Day Reminder */}
                    <td className="px-4 py-3">
                      {reminder.status === 'none' ? (
                        <span className="text-slate-300 text-xs">—</span>
                      ) : (
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider inline-block ${reminder.badgeClass}`}>
                          {reminder.label}
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => onOpenEmailModal(lead)}
                          className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-md text-xs font-semibold flex items-center space-x-1 transition-colors"
                          title="Open Email Composer and Thread History"
                        >
                          <Mail className="w-3 h-3" />
                          <span>{lead.emailThread?.length ? 'Thread' : 'Email'}</span>
                        </button>

                        <button
                          onClick={() => onOpenDetailModal(lead)}
                          className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                          title="View Full Profile Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {lead.profileUrl && (
                          <a
                            href={lead.profileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-colors"
                            title="Open Official University Profile"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer matching Clean Minimalism design */}
      <div className="border-t border-slate-200 p-4 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
        <div className="text-xs text-slate-500">
          Showing <strong className="text-slate-800 font-semibold">{processedLeads.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}</strong> to{' '}
          <strong className="text-slate-800 font-semibold">{Math.min(currentPage * pageSize, processedLeads.length)}</strong> of{' '}
          <strong className="text-slate-800 font-semibold">{processedLeads.length}</strong> faculty leads
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1.5 border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum = i + 1;
            if (totalPages > 5) {
              if (currentPage > 3 && currentPage < totalPages - 1) {
                pageNum = currentPage - 2 + i;
              } else if (currentPage >= totalPages - 1) {
                pageNum = totalPages - 4 + i;
              }
            }

            return (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`px-3 py-1 border rounded-md text-xs font-medium transition-colors ${
                  currentPage === pageNum
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-600 font-bold'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || totalPages === 0}
            className="p-1.5 border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
