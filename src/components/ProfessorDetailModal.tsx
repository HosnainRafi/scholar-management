import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  ExternalLink, 
  Phone, 
  Building, 
  BookOpen, 
  Send, 
  CheckCircle2, 
  Calendar, 
  Star, 
  Tag, 
  FileText, 
  Save, 
  Globe, 
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { ProfessorLead } from '../types';
import { calculateReminderInfo } from '../utils/reminderUtils';

interface ProfessorDetailModalProps {
  lead: ProfessorLead | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateLead: (lead: ProfessorLead) => void;
  onOpenEmailModal: (lead: ProfessorLead) => void;
}

export const ProfessorDetailModal: React.FC<ProfessorDetailModalProps> = ({
  lead,
  isOpen,
  onClose,
  onUpdateLead,
  onOpenEmailModal,
}) => {
  if (!isOpen || !lead) return null;

  const [notes, setNotes] = useState(lead.notes || '');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(lead.tags || []);
  const [reminderDays, setReminderDays] = useState(lead.reminderDays || 7);
  const [customReminderDate, setCustomReminderDate] = useState(
    lead.customReminderDate ? lead.customReminderDate.slice(0, 10) : ''
  );
  const [isSaved, setIsSaved] = useState(false);

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tToRemove: string) => {
    setTags(tags.filter(t => t !== tToRemove));
  };

  const handleSaveDetails = () => {
    const updated: ProfessorLead = {
      ...lead,
      notes,
      tags,
      reminderDays: Number(reminderDays),
      customReminderDate: customReminderDate ? new Date(customReminderDate).toISOString() : null,
      updatedAt: new Date().toISOString(),
    };
    onUpdateLead(updated);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const reminder = calculateReminderInfo(lead);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80 shrink-0">
          <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs sm:text-sm shrink-0">
              {lead.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-1.5 sm:space-x-2 flex-wrap gap-y-1">
                <h3 className="font-bold text-slate-900 text-sm sm:text-base truncate">{lead.name}</h3>
                <span className="text-[10px] sm:text-xs px-1.5 py-0.5 bg-indigo-50 text-indigo-700 font-medium rounded border border-indigo-100">
                  {lead.rank}
                </span>
                <span className={`text-[10px] sm:text-xs px-1.5 py-0.5 rounded font-bold uppercase ${reminder.badgeClass}`}>
                  {reminder.label}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 truncate">{lead.university} • {lead.department}</p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            <button
              onClick={() => {
                onClose();
                onOpenEmailModal(lead);
              }}
              className="px-2.5 py-1.5 sm:px-3 sm:py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1 sm:space-x-1.5 transition-colors shadow-2xs"
            >
              <Mail className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Email</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-xs text-slate-700">
          {/* Research Interest Highlighting */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center space-x-1.5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              <span>Research Focus & Laboratory Interests</span>
            </h4>
            <p className="text-slate-800 leading-relaxed font-sans">
              {lead.researchInterest || 'No specific research keywords listed in initial catalog.'}
            </p>
            {lead.researchMethods && lead.researchMethods !== 'See the official research themes/profile for methods and current projects.' && (
              <div className="mt-2 pt-2 border-t border-slate-200 text-slate-600">
                <span className="font-semibold text-slate-700">Methods / Approach: </span>
                {lead.researchMethods}
              </div>
            )}
          </div>

          {/* Contact Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Primary Contact Information
              </span>
              <div className="space-y-1.5">
                <div>
                  <span className="text-slate-400 block text-[10px]">Direct Email:</span>
                  {lead.email ? (
                    <a href={`mailto:${lead.email}`} className="text-indigo-600 font-mono font-medium hover:underline">
                      {lead.email}
                    </a>
                  ) : (
                    <span className="text-slate-400 italic">Direct email not listed</span>
                  )}
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px]">Email Status:</span>
                  <span className="text-slate-700 font-medium">{lead.directEmailStatus || 'Standard verification'}</span>
                </div>

                {lead.fallbackOfficeEmail && (
                  <div>
                    <span className="text-slate-400 block text-[10px]">Fallback Lab / Office Email:</span>
                    <a href={`mailto:${lead.fallbackOfficeEmail}`} className="text-slate-700 font-mono hover:text-indigo-600">
                      {lead.fallbackOfficeEmail}
                    </a>
                  </div>
                )}

                {lead.fallbackPhone && (
                  <div>
                    <span className="text-slate-400 block text-[10px]">Phone Contact:</span>
                    <span className="text-slate-700 font-mono">{lead.fallbackPhone}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Official Links & Guidelines
              </span>
              <div className="space-y-2">
                {lead.profileUrl && (
                  <div>
                    <a
                      href={lead.profileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1.5 text-indigo-600 font-semibold hover:underline"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>Open Official Researchmap / Lab Profile</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}

                {lead.officialSource && (
                  <div>
                    <span className="text-slate-400 block text-[10px]">Source Directory:</span>
                    <a
                      href={lead.officialSource}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-600 truncate block hover:text-indigo-600"
                    >
                      {lead.officialSource}
                    </a>
                  </div>
                )}

                {lead.howToContact && (
                  <div className="bg-amber-50/60 p-2 rounded-lg border border-amber-100 text-[11px] text-amber-900">
                    <span className="font-bold block text-[10px] uppercase">Outreach Note:</span>
                    {lead.howToContact}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Reminder Configuration */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-600" />
              <span>7-Day Follow-Up Reminder Settings</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Reminder Interval (Days)
                </label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={reminderDays}
                  onChange={e => setReminderDays(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded p-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Custom Reminder Date (Overrides Days)
                </label>
                <input
                  type="date"
                  value={customReminderDate}
                  onChange={e => setCustomReminderDate(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded p-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Tags & Custom Notes */}
          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Tags & Categories
              </label>
              <div className="flex flex-wrap items-center gap-1.5 mb-2">
                {tags.map(t => (
                  <span
                    key={t}
                    className="inline-flex items-center space-x-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-md text-xs font-medium border border-indigo-100"
                  >
                    <span>{t}</span>
                    <button
                      onClick={() => handleRemoveTag(t)}
                      className="hover:text-rose-600 ml-1 font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Type tag (e.g. 'High Priority', 'MEXT Candidate') and press Enter..."
                className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Personal Notes & Laboratory Insights
              </label>
              <textarea
                rows={4}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Add notes about professor's papers, interview discussion, response vibes, or key requirements..."
                className="w-full bg-white border border-slate-200 rounded-lg p-3 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-400">
            Last modified: {new Date(lead.updatedAt).toLocaleDateString()}
          </span>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-medium"
            >
              Close
            </button>
            <button
              onClick={handleSaveDetails}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 shadow-xs transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaved ? 'Saved!' : 'Save Changes'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
