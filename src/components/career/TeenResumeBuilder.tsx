import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { FileText, User, Award, ChevronDown } from 'lucide-react';
import { useTeenProfile } from '@/context/TeenProfileContext';

export function TeenResumeBuilder() {
  const { profile } = useTeenProfile();

  const [schoolYear, setSchoolYear] = useState<string>('Year 11');
  const [suburb, setSuburb] = useState<string>('Melbourne, VIC');
  const [keySkill1, setKeySkill1] = useState<string>('Punctual & Highly Reliable');
  const [keySkill2, setKeySkill2] = useState<string>('Friendly Customer Communication');
  const [keySkill3, setKeySkill3] = useState<string>('Quick Learner & POS Cash Handling');
  const [availability, setAvailability] = useState<string>('Weeknights (after 4pm) & Full Weekends');
  const [volunteerExperience, setVolunteerExperience] = useState<string>('School Canteen Helper & Sports Day Fundraiser');

  const [activeInterviewQ, setActiveInterviewQ] = useState<number | null>(0);

  const interviewQAs = [
    {
      q: '1. Why do you want to work for our store / business?',
      starAnswer: 'Situation: I have been a customer here for years. Task: I wanted to work somewhere with high standards. Action: I researched your customer values and team environment. Result: I am excited to bring my positive energy and reliability to your shift team!',
    },
    {
      q: '2. Tell me about a time you handled a difficult situation or busy moment.',
      starAnswer: 'Situation: During our school fete, a large queue formed at the stall. Task: I needed to serve customers quickly without making change errors. Action: I stayed calm, communicated clearly, and double-checked register totals. Result: We served 100+ people accurately and raised $600.',
    },
    {
      q: '3. How do you handle feedback if a manager corrects a mistake?',
      starAnswer: 'Situation: When learning a new task at school. Task: I listened carefully to advice. Action: I thanked the leader, wrote down the correct steps, and applied them immediately. Result: I mastered the task and never repeated the mistake.',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-5 h-5 text-indigo-500" />
            <h2 className="text-xl font-bold text-foreground">Interactive 1-Page Teen Resume Builder & Interview Simulator</h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Generate a clean 1-page teen resume without prior experience & practice STAR method interview answers!
          </p>
        </div>
        <Badge variant="default">
          No Experience Needed Format
        </Badge>
      </div>

      {/* Resume Generator Controls & Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controls */}
        <Card variant="glass" className="p-5 space-y-4">
          <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            <span>Customize Resume Details:</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-muted-foreground block mb-1">High School Year Level</label>
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

            <div>
              <label className="font-semibold text-muted-foreground block mb-1">Key Strengths / Skills</label>
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
            </div>

            <div>
              <label className="font-semibold text-muted-foreground block mb-1">Availability</label>
              <input
                type="text"
                value={availability}
                onChange={e => setAvailability(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-card border border-border text-foreground font-medium"
              />
            </div>

            <div>
              <label className="font-semibold text-muted-foreground block mb-1">Volunteering / School Experience</label>
              <input
                type="text"
                value={volunteerExperience}
                onChange={e => setVolunteerExperience(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-card border border-border text-foreground font-medium"
              />
            </div>
          </div>
        </Card>

        {/* Live 1-Page Resume Preview */}
        <Card variant="glass" className="p-6 space-y-4 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans border-2 border-primary/30 shadow-lg">
          <div className="border-b-2 border-primary pb-3 text-center sm:text-left">
            <h2 className="text-xl font-extrabold tracking-tight">{profile.name}</h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
              {suburb} • {schoolYear} Student • Available: {availability}
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <h4 className="font-extrabold uppercase text-[11px] text-primary tracking-wider mb-1">Personal Profile</h4>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                Enthusiastic and reliable {schoolYear} student seeking a casual team member role. Dedicated to providing excellent customer service, learning tasks quickly, and maintaining high punctuality.
              </p>
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
              <p className="text-slate-700 dark:text-slate-300 font-medium">
                High School Student — {schoolYear} (Expected completion 2026/2027)
              </p>
            </div>

            <div>
              <h4 className="font-extrabold uppercase text-[11px] text-primary tracking-wider mb-1">Co-Curricular & Volunteering</h4>
              <p className="text-slate-700 dark:text-slate-300">
                {volunteerExperience}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500">
              <span>References available upon request (Teacher & Sports Coach)</span>
            </div>
          </div>
        </Card>
      </div>

      {/* STAR Method Interview Simulator */}
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
