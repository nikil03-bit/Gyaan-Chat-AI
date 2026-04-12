import type { LucideIcon } from 'lucide-react';
import {
  Rocket,
  FileText,
  Paintbrush,
  MessageSquare,
  Globe,
  BarChart2,
} from 'lucide-react';

export interface DocItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  Icon: LucideIcon;
  readTime: string;
}

export interface DocCategory {
  title: string;
  items: DocItem[];
}

export const docsConfig: DocCategory[] = [
  {
    title: 'Getting Started',
    items: [
      {
        id: 'getting-started',
        title: 'Getting Started',
        slug: 'getting-started',
        description: 'A quick overview of GyaanChat and how to get your account ready.',
        Icon: Rocket,
        readTime: '3 min read',
      },
    ],
  },
  {
    title: 'User Guides',
    items: [
      {
        id: 'uploading-documents',
        title: 'Uploading Documents',
        slug: 'uploading-documents',
        description: "Learn how to upload files and build your bot's knowledge base.",
        Icon: FileText,
        readTime: '4 min read',
      },
      {
        id: 'customizing-your-bot',
        title: 'Customizing Your Bot',
        slug: 'customizing-your-bot',
        description: "Change your bot's name, personality, colors, and logo.",
        Icon: Paintbrush,
        readTime: '5 min read',
      },
      {
        id: 'testing-your-bot',
        title: 'Testing Your Bot',
        slug: 'testing-your-bot',
        description: 'Preview and test your bot before sharing it with the world.',
        Icon: MessageSquare,
        readTime: '3 min read',
      },
      {
        id: 'embedding-on-website',
        title: 'Embedding on Your Website',
        slug: 'embedding-on-website',
        description: 'Add the GyaanChat widget to any website in minutes.',
        Icon: Globe,
        readTime: '5 min read',
      },
      {
        id: 'analytics-conversations',
        title: 'Analytics & Conversations',
        slug: 'analytics-conversations',
        description: 'Track usage, view chat history, and understand your users.',
        Icon: BarChart2,
        readTime: '4 min read',
      },
    ],
  },
];

export const allDocItems: DocItem[] = docsConfig.flatMap((c) => c.items);

export const getDocBySlug = (slug: string): DocItem | undefined =>
  allDocItems.find((item) => item.slug === slug);

export const getAdjacentDocs = (slug: string): { prev: DocItem | null; next: DocItem | null } => {
  const index = allDocItems.findIndex((item) => item.slug === slug);
  return {
    prev: index > 0 ? allDocItems[index - 1] : null,
    next: index < allDocItems.length - 1 ? allDocItems[index + 1] : null,
  };
};
