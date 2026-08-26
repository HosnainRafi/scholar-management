import React, { useState } from 'react';
import { X, Plus, Building, User, Mail, BookOpen, Save, Sparkles } from 'lucide-react';
import { ProfessorLead } from '../types';

interface NewLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddLead: (lead: ProfessorLead) => void;
}

export const NewLeadModal: React.FC<NewLeadModalProps> = ({
  isOpen,
  onClose,
  onAddLead,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [university, setUniversity] = useState('');
  const [department, setDepartment] = useState('');
  const [rank, setRank] = useState('Professor');
  const [email, setEmail] = useState('');
  const [researchInterest, setResearchInterest] = useState('');
  const [profileUrl, setProfileUrl] = useState('');
  const [fallbackOfficeEmail, setFallbackOfficeEmail] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !university.trim()) return;

    const now = new Date().toISOString();
    const id = `custom-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    const newLead: ProfessorLead = {
      id,
      university: university.trim(),
      department: department.trim(),
      name: name.trim(),
      rank: rank.trim(),
      email: email.trim(),
      researchInterest: researchInterest.trim(),
      officialSource: profileUrl.trim(),
      additionalInfo: 'Manually added lead',
      directEmailStatus: email.trim() ? 'Manual Entry' : 'Unavailable',
      fallbackOfficeEmail: fallbackOfficeEmail.trim(),
      fallbackContactUrl: profileUrl.trim(),
      fallbackPhone: '',
      howToContact: '',
      profileUrl: profileUrl.trim(),
      researchInfoStatus: 'User provided',
      publicationLookupInstructions: '',
      contactReadiness: email.trim() ? 'Direct email available' : 'Institutional fallback available',
      researchMethods: '',
      verificationSources: 'Manual input',
      coverageStatus: 'Custom addition',

      isMailed: false,
      mailedAt: null,
      isReplied: false,
      repliedAt: null,
      status: 'not_started',
      reminderDays: 7,
      customReminderDate: null,
      notes: notes.trim(),
      tags: ['Custom Lead'],
      emailThread: [],
      rating: 0,
      updatedAt: now,
    };

    onAddLead(newLead);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Add New Faculty Lead</h3>
              <p className="text-[11px] text-slate-500">Record a new university professor contact</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Professor Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Kenjiro Suzuki"
                className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50/50 focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Academic Rank
              </label>
              <select
                value={rank}
                onChange={e => setRank(e.target.value)}
                className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50/50 focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="Professor">Professor</option>
                <option value="Associate Professor">Associate Professor</option>
                <option value="Assistant Professor">Assistant Professor</option>
                <option value="Lecturer">Lecturer / Researcher</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                University *
              </label>
              <input
                type="text"
                value={university}
                onChange={e => setUniversity(e.target.value)}
                placeholder="e.g. University of Tokyo"
                className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50/50 focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Department / Laboratory
              </label>
              <input
                type="text"
                value={department}
                onChange={e => setDepartment(e.target.value)}
                placeholder="e.g. Computer Science"
                className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50/50 focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Direct Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="e.g. suzuki@cs.u-tokyo.ac.jp"
                className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50/50 focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Office / Fallback Email
              </label>
              <input
                type="email"
                value={fallbackOfficeEmail}
                onChange={e => setFallbackOfficeEmail(e.target.value)}
                placeholder="e.g. info@cs.u-tokyo.ac.jp"
                className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50/50 focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Research Interests & Keywords
            </label>
            <input
              type="text"
              value={researchInterest}
              onChange={e => setResearchInterest(e.target.value)}
              placeholder="e.g. Machine Learning, Computer Vision, Robotics"
              className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50/50 focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Profile URL / Lab Website
            </label>
            <input
              type="url"
              value={profileUrl}
              onChange={e => setProfileUrl(e.target.value)}
              placeholder="https://..."
              className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50/50 focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none font-mono"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Initial Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Any specific lab notes or publications..."
              className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50/50 focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Save Faculty Lead</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
