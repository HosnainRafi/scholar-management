import Papa from 'papaparse';
import { ProfessorLead } from '../types';
import { RAW_PROFESSORS_CSV } from './professorsCsv';

function generateId(university: string, name: string, index: number): string {
  const cleanUni = university.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 10);
  const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 15);
  return `${cleanUni}-${cleanName}-${index}`;
}

export function parseProfessorsCsv(csvText: string = RAW_PROFESSORS_CSV): ProfessorLead[] {
  try {
    if (!csvText || typeof csvText !== 'string') {
      return [];
    }

    const parsed = Papa.parse(csvText.trim(), {
      header: true,
      skipEmptyLines: true,
    });

    if (!parsed.data || !Array.isArray(parsed.data) || parsed.data.length === 0) {
      return [];
    }

    const now = new Date().toISOString();

    return (parsed.data as any[])
      .filter((row: any) => row && typeof row === 'object' && (row['Name'] || row['University'] || row['name'] || row['university']))
      .map((row: any, index: number): ProfessorLead => {
        const university = (row['University'] || row['university'] || row['UNIVERSITY'] || '').toString().trim();
        const department = (row['Department/Unit'] || row['Department'] || row['department'] || '').toString().trim();
        const name = (row['Name'] || row['name'] || row['NAME'] || '').toString().trim();
        const rank = (row['Rank'] || row['rank'] || 'Professor').toString().trim();
        const rawEmail = (row['Email or status'] || row['Email'] || row['email'] || '').toString().trim();
        
        // Check if email is a valid email or placeholder text
        const isEmailValid = rawEmail.includes('@') && !rawEmail.toLowerCase().includes('user@domain') && !rawEmail.includes(' ');
        const email = isEmailValid ? rawEmail : '';

        const researchInterest = (row['Research interest'] || row['Research Interest'] || row['research_interest'] || '').toString().trim();
        const officialSource = (row['Official source'] || row['official_source'] || '').toString().trim();
        const additionalInfo = (row['Additional information'] || row['additional_info'] || '').toString().trim();
        const directEmailStatus = (row['Direct email status'] || row['direct_email_status'] || '').toString().trim();
        const fallbackOfficeEmail = (row['Fallback office/lab email'] || row['fallback_office_email'] || '').toString().trim();
        const fallbackContactUrl = (row['Fallback contact URL'] || row['fallback_contact_url'] || '').toString().trim();
        const fallbackPhone = (row['Fallback phone'] || row['fallback_phone'] || '').toString().trim();
        const howToContact = (row['How to contact if direct email unavailable'] || row['how_to_contact'] || '').toString().trim();
        const profileUrl = (row['Research profile/publications URL'] || row['profile_url'] || row['Profile URL'] || '').toString().trim();
        const researchInfoStatus = (row['Research information status'] || row['research_info_status'] || '').toString().trim();
        const publicationLookupInstructions = (row['Publication lookup instructions'] || '').toString().trim();
        const contactReadiness = (row['Contact readiness'] || '').toString().trim();
        const researchMethods = (row['Research approach / methods'] || '').toString().trim();
        const verificationSources = (row['Email verification sources checked'] || '').toString().trim();
        const coverageStatus = (row['Coverage status'] || '').toString().trim();

        return {
          id: generateId(university, name, index),
          university,
          department,
          name,
          rank,
          email,
          researchInterest,
          officialSource,
          additionalInfo,
          directEmailStatus,
          fallbackOfficeEmail,
          fallbackContactUrl,
          fallbackPhone,
          howToContact,
          profileUrl,
          researchInfoStatus,
          publicationLookupInstructions,
          contactReadiness,
          researchMethods,
          verificationSources,
          coverageStatus,

          isMailed: false,
          mailedAt: null,
          isReplied: false,
          repliedAt: null,
          status: 'not_started',
          reminderDays: 7,
          customReminderDate: null,
          notes: '',
          tags: [],
          emailThread: [],
          rating: 0,
          updatedAt: now,
        };
      });
  } catch (err) {
    console.error('Failed to parse professors CSV:', err);
    return [];
  }
}


export const INITIAL_PROFESSORS_DATA: ProfessorLead[] = parseProfessorsCsv();
