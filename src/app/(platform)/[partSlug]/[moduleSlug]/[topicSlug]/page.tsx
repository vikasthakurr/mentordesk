import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getAllParts, getPartBySlug, getModuleBySlug, getTopicBySlug } from '@/lib/courses';
import { loadTopicContent } from '@/lib/topics';
import TopicViewClient from './TopicViewClient';

interface TopicPageProps {
  params: Promise<{
    partSlug: string;
    moduleSlug: string;
    topicSlug: string;
  }>;
}

export async function generateMetadata({ params }: TopicPageProps): Promise<Metadata> {
  const { partSlug, moduleSlug, topicSlug } = await params;
  const part = getPartBySlug(partSlug);
  const mod = getModuleBySlug(partSlug, moduleSlug);
  const topic = getTopicBySlug(partSlug, moduleSlug, topicSlug);

  const title = topic?.title || topicSlug.replace(/-/g, ' ');
  const partTitle = part?.title || '';
  const modTitle = mod?.title || '';

  return {
    title: `${title} | MentorDesk`,
    description: `Learn ${title} in the ${modTitle} module of ${partTitle}. Interactive coding platform for full-stack web development.`,
    openGraph: {
      title: `${title} | MentorDesk`,
      description: `Learn ${title} — ${partTitle} › ${modTitle}`,
      type: 'article',
      siteName: 'MentorDesk',
    },
  };
}

export default async function TopicPage({ params }: TopicPageProps) {
  const { partSlug, moduleSlug, topicSlug } = await params;

  // Validate that the part exists
  const part = getPartBySlug(partSlug);
  if (!part) {
    notFound();
  }

  // Validate that the module exists within the part
  const mod = getModuleBySlug(partSlug, moduleSlug);
  if (!mod) {
    notFound();
  }

  // Note: We don't validate the topic slug against courses.json
  // because custom user-created topics are stored in localStorage (client-side)
  // and won't be in the static data. loadTopicContent handles missing topics
  // gracefully by returning placeholder content.

  // Load full topic content (returns placeholder if not in static data)
  const topic = await loadTopicContent(partSlug, moduleSlug, topicSlug);

  // Get all parts for the navigator
  const parts = getAllParts();

  return (
    <TopicViewClient
      parts={parts}
      topic={topic}
      activeTopic={topicSlug}
    />
  );
}
