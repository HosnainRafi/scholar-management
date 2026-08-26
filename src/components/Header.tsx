import React from 'react';
import { Mail, RefreshCw, Plus, Download, Sparkles, Database, CheckCircle2, AlertCircle } from 'lucide-react';

interface HeaderProps {
  activeTab: 'dashboard' | 'tracker' | 'templates' | 'analytics' | 'supabase';
  setActiveTab: (tab: 'dashboard' | 'tracker' | 'templates' | 'analytics' | 'supabase') => void;
  onOpenNewLead: () => void;
  onExportCsv: () => void;
  onSyncSupabase: () => void;
  isSyncing: boolean;
  supabaseConnected: boolean;
  overdueCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewLead,
  onExportCsv,
  onSyncSupabase,
  isSyncing,
  supabaseConnected,
  overdueCount,
}) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-8 shadow-xs shrink-0 z-20">
      <div className="flex items-center space-x-4">
        {/* Brand Icon & Name */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center shadow-xs text-white">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold tracking-tight text-slate-900 leading-none">
                OutreachFlow
              </h1>
              <span className="text-[11px] font-semibold uppercase tracking-wider px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                Academic CRM
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Faculty Lead & 7-Day Follow-Up Tracker</p>
          </div>
        </div>

        {/* Supabase connection indicator pill */}
        <div 
          onClick={() => setActiveTab('supabase')}
          className={`px-2.5 py-1 text-xs font-medium rounded-full border flex items-center space-x-1.5 cursor-pointer transition-colors ${
            supabaseConnected 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
              : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
          }`}
          title="Click to view Supabase connection details and SQL schema"
        >
          {supabaseConnected ? (
            <>
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              <span>Supabase Connected</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
              <span>Local Cache (Sync Ready)</span>
            </>
          )}
        </div>

        {/* Overdue alert badge if any */}
        {overdueCount > 0 && (
          <button
            onClick={() => setActiveTab('tracker')}
            className="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-full text-xs font-semibold flex items-center space-x-1 hover:bg-rose-100 transition-colors"
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{overdueCount} Follow-ups Due</span>
          </button>
        )}
      </div>

      {/* Navigation tabs matching Clean Minimalism style */}
      <div className="flex items-center space-x-1 sm:space-x-6 text-sm font-medium text-slate-600">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`py-5 px-1 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'dashboard'
              ? 'text-indigo-600 border-indigo-600 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Dashboard & Table
        </button>
        
        <button
          onClick={() => setActiveTab('templates')}
          className={`py-5 px-1 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'templates'
              ? 'text-indigo-600 border-indigo-600 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Email Templates
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`py-5 px-1 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'analytics'
              ? 'text-indigo-600 border-indigo-600 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Analytics
        </button>

        <button
          onClick={() => setActiveTab('supabase')}
          className={`py-5 px-1 border-b-2 transition-colors cursor-pointer flex items-center space-x-1.5 ${
            activeTab === 'supabase'
              ? 'text-indigo-600 border-indigo-600 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Supabase Sync</span>
        </button>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 pl-4 border-l border-slate-200">
          <button
            onClick={onSyncSupabase}
            disabled={isSyncing}
            className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium flex items-center space-x-1 transition-colors shadow-2xs"
            title="Sync with Supabase"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-indigo-600' : ''}`} />
            <span className="hidden md:inline">Sync Cloud</span>
          </button>

          <button
            onClick={onExportCsv}
            className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <button
            onClick={onOpenNewLead}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 shadow-2xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Lead</span>
          </button>
        </div>
      </div>
    </header>
  );
};
