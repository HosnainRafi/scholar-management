import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ProfessorLead } from '../types';

// Supabase configuration provided by the user
const metaEnv = (typeof import.meta !== 'undefined' && (import.meta as unknown as { env?: Record<string, string> })?.env) || {};
export const SUPABASE_URL = metaEnv.VITE_SUPABASE_URL || 'https://ivgklopdpycfydkmvjuv.supabase.co';
export const SUPABASE_ANON_KEY = metaEnv.VITE_SUPABASE_ANON_KEY || 'sb_publishable_2cfqAkTgLsCxcBoRfZpSdw_lIN8UN0-';

let client: SupabaseClient;
try {
  client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
} catch (e) {
  console.warn('Supabase client initialization warning:', e);
  // Fallback dummy client to prevent hard crashes in restricted iframe environments
  client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: false,
    },
  });
}

export const supabase = client;


export const STORAGE_KEY_LEADS = 'academic_outreach_leads_v4';
export const STORAGE_KEY_TEMPLATES = 'academic_outreach_templates_v4';
export const STORAGE_KEY_CONFIG = 'academic_outreach_config_v4';

export interface SupabaseSyncResult {
  success: boolean;
  message: string;
  count?: number;
  syncedFromRemote?: boolean;
}

/**
 * Check if connection to Supabase is active
 */
export async function checkSupabaseConnection(): Promise<{ connected: boolean; tableExists: boolean; message: string }> {
  try {
    const { error } = await supabase.from('leads').select('id', { count: 'exact', head: true });
    if (error) {
      // 404 or relation does not exist
      if (
        error.code === 'PGRST116' || 
        error.code === 'PGRST204' || 
        error.code === '42P01' || 
        error.message?.includes('relation "public.leads" does not exist') ||
        error.message?.includes('404')
      ) {
        return { 
          connected: true,
          tableExists: false,
          message: 'Supabase connected! The `leads` table does not exist in your database yet. Run the SQL Schema in your Supabase SQL Editor to enable cloud sync.' 
        };
      }
      return { 
        connected: true, 
        tableExists: false, 
        message: `Connected to Supabase project (${SUPABASE_URL.split('//')[1]?.split('.')[0] || 'endpoint'})` 
      };
    }
    return { 
      connected: true, 
      tableExists: true, 
      message: 'Connected & synced with Supabase `leads` table.' 
    };
  } catch (err: any) {
    return { connected: false, tableExists: false, message: err?.message || 'Unable to connect to Supabase' };
  }
}

/**
 * Fetch all leads from Supabase with fallback to localStorage
 */
export async function loadLeadsFromSupabaseOrLocal(defaultLeads: ProfessorLead[]): Promise<ProfessorLead[]> {
  // 1. Try fetching every row from Supabase table 'leads'.
  // PostgREST commonly caps a single response at 1,000 rows, so page explicitly.
  try {
    const pageSize = 1000;
    const allRows: any[] = [];
    let pageStart = 0;
    let hasMore = true;

    while (hasMore) {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('updated_at', { ascending: false })
        .range(pageStart, pageStart + pageSize - 1);

      if (error) throw error;
      const page = data || [];
      allRows.push(...page);
      hasMore = page.length === pageSize;
      pageStart += pageSize;
    }

    const data = allRows;
    if (data.length > 0) {
      const parsedRemote: ProfessorLead[] = data.map((row: any) => ({
        id: row.id,
        university: row.university || '',
        department: row.department || '',
        name: row.name || '',
        rank: row.rank || 'Professor',
        email: row.email || '',
        researchInterest: row.research_interest || '',
        officialSource: row.official_source || '',
        additionalInfo: row.additional_info || '',
        directEmailStatus: row.direct_email_status || '',
        fallbackOfficeEmail: row.fallback_office_email || '',
        fallbackContactUrl: row.fallback_contact_url || '',
        fallbackPhone: row.fallback_phone || '',
        howToContact: row.how_to_contact || '',
        profileUrl: row.profile_url || '',
        researchInfoStatus: row.research_info_status || '',
        publicationLookupInstructions: row.publication_lookup_instructions || '',
        contactReadiness: row.contact_readiness || '',
        researchMethods: row.research_methods || '',
        verificationSources: row.verification_sources || '',
        coverageStatus: row.coverage_status || '',
        isMailed: Boolean(row.is_mailed),
        mailedAt: row.mailed_at || null,
        isReplied: Boolean(row.is_replied),
        repliedAt: row.replied_at || null,
        status: row.status || 'not_started',
        reminderDays: row.reminder_days || 7,
        customReminderDate: row.custom_reminder_date || null,
        notes: row.notes || '',
        tags: Array.isArray(row.tags) ? row.tags : (row.tags ? JSON.parse(row.tags) : []),
        emailThread: Array.isArray(row.email_thread) ? row.email_thread : (row.email_thread ? JSON.parse(row.email_thread) : []),
        rating: row.rating || 0,
        updatedAt: row.updated_at || new Date().toISOString(),
      }));

      // If remote has fewer leads than the default dataset, merge them to include new defaults
      if (parsedRemote.length < defaultLeads.length) {
        const remoteMap = new Map(parsedRemote.map(p => [p.id, p]));
        const merged = defaultLeads.map(d => remoteMap.get(d.id) || d);
        for (const p of parsedRemote) {
          if (!defaultLeads.some(d => d.id === p.id)) {
            merged.push(p);
          }
        }
        // Save the merged data locally so the user can sync to cloud
        localStorage.setItem(STORAGE_KEY_LEADS, JSON.stringify(merged));
        return merged;
      }

      // Cache locally
      localStorage.setItem(STORAGE_KEY_LEADS, JSON.stringify(parsedRemote));
      return parsedRemote;
    }
  } catch {
    // Graceful fallback to localStorage
  }

  // 2. Try localStorage cache
  const cached = localStorage.getItem(STORAGE_KEY_LEADS);
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length >= defaultLeads.length) {
        return parsed;
      } else if (Array.isArray(parsed) && parsed.length > 0) {
        // Merge user edits with default dataset
        const cachedMap = new Map(parsed.map(p => [p.id, p]));
        const merged = defaultLeads.map(d => cachedMap.get(d.id) || d);
        // add any custom added leads
        for (const p of parsed) {
          if (!defaultLeads.some(d => d.id === p.id)) {
            merged.push(p);
          }
        }
        localStorage.setItem(STORAGE_KEY_LEADS, JSON.stringify(merged));
        return merged;
      }
    } catch {
      // ignore
    }
  }

  // 3. Return defaults and store in local storage
  localStorage.setItem(STORAGE_KEY_LEADS, JSON.stringify(defaultLeads));
  return defaultLeads;
}

/**
 * Save single lead update to Supabase & localStorage
 */
export async function saveLeadToSupabase(lead: ProfessorLead): Promise<void> {
  // Update local storage first
  try {
    const cached = localStorage.getItem(STORAGE_KEY_LEADS);
    if (cached) {
      const leads: ProfessorLead[] = JSON.parse(cached);
      const idx = leads.findIndex(l => l.id === lead.id);
      if (idx >= 0) {
        leads[idx] = lead;
      } else {
        leads.unshift(lead);
      }
      localStorage.setItem(STORAGE_KEY_LEADS, JSON.stringify(leads));
    }
  } catch (e) {
    console.error('LocalStorage write failed:', e);
  }

  // Attempt Supabase upsert
  try {
    const row = {
      id: lead.id,
      university: lead.university,
      department: lead.department,
      name: lead.name,
      rank: lead.rank,
      email: lead.email,
      research_interest: lead.researchInterest,
      official_source: lead.officialSource,
      additional_info: lead.additionalInfo,
      direct_email_status: lead.directEmailStatus,
      fallback_office_email: lead.fallbackOfficeEmail,
      fallback_contact_url: lead.fallbackContactUrl,
      fallback_phone: lead.fallbackPhone,
      how_to_contact: lead.howToContact,
      profile_url: lead.profileUrl,
      research_info_status: lead.researchInfoStatus,
      publication_lookup_instructions: lead.publicationLookupInstructions,
      contact_readiness: lead.contactReadiness,
      research_methods: lead.researchMethods,
      verification_sources: lead.verificationSources,
      coverage_status: lead.coverageStatus,
      is_mailed: lead.isMailed,
      mailed_at: lead.mailedAt,
      is_replied: lead.isReplied,
      replied_at: lead.repliedAt,
      status: lead.status,
      reminder_days: lead.reminderDays,
      custom_reminder_date: lead.customReminderDate,
      notes: lead.notes,
      tags: lead.tags,
      email_thread: lead.emailThread,
      rating: lead.rating,
      updated_at: new Date().toISOString(),
    };

    await supabase.from('leads').upsert(row);
  } catch (err) {
    // Non-blocking catch to ensure UI remains snappy
    console.warn('Supabase lead upsert error (saved locally):', err);
  }
}

/**
 * Bulk sync all leads to Supabase
 */
export async function bulkSyncLeadsToSupabase(leads: ProfessorLead[]): Promise<SupabaseSyncResult> {
  try {
    const rows = leads.map(lead => ({
      id: lead.id,
      university: lead.university,
      department: lead.department,
      name: lead.name,
      rank: lead.rank,
      email: lead.email,
      research_interest: lead.researchInterest,
      official_source: lead.officialSource,
      additional_info: lead.additionalInfo,
      direct_email_status: lead.directEmailStatus,
      fallback_office_email: lead.fallbackOfficeEmail,
      fallback_contact_url: lead.fallbackContactUrl,
      fallback_phone: lead.fallbackPhone,
      how_to_contact: lead.howToContact,
      profile_url: lead.profileUrl,
      research_info_status: lead.researchInfoStatus,
      publication_lookup_instructions: lead.publicationLookupInstructions,
      contact_readiness: lead.contactReadiness,
      research_methods: lead.researchMethods,
      verification_sources: lead.verificationSources,
      coverage_status: lead.coverageStatus,
      is_mailed: lead.isMailed,
      mailed_at: lead.mailedAt,
      is_replied: lead.isReplied,
      replied_at: lead.repliedAt,
      status: lead.status,
      reminder_days: lead.reminderDays,
      custom_reminder_date: lead.customReminderDate,
      notes: lead.notes,
      tags: lead.tags,
      email_thread: lead.emailThread,
      rating: lead.rating,
      updated_at: lead.updatedAt || new Date().toISOString(),
    }));

    const { error } = await supabase.from('leads').upsert(rows);
    if (error) {
      return {
        success: false,
        message: `Supabase sync notice: ${error.message} (All changes safely saved in LocalStorage).`,
      };
    }
    return {
      success: true,
      message: `Successfully synced ${leads.length} leads with Supabase!`,
      count: leads.length,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Supabase sync error: ${err?.message || err}. Data saved locally.`,
    };
  }
}

/**
 * SQL Schema definition to help user set up the table in Supabase dashboard
 */
export const SUPABASE_SQL_SCHEMA = `-- Run this in your Supabase SQL Editor to create the leads table:
CREATE TABLE IF NOT EXISTS public.leads (
    id TEXT PRIMARY KEY,
    university TEXT,
    department TEXT,
    name TEXT NOT NULL,
    rank TEXT,
    email TEXT,
    research_interest TEXT,
    official_source TEXT,
    additional_info TEXT,
    direct_email_status TEXT,
    fallback_office_email TEXT,
    fallback_contact_url TEXT,
    fallback_phone TEXT,
    how_to_contact TEXT,
    profile_url TEXT,
    research_info_status TEXT,
    publication_lookup_instructions TEXT,
    contact_readiness TEXT,
    research_methods TEXT,
    verification_sources TEXT,
    coverage_status TEXT,
    is_mailed BOOLEAN DEFAULT FALSE,
    mailed_at TIMESTAMP WITH TIME ZONE,
    is_replied BOOLEAN DEFAULT FALSE,
    replied_at TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'not_started',
    reminder_days INTEGER DEFAULT 7,
    custom_reminder_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    tags JSONB DEFAULT '[]'::jsonb,
    email_thread JSONB DEFAULT '[]'::jsonb,
    rating INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS) and allow public read/write with the anon key
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read and write on leads" 
ON public.leads 
FOR ALL 
TO anon 
USING (true) 
WITH CHECK (true);
`;
