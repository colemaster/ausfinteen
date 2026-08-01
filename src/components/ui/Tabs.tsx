
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

interface Tab {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
}

export function Tabs({ tabs, activeTab, onChange }: TabsProps) {
  return (
    <div className="flex gap-1 p-1 bg-muted/50 rounded-xl border border-border flex-wrap w-fit mx-auto sm:mx-0">
      {tabs.map(tab => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              "relative px-4 py-2 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-ring z-10",
              isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            {isActive && (
              <motion.div
                layoutId="active-tab"
                className="absolute inset-0 bg-background rounded-lg shadow-sm border border-border/50 -z-10"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
