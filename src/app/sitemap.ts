import { MetadataRoute } from 'next';
import { getAllParts } from '@/lib/courses';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://mentordesk.app';
  const parts = getAllParts();

  const topicUrls: MetadataRoute.Sitemap = [];

  for (const part of parts) {
    for (const mod of part.modules) {
      for (const topic of mod.topics) {
        topicUrls.push({
          url: `${baseUrl}/${part.slug}/${mod.slug}/${topic.slug}`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.7,
        });
      }
    }
  }

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    ...topicUrls,
  ];
}
