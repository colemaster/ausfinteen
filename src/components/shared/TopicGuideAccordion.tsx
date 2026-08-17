import { useEffect, useState } from 'react';
import { useSearchParams } from '@/lib/router';
import { Card } from '@/components/ui/Card';
import { TopicGuide } from '@/data/mandy-topics';
import { WebReferenceLink } from '@/components/shared/WebReferenceLink';
import { ActionStepBadge } from '@/components/shared/ActionStepBadge';
import { ChevronDown, Sparkles } from 'lucide-react';

interface TopicGuideAccordionProps {
  topics: TopicGuide[];
  title?: string;
}

export function TopicGuideAccordion({ topics, title = 'Topic Q&A Guide' }: TopicGuideAccordionProps) {
  const [searchParams] = useSearchParams();
  const deepLinkTopic = searchParams.get('topic');
  const [openTopicId, setOpenTopicId] = useState<string | null>(() => {
    if (deepLinkTopic && topics.some(t => t.id === deepLinkTopic)) return deepLinkTopic;
    return topics[0]?.id || null;
  });

  // When a deep link (?topic=<id>) arrives after mount, open + scroll to it
  useEffect(() => {
    if (deepLinkTopic && topics.some(t => t.id === deepLinkTopic)) {
      setOpenTopicId(deepLinkTopic);
      const t = setTimeout(() => {
        document.getElementById(`topic-${deepLinkTopic}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
      return () => clearTimeout(t);
    }
  }, [deepLinkTopic, topics]);

  return (
    <Card variant="glass" className="p-6 space-y-5">
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <Sparkles className="w-5 h-5 text-amber-500" />
        <h2 className="text-xl font-bold text-foreground">{title}</h2>
      </div>

      <div className="space-y-3">
        {topics.map(t => {
          const isOpen = openTopicId === t.id;
          return (
            <div
              key={t.id}
              id={`topic-${t.id}`}
              className="rounded-2xl border border-border bg-card overflow-hidden transition-all shadow-xs"
            >
              <button
                type="button"
                onClick={() => setOpenTopicId(isOpen ? null : t.id)}
                aria-expanded={isOpen}
                aria-controls={`topic-panel-${t.id}`}
                className="w-full p-4 text-left flex items-center justify-between gap-3 focus:outline-none"
              >
                <span className="font-bold text-sm text-foreground">{t.question}</span>
                <ChevronDown
                  className={`w-4 h-4 shrink-0 transition-transform ${
                    isOpen ? 'rotate-180 text-primary' : 'text-muted-foreground'
                  }`}
                />
              </button>

              {isOpen && (
                <div
                  id={`topic-panel-${t.id}`}
                  className="p-4 border-t border-border/50 bg-muted/30 text-xs text-muted-foreground space-y-3 leading-relaxed animate-fade-in"
                >
                  <p className="text-foreground font-medium text-sm sm:text-base leading-snug">
                    {t.answer}
                  </p>

                  {t.actionStep && <ActionStepBadge actionStep={t.actionStep} />}

                  {t.webLink && (
                    <div className="pt-2">
                      <WebReferenceLink link={t.webLink} />
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
