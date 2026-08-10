import { notFound } from 'next/navigation';
import { getAllParts, getPartBySlug, getModuleBySlug } from '@/lib/courses';
import { loadTopicContent } from '@/lib/topics';
import TopicViewClient from './TopicViewClient';

interface TopicPageProps {
  params: Promise<{
    partSlug: string;
    moduleSlug: string;
    topicSlug: string;
  }>;
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
