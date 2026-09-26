import type { WebLink } from '../teen-finance-data';

export interface TopicGuide {
  id: string;
  moduleId: string;
  moduleTitle: string;
  question: string;
  answer: string;
  actionStep?: string;
  webLink?: WebLink;
}

export interface MandyModule {
  id: string;
  title: string;
  emoji: string;
  graphicUrl?: string;
  description: string;
  route: string;
  topics: TopicGuide[];
}
