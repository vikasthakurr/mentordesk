import type { Topic, CodeTopicContent, ContentTopicContent, DiagramTopicContent, SupportedLanguage } from '@/types';
import { getTopicBySlug } from './courses';

/**
 * Loads full topic content from a JSON file located at
 * src/data/topics/{partSlug}/{moduleSlug}/{topicSlug}.json
 *
 * If the file doesn't exist or fails to load, returns a placeholder Topic
 * with default content based on the topic type from the catalog metadata.
 */
export async function loadTopicContent(
  partSlug: string,
  moduleSlug: string,
  topicSlug: string
): Promise<Topic> {
  const meta = getTopicBySlug(partSlug, moduleSlug, topicSlug);
  const topicType = meta?.type ?? 'content';
  const topicTitle = meta?.title ?? topicSlug;
  const topicLanguage = meta?.language ?? 'javascript';

  try {
    // Dynamic import of the topic JSON file
    const topicModule = await import(
      `@/data/topics/${partSlug}/${moduleSlug}/${topicSlug}.json`
    );
    const data = topicModule.default ?? topicModule;

    return {
      slug: topicSlug,
      title: data.title ?? topicTitle,
      type: data.type ?? topicType,
      partSlug,
      moduleSlug,
      content: data.content,
    };
  } catch {
    // Return a placeholder topic when the file doesn't exist
    return {
      slug: topicSlug,
      title: topicTitle,
      type: topicType,
      partSlug,
      moduleSlug,
      content: getPlaceholderContent(topicType, topicTitle, topicLanguage),
    };
  }
}

/**
 * Generates placeholder content based on the topic type.
 */
function getPlaceholderContent(
  type: string,
  title: string,
  language: SupportedLanguage
): CodeTopicContent | ContentTopicContent | DiagramTopicContent {
  const starterCodeMap: Record<string, string> = {
    html: `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>${title}</title>\n  <style>\n    body { font-family: sans-serif; padding: 20px; }\n  </style>\n</head>\n<body>\n  <h1>${title}</h1>\n  <p>Start coding here...</p>\n</body>\n</html>`,
    css: `/* ${title} */\n\nbody {\n  font-family: sans-serif;\n  margin: 0;\n  padding: 20px;\n  background-color: #f5f5f5;\n}\n\nh1 {\n  color: #333;\n}\n\n.container {\n  max-width: 800px;\n  margin: 0 auto;\n}`,
    javascript: `// ${title}\n// Start coding here...\n\nconsole.log("Hello from ${title}!");\n`,
    typescript: `// ${title}\n// Start coding here...\n\nconst greeting: string = "Hello from ${title}!";\nconsole.log(greeting);\n`,
    json: `{\n  "title": "${title}",\n  "description": "Start editing here"\n}`,
  };

  switch (type) {
    case 'code':
      return {
        starterCode: starterCodeMap[language] || starterCodeMap.javascript,
        language,
      };
    case 'diagram':
      return {
        description: `Create a diagram for: ${title}`,
        initialElements: [],
      };
    case 'content':
    default:
      return {
        markdown: `# ${title}\n\nContent coming soon.`,
      };
  }
}
