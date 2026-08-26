import React, { useState } from 'react';
import { X, Upload, FileSpreadsheet, CheckCircle2, AlertCircle } from 'lucide-react';
import Papa from 'papaparse';
import { parseProfessorsCsv } from '../data/initialData';
import { ProfessorLead } from '../types';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportLeads: (newLeads: ProfessorLead[], mode: 'replace' | 'append') => void;
}

export const CsvImportModal: React.FC<CsvImportModalProps> = ({
  isOpen,
  onClose,
  onImportLeads,
}) => {
  if (!isOpen) return null;

  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [parsedPreview, setParsedPreview] = useState<ProfessorLead[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setErrorMsg('');

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const leads = parseProfessorsCsv(text);
        if (leads.length === 0) {
          setErrorMsg('Could not detect valid professor records. Ensure CSV has headers like "University", "Name", "Email or status", etc.');
          setParsedPreview([]);
        } else {
          setParsedPreview(leads);
        }
      } catch (err: any) {
        setErrorMsg('Error parsing file: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmImport = () => {
    if (parsedPreview.length > 0) {
      onImportLeads(parsedPreview, importMode);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Import CSV / Spreadsheet</h3>
              <p className="text-[11px] text-slate-500">Upload faculty dataset to track and manage</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs">
          {/* Dropzone */}
          <div className="p-6 border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-xl text-center bg-slate-50/50 transition-colors">
            <input
              type="file"
              accept=".csv,.txt"
              id="csv-file-input"
              onChange={handleFileUpload}
              className="hidden"
            />
            <label htmlFor="csv-file-input" className="cursor-pointer block space-y-2">
              <Upload className="w-8 h-8 text-indigo-600 mx-auto" />
              <div>
                <span className="font-semibold text-indigo-600 hover:underline">
                  Click to select CSV file
                </span>
                <span className="text-slate-500"> or drag and drop</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Supports university outreach datasets with names, emails, research areas
              </p>
            </label>
          </div>

          {fileName && (
            <div className="p-3 bg-indigo-50/60 border border-indigo-200 rounded-lg flex items-center justify-between">
              <div className="flex items-center space-x-2 truncate">
                <FileSpreadsheet className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="font-medium text-slate-800 truncate">{fileName}</span>
              </div>
              <span className="text-indigo-700 font-bold shrink-0 ml-2">
                {parsedPreview.length} records parsed
              </span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Import Mode */}
          <div className="space-y-2 pt-1">
            <label className="font-semibold text-slate-700 block">
              Import Mode:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label className={`p-2.5 rounded-lg border flex items-center space-x-2 cursor-pointer transition-colors ${
                importMode === 'append' ? 'bg-indigo-50 border-indigo-300 text-indigo-900' : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}>
                <input
                  type="radio"
                  name="import-mode"
                  checked={importMode === 'append'}
                  onChange={() => setImportMode('append')}
                  className="text-indigo-600"
                />
                <div>
                  <span className="font-bold block">Append</span>
                  <span className="text-[10px] text-slate-500">Keep existing tracking data</span>
                </div>
              </label>

              <label className={`p-2.5 rounded-lg border flex items-center space-x-2 cursor-pointer transition-colors ${
                importMode === 'replace' ? 'bg-indigo-50 border-indigo-300 text-indigo-900' : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}>
                <input
                  type="radio"
                  name="import-mode"
                  checked={importMode === 'replace'}
                  onChange={() => setImportMode('replace')}
                  className="text-indigo-600"
                />
                <div>
                  <span className="font-bold block">Replace All</span>
                  <span className="text-[10px] text-slate-500">Overwrite current list</span>
                </div>
              </label>
            </div>
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
              type="button"
              disabled={parsedPreview.length === 0}
              onClick={handleConfirmImport}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 shadow-xs transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Import {parsedPreview.length > 0 ? `${parsedPreview.length} Leads` : ''}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
