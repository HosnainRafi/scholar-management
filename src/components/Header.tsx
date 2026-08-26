import React from 'react';
import { Mail, RefreshCw, Plus, Download, Sparkles, Database, CheckCircle2, AlertCircle, Menu, PanelLeft, PanelLeftClose, SlidersHorizontal } from 'lucide-react';

interface HeaderProps {
  activeTab: 'dashboard' | 'tracker' | 'templates' | 'analytics' | 'supabase';
  setActiveTab: (tab: 'dashboard' | 'tracker' | 'templates' | 'analytics' | 'supabase') => void;
  onOpenNewLead: () => void;
  onExportCsv: () => void;
  onSyncSupabase: () => void;
  isSyncing: boolean;
  supabaseConnected: boolean;
  overdueCount: number;
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
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
  onToggleSidebar,
  isSidebarOpen = true,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 shadow-2xs shrink-0 z-30 sticky top-0">
      {/* Primary Top Bar */}
      <div className="h-14 sm:h-16 flex items-center justify-between px-3 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
          {/* Mobile Drawer / Sidebar Toggle Button (Also appears on desktop when sidebar is collapsed) */}
          {onToggleSidebar && (
            <button
              id="sidebar-toggle-button"
              type="button"
              onClick={onToggleSidebar}
              className={`px-2.5 py-1.5 rounded-lg border transition-colors flex items-center space-x-1.5 shrink-0 text-xs font-semibold ${
                isSidebarOpen
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700 lg:hidden'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 flex'
              }`}
              title={isSidebarOpen ? "Close filters drawer" : "Open filters & datasets drawer"}
              aria-label="Toggle filters drawer"
            >
              <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
              <span className="hidden sm:inline">Filters</span>
            </button>
          )}

          {/* Brand Icon & Name */}
          <div 
            className="flex items-center space-x-2.5 cursor-pointer min-w-0" 
            onClick={() => setActiveTab('dashboard')}
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-indigo-600 rounded-lg flex items-center justify-center shadow-xs text-white shrink-0">
              <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-1.5">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 leading-none truncate">
                  OutreachFlow
                </h1>
                <span className="hidden xs:inline-block text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded shrink-0">
                  CRM
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 truncate hidden sm:block">
                Academic Outreach & 7-Day Follow-Up
              </p>
            </div>
          </div>

          {/* Supabase status badge */}
          <div 
            onClick={() => setActiveTab('supabase')}
            className={`hidden md:flex px-2 py-0.5 sm:px-2.5 sm:py-1 text-[11px] font-medium rounded-full border items-center space-x-1.5 cursor-pointer transition-colors shrink-0 ${
              supabaseConnected 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
            }`}
            title="Click to view Supabase status"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${supabaseConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span>{supabaseConnected ? 'Supabase' : 'Local Cache'}</span>
          </div>

          {/* Overdue alert badge */}
          {overdueCount > 0 && (
            <button
              onClick={() => setActiveTab('tracker')}
              className="hidden lg:flex px-2.5 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-full text-[11px] font-semibold items-center space-x-1 hover:bg-rose-100 transition-colors shrink-0 animate-pulse"
            >
              <AlertCircle className="w-3 h-3" />
              <span>{overdueCount} Overdue</span>
            </button>
          )}
        </div>

        {/* Right Actions: Sync, Export, Add Lead */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
          <button
            onClick={onSyncSupabase}
            disabled={isSyncing}
            className="p-1.5 sm:px-2.5 sm:py-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium flex items-center space-x-1 transition-colors shadow-2xs"
            title="Sync with Supabase Cloud"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-indigo-600' : ''}`} />
            <span className="hidden sm:inline">Sync</span>
          </button>

          <button
            onClick={onExportCsv}
            className="p-1.5 sm:px-2.5 sm:py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-medium flex items-center space-x-1 transition-colors shadow-2xs"
            title="Export filtered dataset to CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden md:inline">Export</span>
          </button>

          <button
            onClick={onOpenNewLead}
            className="px-2.5 py-1.5 sm:px-3 sm:py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1 shadow-2xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Lead</span>
          </button>
        </div>
      </div>

      {/* Navigation tabs bar with horizontal swipe/scroll on mobile */}
      <div className="px-3 sm:px-6 lg:px-8 border-t border-slate-100 flex items-center space-x-2 sm:space-x-6 text-xs sm:text-sm font-medium overflow-x-auto scrollbar-none bg-slate-50/40">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`py-2.5 px-1.5 sm:px-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'dashboard'
              ? 'text-indigo-600 border-indigo-600 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Dashboard & Table
        </button>
        
        <button
          onClick={() => setActiveTab('templates')}
          className={`py-2.5 px-1.5 sm:px-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'templates'
              ? 'text-indigo-600 border-indigo-600 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Email Templates
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`py-2.5 px-1.5 sm:px-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'analytics'
              ? 'text-indigo-600 border-indigo-600 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Analytics
        </button>

        <button
          onClick={() => setActiveTab('supabase')}
          className={`py-2.5 px-1.5 sm:px-2 border-b-2 transition-colors cursor-pointer flex items-center space-x-1.5 whitespace-nowrap shrink-0 ${
            activeTab === 'supabase'
              ? 'text-indigo-600 border-indigo-600 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Supabase Sync</span>
        </button>
      </div>
    </header>
  );
};
