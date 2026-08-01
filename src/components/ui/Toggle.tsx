import { cn } from '@/lib/utils';

interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  description?: string;
}

export function Toggle({ label, checked, onChange, description }: ToggleProps) {
  return (
    <div className="flex items-start gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative mt-0.5 inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border border-transparent p-0.5 outline-none transition-all duration-300 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-95',
          checked
            ? 'bg-primary shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)]'
            : 'bg-muted ring-1 ring-inset ring-border/50'
        )}
      >
        <span
          className={cn(
            'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-md ring-1 ring-black/10 transition-transform duration-300 ease-out',
            checked ? 'translate-x-5' : 'translate-x-0'
          )}
        />
      </button>
      <div>
        <div className="text-sm font-medium text-foreground">{label}</div>
        {description && (
          <div className="mt-0.5 text-xs text-muted-foreground">
            {description}
          </div>
        )}
      </div>
    </div>
  );
}
