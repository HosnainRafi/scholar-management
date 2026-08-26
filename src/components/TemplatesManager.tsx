import React, { useState } from 'react';
import { Mail, Plus, Edit2, Trash2, Check, Copy, FileText, Sparkles, RefreshCw, Save } from 'lucide-react';
import { EmailTemplate } from '../types';
import { DEFAULT_TEMPLATES } from '../data/defaultTemplates';

interface TemplatesManagerProps {
  templates: EmailTemplate[];
  onSaveTemplates: (templates: EmailTemplate[]) => void;
}

export const TemplatesManager: React.FC<TemplatesManagerProps> = ({
  templates,
  onSaveTemplates,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate>(templates[0] || DEFAULT_TEMPLATES[0]);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(selectedTemplate.name);
  const [subject, setSubject] = useState(selectedTemplate.subject);
  const [body, setBody] = useState(selectedTemplate.body);
  const [category, setCategory] = useState<EmailTemplate['category']>(selectedTemplate.category);
  const [copied, setCopied] = useState(false);
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  const handleSelect = (t: EmailTemplate) => {
    setSelectedTemplate(t);
    setName(t.name);
    setSubject(t.subject);
    setBody(t.body);
    setCategory(t.category);
    setIsEditing(false);
  };

  const handleSaveCurrent = () => {
    const updatedList = templates.map(t => {
      if (t.id === selectedTemplate.id) {
        return { ...t, name, subject, body, category };
      }
      return t;
    });

    onSaveTemplates(updatedList);
    setIsSavedNotice(true);
    setIsEditing(false);
    setTimeout(() => setIsSavedNotice(false), 2000);
  };

  const handleCreateNew = () => {
    const newTpl: EmailTemplate = {
      id: `custom-tpl-${Date.now()}`,
      name: 'New Custom Template',
      category: 'initial',
      subject: 'Inquiry regarding Graduate Studies - [Your Name]',
      body: `Dear Professor {Name},\n\nI hope you are well.\n\nSincerely,\n[Your Name]`,
    };

    const updatedList = [...templates, newTpl];
    onSaveTemplates(updatedList);
    handleSelect(newTpl);
    setIsEditing(true);
  };

  const handleDeleteCurrent = () => {
    if (templates.length <= 1) return;
    const updatedList = templates.filter(t => t.id !== selectedTemplate.id);
    onSaveTemplates(updatedList);
    handleSelect(updatedList[0]);
  };

  const handleResetDefaults = () => {
    if (confirm('Reset all templates to default library?')) {
      onSaveTemplates(DEFAULT_TEMPLATES);
      handleSelect(DEFAULT_TEMPLATES[0]);
    }
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-slate-50 p-6 sm:p-8">
      <div className="max-w-6xl w-full mx-auto flex flex-col md:flex-row gap-6 overflow-hidden">
        {/* Template List Left Sidebar */}
        <div className="w-full md:w-80 bg-white border border-slate-200 rounded-xl p-5 flex flex-col shadow-xs shrink-0">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Template Library
            </h3>
            <button
              onClick={handleCreateNew}
              className="p-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New</span>
            </button>
          </div>

          <div className="space-y-1.5 overflow-y-auto flex-1 pr-1">
            {templates.map(tpl => (
              <div
                key={tpl.id}
                onClick={() => handleSelect(tpl)}
                className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                  selectedTemplate.id === tpl.id
                    ? 'bg-indigo-50/70 border-indigo-200 text-indigo-900 shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs truncate">{tpl.name}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                    tpl.category === 'followup' 
                      ? 'bg-amber-100 text-amber-800' 
                      : tpl.category === 'meeting' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-indigo-100 text-indigo-800'
                  }`}>
                    {tpl.category}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 truncate mt-1">{tpl.subject}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 flex justify-between">
            <button
              onClick={handleResetDefaults}
              className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center space-x-1 font-medium"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset Defaults</span>
            </button>
          </div>
        </div>

        {/* Template Editor / Preview Area */}
        <div className="flex-1 bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col overflow-y-auto">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {selectedTemplate.name}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Variables: <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px] text-indigo-700 font-mono">&#123;Name&#125;</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px] text-indigo-700 font-mono">&#123;University&#125;</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px] text-indigo-700 font-mono">&#123;Department&#125;</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px] text-indigo-700 font-mono">&#123;ResearchInterest&#125;</code>
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(body);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium flex items-center space-x-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>

              <button
                onClick={handleSaveCurrent}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 shadow-2xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSavedNotice ? 'Saved!' : 'Save Template'}</span>
              </button>

              {templates.length > 1 && (
                <button
                  onClick={handleDeleteCurrent}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Delete Template"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Template Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2.5 bg-white focus:ring-1 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as any)}
                  className="w-full border border-slate-200 rounded-lg p-2.5 bg-white focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="initial">Initial Outreach</option>
                  <option value="followup">7-Day Follow-Up Reminder</option>
                  <option value="meeting">Meeting Request / Coordination</option>
                  <option value="thanks">Thank You / Update</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Email Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="w-full border border-slate-200 rounded-lg p-2.5 bg-white focus:ring-1 focus:ring-indigo-500 font-medium"
              />
            </div>

            <div className="flex-1">
              <label className="font-semibold text-slate-700 block mb-1">
                Email Message Body
              </label>
              <textarea
                rows={12}
                value={body}
                onChange={e => setBody(e.target.value)}
                className="w-full border border-slate-200 rounded-lg p-3.5 bg-white focus:ring-1 focus:ring-indigo-500 font-mono text-xs leading-relaxed text-slate-800"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
