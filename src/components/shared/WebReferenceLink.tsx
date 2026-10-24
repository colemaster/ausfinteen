import { ExternalLink, ShieldCheck } from 'lucide-react';
import type { WebLink } from '@/data/teen-finance-data';
import { cn } from '@/lib/utils';

export function WebReferenceLink({ link, className = '' }: { link?: WebLink; className?: string }) {
  if (!link || !link.url) return null;

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'group inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border border-border/80 bg-card/90 hover:bg-muted hover:border-primary/40 text-foreground transition-all shadow-xs hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40',
        className
      )}
      title={link.description || link.title}
    >
      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0 group-hover:scale-110 transition-transform" />
      {link.source && (
        <span className="px-1.5 py-0.5 rounded-md bg-muted text-[10px] font-bold text-muted-foreground uppercase tracking-wider group-hover:bg-primary/10 group-hover:text-primary transition-colors">
          {link.source}
        </span>
      )}
      <span className="truncate group-hover:text-primary transition-colors font-medium">
        {link.title}
      </span>
      {link.formCode && (
        <span className="px-1 py-0.2 rounded text-[9px] font-mono font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 shrink-0">
          {link.formCode}
        </span>
      )}
      <ExternalLink className="w-3 h-3 text-muted-foreground group-hover:text-primary shrink-0 ml-auto group-hover:translate-x-0.5 transition-all" />
    </a>
  );
}
