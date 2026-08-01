import { ExternalLink, ShieldCheck } from 'lucide-react';
import { WebLink } from '@/data/teen-finance-data';

export function WebReferenceLink({ link, className = '' }: { link: WebLink; className?: string }) {
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border bg-card hover:bg-muted/80 text-foreground transition-all shadow-xs ${className}`}
      title={link.description}
    >
      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
      <span>{link.title}</span>
      <ExternalLink className="w-3 h-3 text-muted-foreground shrink-0" />
    </a>
  );
}
