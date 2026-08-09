import { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { useNavigate } from 'react-router-dom';
import { MANDY_MODULES } from '@/data/mandy-topics';
import { Calculator, User, FileText, ShieldAlert, MessageSquare, Award } from 'lucide-react';

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    const openFromNav = () => setOpen(true);

    document.addEventListener('keydown', down);
    document.addEventListener('open-command-palette', openFromNav);
    return () => {
      document.removeEventListener('keydown', down);
      document.removeEventListener('open-command-palette', openFromNav);
    };
  }, []);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-background/80 backdrop-blur-sm p-4 sm:p-0">
      <Command
        label="Command Palette"
        loop
        className="w-full max-w-lg rounded-2xl border border-border bg-card text-card-foreground shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-250"
        onKeyDown={(e) => {
          if (e.key === 'Escape') setOpen(false);
        }}
      >
        <div className="flex items-center border-b border-border px-3">
          <Calculator className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
          <Command.Input
            autoFocus
            placeholder="Search TFN NAT 3092, Super Choice, Penalty rates, Resume..."
            className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 border-0 focus:ring-0"
          />
        </div>
        <Command.List className="max-h-[350px] overflow-y-auto p-2">
          <Command.Empty className="py-6 text-center text-sm text-muted-foreground">No matching money guides found.</Command.Empty>

          <Command.Group heading="Official Government Forms & First Job Tools" className="px-2 py-1.5 text-xs font-bold text-muted-foreground">
            <Command.Item
              onSelect={() => runCommand(() => navigate('/careers-employment?tab=forms'))}
              className="relative flex cursor-pointer select-none items-center rounded-xl px-3 py-2 text-xs font-medium text-foreground outline-none hover:bg-muted hover:text-primary transition-colors my-0.5"
            >
              <FileText className="mr-2.5 h-4 w-4 text-emerald-500 shrink-0" />
              <div className="flex flex-col">
                <span className="font-bold">ATO TFN Declaration (NAT 3092) & Super Choice (NAT 13080)</span>
                <span className="text-[10px] text-muted-foreground">Claim $18,200 Tax-Free Threshold & staple super fund</span>
              </div>
            </Command.Item>

            <Command.Item
              onSelect={() => runCommand(() => navigate('/careers-employment?tab=rights'))}
              className="relative flex cursor-pointer select-none items-center rounded-xl px-3 py-2 text-xs font-medium text-foreground outline-none hover:bg-muted hover:text-primary transition-colors my-0.5"
            >
              <ShieldAlert className="mr-2.5 h-4 w-4 text-rose-500 shrink-0" />
              <div className="flex flex-col">
                <span className="font-bold">Unpaid Trial Shift Rules & Cash-in-Hand Dangers</span>
                <span className="text-[10px] text-muted-foreground">Fair Work legal 1-2h limit & WorkCover injury rights</span>
              </div>
            </Command.Item>

            <Command.Item
              onSelect={() => runCommand(() => navigate('/careers-employment?tab=scripts'))}
              className="relative flex cursor-pointer select-none items-center rounded-xl px-3 py-2 text-xs font-medium text-foreground outline-none hover:bg-muted hover:text-primary transition-colors my-0.5"
            >
              <MessageSquare className="mr-2.5 h-4 w-4 text-purple-500 shrink-0" />
              <div className="flex flex-col">
                <span className="font-bold">Workplace Conversation Script Generator</span>
                <span className="text-[10px] text-muted-foreground">Broke Millennial raise scripts & Barefoot 3-bucket system</span>
              </div>
            </Command.Item>

            <Command.Item
              onSelect={() => runCommand(() => navigate('/careers-employment?tab=resume'))}
              className="relative flex cursor-pointer select-none items-center rounded-xl px-3 py-2 text-xs font-medium text-foreground outline-none hover:bg-muted hover:text-primary transition-colors my-0.5"
            >
              <Award className="mr-2.5 h-4 w-4 text-indigo-500 shrink-0" />
              <div className="flex flex-col">
                <span className="font-bold">1-Page Teen Resume Builder & STAR Interview Simulator</span>
                <span className="text-[10px] text-muted-foreground">Build a teen resume with no prior experience needed</span>
              </div>
            </Command.Item>
          </Command.Group>

          <Command.Group heading="Real-World Money Modules" className="px-2 py-1.5 text-xs font-bold text-muted-foreground">
            {MANDY_MODULES.map((module) => (
              <Command.Item
                key={module.id}
                onSelect={() => runCommand(() => navigate(module.route))}
                className="relative flex cursor-pointer select-none items-center rounded-xl px-3 py-2.5 text-xs font-medium text-foreground outline-none hover:bg-muted hover:text-primary transition-colors my-0.5"
              >
                <span className="mr-2.5 text-lg">{module.emoji}</span>
                <div className="flex flex-col">
                  <span className="font-bold">{module.title}</span>
                  <span className="text-[10px] text-muted-foreground truncate">{module.description}</span>
                </div>
              </Command.Item>
            ))}
          </Command.Group>

          <Command.Group heading="Settings" className="px-2 py-1.5 text-xs font-bold text-muted-foreground">
            <Command.Item
              onSelect={() => runCommand(() => navigate('/profile'))}
              className="relative flex cursor-pointer select-none items-center rounded-xl px-3 py-2 text-xs font-medium text-foreground outline-none hover:bg-muted hover:text-primary transition-colors"
            >
              <User className="mr-2 h-4 w-4" />
              <span>My Teen Money Profile (Hourly Rate & Goals)</span>
            </Command.Item>
          </Command.Group>
        </Command.List>
      </Command>
    </div>
  );
}
