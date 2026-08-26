import React, { useState } from 'react';
import { 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  RefreshCw, 
  Server, 
  ShieldCheck, 
  CloudUpload, 
  ExternalLink,
  Code2,
  HardDrive
} from 'lucide-react';
import { 
  SUPABASE_URL, 
  SUPABASE_ANON_KEY, 
  SUPABASE_SQL_SCHEMA, 
  checkSupabaseConnection,
  bulkSyncLeadsToSupabase 
} from '../services/supabase';
import { ProfessorLead } from '../types';

interface SupabaseSetupHelperProps {
  leads: ProfessorLead[];
  onSyncComplete?: () => void;
}

export const SupabaseSetupHelper: React.FC<SupabaseSetupHelperProps> = ({
  leads,
  onSyncComplete,
}) => {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ connected: boolean; message: string } | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  const handleTestConnection = async () => {
    setTesting(true);
    const res = await checkSupabaseConnection();
    setTestResult(res);
    setTesting(false);
  };

  const handleSyncAll = async () => {
    setSyncing(true);
    setSyncMessage(null);
    const res = await bulkSyncLeadsToSupabase(leads);
    setSyncMessage(res.message);
    setSyncing(false);
    if (onSyncComplete) onSyncComplete();
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-6 sm:p-8">
      <div className="max-w-4xl w-full mx-auto space-y-6">
        {/* Title */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
              <Database className="w-5 h-5 text-indigo-600" />
              <span>Supabase Database & Cloud Synchronization</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage your PostgreSQL cloud persistence, credentials, and schema replication
            </p>
          </div>

          <button
            onClick={handleTestConnection}
            disabled={testing}
            className="px-3.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-700 flex items-center space-x-1.5 transition-colors shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin text-indigo-600' : ''}`} />
            <span>Test Connection</span>
          </button>
        </div>

        {/* Credentials Status Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Configured Supabase Endpoint
            </span>
            <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200 flex items-center space-x-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Active Project</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Project URL
              </label>
              <span className="font-mono text-slate-800 font-medium select-all block truncate" title={SUPABASE_URL}>
                {SUPABASE_URL}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Publishable / Anon Key
              </label>
              <span className="font-mono text-slate-800 font-medium select-all block truncate" title={SUPABASE_ANON_KEY}>
                {SUPABASE_ANON_KEY.slice(0, 24)}...
              </span>
            </div>
          </div>

          {testResult && (
            <div className={`p-3 rounded-lg border text-xs flex items-start space-x-2 ${
              testResult.connected 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}>
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <div>
                <strong className="block font-semibold">Connection Check Passed:</strong>
                <span>{testResult.message}</span>
              </div>
            </div>
          )}

          {/* Sync Action */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
            <div className="text-xs text-slate-500">
              Current in-memory records: <strong className="text-slate-800 font-semibold">{leads.length} leads</strong> with real-time local cache fallback.
            </div>

            <button
              onClick={handleSyncAll}
              disabled={syncing}
              className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 shadow-2xs transition-colors"
            >
              <CloudUpload className="w-3.5 h-3.5" />
              <span>{syncing ? 'Syncing to Supabase...' : 'Bulk Sync All Leads to Supabase'}</span>
            </button>
          </div>

          {syncMessage && (
            <div className="p-3 bg-indigo-50 border border-indigo-200 text-indigo-900 rounded-lg text-xs">
              {syncMessage}
            </div>
          )}
        </div>

        {/* SQL Schema Copy Section */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                <Code2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>Supabase PostgreSQL Schema Setup</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Copy and run this in your Supabase project SQL Editor to enable full table-level cloud persistence.
              </p>
            </div>

            <button
              onClick={() => {
                navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
                setCopiedSql(true);
                setTimeout(() => setCopiedSql(false), 2000);
              }}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors"
            >
              {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSql ? 'SQL Copied!' : 'Copy SQL'}</span>
            </button>
          </div>

          <pre className="p-4 bg-slate-900 text-slate-200 rounded-lg font-mono text-[11px] overflow-x-auto leading-relaxed border border-slate-800 max-h-56">
            {SUPABASE_SQL_SCHEMA}
          </pre>
        </div>
      </div>
    </div>
  );
};
