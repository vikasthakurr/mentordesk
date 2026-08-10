// =============================================================================
// MERN Teaching Platform - Type Definitions
// =============================================================================

// -----------------------------------------------------------------------------
// Topic Types
// -----------------------------------------------------------------------------

/** The type of content a topic provides */
export type TopicType = 'code' | 'content' | 'diagram';

/** Supported programming languages for the code editor */
export type SupportedLanguage = 'javascript' | 'typescript' | 'html' | 'css' | 'json';

/** Exercise types for special topic variants */
export type ExerciseType = 'art' | 'build' | 'challenge';

// -----------------------------------------------------------------------------
// Content Interfaces
// -----------------------------------------------------------------------------

/** Content structure for code-type topics */
export interface CodeTopicContent {
  starterCode: string;
  language: SupportedLanguage;
  instructions?: string;
  exerciseInstructions?: string;
  referenceContent?: string;
}

/** Content structure for content/theory-type topics */
export interface ContentTopicContent {
  markdown: string;
  exerciseInstructions?: string;
  referenceContent?: string;
}

/** Content structure for diagram-type topics */
export interface DiagramTopicContent {
  description: string;
  initialElements?: any[];
  exerciseInstructions?: string;
  referenceContent?: string;
}

// -----------------------------------------------------------------------------
// Data Model Interfaces
// -----------------------------------------------------------------------------

/** Metadata about a topic within a module (used in course catalog navigation) */
export interface TopicMeta {
  slug: string;
  title: string;
  type: TopicType;
  order: number;
  exerciseType?: ExerciseType;
  language?: SupportedLanguage;
}

/** A single module containing multiple topics */
export interface Module {
  slug: string;
  moduleId: string;
  title: string;
  topicCount: number;
  topics: TopicMeta[];
}

/** A part (top-level subject area) containing multiple modules */
export interface Part {
  slug: string;
  partNumber: number;
  title: string;
  modules: Module[];
}

/** The root course catalog containing all parts */
export interface CourseCatalog {
  parts: Part[];
}

/** Full topic data including content (loaded when a topic is selected) */
export interface Topic {
  slug: string;
  title: string;
  type: TopicType;
  partSlug: string;
  moduleSlug: string;
  content: CodeTopicContent | ContentTopicContent | DiagramTopicContent;
}

// -----------------------------------------------------------------------------
// Component Prop Interfaces
// -----------------------------------------------------------------------------

/** Props for the TopicNavigator container component */
export interface TopicNavigatorProps {
  parts: Part[];
  activeTopic: string | null;
  onTopicSelect: (partSlug: string, moduleSlug: string, topicSlug: string) => void;
}

/** Props for a single collapsible Part section */
export interface PartSectionProps {
  part: Part;
  activeTopic: string | null;
  isExpanded: boolean;
  onToggle: () => void;
  onTopicSelect: (partSlug: string, moduleSlug: string, topicSlug: string) => void;
}

/** Props for a single collapsible Module section */
export interface ModuleSectionProps {
  module: Module;
  partSlug: string;
  activeTopic: string | null;
  isExpanded: boolean;
  onToggle: () => void;
  onTopicSelect: (partSlug: string, moduleSlug: string, topicSlug: string) => void;
}

/** Props for the ContentPanel that routes to the correct editor/viewer */
export interface ContentPanelProps {
  topic: Topic;
}

/** Props for the Monaco-based code editor */
export interface CodeEditorProps {
  topicSlug: string;
  starterCode: string;
  language: SupportedLanguage;
  onCodeChange: (code: string) => void;
}

/** Props for the Markdown content viewer */
export interface ContentViewerProps {
  content: string;
}

/** Props for the Excalidraw-based diagram editor */
export interface DiagramEditorProps {
  topicSlug: string;
  initialData?: any[];
}

/** Props for the download button component */
export interface DownloadButtonProps {
  topic: Topic;
  getCurrentCode?: () => string;
  getDiagramBlob?: () => Promise<Blob>;
}
