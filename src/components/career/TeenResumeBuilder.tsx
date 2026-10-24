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
} from 'lucide-react';
import { useTeenProfile } from '@/context/TeenProfileContext';
import { TOP_TEEN_EMPLOYERS_AU } from '@/data/teen-finance-data';
import { sound } from '@/lib/sound-synthesizer';

interface RolePreset {
  name: string;
  badge: string;
  schoolYear: string;
  skills: [string, string, string];
  availability: string;
  experience: string;
  profileSummary: string;
}

const ROLE_PRESETS: RolePreset[] = [
  {
    name: 'Supermarkets (Coles, Woolworths)',
    badge: 'Retail Assistant',
    schoolYear: 'Year 10',
    skills: ['Fast Barcode Scanning & POS Operation', 'Friendly & Polite Customer Service', 'Shelf Stocking & Product Replenishment'],
    availability: 'Friday after 4pm, Saturday & Sunday anytime',
    experience: 'School Canteen Volunteer, High Attendance Record',
    profileSummary: 'Energetic Year 10 student looking for a casual supermarket team member role. Reliable, quick to learn POS checkout systems, and dedicated to providing friendly service.',
  },
  {
    name: "Fast food (McDonald's, KFC, HJ's, GYG)",
    badge: 'Crew Member',
    schoolYear: 'Year 10',
    skills: ['Speed & Accuracy Under Pressure', 'Food Hygiene & Kitchen Cleanliness', 'Teamwork & Effective Communication'],
    availability: 'Weeknights (after 4:30pm) and full weekend rosters',
    experience: 'House Captain, School Sports Team Player',
    profileSummary: 'Hard-working and motivated Year 10 student eager to join a fast-paced crew. Brings positive energy, excellent punctuality, and works well under pressure during peak rushes.',
  },
  {
    name: 'Retail (Kmart, Target, Bunnings)',
    badge: 'Retail Team Member',
    schoolYear: 'Year 10',
    skills: ['Table Clearing & Kitchen Hygiene', 'POS Cash & Card Handling', 'Warm Greeting & Order Taking'],
    availability: 'Saturday & Sunday morning/lunch shifts',
    experience: 'Baking & Food Tech Elective, School Market Day Stall Organizer',
    profileSummary: 'Friendly and well-presented Year 10 student seeking a weekend retail role. Passionate about customer service, highly organized, and committed to a tidy environment.',
  },
  {
    name: 'Sports refereeing',
    badge: 'Match Official',
    schoolYear: 'Year 10',
    skills: ['Fair Decision Making & Rules Knowledge', 'Clear Whistle & Hand Signals', 'Conflict Resolution & Player Safety'],
    availability: 'Saturday & Sunday mornings',
    experience: 'Junior Club Player for 5 Years, Completed Level 1 Junior Referee Course',
    profileSummary: 'Active and confident Year 10 student seeking junior officiating roles. Deep knowledge of game rules, assertive communication, and committed to fair play and player safety.',
  },
  {
    name: 'Swim teaching',
    badge: 'Junior Swim Teacher',
    schoolYear: 'Year 10',
    skills: ['Water Safety', 'Patience & Encouragement', 'Clear Communication'],
    availability: 'Saturday mornings & After school',
    experience: 'School Swimming Team, AUSTSWIM certification',
    profileSummary: 'Responsible and enthusiastic Year 10 student available for junior swim teaching. Strong swimmer, patient with children, and highly safety-conscious.',
  },
  {
    name: 'Babysitting',
    badge: 'Babysitter / Mother’s Helper',
    schoolYear: 'Year 10',
    skills: ['Patient & Caring Supervision', 'First Aid / CPR Certified', 'Engaging Activity & Meal Prep'],
    availability: 'Friday & Saturday evenings, School Holidays',
    experience: 'Supervised younger siblings/cousins, Certified HLTAID011 First Aid',
    profileSummary: 'Responsible, patient, and CPR-certified Year 10 student available for local babysitting and after-school helper duties. Punctual, energetic, and highly safety-conscious.',
  },
];

const POPULAR_SKILL_CHIPS = [
  'Punctual & 100% Reliable',
  'POS Cash & Card Handling',
  'Friendly Customer Communication',
  'Fast Learner',
  'Team Player',
  'WHS & Food Safety Aware',
  'Calm Under Rush Pressure',
  'Stock Replenishment',
];

export type ResumeTemplate = 'modern' | 'academic' | 'minimalist';

interface TemplateOption {
  id: ResumeTemplate;
  name: string;
  tagline: string;
  badge: string;
}

const TEMPLATE_OPTIONS: TemplateOption[] = [
  {
    id: 'modern',
    name: 'Modern Casual',
    tagline: 'Vibrant & approachable with colorful skill pills',
    badge: 'Popular for Retail & Fast Food',
  },
  {
    id: 'academic',
    name: 'Academic / Trainee',
    tagline: 'Distinguished navy & structured headings',
    badge: 'Best for Apprenticeships & Tutoring',
  },
  {
    id: 'minimalist',
    name: 'Clean Minimalist',
    tagline: 'High-contrast monochrome typographic layout',
    badge: 'Universal & Ultra-Clean',
  },
];

export function TeenResumeBuilder() {
  const { profile } = useTeenProfile();

  const [selectedPreset, setSelectedPreset] = useState<number>(0);
  const [selectedTemplate, setSelectedTemplate] = useState<ResumeTemplate>('modern');
  const [schoolYear, setSchoolYear] = useState<string>(ROLE_PRESETS[0].schoolYear);
  const [suburb, setSuburb] = useState<string>('Brisbane, QLD');
  const [keySkill1, setKeySkill1] = useState<string>(ROLE_PRESETS[0].skills[0]);
  const [keySkill2, setKeySkill2] = useState<string>(ROLE_PRESETS[0].skills[1]);
  const [keySkill3, setKeySkill3] = useState<string>(ROLE_PRESETS[0].skills[2]);
  const [availability, setAvailability] = useState<string>(ROLE_PRESETS[0].availability);
  const [volunteerExperience, setVolunteerExperience] = useState<string>(ROLE_PRESETS[0].experience);
  const [profileSummary, setProfileSummary] = useState<string>(ROLE_PRESETS[0].profileSummary);

  const [copiedType, setCopiedType] = useState<'text' | 'md' | null>(null);
  const [activeInterviewQ, setActiveInterviewQ] = useState<number | null>(0);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState<boolean>(false);

  const applyPreset = (idx: number) => {
    const p = ROLE_PRESETS[idx];
    setSelectedPreset(idx);
    setSchoolYear(p.schoolYear);
    setKeySkill1(p.skills[0]);
    setKeySkill2(p.skills[1]);
    setKeySkill3(p.skills[2]);
    setAvailability(p.availability);
    setVolunteerExperience(p.experience);
    setProfileSummary(p.profileSummary);
  };

  const addSkillChip = (chip: string) => {
    if (!keySkill1) setKeySkill1(chip);
    else if (!keySkill2) setKeySkill2(chip);
    else setKeySkill3(chip);
  };

  const getFullResumeText = () => {
    return `${profile.name.toUpperCase()}
${suburb} • ${schoolYear} Student • Available: ${availability}

PERSONAL PROFILE
${profileSummary}

KEY STRENGTHS & SKILLS
• ${keySkill1}
• ${keySkill2}
• ${keySkill3}

EDUCATION
High School Student — ${schoolYear} (Expected completion 2028)

EXPERIENCE & VOLUNTEERING
• ${volunteerExperience}

AVAILABILITY
• ${availability}

REFERENCES
Available upon request (School Teacher & Sports Coach / Coordinator)`;
  };

  const getFullResumeMarkdown = () => {
    return `# ${profile.name}
**${suburb}** | **${schoolYear} Student** | **Available:** ${availability}

---

### Personal Profile
${profileSummary}

### Key Strengths & Skills
* **${keySkill1}**
* **${keySkill2}**
* **${keySkill3}**

### Education
* **High School Student** — ${schoolYear} (Expected Completion: 2028)

### Experience & Volunteering
* ${volunteerExperience}

### Availability
* ${availability}

### References
* Available upon request (School Teacher & Sports Coach / Coordinator)`;
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

  const interviewQAs = [
    {
      q: '1. Why do you want to work for our store / business?',
      starAnswer: 'Situation: I have been a regular customer here and love the friendly team atmosphere. Task: I want to build my work experience with an industry leader. Action: I researched your core customer values and team training. Result: I am excited to bring my punctuality and positive attitude to your shift roster!',
    },
    {
      q: '2. Tell me about a time you handled a difficult situation or busy moment.',
      starAnswer: 'Situation: During our school sports carnival, a huge queue formed at the canteen. Task: I needed to take orders quickly without making register errors. Action: I stayed calm, communicated clearly with each customer, and double-checked change. Result: We served over 100 students smoothly with zero till discrepancies.',
    },
    {
      q: '3. How do you handle feedback if a manager corrects a mistake?',
      starAnswer: 'Situation: When learning a new school laboratory procedure. Task: I needed to adjust my technique based on teacher feedback. Action: I thanked the teacher, noted the correct step immediately, and practiced it right away. Result: I mastered the technique safely and never repeated the initial error.',
    },
    {
      q: '4. What would you do if a customer asks for an item you cannot find?',
      starAnswer: 'Situation: A customer asks where a specific product is located. Task: Help the customer without leaving them waiting. Action: I politely say "Let me check our inventory for you right away", check our shelf app, and walk them directly to the aisle. Result: The customer leaves happy and well-assisted.',
    },
  ];

  /* Resume Preview Rendering helper based on selectedTemplate */
  const renderResumeContent = () => {
    if (selectedTemplate === 'academic') {
      return (
        <div className="font-serif space-y-5 text-slate-900 dark:text-slate-100">
          <div className="border-b-2 border-slate-700 dark:border-slate-300 pb-3 text-center">
            <h2 className="text-2xl font-bold tracking-normal uppercase text-slate-900 dark:text-white">
              {profile.name}
            </h2>
            <p className="text-xs font-sans text-slate-600 dark:text-slate-300 mt-1">
              {suburb} • {schoolYear} Student • Available: {availability}
            </p>
          </div>

          <div className="space-y-4 text-xs font-sans">
            <div>
              <h4 className="font-serif font-bold uppercase text-[11px] text-slate-800 dark:text-slate-200 border-b border-slate-300 dark:border-slate-700 pb-1 mb-1.5 tracking-wider">
                Objective & Profile
              </h4>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed italic">
                "{profileSummary}"
              </p>
            </div>

            <div>
              <h4 className="font-serif font-bold uppercase text-[11px] text-slate-800 dark:text-slate-200 border-b border-slate-300 dark:border-slate-700 pb-1 mb-1.5 tracking-wider">
                Education & Academic Standing
              </h4>
              <p className="text-slate-700 dark:text-slate-300 font-medium">
                High School Student — {schoolYear} (Expected Graduation: 2028)
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Demonstrated strong attendance record, teamwork, and commitment to academic growth.
              </p>
            </div>

            <div>
              <h4 className="font-serif font-bold uppercase text-[11px] text-slate-800 dark:text-slate-200 border-b border-slate-300 dark:border-slate-700 pb-1 mb-1.5 tracking-wider">
                Core Competencies & Skills
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                {[keySkill1, keySkill2, keySkill3].map((skill, idx) => (
                  <div key={idx} className="p-2 rounded bg-slate-100 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-[11px] font-semibold text-slate-800 dark:text-slate-200 text-center">
                    {skill}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-serif font-bold uppercase text-[11px] text-slate-800 dark:text-slate-200 border-b border-slate-300 dark:border-slate-700 pb-1 mb-1.5 tracking-wider">
                Extracurricular Activities & Volunteering
              </h4>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                {volunteerExperience}
              </p>
            </div>

            <div>
              <h4 className="font-serif font-bold uppercase text-[11px] text-slate-800 dark:text-slate-200 border-b border-slate-300 dark:border-slate-700 pb-1 mb-1.5 tracking-wider">
                Roster Availability
              </h4>
              <p className="text-slate-700 dark:text-slate-300">
                {availability}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 italic text-center">
              Professional & Academic References: Available upon request (Teacher & Coach)
            </div>
          </div>
        </div>
      );
    }

    if (selectedTemplate === 'minimalist') {
      return (
        <div className="font-mono space-y-5 text-slate-900 dark:text-slate-100">
          <div className="border-b border-dashed border-slate-400 dark:border-slate-600 pb-3">
            <h2 className="text-xl font-bold tracking-tight text-foreground uppercase">
              {profile.name}
            </h2>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              <span>{suburb}</span> | <span>{schoolYear}</span> | <span>Roster: {availability}</span>
            </div>
          </div>

          <div className="space-y-4 text-xs font-sans">
            <div>
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                // 01. PROFILE SUMMARY
              </span>
              <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
                {profileSummary}
              </p>
            </div>

            <div>
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
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
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                // 03. EDUCATION
              </span>
              <p className="text-slate-800 dark:text-slate-200 font-sans">
                High School Student — {schoolYear} (Graduating 2028)
              </p>
            </div>

            <div>
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                // 04. VOLUNTEERING & COMMUNITY
              </span>
              <p className="text-slate-800 dark:text-slate-200 font-sans">
                {volunteerExperience}
              </p>
            </div>

            <div className="pt-2 border-t border-dashed border-slate-300 dark:border-slate-700 text-[10px] text-muted-foreground font-mono">
              // REFERENCES: Available on request (Sports Coach & Teacher)
            </div>
          </div>
        </div>
      );
    }

    // Default 'modern' template
    return (
      <div className="space-y-4 font-sans">
        <div className="border-b-2 border-primary/80 pb-3 text-center sm:text-left bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-3 rounded-xl">
          <h2 className="text-2xl font-extrabold tracking-tight text-foreground">{profile.name}</h2>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">
            {suburb} • {schoolYear} Student • Available: {availability}
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
                <span key={idx} className="px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary font-bold text-[11px]">
                  ✓ {s}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-extrabold uppercase text-[11px] text-primary tracking-wider mb-1">Education</h4>
            <p className="text-slate-700 dark:text-slate-300 font-medium">High School Student — {schoolYear} (Expected completion 2028)</p>
          </div>

          <div>
            <h4 className="font-extrabold uppercase text-[11px] text-primary tracking-wider mb-1">Co-Curricular & Volunteering</h4>
            <p className="text-slate-700 dark:text-slate-300">{volunteerExperience}</p>
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
            <span>References: Available upon request (Teacher & Sports Coordinator)</span>
            <span className="font-mono text-[10px] text-primary">Aussie Teen Resume</span>
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
            <h2 className="text-xl font-bold text-foreground">15yo First Job Resume Builder & STAR Interview Simulator</h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Generate a proven 1-page teen resume with zero prior experience, choose modern design templates, copy text/markdown, print, and practice STAR interview questions!
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Copy Plain Text */}
          <button
            type="button"
            onClick={() => handleCopy('text')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              copiedType === 'text' ? 'bg-emerald-500 text-white shadow-xs' : 'bg-primary text-primary-foreground hover:opacity-90'
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

      {/* Design Template Selector Bar */}
      <div className="space-y-2 print:hidden">
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Palette className="w-3.5 h-3.5 text-primary" />
          <span>Select Resume Design Template:</span>
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {TEMPLATE_OPTIONS.map(tpl => {
            const isSelected = selectedTemplate === tpl.id;
            return (
              <button
                key={tpl.id}
                type="button"
                onClick={() => setSelectedTemplate(tpl.id)}
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

      {/* Role Presets Bar */}
      <div className="space-y-2 print:hidden">
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Quick-Load 15yo Job Presets:</span>
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {ROLE_PRESETS.map((preset, idx) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => applyPreset(idx)}
              className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                selectedPreset === idx
                  ? 'border-primary bg-primary/10 text-primary font-bold shadow-xs'
                  : 'border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <span className="block font-bold truncate">{preset.name}</span>
              <span className="text-[10px] opacity-80">{preset.badge}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Editor & Live Preview Side-by-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Editor Form Card */}
        <Card variant="glass" className="p-5 space-y-4 print:hidden">
          <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            <span>Customize Your Details:</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-semibold text-muted-foreground block mb-1">Year Level</label>
                <input
                  type="text"
                  value={schoolYear}
                  onChange={e => setSchoolYear(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-card border border-border text-foreground font-medium"
                />
              </div>
              <div>
                <label className="font-semibold text-muted-foreground block mb-1">Suburb / City</label>
                <input
                  type="text"
                  value={suburb}
                  onChange={e => setSuburb(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-card border border-border text-foreground font-medium"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-muted-foreground block mb-1">Profile Summary</label>
              <textarea
                rows={2}
                value={profileSummary}
                onChange={e => setProfileSummary(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-card border border-border text-foreground text-xs"
              />
            </div>

            <div>
              <label className="font-semibold text-muted-foreground block mb-1">Key Strengths / Skills</label>
              <div className="space-y-1.5">
                <input type="text" value={keySkill1} onChange={e => setKeySkill1(e.target.value)} className="w-full px-3 py-1.5 rounded-lg bg-card border border-border text-foreground" />
                <input type="text" value={keySkill2} onChange={e => setKeySkill2(e.target.value)} className="w-full px-3 py-1.5 rounded-lg bg-card border border-border text-foreground" />
                <input type="text" value={keySkill3} onChange={e => setKeySkill3(e.target.value)} className="w-full px-3 py-1.5 rounded-lg bg-card border border-border text-foreground" />
              </div>
              <div className="flex flex-wrap gap-1.5 pt-2">
                {POPULAR_SKILL_CHIPS.map(chip => (
                  <button key={chip} type="button" onClick={() => addSkillChip(chip)} className="px-2 py-0.5 rounded-md bg-muted text-[10px] text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
                    + {chip}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="font-semibold text-muted-foreground block mb-1">Availability</label>
              <input type="text" value={availability} onChange={e => setAvailability(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-card border border-border text-foreground font-medium" />
            </div>

            <div>
              <label className="font-semibold text-muted-foreground block mb-1">School Activities / Volunteering</label>
              <input type="text" value={volunteerExperience} onChange={e => setVolunteerExperience(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-card border border-border text-foreground font-medium" />
            </div>
          </div>
        </Card>

        {/* Live Resume Card with Print Styles */}
        <div id="teen-resume-print-area" className="relative print:m-0 print:p-0 print:w-full">
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

      {/* Employers Hiring 15yo Bar */}
      <Card variant="glass" className="p-5 space-y-3 print:hidden">
        <div className="flex items-center justify-between gap-2 border-b border-border pb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h3 className="font-bold text-sm text-foreground">Top Australian Employers Hiring 15-Year-Olds</h3>
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

      {/* STAR Interview Simulator */}
      <Card variant="glass" className="p-6 space-y-4 print:hidden">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <Award className="w-5 h-5 text-amber-500" />
          <h3 className="font-bold text-base text-foreground">STAR Method Interview Technique Simulator:</h3>
        </div>

        <p className="text-xs text-muted-foreground">
          Use the STAR method (<strong>Situation, Task, Action, Result</strong>) to answer job interview questions with confidence!
        </p>
        <div className="p-3 bg-muted/50 rounded-xl border border-border text-xs text-muted-foreground">
          <strong>💡 Interview Tips:</strong> Arrive 10 mins early, dress neatly, firm handshake, and prepare 3 questions to ask the interviewer.
        </div>

        <div className="space-y-2.5">
          {interviewQAs.map((item, idx) => {
            const isOpen = activeInterviewQ === idx;
            return (
              <div key={item.q} className="rounded-xl border border-border bg-card overflow-hidden">
                <button
                  type="button"
                  onClick={() => setActiveInterviewQ(isOpen ? null : idx)}
                  className="w-full p-3.5 text-left flex items-center justify-between text-xs font-bold text-foreground focus:outline-none"
                >
                  <span>{item.q}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180 text-primary' : 'text-muted-foreground'}`} />
                </button>

                {isOpen && (
                  <div className="p-3.5 border-t border-border/50 bg-muted/50 text-xs text-muted-foreground leading-relaxed animate-fade-in font-sans">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 block mb-1">Model STAR Answer:</span>
                    <p className="italic">"{item.starAnswer}"</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
