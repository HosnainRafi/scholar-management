import { EmailTemplate } from '../types';

export const DEFAULT_TEMPLATES: EmailTemplate[] = [
  {
    id: 'mext_grad_inquiry',
    name: 'Prospective Graduate Student / Supervision Request',
    category: 'initial',
    subject: 'Prospective Graduate Student Inquiry - {ResearchInterest} - [Your Name]',
    body: `Dear Professor {Name},

I hope this email finds you well.

My name is [Your Name], and I am writing to express my strong interest in joining your laboratory as a prospective graduate research student at {University} ({Department}).

I have been following your impactful research on {ResearchInterest}, and I was particularly fascinated by your recent publications and work in this domain. My background is in Computer Science and Engineering, with a focus on [Your Key Skills/Focus Area]. I am eager to contribute to your ongoing research projects and pursue my graduate research under your esteemed guidance.

I have attached my Curriculum Vitae, academic transcripts, and a brief research proposal outline for your review. Would you be open to a brief meeting via Zoom or discussing potential supervision opportunities for upcoming intakes?

Thank you very much for your time, consideration, and guidance.

Sincerely,

[Your Name]
[Your Current University / Affiliation]
[Your Phone Number]
[Your LinkedIn / Portfolio URL]`
  },
  {
    id: 'followup_7_day',
    name: '7-Day Follow-Up Reminder (Polite & Professional)',
    category: 'followup',
    subject: 'Follow-up regarding Graduate Supervision Inquiry - [Your Name] / Prof. {Name}',
    body: `Dear Professor {Name},

I hope you are having a productive week.

I am following up on my previous email sent last week regarding potential graduate research opportunities in your laboratory at {University} regarding {ResearchInterest}.

I understand that you have a very busy schedule with teaching and research commitments. I remain deeply enthusiastic about the possibility of joining your group and would be grateful for any brief advice or feedback regarding prospective student openings.

For your convenience, I have re-attached my CV and research interest statement below.

Thank you once again for your valuable time and consideration.

Warm regards,

[Your Name]
[Your Contact Information]`
  },
  {
    id: 'research_collab',
    name: 'Research Collaboration Inquiry',
    category: 'initial',
    subject: 'Research Collaboration Inquiry on {ResearchInterest} - [Your Name]',
    body: `Dear Professor {Name},

I hope you are well.

I am reaching out from [Your Institution/Lab] regarding potential research collaboration in the area of {ResearchInterest}. 

We have been studying [Brief description of your problem] and believe that your expertise in {Department} at {University} could provide invaluable synergies.

Would you be open to an introductory 15-minute call sometime in the coming weeks to explore potential mutual research interests?

Best regards,

[Your Name]
[Your Position & Institution]`
  },
  {
    id: 'meeting_confirmation',
    name: 'Meeting Availability & Thanks',
    category: 'meeting',
    subject: 'Thank you for your response / Meeting Availability - [Your Name]',
    body: `Dear Professor {Name},

Thank you very much for your kind response.

I am available for an online meeting at any of the following times (JST):
1. [Option 1, e.g. Tuesday at 14:00 - 15:00 JST]
2. [Option 2, e.g. Wednesday at 10:00 - 11:00 JST]
3. [Option 3, e.g. Thursday at 16:00 - 17:00 JST]

Please let me know if any of these suit your schedule, or if you prefer an alternative time. I look forward to speaking with you!

Sincerely,

[Your Name]`
  }
];
