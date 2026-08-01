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
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-1 mt-0.5 ${checked ? 'bg-[var(--primary)]' : 'bg-slate-300 '}`}
      >
        <span
          className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-[var(--background)] shadow transition-transform duration-200 ${checked ? 'translate-x-4' : 'translate-x-0'}`}
        />
      </button>
      <div>
        <div className="text-sm font-medium text-[var(--foreground)]">{label}</div>
        {description && (
          <div className="text-xs text-[var(--muted-foreground)] mt-0.5">{description}</div>
        )}
      </div>
    </div>
  );
}
