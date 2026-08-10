# Implementation Plan: MERN Teaching Platform

## Overview

Build an all-in-one teaching platform using Next.js App Router with a split-panel layout (topic navigator + content panel). The implementation proceeds from data layer and types, through navigation components, to content editors (Monaco, Markdown, Excalidraw), download functionality, progress tracking, and responsive layout. Each task builds incrementally on previous work.

## Tasks

- [x] 1. Set up project structure, types, and data layer
  - [x] 1.1 Initialize Next.js project with TypeScript, Tailwind CSS, and core dependencies
    - Initialize Next.js project with App Router, TypeScript, and Tailwind CSS
    - Install dependencies: `@monaco-editor/react`, `excalidraw`, `react-markdown`, `remark-gfm`, `rehype-highlight`
    - Install dev dependencies: `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `fast-check`, `jsdom`
    - Configure Vitest with jsdom environment in `vitest.config.ts`
    - Create the directory structure as defined in the design (`src/app/`, `src/components/`, `src/data/`, `src/lib/`, `src/types/`, `src/styles/`)
    - _Requirements: 2.1, 3.1, 4.1_

  - [x] 1.2 Define TypeScript type definitions and interfaces
    - Create `src/types/index.ts` with all interfaces: `CourseCatalog`, `Part`, `Module`, `TopicMeta`, `Topic`, `TopicType`, `CodeTopicContent`, `ContentTopicContent`, `DiagramTopicContent`, `SupportedLanguage`
    - Define component prop interfaces: `TopicNavigatorProps`, `PartSectionProps`, `ModuleSectionProps`, `ContentPanelProps`, `CodeEditorProps`, `ContentViewerProps`, `DiagramEditorProps`, `DownloadButtonProps`
    - Export all types for use across the application
    - _Requirements: 6.5, 9.1, 9.2_

  - [x] 1.3 Create curriculum manifest data file (courses.json)
    - Create `src/data/courses.json` with the full Part → Module → Topic hierarchy as specified in the design
    - Include all 11 Parts (plus Deployment) with their modules and sample topics
    - Ensure each module has a `topicCount` field matching the length of its topics array
    - Include sample topics for Part 1 Module 1 (HTML) with varied types (code, content, diagram)
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.6_

  - [x] 1.4 Implement data access functions and session storage helpers
    - Create `src/lib/courses.ts` with functions: `getAllParts()`, `getPartBySlug()`, `getModuleBySlug()`, `getTopicBySlug()`
    - Create `src/lib/topics.ts` with functions to load topic content from JSON files
    - Create `src/lib/session-storage.ts` with helpers: `saveCode(key, code)`, `loadCode(key)`, `saveDiagram(key, elements)`, `loadDiagram(key)`, `clearEntry(key)` using the key format `mern-platform:{partSlug}:{moduleSlug}:{topicSlug}:{type}`
    - Handle session storage unavailability and quota exceeded errors gracefully
    - _Requirements: 2.3, 2.4, 4.4, 4.6, 10.5_

  - [x]* 1.5 Write property tests for session storage round-trip and topic count accuracy
    - **Property 4: Session storage persistence round-trip** — Generate random code strings and diagram element arrays, verify save/load equality
    - **Property 10: Topic count accuracy** — Generate random Part/Module structures, verify displayed count matches topics array length
    - **Validates: Requirements 2.4, 4.4, 6.4**

- [x] 2. Implement Topic Navigator components
  - [x] 2.1 Create TopicItem component
    - Create `src/components/topic-navigator/TopicItem.tsx`
    - Render topic title with active highlight styling when selected
    - Display emoji prefix (🎨, 🛠️, 🧩) for Exercise_Topics based on topic metadata
    - Display completion indicator (checkmark) for completed topics
    - Support keyboard navigation (Enter/Space to select)
    - _Requirements: 1.7, 1.8, 8.1, 8.2, 10.2_

  - [x] 2.2 Create ModuleSection component
    - Create `src/components/topic-navigator/ModuleSection.tsx`
    - Render module title with format "Module N · [Subject] | [Subtitle]"
    - Display topic count badge (e.g., "17 topics")
    - Display module-level progress (completed/total topics)
    - Implement collapsible behavior with expand/collapse toggle
    - Auto-expand if the module contains the currently active topic
    - Render child TopicItem components for each topic in the module
    - _Requirements: 1.6, 6.4, 6.6, 10.3_

  - [x] 2.3 Create PartSection component
    - Create `src/components/topic-navigator/PartSection.tsx`
    - Render part title with format "Part N — [Subject Area]"
    - Display part-level progress (completed modules / total modules)
    - Implement collapsible behavior with expand/collapse toggle
    - Auto-expand if the part contains the currently active topic
    - Render child ModuleSection components
    - _Requirements: 1.6, 6.6, 10.4_

  - [x] 2.4 Create TopicNavigator container component
    - Create `src/components/topic-navigator/TopicNavigator.tsx`
    - Render all PartSection components from course data
    - Accept `activeTopic` prop and pass it down for highlight logic
    - Accept `onTopicSelect` callback to handle topic selection
    - Auto-expand the Part and Module containing the active topic on mount and when activeTopic changes
    - Implement accessible navigation with ARIA attributes
    - _Requirements: 1.1, 1.6, 1.9_

  - [x]* 2.5 Write property test for active topic highlighting
    - **Property 2: Active topic highlighting** — Generate random topic slugs, verify exactly one topic item has the active highlight class
    - **Validates: Requirements 1.7**

- [x] 3. Implement Code Editor component
  - [x] 3.1 Create CodeEditor component with Monaco integration
    - Create `src/components/content-panel/CodeEditor.tsx` as a client component
    - Dynamically import Monaco Editor with `next/dynamic` and `ssr: false`
    - Load starter code on mount; check session storage for saved state first
    - Support languages: JavaScript, TypeScript, HTML, CSS, JSON
    - Save code changes to session storage with debounced writes (1 second delay)
    - Implement reset button to restore original starter code and clear session storage entry
    - Set minimum height of 400px and responsive width
    - Implement fallback textarea when Monaco fails to load with "advanced features unavailable" notice
    - Handle session storage unavailable/quota exceeded with informational notice
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_

  - [x]* 3.2 Write property tests for CodeEditor
    - **Property 3: Starter code initialization** — Generate random code strings, verify fresh load equals starter code
    - **Property 5: Reset restores starter code** — Generate random starter code + edits, verify reset behavior
    - **Validates: Requirements 2.3, 2.5**

- [x] 4. Implement Content Viewer component
  - [x] 4.1 Create ContentViewer component with Markdown rendering
    - Create `src/components/content-panel/ContentViewer.tsx`
    - Parse Markdown using `react-markdown` with `remark-gfm` plugin
    - Apply syntax highlighting to fenced code blocks via `rehype-highlight`
    - Render headings (h1-h6), lists, bold, italic, links, inline code
    - Render images with max-width 100% and aspect ratio preservation; show alt text on load failure
    - Implement copy-to-clipboard button on each code block with 2-second visual confirmation
    - Provide scrollable layout within the content panel
    - Display placeholder message when content string is empty
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

  - [x]* 4.2 Write property test for Markdown structure preservation
    - **Property 6: Markdown structure preservation** — Generate random Markdown with headings, verify output contains corresponding h1-h6 elements preserving text content
    - **Validates: Requirements 3.1**

- [x] 5. Implement Diagram Editor component
  - [x] 5.1 Create DiagramEditor component with Excalidraw integration
    - Create `src/components/content-panel/DiagramEditor.tsx` as a client component
    - Dynamically import Excalidraw with `next/dynamic` and `ssr: false`
    - Provide canvas with shapes (rectangles, circles), arrows, and text labels
    - Save diagram state to session storage on changes with debounced writes (1 second)
    - Restore previously saved diagram from session storage on revisit
    - Implement "Clear Canvas" button to remove all elements and clear session storage
    - Display error message with retry button if Excalidraw fails to load
    - Handle corrupted session storage data: discard invalid data, load empty canvas, log warning
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8_

  - [x]* 5.2 Write property test for clear canvas
    - **Property 7: Clear canvas empties all elements** — Generate random non-empty element arrays, verify clear produces empty array
    - **Validates: Requirements 4.5**

- [x] 6. Checkpoint - Core editors complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Implement ContentPanel and topic type routing
  - [x] 7.1 Create ContentPanel component with type-based rendering
    - Create `src/components/content-panel/ContentPanel.tsx`
    - Read `topic.type` to determine rendering: "code" → CodeEditor, "content" → ContentViewer, "diagram" → DiagramEditor
    - Implement "mixed" type: vertical split view with ContentViewer on top and CodeEditor on bottom (each ~50% height)
    - For diagram topics with Markdown content: side-by-side horizontal layout (DiagramEditor + ContentViewer)
    - Display error message for missing or unrecognized `type` value
    - Include download button in panel header
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

  - [x]* 7.2 Write property test for content type routing
    - **Property 1: Content type routing** — Generate random topics with each type, verify correct component is rendered
    - **Validates: Requirements 1.2, 1.3, 1.4**

- [x] 8. Implement Exercise Topic support
  - [x] 8.1 Create ExerciseInstructions component and integrate with ContentPanel
    - Create a collapsible instructions panel component displayed above the content area
    - Show exercise instructions (Markdown-rendered) expanded by default on initial load
    - Display reference materials/expected output in a separate section below instructions within the same collapsible panel
    - Integrate with ContentPanel: when topic has exercise metadata, render instructions panel above the editor/viewer
    - Hide instructions panel if exercise instructions field is empty or missing
    - _Requirements: 8.3, 8.4, 8.5, 8.6_

- [x] 9. Implement Download functionality
  - [x] 9.1 Create download utility functions
    - Create `src/lib/download.ts` with functions for file download generation
    - Implement `toKebabCase(title: string): string` for filename conversion
    - Implement `getFileExtension(type: TopicType, language?: SupportedLanguage): string`
    - Implement `downloadCodeFile(title, code, language)` — generates code file download
    - Implement `downloadMarkdownFile(title, markdownContent)` — generates .md file download
    - Implement `downloadDiagramPng(title, blob)` — triggers PNG blob download
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [x] 9.2 Create DownloadButton component
    - Create `src/components/download/DownloadButton.tsx`
    - For code topics: download current editor content with correct language extension
    - For content topics: download Markdown source as `.md`
    - For diagram topics: export diagram as PNG via Excalidraw `exportToBlob` API
    - Disable button when content is empty or diagram has no elements
    - Show error notification if PNG export fails
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

  - [x]* 9.3 Write property tests for file naming and download fidelity
    - **Property 8: Download content fidelity** — Generate random content strings, verify download output matches source
    - **Property 9: File naming transformation** — Generate random title strings and types, verify kebab-case conversion + correct extension
    - **Validates: Requirements 5.1, 5.2, 5.4**

- [x] 10. Implement Learning Progress Tracking
  - [x] 10.1 Create progress tracking with local storage
    - Create `src/lib/progress.ts` with functions: `markTopicComplete(topicSlug)`, `markTopicIncomplete(topicSlug)`, `isTopicComplete(topicSlug)`, `getModuleProgress(moduleSlug)`, `getPartProgress(partSlug)`
    - Store completion state in browser local storage (key format: `mern-platform:progress:{topicSlug}`)
    - Calculate module-level progress as completed topics / total topics count
    - Calculate part-level progress as completed modules / total modules (module complete = all topics complete)
    - Handle local storage unavailable or quota exceeded with informational message
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

  - [x] 10.2 Create MarkAsCompleted button and integrate with topic view
    - Create a "Mark as completed" toggle control on the topic view page
    - Toggle completion state on click (completed ↔ incomplete)
    - Update the TopicNavigator to show completion indicators and progress counts reactively
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [x] 11. Checkpoint - Feature components complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 12. Implement page routing and responsive layout
  - [x] 12.1 Create App Router pages and layout
    - Create `src/app/layout.tsx` with root layout, metadata, and global styles
    - Create `src/app/page.tsx` as a landing/home page (course overview or redirect)
    - Create `src/app/(platform)/[partSlug]/[moduleSlug]/[topicSlug]/page.tsx` as the main topic view
    - Load course data and topic content on the topic view page
    - Wire TopicNavigator and ContentPanel together with routing-based topic selection
    - Implement deep-linking: navigating to a URL auto-selects and expands the correct topic
    - Handle invalid routes with Next.js `notFound()` for 404 responses
    - _Requirements: 1.2, 1.9, 6.3_

  - [x] 12.2 Implement responsive layout with 1024px breakpoint
    - Implement side-by-side layout (navigator left, content right) for viewports ≥ 1024px
    - Implement stacked/overlay layout for viewports < 1024px with toggle control to show/hide navigator
    - Ensure Code Editor maintains 400px minimum height at all viewport sizes
    - Ensure layout transitions seamlessly on resize without losing content or requiring reload
    - Use Tailwind CSS responsive utilities (`lg:` prefix for 1024px breakpoint)
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [x] 13. Final checkpoint - Full integration
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The implementation uses TypeScript throughout, matching the design document
- Monaco Editor and Excalidraw must be dynamically imported with `ssr: false` due to SSR incompatibility
- Session storage is used for temporary state (code/diagrams), local storage for persistent progress

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.3"] },
    { "id": 2, "tasks": ["1.4"] },
    { "id": 3, "tasks": ["1.5", "2.1"] },
    { "id": 4, "tasks": ["2.2", "3.1", "4.1", "5.1"] },
    { "id": 5, "tasks": ["2.3", "3.2", "4.2", "5.2"] },
    { "id": 6, "tasks": ["2.4", "9.1"] },
    { "id": 7, "tasks": ["2.5", "7.1"] },
    { "id": 8, "tasks": ["7.2", "8.1", "9.2"] },
    { "id": 9, "tasks": ["9.3", "10.1"] },
    { "id": 10, "tasks": ["10.2"] },
    { "id": 11, "tasks": ["12.1"] },
    { "id": 12, "tasks": ["12.2"] }
  ]
}
```
