import { useState } from 'react';
import confetti from 'canvas-confetti';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  FileText,
  User,
  Award,
  ChevronDown,
  Copy,
  Check,
  Printer,
  Sparkles,
  Palette,
  Maximize2,
  X,
  FileCode,
  CheckCircle2,
  GraduationCap,
  Trophy,
  ShieldCheck,
  HeartHandshake,
  MessageCircle,
} from 'lucide-react';
import { useTeenProfile } from '@/context/TeenProfileContext';
import { TOP_TEEN_EMPLOYERS_AU } from '@/data/teen-finance-data';
import { sound } from '@/lib/sound-synthesizer';

export interface RolePreset {
  name: string;
  badge: string;
  schoolYear: string;
  skills: [string, string, string];
  availability: string;
  experience: string;
  schoolAchievements: string;
  sportsLeadership: string;
  certifications: string;
  profileSummary: string;
}

export const ROLE_PRESETS: RolePreset[] = [
  {
    name: 'Supermarkets (Coles, Woolworths, IGA)',
    badge: 'Retail Team Member',
    schoolYear: 'Year 10',
    skills: [
      'Fast Barcode Scanning & POS Operation',
      'Warm Customer Service & Queue Management',
      'Stock Replenishment & FIFO Inventory Rotation',
    ],
    availability: 'Friday after 4:00pm, Saturday & Sunday anytime (open to close)',
    experience: 'School Canteen Volunteer (weekly cash/card register), High Attendance Award',
    schoolAchievements: 'Year 10 Academic Honour Roll, 99% school attendance record across Year 9 & 10',
    sportsLeadership: 'Junior Club Basketball Player (3 years) — demonstrated team communication and punctual attendance',
    certifications: 'HLTAID011 Provide First Aid & CPR (Current)',
    profileSummary:
      'Energetic and reliable Year 10 student seeking a casual supermarket team member role. Dedicated to providing warm, polite customer service, fast to learn POS till systems, and eager to maintain immaculate shelf presentations.',
  },
  {
    name: "Fast Food Crew (McDonald's, KFC, HJ's, GYG)",
    badge: 'Crew Member',
    schoolYear: 'Year 10',
    skills: [
      'High-Speed Accuracy During Peak Rushes',
      'Food Hygiene & Kitchen Sanitation (FIFO)',
      'Positive Teamwork & Clear Communication',
    ],
    availability: 'Weeknights (after 4:30pm) and full weekend rosters (mornings/closings)',
    experience: 'School Gala Day Food Stall Coordinator, Family Event Food Prep Volunteer',
    schoolAchievements: 'School Punctuality & Effort Award, Year 9 Food Technology Merit Certificate',
    sportsLeadership: 'House Sports Vice-Captain — coordinated athletic events and motivated junior squads',
    certifications: 'SITXFSA005 Food Safety Certificate & HLTAID011 First Aid',
    profileSummary:
      'Enthusiastic and fast-learning Year 10 student eager to join a high-energy kitchen or front counter crew. Brings an upbeat attitude, 100% punctuality, and the stamina to thrive during busy lunch and dinner rushes.',
  },
  {
    name: 'Retail Store Assistant (Kmart, Target, Bunnings)',
    badge: 'Retail Assistant',
    schoolYear: 'Year 10',
    skills: [
      'Visual Merchandising & Shelf Recovery',
      'Friendly Customer Assistance & Greeting',
      'Inventory Restocking & Register Support',
    ],
    availability: 'Saturday & Sunday anytime, Thursday late-night trading (after 4:30pm)',
    experience: 'School Market Day Stall Creator (handled stock & electronic Square payments)',
    schoolAchievements: 'Art & Design Top Student Award, School Library Peer Monitor',
    sportsLeadership: 'School Debating Team Speaker — practiced clear, articulate communication under pressure',
    certifications: 'HLTAID011 Provide First Aid',
    profileSummary:
      'Friendly, well-presented Year 10 student looking for a weekend retail assistant role. Passionate about helping customers find what they need, highly organized, and committed to a spotless, tidy shopping floor.',
  },
  {
    name: 'Sports Referee & Junior Umpire',
    badge: 'Match Official',
    schoolYear: 'Year 10',
    skills: [
      'Firm & Fair Rule Interpretation Under Pressure',
      'Assertive Hand Signals & Clear Whistle Communication',
      'Player Safety & Conflict De-escalation',
    ],
    availability: 'Saturday & Sunday mornings and Friday twilight junior rounds',
    experience: 'Junior Club Player for 5 Years, Completed State Junior Referee Accreditation',
    schoolAchievements: 'Physical Education Academic Excellence Award, Peer Support Leader',
    sportsLeadership: 'Captained Under-15 District Soccer/Netball team to regional finals',
    certifications: 'State Level 1 Junior Referee Badge & HLTAID011 First Aid / CPR',
    profileSummary:
      'Confident, active Year 10 student seeking junior officiating and refereeing opportunities. Possesses deep knowledge of official game rules, decisive communication skills, and a strong commitment to player safety and fair play.',
  },
  {
    name: "Babysitting & Mother's Helper",
    badge: 'Babysitter / Helper',
    schoolYear: 'Year 10',
    skills: [
      'Patient & Attentive Child Care (Ages 3–10)',
      'First Aid & Pediatric CPR Certified',
      'Nutritious Snack Prep & Engaging Play Activities',
    ],
    availability: 'Friday & Saturday evenings, weekend afternoons, and school holiday days',
    experience: 'Babysat for 3 local neighbourhood families (references available), Supervised younger siblings',
    schoolAchievements: 'High Distinction in Year 10 Child Studies, Peer Mentoring Certificate',
    sportsLeadership: 'School Swimming Squad Member & Life Saving Bronze Star Candidate',
    certifications: 'HLTAID011 Provide First Aid & CPR (Current & Certified)',
    profileSummary:
      'Responsible, patient, and CPR-certified Year 10 student available for local babysitting and parent-helper roles. Highly safety-conscious, reliable, engaging with young children, and happy to assist with homework and light meal preparation.',
  },
  {
    name: 'School Leader & Academic Peer Tutor',
    badge: 'Peer Tutor / Leader',
    schoolYear: 'Year 10',
    skills: [
      'Clear Concept Explanation & Patient Teaching',
      'Strong Organizational & Time Management Habits',
      'High Academic Integrity & Active Listening',
    ],
    availability: 'Weekdays after school (3:30pm–6:00pm) and Saturday mornings',
    experience: 'Volunteer Peer Tutor in High School Homework Club for Year 7 & 8 students',
    schoolAchievements: 'Student Representative Council (SRC) Member, Dux of Year 9 Mathematics',
    sportsLeadership: 'School Chess Club Captain & Junior Debating Mentor',
    certifications: 'HLTAID011 Provide First Aid',
    profileSummary:
      'Academically accomplished Year 10 student with a passion for helping younger peers succeed. Patient, articulate, and organized, with a proven ability to break down complex maths and English concepts into simple, encouraging steps.',
  },
  {
    name: 'Lawn Care, Yard Work & Pet Sitting',
    badge: 'Local Services',
    schoolYear: 'Year 10',
    skills: [
      'Reliable Lawn Mowing, Edging & Garden Weeding',
      'Attentive Pet Sitting, Dog Walking & Feeding',
      'Physical Stamina, Punctuality & Client Honesty',
    ],
    availability: 'Saturday & Sunday mornings/afternoons, weekday late afternoons',
    experience: 'Maintained yards and cared for pets for 4 regular neighbourhood households over 12 months',
    schoolAchievements: 'Design & Technology Woodwork Award, 100% Punctuality Record',
    sportsLeadership: 'Rowing Squad Member — built exceptional physical work ethic and early-morning discipline',
    certifications: 'HLTAID011 Provide First Aid & General Construction Induction (White Card)',
    profileSummary:
      'Hard-working, punctual Year 10 student offering reliable lawn care, garden maintenance, and caring pet sitting services. Brings strong physical stamina, respectful communication, and pride in doing every job thoroughly.',
  },
];

export const POPULAR_SKILL_CHIPS = [
  'Punctual & 100% Reliable',
  'POS Cash & Card Handling',
  'Friendly Customer Communication',
  'Fast Learner Under Pressure',
  'Team Player & Positive Attitude',
  'WHS & Food Safety Aware',
  'Stock Replenishment & Merchandising',
  'Active Listening & Conflict Resolution',
  'Multi-tasking During Rushes',
  'High Attention to Cleanliness',
];

export type ResumeTemplate = 'modern' | 'academic' | 'minimalist' | 'ats';

export interface TemplateOption {
  id: ResumeTemplate;
  name: string;
  tagline: string;
  badge: string;
}

export const TEMPLATE_OPTIONS: TemplateOption[] = [
  {
    id: 'modern',
    name: 'Modern Casual',
    tagline: 'Vibrant & approachable with colorful skill pills',
    badge: 'Popular for Retail & Fast Food',
  },
  {
    id: 'academic',
    name: 'Academic / Trainee',
    tagline: 'Distinguished navy & structured serif headings',
    badge: 'Best for Apprenticeships & Tutoring',
  },
  {
    id: 'minimalist',
    name: 'Clean Minimalist',
    tagline: 'High-contrast monochrome typographic layout',
    badge: 'Universal & Modern',
  },
  {
    id: 'ats',
    name: 'ATS Single-Page',
    tagline: '100% ATS parser compliant single-column structure',
    badge: 'Recommended for Online Portals (Coles, Maccas, Kmart)',
  },
];

export interface StarInterviewQA {
  id: string;
  q: string;
  context: string;
  situation: string;
  task: string;
  action: string;
  result: string;
  coachTip: string;
}

export const STAR_INTERVIEW_SCENARIOS: StarInterviewQA[] = [
  {
    id: 'diff-cust',
    q: '1. Tell me about a time you handled a difficult situation or upset customer.',
    context: 'Crucial for retail & fast food. Shows emotional maturity, de-escalation, and composure.',
    situation:
      'During a peak Friday dinner rush at our school canteen BBQ, a customer was visibly frustrated because their order was delayed and missing a drink.',
    task: 'I needed to de-escalate their frustration calmly, fix the order accurately, and avoid slowing down the rest of the queue.',
    action:
      'I maintained eye contact, listened actively without interrupting, apologized sincerely for the wait, quickly retrieved their missing drink personally, and checked that their hot food was fresh.',
    result:
      'The customer appreciated the prompt resolution, smiled, and thanked me for staying polite. The queue kept moving smoothly without further delay.',
    coachTip:
      'Never blame teammates or the customer. Focus on listening first, taking personal ownership of the fix, and keeping your tone calm.',
  },
  {
    id: 'rush-team',
    q: '2. Describe a time you worked as part of a team during a high-pressure rush.',
    context: 'Tests whether you support others or shut down when shifts become hectic.',
    situation:
      'At our school athletics carnival, our stall had a sudden rush of over 60 students queuing simultaneously during the 20-minute morning tea interval.',
    task: 'We had to serve everyone quickly and safely before the bell rang without miscounting change or dropping stock.',
    action:
      'I suggested a clear division of roles: two students took orders and card payments, while I packed the food and restocked drinks continuously, calling out order numbers clearly.',
    result:
      'We served all 60 students in 15 minutes with zero till discrepancies, broke our fundraising sales target, and received praise from the supervising teacher.',
    coachTip:
      'Highlight communication with coworkers and how dividing tasks created efficiency.',
  },
  {
    id: 'punctuality',
    q: '3. How do you demonstrate reliability and punctuality when balancing school and work?',
    context: 'Managers fear teens not showing up for weekend or early shifts. Prove you are 100% dependable.',
    situation:
      'Throughout Year 10, I had to balance heavy assessment periods with early 7:30am Saturday morning sports refereeing commitments.',
    task: 'I needed to ensure I never arrived late or let down the junior teams while keeping up my academic grades.',
    action:
      'I set up a shared digital calendar for shift rosters and study blocks, packed my uniform and gear the night before, set two alarms, and consistently arrived 15 minutes before kick-off.',
    result:
      'I achieved a 100% on-time attendance record across 22 consecutive weeks of games and maintained an A-grade average in my school subjects.',
    coachTip:
      'Punctuality is the #1 trait store managers value in teen hires. Give an exact statistic like arriving 15 minutes early.',
  },
  {
    id: 'hazard-safety',
    q: '4. Tell me about a time you identified a safety hazard and took action (WHS).',
    context: 'Safe Work Australia requires hazard awareness. Demonstrates non-negotiable duty of care.',
    situation:
      'While helping out at a school community hall event, I noticed a large container of water had leaked across the polished wooden floor near the main doorway.',
    task: 'Prevent people from slipping or falling, especially elderly visitors and young children.',
    action:
      'I stood by the wet spot immediately to direct people around it, asked a peer to bring the yellow hazard warning cone, and used the absorbent mop to dry the area completely.',
    result:
      'No one slipped or was injured, and the supervisor thanked me for taking immediate initiative rather than assuming someone else would clean it.',
    coachTip:
      'Employers love young workers who treat safety as an active personal responsibility. Mention guarding the hazard before cleaning it.',
  },
  {
    id: 'feedback',
    q: '5. How do you handle constructive feedback or mistakes if a manager corrects you?',
    context: 'Shows humility, trainability, and willingness to learn without being defensive.',
    situation:
      'When learning the school library inventory scanner system, the librarian pointed out that I had misclassified three reserve textbooks under the general fiction category.',
    task: 'I needed to correct the misplaced books immediately and ensure I learned the cataloging codes accurately.',
    action:
      'I thanked the librarian for pointing it out, took detailed notes in my pocket notepad on the correct classification codes, and re-scanned the shelf to confirm all books were in order.',
    result:
      'I never repeated that mistake, and the librarian subsequently trusted me to train two new Year 8 student volunteers on the system.',
    coachTip:
      'Saying "Thank you for pointing that out" proves emotional maturity. Emphasize how you fixed the issue and permanently improved.',
  },
  {
    id: 'team-conflict',
    q: '6. Describe a situation where you had a miscommunication with a peer and how you resolved it.',
    context: 'Reveals conflict resolution skills and professional workplace maturity.',
    situation:
      'During a science group project, my partner and I had conflicting ideas on how to format our presentation, leading to delays two days before the due date.',
    task: 'We needed to find common ground quickly to submit a polished presentation on time.',
    action:
      'Instead of arguing over text, I scheduled a 15-minute face-to-face chat during lunch. I listened to their perspective, suggested merging their design ideas with my data analysis, and created an agreed split of remaining slides.',
    result:
      'We submitted the assignment 12 hours ahead of the deadline and received a High Distinction mark for team coherence.',
    coachTip:
      'Show that you stepped away from heated emotions, moved to direct communication, and found a win-win compromise.',
  },
  {
    id: 'customer-service',
    q: '7. What would you do if a customer asks for an item you cannot find in-store?',
    context: 'Retail gold standard: never say "I don\'t know" and walk away.',
    situation:
      'A customer approaches you asking for a specific brand or item that is not on its regular shelf.',
    task: 'Help the customer locate the product or provide an accurate alternative without leaving them abandoned.',
    action:
      'I warmly say: "I would be very happy to help you find that! Let me check our inventory system right now." I look up the shelf location on our store scanner, walk with the customer directly to the aisle, and if out of stock, check nearby stores or offer a similar alternative.',
    result:
      'The customer feels valued and respected, gets their problem solved, and leaves with a positive impression of the business.',
    coachTip:
      'Always emphasize *walking with the customer* rather than pointing across the store with a finger.',
  },
];

export function TeenResumeBuilder() {
  const { profile } = useTeenProfile();

  const [selectedPreset, setSelectedPreset] = useState<number>(0);
  const [selectedTemplate, setSelectedTemplate] = useState<ResumeTemplate>('ats');
  const [schoolYear, setSchoolYear] = useState<string>(ROLE_PRESETS[0].schoolYear);
  const [suburb, setSuburb] = useState<string>('Brisbane, QLD');
  const [phone, setPhone] = useState<string>('0400 000 000');
  const [email, setEmail] = useState<string>(
    `${profile.name.toLowerCase().replace(/\s+/g, '') || 'teen'}.work@gmail.com`,
  );
  const [keySkill1, setKeySkill1] = useState<string>(ROLE_PRESETS[0].skills[0]);
  const [keySkill2, setKeySkill2] = useState<string>(ROLE_PRESETS[0].skills[1]);
  const [keySkill3, setKeySkill3] = useState<string>(ROLE_PRESETS[0].skills[2]);
  const [availability, setAvailability] = useState<string>(ROLE_PRESETS[0].availability);
  const [volunteerExperience, setVolunteerExperience] = useState<string>(ROLE_PRESETS[0].experience);
  const [schoolAchievements, setSchoolAchievements] = useState<string>(ROLE_PRESETS[0].schoolAchievements);
  const [sportsLeadership, setSportsLeadership] = useState<string>(ROLE_PRESETS[0].sportsLeadership);
  const [certifications, setCertifications] = useState<string>(ROLE_PRESETS[0].certifications);
  const [profileSummary, setProfileSummary] = useState<string>(ROLE_PRESETS[0].profileSummary);
  const [references, setReferences] = useState<string>(
    'Available upon request (High School Teacher & Junior Sports Coach)',
  );

  const [copiedType, setCopiedType] = useState<'text' | 'md' | 'star' | null>(null);
  const [activeInterviewQ, setActiveInterviewQ] = useState<number | null>(0);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState<boolean>(false);

  // Custom STAR builder interactive state
  const [customS, setCustomS] = useState<string>(STAR_INTERVIEW_SCENARIOS[0].situation);
  const [customT, setCustomT] = useState<string>(STAR_INTERVIEW_SCENARIOS[0].task);
  const [customA, setCustomA] = useState<string>(STAR_INTERVIEW_SCENARIOS[0].action);
  const [customR, setCustomR] = useState<string>(STAR_INTERVIEW_SCENARIOS[0].result);

  const applyPreset = (idx: number) => {
    const p = ROLE_PRESETS[idx];
    setSelectedPreset(idx);
    setSchoolYear(p.schoolYear);
    setKeySkill1(p.skills[0]);
    setKeySkill2(p.skills[1]);
    setKeySkill3(p.skills[2]);
    setAvailability(p.availability);
    setVolunteerExperience(p.experience);
    setSchoolAchievements(p.schoolAchievements);
    setSportsLeadership(p.sportsLeadership);
    setCertifications(p.certifications);
    setProfileSummary(p.profileSummary);
    sound.playClick();
  };

  const addSkillChip = (chip: string) => {
    sound.playClick();
    if (!keySkill1) setKeySkill1(chip);
    else if (!keySkill2) setKeySkill2(chip);
    else setKeySkill3(chip);
  };

  const loadScenarioIntoBuilder = (qa: StarInterviewQA) => {
    setCustomS(qa.situation);
    setCustomT(qa.task);
    setCustomA(qa.action);
    setCustomR(qa.result);
    sound.playClick();
  };

  const getFullResumeText = () => {
    return `${profile.name.toUpperCase()}
${suburb} • ${phone} • ${email}
${schoolYear} Student • Available: ${availability}

PERSONAL PROFILE
${profileSummary}

KEY STRENGTHS & SKILLS
• ${keySkill1}
• ${keySkill2}
• ${keySkill3}

EDUCATION & ACADEMIC ACHIEVEMENTS
• High School Student — ${schoolYear} (Expected Completion: 2028)
• ${schoolAchievements}

LEADERSHIP & SPORTS
• ${sportsLeadership}

INFORMAL WORK, BABYSITTING & VOLUNTEERING
• ${volunteerExperience}

CERTIFICATIONS & CREDENTIALS
• ${certifications}

ROSTER AVAILABILITY
• ${availability}

REFERENCES
• ${references}`;
  };

  const getFullResumeMarkdown = () => {
    return `# ${profile.name}
**${suburb}** | **${phone}** | **${email}**
**${schoolYear} Student** | **Available:** ${availability}

---

### Personal Profile
${profileSummary}

### Key Strengths & Skills
* **${keySkill1}**
* **${keySkill2}**
* **${keySkill3}**

### Education & Academic Achievements
* **High School Student** — ${schoolYear} (Expected Completion: 2028)
* ${schoolAchievements}

### Leadership, Sports & Extracurriculars
* ${sportsLeadership}

### Informal Work, Babysitting & Volunteering
* ${volunteerExperience}

### Certifications & Credentials
* ${certifications}

### Roster Availability
* ${availability}

### References
* ${references}`;
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.3 },
        colors: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b'],
        disableForReducedMotion: true,
      });
    } catch {
      // ignore
    }
  };

  const handleCopy = (type: 'text' | 'md') => {
    const content = type === 'text' ? getFullResumeText() : getFullResumeMarkdown();
    navigator.clipboard.writeText(content);
    sound.playSuccess();
    triggerConfetti();
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  const copyCustomStarAnswer = () => {
    const formatted = `Situation: ${customS}\nTask: ${customT}\nAction: ${customA}\nResult: ${customR}`;
    navigator.clipboard.writeText(formatted);
    sound.playSuccess();
    triggerConfetti();
    setCopiedType('star');
    setTimeout(() => setCopiedType(null), 2500);
  };

  // ATS Health Check Live Score
  const wordCount = (
    profileSummary +
    ' ' +
    schoolAchievements +
    ' ' +
    sportsLeadership +
    ' ' +
    volunteerExperience
  ).trim().split(/\s+/).length;
  const isWordCountOptimal = wordCount >= 60 && wordCount <= 260;
  const hasPhone = phone.trim().length >= 8;
  const hasCert = certifications.trim().length > 3;
  const hasLeadership = sportsLeadership.trim().length > 5;
  const atsScore = Math.min(
    100,
    70 +
      (isWordCountOptimal ? 10 : 5) +
      (hasPhone ? 5 : 0) +
      (hasCert ? 5 : 0) +
      (hasLeadership ? 10 : 5),
  );

  /* Resume Preview Rendering helper based on selectedTemplate */
  const renderResumeContent = () => {
    // 1. ATS Single-Page Template (Highest Recommendation)
    if (selectedTemplate === 'ats') {
      return (
        <div className="font-sans space-y-4 text-black dark:text-slate-100 print:text-black">
          {/* Header */}
          <div className="border-b-2 border-black dark:border-white pb-2 text-center print:border-black">
            <h2 className="text-2xl font-black uppercase tracking-wider text-black dark:text-white print:text-black">
              {profile.name}
            </h2>
            <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 mt-1 print:text-black">
              {suburb} • {phone} • {email}
            </p>
            <p className="text-[11px] text-neutral-700 dark:text-neutral-300 font-medium print:text-neutral-800">
              {schoolYear} High School Student • Available: {availability}
            </p>
          </div>

          <div className="space-y-3.5 text-xs leading-relaxed">
            {/* Objective */}
            <div>
              <h4 className="font-black uppercase text-[11px] tracking-wider text-black dark:text-white border-b border-neutral-400 dark:border-neutral-600 pb-0.5 mb-1 print:text-black print:border-black">
                OBJECTIVE & PERSONAL PROFILE
              </h4>
              <p className="text-neutral-800 dark:text-neutral-200 print:text-black">
                {profileSummary}
              </p>
            </div>

            {/* Core Skills */}
            <div>
              <h4 className="font-black uppercase text-[11px] tracking-wider text-black dark:text-white border-b border-neutral-400 dark:border-neutral-600 pb-0.5 mb-1 print:text-black print:border-black">
                CORE SKILLS & COMPETENCIES
              </h4>
              <ul className="list-disc list-inside space-y-0.5 text-neutral-800 dark:text-neutral-200 print:text-black">
                <li><strong>{keySkill1}</strong></li>
                <li><strong>{keySkill2}</strong></li>
                <li><strong>{keySkill3}</strong></li>
              </ul>
            </div>

            {/* Education */}
            <div>
              <h4 className="font-black uppercase text-[11px] tracking-wider text-black dark:text-white border-b border-neutral-400 dark:border-neutral-600 pb-0.5 mb-1 print:text-black print:border-black">
                EDUCATION & ACADEMIC ACHIEVEMENTS
              </h4>
              <p className="font-bold text-neutral-900 dark:text-white print:text-black">
                High School Student — {schoolYear} (Expected Year 12 Completion: 2028)
              </p>
              <p className="text-neutral-800 dark:text-neutral-200 print:text-black">
                • {schoolAchievements}
              </p>
            </div>

            {/* Leadership & Sports */}
            <div>
              <h4 className="font-black uppercase text-[11px] tracking-wider text-black dark:text-white border-b border-neutral-400 dark:border-neutral-600 pb-0.5 mb-1 print:text-black print:border-black">
                LEADERSHIP, SPORTS & EXTRACURRICULARS
              </h4>
              <p className="text-neutral-800 dark:text-neutral-200 print:text-black">
                • {sportsLeadership}
              </p>
            </div>

            {/* Informal Work & Volunteering */}
            <div>
              <h4 className="font-black uppercase text-[11px] tracking-wider text-black dark:text-white border-b border-neutral-400 dark:border-neutral-600 pb-0.5 mb-1 print:text-black print:border-black">
                VOLUNTEERING, BABYSITTING & INFORMAL WORK
              </h4>
              <p className="text-neutral-800 dark:text-neutral-200 print:text-black">
                • {volunteerExperience}
              </p>
            </div>

            {/* Certifications */}
            <div>
              <h4 className="font-black uppercase text-[11px] tracking-wider text-black dark:text-white border-b border-neutral-400 dark:border-neutral-600 pb-0.5 mb-1 print:text-black print:border-black">
                CERTIFICATIONS & ACCREDITATIONS
              </h4>
              <p className="text-neutral-800 dark:text-neutral-200 print:text-black">
                • {certifications}
              </p>
            </div>

            {/* Availability & References */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-neutral-300 dark:border-neutral-700 print:border-neutral-400">
              <div>
                <span className="font-bold text-[10px] uppercase text-neutral-600 dark:text-neutral-400 block print:text-black">
                  Roster Availability:
                </span>
                <span className="text-[11px] text-neutral-800 dark:text-neutral-200 print:text-black">
                  {availability}
                </span>
              </div>
              <div>
                <span className="font-bold text-[10px] uppercase text-neutral-600 dark:text-neutral-400 block print:text-black">
                  References:
                </span>
                <span className="text-[11px] text-neutral-800 dark:text-neutral-200 print:text-black">
                  {references}
                </span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // 2. Academic / Trainee Template
    if (selectedTemplate === 'academic') {
      return (
        <div className="font-serif space-y-4 text-slate-900 dark:text-slate-100">
          <div className="border-b-2 border-slate-700 dark:border-slate-300 pb-3 text-center">
            <h2 className="text-2xl font-bold tracking-normal uppercase text-slate-900 dark:text-white">
              {profile.name}
            </h2>
            <p className="text-xs font-sans text-slate-600 dark:text-slate-300 mt-1">
              {suburb} • {phone} • {email}
            </p>
            <p className="text-[11px] font-sans text-slate-500 dark:text-slate-400 mt-0.5">
              {schoolYear} Student • Available: {availability}
            </p>
          </div>

          <div className="space-y-3.5 text-xs font-sans">
            <div>
              <h4 className="font-serif font-bold uppercase text-[11px] text-slate-800 dark:text-slate-200 border-b border-slate-300 dark:border-slate-700 pb-1 mb-1 tracking-wider">
                Objective & Profile
              </h4>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed italic">
                "{profileSummary}"
              </p>
            </div>

            <div>
              <h4 className="font-serif font-bold uppercase text-[11px] text-slate-800 dark:text-slate-200 border-b border-slate-300 dark:border-slate-700 pb-1 mb-1 tracking-wider">
                Core Competencies & Skills
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-0.5">
                {[keySkill1, keySkill2, keySkill3].map((skill, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded bg-slate-100 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-[11px] font-semibold text-slate-800 dark:text-slate-200 text-center"
                  >
                    {skill}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-serif font-bold uppercase text-[11px] text-slate-800 dark:text-slate-200 border-b border-slate-300 dark:border-slate-700 pb-1 mb-1 tracking-wider">
                Education & Academic Standing
              </h4>
              <p className="text-slate-800 dark:text-slate-200 font-medium">
                High School Student — {schoolYear} (Expected Completion: 2028)
              </p>
              <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                • {schoolAchievements}
              </p>
            </div>

            <div>
              <h4 className="font-serif font-bold uppercase text-[11px] text-slate-800 dark:text-slate-200 border-b border-slate-300 dark:border-slate-700 pb-1 mb-1 tracking-wider">
                Leadership & Extracurriculars
              </h4>
              <p className="text-slate-700 dark:text-slate-300">
                • {sportsLeadership}
              </p>
            </div>

            <div>
              <h4 className="font-serif font-bold uppercase text-[11px] text-slate-800 dark:text-slate-200 border-b border-slate-300 dark:border-slate-700 pb-1 mb-1 tracking-wider">
                Volunteering & Informal Experience
              </h4>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                • {volunteerExperience}
              </p>
            </div>

            <div>
              <h4 className="font-serif font-bold uppercase text-[11px] text-slate-800 dark:text-slate-200 border-b border-slate-300 dark:border-slate-700 pb-1 mb-1 tracking-wider">
                Certifications
              </h4>
              <p className="text-slate-700 dark:text-slate-300">
                • {certifications}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 italic text-center">
              References: {references}
            </div>
          </div>
        </div>
      );
    }

    // 3. Clean Minimalist Template
    if (selectedTemplate === 'minimalist') {
      return (
        <div className="font-mono space-y-4 text-slate-900 dark:text-slate-100">
          <div className="border-b border-dashed border-slate-400 dark:border-slate-600 pb-3">
            <h2 className="text-xl font-bold tracking-tight text-foreground uppercase">
              {profile.name}
            </h2>
            <div className="text-[11px] text-muted-foreground mt-0.5 space-x-2">
              <span>{suburb}</span> | <span>{phone}</span> | <span>{email}</span>
            </div>
            <div className="text-[10px] text-muted-foreground mt-0.5">
              <span>{schoolYear} Student</span> | <span>Roster: {availability}</span>
            </div>
          </div>

          <div className="space-y-3.5 text-xs font-sans">
            <div>
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-0.5">
                // 01. PROFILE SUMMARY
              </span>
              <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
                {profileSummary}
              </p>
            </div>

            <div>
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-0.5">
                // 02. KEY STRENGTHS
              </span>
              <ul className="space-y-1 text-slate-800 dark:text-slate-200 font-sans">
                <li className="flex items-center gap-2">
                  <span className="text-primary font-mono">•</span>
                  <span>{keySkill1}</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary font-mono">•</span>
                  <span>{keySkill2}</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary font-mono">•</span>
                  <span>{keySkill3}</span>
                </li>
              </ul>
            </div>

            <div>
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-0.5">
                // 03. EDUCATION & ACHIEVEMENTS
              </span>
              <p className="text-slate-800 dark:text-slate-200 font-sans font-medium">
                High School Student — {schoolYear} (Graduating 2028)
              </p>
              <p className="text-slate-600 dark:text-slate-400 text-[11px] font-sans">
                • {schoolAchievements}
              </p>
            </div>

            <div>
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-0.5">
                // 04. LEADERSHIP & EXTRACURRICULARS
              </span>
              <p className="text-slate-800 dark:text-slate-200 font-sans">
                • {sportsLeadership}
              </p>
            </div>

            <div>
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-0.5">
                // 05. VOLUNTEERING & INFORMAL WORK
              </span>
              <p className="text-slate-800 dark:text-slate-200 font-sans">
                • {volunteerExperience}
              </p>
            </div>

            <div>
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-0.5">
                // 06. CERTIFICATIONS
              </span>
              <p className="text-slate-800 dark:text-slate-200 font-sans">
                • {certifications}
              </p>
            </div>

            <div className="pt-2 border-t border-dashed border-slate-300 dark:border-slate-700 text-[10px] text-muted-foreground font-mono">
              // REFERENCES: {references}
            </div>
          </div>
        </div>
      );
    }

    // 4. Default 'modern' template
    return (
      <div className="space-y-4 font-sans">
        <div className="border-b-2 border-primary/80 pb-3 text-center sm:text-left bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-3 rounded-xl">
          <h2 className="text-2xl font-extrabold tracking-tight text-foreground">{profile.name}</h2>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">
            {suburb} • {phone} • {email}
          </p>
          <p className="text-[11px] text-primary font-bold mt-0.5">
            {schoolYear} Student • Available: {availability}
          </p>
        </div>

        <div className="space-y-3.5 text-xs">
          <div>
            <h4 className="font-extrabold uppercase text-[11px] text-primary tracking-wider mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              <span>Personal Profile</span>
            </h4>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed bg-muted/30 p-2.5 rounded-lg border border-border/50">
              {profileSummary}
            </p>
          </div>

          <div>
            <h4 className="font-extrabold uppercase text-[11px] text-primary tracking-wider mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Key Strengths & Skills</span>
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {[keySkill1, keySkill2, keySkill3].map((s, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary font-bold text-[11px]"
                >
                  ✓ {s}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-extrabold uppercase text-[11px] text-primary tracking-wider mb-1 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-blue-500" />
              <span>Education & School Achievements</span>
            </h4>
            <p className="text-slate-700 dark:text-slate-300 font-medium">
              High School Student — {schoolYear} (Expected completion 2028)
            </p>
            <p className="text-muted-foreground text-[11px] mt-0.5">• {schoolAchievements}</p>
          </div>

          <div>
            <h4 className="font-extrabold uppercase text-[11px] text-primary tracking-wider mb-1 flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span>Leadership & Sports</span>
            </h4>
            <p className="text-slate-700 dark:text-slate-300">• {sportsLeadership}</p>
          </div>

          <div>
            <h4 className="font-extrabold uppercase text-[11px] text-primary tracking-wider mb-1 flex items-center gap-1.5">
              <HeartHandshake className="w-3.5 h-3.5 text-emerald-500" />
              <span>Volunteering & Informal Experience</span>
            </h4>
            <p className="text-slate-700 dark:text-slate-300">• {volunteerExperience}</p>
          </div>

          <div>
            <h4 className="font-extrabold uppercase text-[11px] text-primary tracking-wider mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
              <span>Certifications</span>
            </h4>
            <p className="text-slate-700 dark:text-slate-300">• {certifications}</p>
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
            <span>References: {references}</span>
            <span className="font-mono text-[10px] text-primary font-bold">First Job AU</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4 print:hidden">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-5 h-5 text-indigo-500" />
            <h2 className="text-xl font-bold text-foreground">
              First Job Resume Builder & STAR Interview Simulator (14–17yo)
            </h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Zero prior paid experience? No worries! Build an ATS-friendly single-page Aussie teen resume leveraging school achievements, sports captaincy, babysitting, and volunteering.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Copy Plain Text */}
          <button
            type="button"
            onClick={() => handleCopy('text')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              copiedType === 'text'
                ? 'bg-emerald-500 text-white shadow-xs'
                : 'bg-primary text-primary-foreground hover:opacity-90'
            }`}
          >
            {copiedType === 'text' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedType === 'text' ? 'Copied Text!' : 'Copy Text'}</span>
          </button>

          {/* Copy Markdown */}
          <button
            type="button"
            onClick={() => handleCopy('md')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-border bg-card hover:bg-muted text-foreground transition-all ${
              copiedType === 'md' ? 'border-emerald-500 text-emerald-600 bg-emerald-500/10' : ''
            }`}
            title="Copy as Markdown formatted text"
          >
            {copiedType === 'md' ? <Check className="w-3.5 h-3.5" /> : <FileCode className="w-3.5 h-3.5" />}
            <span>{copiedType === 'md' ? 'Copied MD!' : 'Markdown'}</span>
          </button>

          {/* Full-Screen Drawer / Live Preview Modal Toggle */}
          <button
            type="button"
            onClick={() => setIsPreviewModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-border bg-card hover:bg-muted text-foreground transition-all"
            title="Open large preview drawer"
          >
            <Maximize2 className="w-3.5 h-3.5 text-muted-foreground" />
            <span>Full Preview</span>
          </button>

          {/* Print Button */}
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-border bg-card hover:bg-muted text-foreground transition-all"
          >
            <Printer className="w-3.5 h-3.5 text-muted-foreground" />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* ATS Compatibility Meter & Zero-Experience Guidance */}
      <Card variant="glass" className="p-4 bg-gradient-to-r from-emerald-500/10 via-primary/5 to-transparent border-emerald-500/30 print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              <h3 className="text-sm font-bold text-foreground">
                ATS Scanner Readiness: {atsScore}% Compatible
              </h3>
              <Badge variant="success" className="text-[10px]">
                {atsScore >= 90 ? 'Applicant Tracking System Ready' : 'Optimization Recommended'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Major Australian retailers (Coles, Woolies, McDonald's, Kmart) use automated software to scan resumes. Single-column layouts, clean headings, and no fancy text boxes guarantee your resume gets seen by a real manager!
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold">
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" /> 1-Page Format
            </span>
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" /> Privacy-Safe Contact
            </span>
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" /> Zero Experience Friendly
            </span>
          </div>
        </div>
      </Card>

      {/* Design Template Selector Bar */}
      <div className="space-y-2 print:hidden">
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Palette className="w-3.5 h-3.5 text-primary" />
          <span>Select Resume Design Template:</span>
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {TEMPLATE_OPTIONS.map(tpl => {
            const isSelected = selectedTemplate === tpl.id;
            return (
              <button
                key={tpl.id}
                type="button"
                onClick={() => {
                  setSelectedTemplate(tpl.id);
                  sound.playClick();
                }}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? 'border-primary bg-primary/10 text-primary font-bold shadow-xs ring-1 ring-primary/40'
                    : 'border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-extrabold text-xs text-foreground">{tpl.name}</span>
                  <Badge variant={isSelected ? 'default' : 'outline'} className="text-[9px]">
                    {tpl.badge}
                  </Badge>
                </div>
                <p className="text-[11px] opacity-80">{tpl.tagline}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Role Presets Bar (7 Zero-Experience Options) */}
      <div className="space-y-2 print:hidden">
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Quick-Load 14–17yo First Job Presets (No Paid Experience Needed):</span>
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2">
          {ROLE_PRESETS.map((preset, idx) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => applyPreset(idx)}
              className={`p-2 rounded-xl border text-left text-xs transition-all ${
                selectedPreset === idx
                  ? 'border-primary bg-primary/10 text-primary font-bold shadow-xs'
                  : 'border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <span className="block font-bold truncate text-[11px]">{preset.name.split('(')[0]}</span>
              <span className="text-[10px] opacity-80 truncate block">{preset.badge}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Editor & Live Preview Side-by-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Editor Form Card */}
        <Card variant="glass" className="lg:col-span-6 p-5 space-y-4 print:hidden">
          <h3 className="font-bold text-sm text-foreground flex items-center gap-2 border-b border-border pb-2">
            <User className="w-4 h-4 text-primary" />
            <span>Customize Your First-Job Profile:</span>
          </h3>

          <div className="space-y-3 text-xs">
            {/* Contact Details */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-semibold text-muted-foreground block mb-1">Year Level</label>
                <input
                  type="text"
                  value={schoolYear}
                  onChange={e => setSchoolYear(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-card border border-border text-foreground font-medium"
                />
              </div>
              <div>
                <label className="font-semibold text-muted-foreground block mb-1">Suburb, State</label>
                <input
                  type="text"
                  value={suburb}
                  onChange={e => setSuburb(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-card border border-border text-foreground font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-semibold text-muted-foreground block mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-card border border-border text-foreground font-medium"
                />
              </div>
              <div>
                <label className="font-semibold text-muted-foreground block mb-1">Professional Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-card border border-border text-foreground font-medium"
                />
              </div>
            </div>

            {/* Profile Summary */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-muted-foreground">Profile Summary / Objective</label>
                <span className="text-[10px] text-muted-foreground">{profileSummary.length} chars</span>
              </div>
              <textarea
                rows={3}
                value={profileSummary}
                onChange={e => setProfileSummary(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-card border border-border text-foreground text-xs leading-relaxed"
              />
            </div>

            {/* 3 Key Skills */}
            <div>
              <label className="font-semibold text-muted-foreground block mb-1">Top 3 Skills / Strengths</label>
              <div className="space-y-1.5">
                <input
                  type="text"
                  value={keySkill1}
                  onChange={e => setKeySkill1(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-card border border-border text-foreground"
                />
                <input
                  type="text"
                  value={keySkill2}
                  onChange={e => setKeySkill2(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-card border border-border text-foreground"
                />
                <input
                  type="text"
                  value={keySkill3}
                  onChange={e => setKeySkill3(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-card border border-border text-foreground"
                />
              </div>
              <div className="flex flex-wrap gap-1 pt-2">
                {POPULAR_SKILL_CHIPS.map(chip => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => addSkillChip(chip)}
                    className="px-2 py-0.5 rounded-md bg-muted text-[10px] text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                  >
                    + {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* School Achievements */}
            <div>
              <label className="font-semibold text-muted-foreground block mb-1">
                School Achievements & Academic Record
              </label>
              <input
                type="text"
                value={schoolAchievements}
                onChange={e => setSchoolAchievements(e.target.value)}
                placeholder="e.g. Year 10 Honour Roll, 99% attendance record"
                className="w-full px-3 py-1.5 rounded-xl bg-card border border-border text-foreground font-medium"
              />
            </div>

            {/* Sports & Leadership */}
            <div>
              <label className="font-semibold text-muted-foreground block mb-1">
                Sports Captaincy, Athletics & Leadership
              </label>
              <input
                type="text"
                value={sportsLeadership}
                onChange={e => setSportsLeadership(e.target.value)}
                placeholder="e.g. Under-15 Netball Captain, Debating Team Speaker"
                className="w-full px-3 py-1.5 rounded-xl bg-card border border-border text-foreground font-medium"
              />
            </div>

            {/* Volunteering & Informal Experience */}
            <div>
              <label className="font-semibold text-muted-foreground block mb-1">
                Volunteering, Babysitting & Informal Jobs
              </label>
              <input
                type="text"
                value={volunteerExperience}
                onChange={e => setVolunteerExperience(e.target.value)}
                placeholder="e.g. Weekly Canteen Volunteer, Neighbourhood Babysitting"
                className="w-full px-3 py-1.5 rounded-xl bg-card border border-border text-foreground font-medium"
              />
            </div>

            {/* Certifications & Licenses */}
            <div>
              <label className="font-semibold text-muted-foreground block mb-1">
                Certifications & Credentials (First Aid, Food Safety, RSA, White Card)
              </label>
              <input
                type="text"
                value={certifications}
                onChange={e => setCertifications(e.target.value)}
                placeholder="e.g. HLTAID011 Provide First Aid & CPR"
                className="w-full px-3 py-1.5 rounded-xl bg-card border border-border text-foreground font-medium"
              />
            </div>

            {/* Roster Availability */}
            <div>
              <label className="font-semibold text-muted-foreground block mb-1">
                Roster Availability (Hours & Days)
              </label>
              <input
                type="text"
                value={availability}
                onChange={e => setAvailability(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-card border border-border text-foreground font-medium"
              />
            </div>

            {/* References */}
            <div>
              <label className="font-semibold text-muted-foreground block mb-1">
                References / Contacts
              </label>
              <input
                type="text"
                value={references}
                onChange={e => setReferences(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-card border border-border text-foreground font-medium"
              />
            </div>
          </div>
        </Card>

        {/* Live Resume Card with Print Styles */}
        <div id="teen-resume-print-area" className="lg:col-span-6 relative print:m-0 print:p-0 print:w-full">
          <Card
            variant="glass"
            className="p-6 space-y-4 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border-2 border-primary/30 shadow-lg print:border-none print:shadow-none print:bg-white print:text-black print:p-8"
          >
            <div className="flex items-center justify-between border-b border-border/50 pb-2 print:hidden">
              <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-primary" />
                Live Preview ({TEMPLATE_OPTIONS.find(t => t.id === selectedTemplate)?.name})
              </span>
              <button
                type="button"
                onClick={() => setIsPreviewModalOpen(true)}
                className="text-[11px] text-primary hover:underline font-semibold flex items-center gap-1"
              >
                <Maximize2 className="w-3 h-3" /> Popout
              </button>
            </div>

            {renderResumeContent()}
          </Card>
        </div>
      </div>

      {/* Full Preview Drawer / Modal */}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in print:hidden">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-card border border-border p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-base text-foreground">Print-Ready Resume Preview</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-primary text-primary-foreground flex items-center gap-1.5 hover:opacity-90 transition-all"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsPreviewModalOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                  aria-label="Close Preview"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-border shadow-inner">
              {renderResumeContent()}
            </div>
          </div>
        </div>
      )}

      {/* Top Australian Teen Employers Grid */}
      <Card variant="glass" className="p-5 space-y-3 print:hidden">
        <div className="flex items-center justify-between gap-2 border-b border-border pb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h3 className="font-bold text-sm text-foreground">Top Australian Employers Hiring 14–17-Year-Olds</h3>
          </div>
          <Badge variant="outline" className="text-[10px]">Hiring Portals</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          {TOP_TEEN_EMPLOYERS_AU.map(emp => (
            <div key={emp.company} className="p-3 rounded-xl bg-card border border-border space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-primary">{emp.company}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-muted text-muted-foreground">{emp.minAge}</span>
              </div>
              <p className="text-foreground text-[11px]"><strong>Roles:</strong> {emp.roles}</p>
              <p className="text-muted-foreground text-[11px]"><strong>How:</strong> {emp.howToApply}</p>
              <p className="text-emerald-600 dark:text-emerald-400 text-[10px] font-medium pt-1 border-t border-border/40">
                💡 Tip: {emp.tip}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* STAR Method Interview Technique Simulator */}
      <Card variant="glass" className="p-6 space-y-5 print:hidden border-amber-500/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-base text-foreground">
              STAR Method Interview Technique Simulator:
            </h3>
          </div>
          <Badge variant="warning" className="text-[10px]">
            Retail & Hospitality Scenarios
          </Badge>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          The <strong>STAR method</strong> (<strong>Situation, Task, Action, Result</strong>) is the proven formula Australian hiring managers look for. It stops you from rambling and proves you have the real-world skills to thrive on the shop floor!
        </p>

        {/* Golden Rules Box */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs">
          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <span className="font-bold text-blue-600 dark:text-blue-400 block mb-1">S — Situation (15%)</span>
            <span className="text-muted-foreground text-[11px]">Set the scene simply. Where were you and what was the context?</span>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <span className="font-bold text-amber-600 dark:text-amber-400 block mb-1">T — Task (15%)</span>
            <span className="text-muted-foreground text-[11px]">What was the specific challenge, goal, or problem to solve?</span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <span className="font-bold text-emerald-600 dark:text-emerald-400 block mb-1">A — Action (50%)</span>
            <span className="text-muted-foreground text-[11px]">What did YOU specifically do? Use strong action verbs ("I listened", "I organized").</span>
          </div>
          <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
            <span className="font-bold text-purple-600 dark:text-purple-400 block mb-1">R — Result (20%)</span>
            <span className="text-muted-foreground text-[11px]">What was the positive, measurable outcome or lesson learned?</span>
          </div>
        </div>

        {/* 7 Interactive Scenario Accordions */}
        <div className="space-y-2.5">
          {STAR_INTERVIEW_SCENARIOS.map((item, idx) => {
            const isOpen = activeInterviewQ === idx;
            return (
              <div key={item.id} className="rounded-2xl border border-border bg-card overflow-hidden transition-all">
                <button
                  type="button"
                  onClick={() => {
                    setActiveInterviewQ(isOpen ? null : idx);
                    sound.playClick();
                  }}
                  className="w-full p-3.5 text-left flex items-center justify-between text-xs font-bold text-foreground focus:outline-none hover:bg-muted/30"
                >
                  <div className="space-y-0.5">
                    <span className="block text-foreground">{item.q}</span>
                    <span className="text-[11px] font-normal text-muted-foreground">{item.context}</span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 shrink-0 transition-transform ${
                      isOpen ? 'rotate-180 text-primary' : 'text-muted-foreground'
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="p-4 border-t border-border/50 bg-muted/40 text-xs space-y-3 animate-fade-in font-sans">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20">
                        <span className="font-bold text-blue-600 dark:text-blue-400 block text-[11px] mb-0.5">
                          [S] Situation:
                        </span>
                        <p className="text-foreground text-[11px]">{item.situation}</p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                        <span className="font-bold text-amber-600 dark:text-amber-400 block text-[11px] mb-0.5">
                          [T] Task:
                        </span>
                        <p className="text-foreground text-[11px]">{item.task}</p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 block text-[11px] mb-0.5">
                          [A] Action:
                        </span>
                        <p className="text-foreground text-[11px]">{item.action}</p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
                        <span className="font-bold text-purple-600 dark:text-purple-400 block text-[11px] mb-0.5">
                          [R] Result:
                        </span>
                        <p className="text-foreground text-[11px]">{item.result}</p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-border/40">
                      <p className="text-[11px] text-amber-700 dark:text-amber-300 font-medium">
                        💡 <strong>Why Interviewers Love This:</strong> {item.coachTip}
                      </p>
                      <button
                        type="button"
                        onClick={() => loadScenarioIntoBuilder(item)}
                        className="text-[11px] text-primary font-bold hover:underline shrink-0 flex items-center gap-1"
                      >
                        Load into Custom Practice Builder ↓
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Interactive Custom STAR Answer Builder & Rehearsal Tool */}
        <div className="p-5 rounded-2xl bg-card border border-primary/30 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-2">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-primary" />
              <h4 className="font-bold text-sm text-foreground">
                Interactive Custom STAR Answer Rehearsal Builder
              </h4>
            </div>
            <button
              type="button"
              onClick={copyCustomStarAnswer}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                copiedType === 'star'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-primary text-primary-foreground hover:opacity-90'
              }`}
            >
              {copiedType === 'star' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedType === 'star' ? 'Answer Copied!' : 'Copy Formatted Answer'}</span>
            </button>
          </div>

          <p className="text-xs text-muted-foreground">
            Type or refine your own STAR story below. Practice saying it aloud until it feels natural:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="font-bold text-blue-600 dark:text-blue-400 block mb-1">
                [S] Situation (Context & Setting)
              </label>
              <textarea
                rows={2}
                value={customS}
                onChange={e => setCustomS(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-muted/40 border border-border text-foreground"
              />
            </div>

            <div>
              <label className="font-bold text-amber-600 dark:text-amber-400 block mb-1">
                [T] Task (Problem or Goal)
              </label>
              <textarea
                rows={2}
                value={customT}
                onChange={e => setCustomT(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-muted/40 border border-border text-foreground"
              />
            </div>

            <div>
              <label className="font-bold text-emerald-600 dark:text-emerald-400 block mb-1">
                [A] Action (What YOU Personally Did)
              </label>
              <textarea
                rows={3}
                value={customA}
                onChange={e => setCustomA(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-muted/40 border border-border text-foreground"
              />
            </div>

            <div>
              <label className="font-bold text-purple-600 dark:text-purple-400 block mb-1">
                [R] Result (Outcome & Metrics)
              </label>
              <textarea
                rows={3}
                value={customR}
                onChange={e => setCustomR(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-muted/40 border border-border text-foreground"
              />
            </div>
          </div>

          {/* Spoken Speech Preview */}
          <div className="p-3.5 rounded-xl bg-muted/60 border border-border/60 text-xs text-foreground italic space-y-1">
            <span className="font-bold text-[11px] text-primary not-italic block">
              🗣 How Your Answer Sounds When Spoken in the Interview:
            </span>
            <p className="leading-relaxed">
              "{customS} My responsibility was to {customT.toLowerCase()} So what I did was {customA.toLowerCase()} As a result, {customR.toLowerCase()}"
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
