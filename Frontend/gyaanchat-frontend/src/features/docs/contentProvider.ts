import gettingStarted from './content/getting-started.md?raw';
import uploadingDocuments from './content/uploading-documents.md?raw';
import customizingYourBot from './content/customizing-your-bot.md?raw';
import testingYourBot from './content/testing-your-bot.md?raw';
import embeddingOnWebsite from './content/embedding-on-website.md?raw';
import analyticsConversations from './content/analytics-conversations.md?raw';

const contentMap: Record<string, string> = {
  'getting-started': gettingStarted,
  'uploading-documents': uploadingDocuments,
  'customizing-your-bot': customizingYourBot,
  'testing-your-bot': testingYourBot,
  'embedding-on-website': embeddingOnWebsite,
  'analytics-conversations': analyticsConversations,
};

export const getContentForSlug = (slug: string): string => {
  return contentMap[slug] || '';
};
