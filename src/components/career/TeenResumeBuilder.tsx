import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { FileText, User, Award, ChevronDown, Copy, Check, Printer, Sparkles } from 'lucide-react';
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
    name: 'Supermarket (Woolies / Coles)',
    badge: 'Retail Assistant',
    schoolYear: 'Year 10',
    skills: ['Fast Barcode Scanning & POS Operation', 'Friendly & Polite Customer Service', 'Shelf Stocking & Product Replenishment'],
    availability: 'Friday after 4pm, Saturday & Sunday anytime',
    experience: 'School Canteen Volunteer, High Attendance Record',
    profileSummary: 'Energetic Year 10 student looking for a casual supermarket team member role. Reliable, quick to learn POS checkout systems, and dedicated to providing friendly service.',
  },
  {
    name: "Fast Food (Maccas / Hungry Jack's)",
    badge: 'Crew Member',
    schoolYear: 'Year 10',
    skills: ['Speed & Accuracy Under Pressure', 'Food Hygiene & Kitchen Cleanliness', 'Teamwork & Effective Communication'],
    availability: 'Weeknights (after 4:30pm) and full weekend rosters',
    experience: 'House Captain, School Sports Team Player',
    profileSummary: 'Hard-working and motivated Year 10 student eager to join a fast-paced crew. Brings positive energy, excellent punctuality, and works well under pressure during peak rushes.',
  },
  {
    name: 'Local Cafe & Bakery',
    badge: 'Front of House / Kitchen Hand',
    schoolYear: 'Year 10',
    skills: ['Table Clearing & Kitchen Hygiene', 'POS Cash & Card Handling', 'Warm Greeting & Order Taking'],
    availability: 'Saturday & Sunday morning/lunch shifts',
    experience: 'Baking & Food Tech Elective, School Market Day Stall Organizer',
    profileSummary: 'Friendly and well-presented Year 10 student seeking a weekend cafe or bakery role. Passionate about food service, highly organized, and committed to a spotless kitchen environment.',
  },
  {
    name: 'Sports Referee / Umpire',
    badge: 'Match Official',
    schoolYear: 'Year 10',
    skills: ['Fair Decision Making & Rules Knowledge', 'Clear Whistle & Hand Signals', 'Conflict Resolution & Player Safety'],
    availability: 'Saturday & Sunday mornings',
    experience: 'Junior Club Player for 5 Years, Completed Level 1 Junior Referee Course',
    profileSummary: 'Active and confident Year 10 student seeking junior officiating roles. Deep knowledge of game rules, assertive communication, and committed to fair play and player safety.',
  },
  {
    name: 'Babysitting & Childcare Helper',
    badge: 'Babysitter / Mother’s Helper',
    schoolYear: 'Year 10',
    skills: ['Patient & Caring Supervision', 'First Aid / CPR Certified', 'Engaging Activity & Meal Prep'],
    availability: 'Friday & Saturday evenings, School Holidays',
    experience: 'Supervised younger siblings/cousins, Certified HLTAID011 First Aid',
    profileSummary: 'Responsible, patient, and CPR-certified Year 10 student available for local babysitting and after-school helper duties. Punctual, energetic, and highly safety-conscious.',
  },
  {
    name: 'Lawn Care & Yard Maintenance',
    badge: 'Yard Assistant',
    schoolYear: 'Year 10',
    skills: ['Lawn Mowing & Edge Trimming', 'Physical Stamina & Work Ethic', 'Equipment Care & Safety Standards'],
    availability: 'Weekend mornings and school holiday afternoons',
    experience: 'Maintained family and neighbor lawns for 2 years, Self-Motivated',
    profileSummary: 'Reliable and fit Year 10 student offering garden and lawn maintenance services. Hard-working, punctual, respectful of property, and brings high attention to detail.',
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

export function TeenResumeBuilder() {
  const { profile } = useTeenProfile();

  const [selectedPreset, setSelectedPreset] = useState<number>(0);
  const [schoolYear, setSchoolYear] = useState<string>(ROLE_PRESETS[0].schoolYear);
  const [suburb, setSuburb] = useState<string>('Brisbane, QLD');
  const [keySkill1, setKeySkill1] = useState<string>(ROLE_PRESETS[0].skills[0]);
  const [keySkill2, setKeySkill2] = useState<string>(ROLE_PRESETS[0].skills[1]);
  const [keySkill3, setKeySkill3] = useState<string>(ROLE_PRESETS[0].skills[2]);
  const [availability, setAvailability] = useState<string>(ROLE_PRESETS[0].availability);
  const [volunteerExperience, setVolunteerExperience] = useState<string>(ROLE_PRESETS[0].experience);
  const [profileSummary, setProfileSummary] = useState<string>(ROLE_PRESETS[0].profileSummary);

  const [copied, setCopied] = useState<boolean>(false);
  const [activeInterviewQ, setActiveInterviewQ] = useState<number | null>(0);

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
High School Student — ${schoolYear} (Expected completion 2027/2028)

EXPERIENCE & VOLUNTEERING
• ${volunteerExperience}

AVAILABILITY
• ${availability}

REFERENCES
Available upon request (School Teacher & Sports Coach / Coordinator)`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getFullResumeText());
    sound.playSuccess();
    try {
      import('canvas-confetti').then((m) => {
        m.default({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.3 },
          colors: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b'],
          disableForReducedMotion: true,
        });
      });
    } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-5 h-5 text-indigo-500" />
            <h2 className="text-xl font-bold text-foreground">15yo First Job Resume Builder & STAR Interview Simulator</h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Generate a proven 1-page teen resume with zero prior experience, copy text, print, and practice STAR interview questions!
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              copied ? 'bg-emerald-500 text-white' : 'bg-primary text-primary-foreground hover:opacity-90'
            }`}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Resume'}</span>
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-border bg-card hover:bg-muted text-foreground transition-all"
          >
            <Printer className="w-3.5 h-3.5 text-muted-foreground" />
            <span>Print</span>
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Quick-Load 15yo Job Presets:</span>
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card variant="glass" className="p-5 space-y-4">
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

        <Card variant="glass" className="p-6 space-y-4 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans border-2 border-primary/30 shadow-lg print:border-none print:shadow-none">
          <div className="border-b-2 border-primary pb-3 text-center sm:text-left">
            <h2 className="text-xl font-extrabold tracking-tight">{profile.name}</h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
              {suburb} • {schoolYear} Student • Available: {availability}
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <h4 className="font-extrabold uppercase text-[11px] text-primary tracking-wider mb-1">Personal Profile</h4>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{profileSummary}</p>
            </div>

            <div>
              <h4 className="font-extrabold uppercase text-[11px] text-primary tracking-wider mb-1">Key Strengths & Skills</h4>
              <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-0.5">
                <li>{keySkill1}</li>
                <li>{keySkill2}</li>
                <li>{keySkill3}</li>
              </ul>
            </div>

            <div>
              <h4 className="font-extrabold uppercase text-[11px] text-primary tracking-wider mb-1">Education</h4>
              <p className="text-slate-700 dark:text-slate-300 font-medium">High School Student — {schoolYear} (Expected completion 2027/2028)</p>
            </div>

            <div>
              <h4 className="font-extrabold uppercase text-[11px] text-primary tracking-wider mb-1">Co-Curricular & Volunteering</h4>
              <p className="text-slate-700 dark:text-slate-300">{volunteerExperience}</p>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500">
              <span>References available upon request (School Teacher & Sports Coach / Coordinator)</span>
            </div>
          </div>
        </Card>
      </div>

      <Card variant="glass" className="p-5 space-y-3">
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

      <Card variant="glass" className="p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <Award className="w-5 h-5 text-amber-500" />
          <h3 className="font-bold text-base text-foreground">STAR Method Interview Technique Simulator:</h3>
        </div>

        <p className="text-xs text-muted-foreground">
          Use the STAR method (<strong>Situation, Task, Action, Result</strong>) to answer job interview questions with confidence!
        </p>

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
