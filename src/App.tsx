import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Papa from 'papaparse';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { StatsBar } from './components/StatsBar';
import { ProfessorTable } from './components/ProfessorTable';
import { EmailModal } from './components/EmailModal';
import { ProfessorDetailModal } from './components/ProfessorDetailModal';
import { NewLeadModal } from './components/NewLeadModal';
import { CsvImportModal } from './components/CsvImportModal';
import { TemplatesManager } from './components/TemplatesManager';
import { AnalyticsView } from './components/AnalyticsView';
import { SupabaseSetupHelper } from './components/SupabaseSetupHelper';
import { INITIAL_PROFESSORS_DATA } from './data/initialData';
import { DEFAULT_TEMPLATES } from './data/defaultTemplates';
import { 
  loadLeadsFromSupabaseOrLocal, 
  saveLeadToSupabase, 
  bulkSyncLeadsToSupabase,
  checkSupabaseConnection,
  STORAGE_KEY_TEMPLATES,
  STORAGE_KEY_LEADS 
} from './services/supabase';
import { ProfessorLead, ViewFilter, EmailTemplate } from './types';
import { calculateReminderInfo } from './utils/reminderUtils';

export default function App() {
  // State
  const [leads, setLeads] = useState<ProfessorLead[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LEADS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= INITIAL_PROFESSORS_DATA.length) return parsed;
      }
    } catch (e) {
      console.warn('LocalStorage lead cache read error:', e);
    }
    return INITIAL_PROFESSORS_DATA || [];
  });
  const [templates, setTemplates] = useState<EmailTemplate[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TEMPLATES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return DEFAULT_TEMPLATES;
  });


  const [activeTab, setActiveTab] = useState<'dashboard' | 'tracker' | 'templates' | 'analytics' | 'supabase'>('dashboard');
  const [activeFilter, setActiveFilter] = useState<ViewFilter>('all');
  const [selectedUniversity, setSelectedUniversity] = useState<string>('ALL');
  const [selectedRank, setSelectedRank] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Layout expansion states (defaults to open on desktop, closed drawer on mobile)
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      return false;
    }
    return true;
  });
  const [isStatsCollapsed, setIsStatsCollapsed] = useState<boolean>(false);
  const [isFullPage, setIsFullPage] = useState<boolean>(false);

  // Modals
  const [selectedEmailLead, setSelectedEmailLead] = useState<ProfessorLead | null>(null);
  const [selectedDetailLead, setSelectedDetailLead] = useState<ProfessorLead | null>(null);
  const [isNewLeadOpen, setIsNewLeadOpen] = useState(false);
  const [isCsvImportOpen, setIsCsvImportOpen] = useState(false);

  // Sync state
  const [isSyncing, setIsSyncing] = useState(false);
  const [supabaseConnected, setSupabaseConnected] = useState(false);

  // Load from Supabase on mount
  useEffect(() => {
    async function initData() {
      const conn = await checkSupabaseConnection();
      setSupabaseConnected(conn.connected);

      const loaded = await loadLeadsFromSupabaseOrLocal(INITIAL_PROFESSORS_DATA);
      setLeads(loaded);
    }
    initData();
  }, []);

  // Save templates whenever updated
  const handleSaveTemplates = (newTemplates: EmailTemplate[]) => {
    setTemplates(newTemplates);
    localStorage.setItem(STORAGE_KEY_TEMPLATES, JSON.stringify(newTemplates));
  };

  // Update lead in state & persist to Supabase / LocalStorage
  const handleUpdateLead = useCallback((updatedLead: ProfessorLead) => {
    setLeads(prev => {
      const next = prev.map(l => (l.id === updatedLead.id ? updatedLead : l));
      saveLeadToSupabase(updatedLead);
      return next;
    });

    // Also update modal states if open
    if (selectedEmailLead?.id === updatedLead.id) {
      setSelectedEmailLead(updatedLead);
    }
    if (selectedDetailLead?.id === updatedLead.id) {
      setSelectedDetailLead(updatedLead);
    }
  }, [selectedEmailLead, selectedDetailLead]);

  // Add a new lead
  const handleAddLead = (newLead: ProfessorLead) => {
    setLeads(prev => {
      const next = [newLead, ...prev];
      saveLeadToSupabase(newLead);
      return next;
    });
  };

  // Bulk import leads from CSV
  const handleImportLeads = (newLeads: ProfessorLead[], mode: 'append' | 'replace') => {
    setLeads(prev => {
      let merged: ProfessorLead[];
      if (mode === 'replace') {
        merged = newLeads;
      } else {
        // Append unique by name and university
        const existingKeys = new Set(prev.map(l => `${l.name}-${l.university}`));
        const filteredNew = newLeads.filter(l => !existingKeys.has(`${l.name}-${l.university}`));
        merged = [...prev, ...filteredNew];
      }
      localStorage.setItem(STORAGE_KEY_LEADS, JSON.stringify(merged));
      bulkSyncLeadsToSupabase(merged);
      return merged;
    });
  };

  // Manual sync with Supabase
  const handleSyncSupabase = async () => {
    setIsSyncing(true);
    const conn = await checkSupabaseConnection();
    setSupabaseConnected(conn.connected);
    const res = await bulkSyncLeadsToSupabase(leads);
    setIsSyncing(false);
  };

  // Export current list to CSV
  const handleExportCsv = () => {
    const exportRows = leads.map(l => {
      const reminder = calculateReminderInfo(l);
      return {
        University: l.university,
        'Department/Unit': l.department,
        Name: l.name,
        Rank: l.rank,
        'Email Address': l.email,
        'Mailed Status': l.isMailed ? 'YES' : 'NO',
        'Mailed Date': l.mailedAt ? new Date(l.mailedAt).toLocaleDateString() : '',
        'Replied Status': l.isReplied ? 'YES' : 'NO',
        'Replied Date': l.repliedAt ? new Date(l.repliedAt).toLocaleDateString() : '',
        '7-Day Reminder Status': reminder.label,
        'Notes & Log': l.notes,
        'Research Interest': l.researchInterest,
        'Official Profile URL': l.profileUrl,
        'Fallback Office Email': l.fallbackOfficeEmail,
        'Fallback Phone': l.fallbackPhone,
      };
    });

    const csvContent = Papa.unparse(exportRows);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `academic_outreach_tracker_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filtered Leads based on sidebar selection
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      // University filter
      if (selectedUniversity !== 'ALL' && lead.university !== selectedUniversity) {
        return false;
      }

      // Rank filter
      if (selectedRank !== 'ALL') {
        if (selectedRank === 'Professor' && !lead.rank.toLowerCase().includes('professor')) return false;
        if (selectedRank === 'Associate Professor' && !lead.rank.toLowerCase().includes('associate')) return false;
      }

      // Quick filter
      if (activeFilter === 'with_email') {
        return Boolean(lead.email);
      }
      if (activeFilter === 'no_email') {
        return !lead.email;
      }
      if (activeFilter === 'mailed') {
        return lead.isMailed;
      }
      if (activeFilter === 'pending_reply') {
        return lead.isMailed && !lead.isReplied;
      }
      if (activeFilter === 'reminders_due') {
        if (!lead.isMailed || lead.isReplied) return false;
        const reminder = calculateReminderInfo(lead);
        return reminder.isOverdue || reminder.isDueToday;
      }
      if (activeFilter === 'replied') {
        return lead.isReplied;
      }
      if (activeFilter === 'favorites') {
        return (lead.rating || 0) > 0;
      }

      return true;
    });
  }, [leads, selectedUniversity, selectedRank, activeFilter]);

  // Overdue count for top banner
  const overdueCount = useMemo(() => {
    return leads.filter(l => {
      if (!l.isMailed || l.isReplied) return false;
      const info = calculateReminderInfo(l);
      return info.isOverdue || info.isDueToday;
    }).length;
  }, [leads]);

  return (
    <div className="h-screen flex flex-col bg-slate-50 text-slate-800 font-sans antialiased overflow-hidden select-none">
      {/* Top Application Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewLead={() => setIsNewLeadOpen(true)}
        onExportCsv={handleExportCsv}
        onSyncSupabase={handleSyncSupabase}
        isSyncing={isSyncing}
        supabaseConnected={supabaseConnected}
        overdueCount={overdueCount}
        onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
        isSidebarOpen={isSidebarOpen && !isFullPage}
      />

      {/* Main Content Body */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar Filters Drawer */}
        <Sidebar
          leads={leads}
          activeFilter={activeFilter}
          setActiveFilter={(filter) => {
            setActiveFilter(filter);
            if (activeTab !== 'dashboard') setActiveTab('dashboard');
          }}
          selectedUniversity={selectedUniversity}
          setSelectedUniversity={setSelectedUniversity}
          selectedRank={selectedRank}
          setSelectedRank={setSelectedRank}
          onOpenUploadModal={() => setIsCsvImportOpen(true)}
          onSelectLead={(lead) => setSelectedDetailLead(lead)}
          isOpen={isSidebarOpen && !isFullPage}
          onClose={() => setIsSidebarOpen(false)}
          onToggle={() => setIsSidebarOpen(prev => !prev)}
        />

        {/* Center Dynamic Tab View */}
        <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-200 ${
          isFullPage ? 'p-2 sm:p-3' : 'p-3 sm:p-4 lg:p-5'
        }`}>
          {activeTab === 'dashboard' || activeTab === 'tracker' ? (
            <>
              {/* Quick Metrics Bar (Collapsible to give 100% space to the table) */}
              {!isFullPage && (
                <StatsBar
                  leads={leads}
                  onFilterClick={(filter) => setActiveFilter(filter)}
                  isCollapsed={isStatsCollapsed}
                  onToggleCollapse={() => setIsStatsCollapsed(prev => !prev)}
                />
              )}

              {/* Interactive Professors Table */}
              <ProfessorTable
                leads={filteredLeads}
                onUpdateLead={handleUpdateLead}
                onOpenEmailModal={(lead) => setSelectedEmailLead(lead)}
                onOpenDetailModal={(lead) => setSelectedDetailLead(lead)}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                isFullPage={isFullPage}
                onToggleFullPage={() => {
                  setIsFullPage(prev => {
                    const next = !prev;
                    if (next) {
                      setIsStatsCollapsed(true);
                    }
                    return next;
                  });
                }}
                isSidebarOpen={isSidebarOpen && !isFullPage}
                onToggleSidebar={() => {
                  if (isFullPage) {
                    setIsFullPage(false);
                    setIsSidebarOpen(true);
                  } else {
                    setIsSidebarOpen(prev => !prev);
                  }
                }}
                activeFilter={activeFilter}
                onSelectFilter={(filter) => setActiveFilter(filter)}
              />
            </>
          ) : activeTab === 'templates' ? (
            <TemplatesManager
              templates={templates}
              onSaveTemplates={handleSaveTemplates}
            />
          ) : activeTab === 'analytics' ? (
            <AnalyticsView leads={leads} />
          ) : activeTab === 'supabase' ? (
            <SupabaseSetupHelper
              leads={leads}
              onSyncComplete={() => setSupabaseConnected(true)}
            />
          ) : null}
        </div>
      </main>

      {/* Modals */}
      <EmailModal
        lead={selectedEmailLead}
        isOpen={Boolean(selectedEmailLead)}
        onClose={() => setSelectedEmailLead(null)}
        onUpdateLead={handleUpdateLead}
        templates={templates}
      />

      <ProfessorDetailModal
        lead={selectedDetailLead}
        isOpen={Boolean(selectedDetailLead)}
        onClose={() => setSelectedDetailLead(null)}
        onUpdateLead={handleUpdateLead}
        onOpenEmailModal={(lead) => {
          setSelectedDetailLead(null);
          setSelectedEmailLead(lead);
        }}
      />

      <NewLeadModal
        isOpen={isNewLeadOpen}
        onClose={() => setIsNewLeadOpen(false)}
        onAddLead={handleAddLead}
      />

      <CsvImportModal
        isOpen={isCsvImportOpen}
        onClose={() => setIsCsvImportOpen(false)}
        onImportLeads={handleImportLeads}
      />
    </div>
  );
}
