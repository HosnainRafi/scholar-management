import React, { useState } from 'react';
import { 
  X, 
  Send, 
  Copy, 
  Check, 
  ExternalLink, 
  Clock, 
  Calendar, 
  MessageSquare, 
  CheckCircle2, 
  Sparkles,
  AlertCircle,
  FileText,
  User,
  Building,
  RefreshCw,
  Plus
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ProfessorLead, EmailTemplate, EmailInteraction } from '../types';
import { DEFAULT_TEMPLATES } from '../data/defaultTemplates';
import { calculateReminderInfo } from '../utils/reminderUtils';

interface EmailModalProps {
  lead: ProfessorLead | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateLead: (lead: ProfessorLead) => void;
  templates?: EmailTemplate[];
}

export const EmailModal: React.FC<EmailModalProps> = ({
  lead,
  isOpen,
  onClose,
  onUpdateLead,
  templates = DEFAULT_TEMPLATES,
}) => {
  if (!isOpen || !lead) return null;

  const [activeSubTab, setActiveSubTab] = useState<'composer' | 'thread' | 'log_reply'>('composer');
  const safeTemplates = Array.isArray(templates) && templates.length > 0 ? templates : DEFAULT_TEMPLATES;
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(safeTemplates[0]?.id || 'initial-1');
  const [senderName, setSenderName] = useState<string>(() => {
    try {
      return localStorage.getItem('outreach_sender_name') || '';
    } catch {
      return '';
    }
  });
  const [copiedBody, setCopiedBody] = useState(false);

  // Editable email state
  const selectedTemplate = safeTemplates.find(t => t.id === selectedTemplateId) || safeTemplates[0] || DEFAULT_TEMPLATES[0];

  const fillTemplate = React.useCallback((text: string = '') => {
    if (!text) return '';
    return text
      .replace(/{Name}/g, lead?.name || '')
      .replace(/{University}/g, lead?.university || '')
      .replace(/{Department}/g, lead?.department || 'the Department')
      .replace(/{ResearchInterest}/g, lead?.researchInterest?.split(';')[0]?.slice(0, 75) || 'your research field')
      .replace(/\[Your Name\]/g, senderName.trim() || '[Your Name]');
  }, [lead, senderName]);

  const [emailSubject, setEmailSubject] = useState<string>(() => fillTemplate(selectedTemplate?.subject || ''));
  const [emailBody, setEmailBody] = useState<string>(() => fillTemplate(selectedTemplate?.body || ''));

  // Update subject and body when lead or template changes
  React.useEffect(() => {
    if (selectedTemplate) {
      setEmailSubject(fillTemplate(selectedTemplate.subject || ''));
      setEmailBody(fillTemplate(selectedTemplate.body || ''));
    }
  }, [lead?.id, selectedTemplateId, fillTemplate, selectedTemplate]);


  // Log Reply Form state
  const [replySummary, setReplySummary] = useState('');
  const [replySentiment, setReplySentiment] = useState<'positive' | 'neutral' | 'negative' | 'declined'>('positive');
  const [replyDate, setReplyDate] = useState(() => new Date().toISOString().slice(0, 10));

  // When template changes, update fields
  const handleTemplateChange = (tplId: string) => {
    setSelectedTemplateId(tplId);
    const tpl = templates.find(t => t.id === tplId);
    if (tpl) {
      setEmailSubject(fillTemplate(tpl.subject));
      setEmailBody(fillTemplate(tpl.body));
    }
  };

  const handleSenderNameChange = (name: string) => {
    setSenderName(name);
    localStorage.setItem('outreach_sender_name', name);
  };

  // Generate Mailto URL
  const mailtoUrl = React.useMemo(() => {
    const to = lead.email || lead.fallbackOfficeEmail || '';
    const encodedSubject = encodeURIComponent(emailSubject);
    const encodedBody = encodeURIComponent(emailBody);
    return `mailto:${to}?subject=${encodedSubject}&body=${encodedBody}`;
  }, [lead, emailSubject, emailBody]);

  // Log outgoing mail action
  const handleLogSentMail = () => {
    const now = new Date().toISOString();
    const newInteraction: EmailInteraction = {
      id: `sent-${Date.now()}`,
      type: selectedTemplate?.category === 'followup' ? 'followup' : 'sent',
      subject: emailSubject,
      content: emailBody,
      timestamp: now,
      templateId: selectedTemplateId,
    };

    const updatedThread = [newInteraction, ...(lead.emailThread || [])];

    const updated: ProfessorLead = {
      ...lead,
      isMailed: true,
      mailedAt: lead.mailedAt || now,
      status: selectedTemplate?.category === 'followup' ? 'followup_sent' : 'mailed_pending',
      emailThread: updatedThread,
      updatedAt: now,
    };

    onUpdateLead(updated);
    setActiveSubTab('thread');
  };

  // Log incoming reply action
  const handleSaveReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replySummary.trim()) return;

    const now = new Date().toISOString();
    const newInteraction: EmailInteraction = {
      id: `reply-${Date.now()}`,
      type: 'reply',
      subject: `Reply from Prof. ${lead.name}`,
      content: replySummary.trim(),
      timestamp: replyDate ? new Date(replyDate).toISOString() : now,
      sentiment: replySentiment,
    };

    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 }
    });

    const updatedThread = [newInteraction, ...(lead.emailThread || [])];

    const updated: ProfessorLead = {
      ...lead,
      isReplied: true,
      repliedAt: replyDate ? new Date(replyDate).toISOString() : now,
      status: replySentiment === 'positive' ? 'meeting_scheduled' : (replySentiment === 'declined' ? 'rejected' : 'replied'),
      emailThread: updatedThread,
      updatedAt: now,
    };

    onUpdateLead(updated);
    setReplySummary('');
    setActiveSubTab('thread');
  };

  // Reminder status
  const reminderInfo = calculateReminderInfo(lead);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70 shrink-0">
          <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs sm:text-sm shadow-xs shrink-0">
              {lead.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-1.5 sm:space-x-2 flex-wrap gap-y-1">
                <h3 className="font-bold text-slate-900 text-sm sm:text-base truncate">
                  {lead.name}
                </h3>
                <span className="text-[10px] sm:text-xs px-1.5 py-0.5 bg-indigo-50 text-indigo-700 font-medium rounded border border-indigo-100">
                  {lead.rank}
                </span>
                <span className={`text-[10px] sm:text-xs px-1.5 py-0.5 rounded font-bold uppercase ${reminderInfo.badgeClass}`}>
                  {reminderInfo.label}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 truncate">
                {lead.university} • {lead.department || 'Graduate School'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-3 sm:px-6 border-b border-slate-200 flex space-x-3 sm:space-x-6 text-xs font-semibold bg-white shrink-0 overflow-x-auto scrollbar-none whitespace-nowrap">
          <button
            onClick={() => setActiveSubTab('composer')}
            className={`py-3 border-b-2 flex items-center space-x-1.5 transition-colors cursor-pointer shrink-0 ${
              activeSubTab === 'composer'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Compose & Send</span>
          </button>

          <button
            onClick={() => setActiveSubTab('thread')}
            className={`py-3 border-b-2 flex items-center space-x-1.5 transition-colors cursor-pointer shrink-0 ${
              activeSubTab === 'thread'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Thread ({lead.emailThread?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('log_reply')}
            className={`py-3 border-b-2 flex items-center space-x-1.5 transition-colors cursor-pointer shrink-0 ${
              activeSubTab === 'log_reply'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Log Reply</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {activeSubTab === 'composer' && (
            <div className="space-y-4">
              {/* Recipient & Sender metadata */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    To (Recipient Email)
                  </label>
                  <div className="flex items-center space-x-1 font-mono font-medium text-slate-800">
                    <span className="truncate">{lead.email || lead.fallbackOfficeEmail || 'No direct email'}</span>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Your Name (For Placeholder)
                  </label>
                  <input
                    type="text"
                    value={senderName}
                    onChange={e => handleSenderNameChange(e.target.value)}
                    placeholder="Enter your name..."
                    className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Select Outreach Template
                  </label>
                  <select
                    value={selectedTemplateId}
                    onChange={e => handleTemplateChange(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  >
                    {templates.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Subject Line */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Email Subject
                </label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={e => setEmailSubject(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-xs bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none font-medium text-slate-800"
                />
              </div>

              {/* Body */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Email Message Content
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Auto-personalized with professor research interests
                  </span>
                </div>
                <textarea
                  rows={11}
                  value={emailBody}
                  onChange={e => setEmailBody(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-3 text-xs bg-white font-mono focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none leading-relaxed text-slate-800"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center space-x-2">
                  <a
                    href={mailtoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-2 shadow-xs transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open in Default Mail Client (Gmail / Outlook)</span>
                  </a>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(emailBody);
                      setCopiedBody(true);
                      setTimeout(() => setCopiedBody(false), 2000);
                    }}
                    className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-colors"
                  >
                    {copiedBody ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedBody ? 'Copied Body!' : 'Copy Text'}</span>
                  </button>
                </div>

                <button
                  onClick={handleLogSentMail}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Mark Emailed & Start 7-Day Reminder</span>
                </button>
              </div>
            </div>
          )}

          {activeSubTab === 'thread' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Outreach Activity Timeline
                </h4>
                <button
                  onClick={() => setActiveSubTab('log_reply')}
                  className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-medium flex items-center space-x-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log New Reply / Follow-Up</span>
                </button>
              </div>

              {!lead.emailThread || lead.emailThread.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-700">No interaction records yet</p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Send an email via the composer or log previous outreach to begin tracking.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {lead.emailThread.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className={`p-4 rounded-xl border transition-all ${
                        item.type === 'reply'
                          ? 'bg-emerald-50/40 border-emerald-200'
                          : item.type === 'followup'
                          ? 'bg-amber-50/40 border-amber-200'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                            item.type === 'reply'
                              ? 'bg-emerald-100 text-emerald-800'
                              : item.type === 'followup'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-indigo-100 text-indigo-800'
                          }`}>
                            {item.type}
                          </span>
                          <span className="text-xs font-bold text-slate-900">
                            {item.subject || 'Outreach Note'}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400">
                          {new Date(item.timestamp).toLocaleString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric',
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">
                        {item.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeSubTab === 'log_reply' && (
            <form onSubmit={handleSaveReply} className="space-y-4">
              <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-xl text-xs text-emerald-900">
                <strong>Record Professor Response:</strong> This updates the professor's status to <em>Replied</em> and stops pending follow-up countdowns.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Response Date
                  </label>
                  <input
                    type="date"
                    value={replyDate}
                    onChange={e => setReplyDate(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Response Sentiment / Outcome
                  </label>
                  <select
                    value={replySentiment}
                    onChange={e => setReplySentiment(e.target.value as any)}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                  >
                    <option value="positive">Positive (Invited to Interview / Encouraging)</option>
                    <option value="neutral">Neutral (Asked for transcripts / more info)</option>
                    <option value="declined">Declined (No vacancies / Lab full)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Reply Summary & Next Steps
                </label>
                <textarea
                  rows={6}
                  value={replySummary}
                  onChange={e => setReplySummary(e.target.value)}
                  placeholder="Paste key points from professor's email, requested materials, or scheduled meeting dates..."
                  className="w-full border border-slate-200 rounded-lg p-3 text-xs bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none text-slate-800"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveSubTab('thread')}
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 shadow-xs transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Save Reply to Record</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
