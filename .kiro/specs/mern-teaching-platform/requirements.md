# Requirements Document

## Introduction

An all-in-one teaching platform for a comprehensive full-stack web development curriculum built with Next.js. The platform covers 11 parts spanning Web Foundations, JavaScript, TypeScript, ReactJS, Node.js & Express, MongoDB & Mongoose, System Design, Deployment, Git & GitHub, Testing, Next.js, and Data Structures & Algorithms — totaling 31 modules. The platform provides a topic-wise layout (similar to LeetCode and GeeksforGeeks Practice) where students can navigate a Part → Module → Topic hierarchy on the left side and interact with a Monaco code editor, theory/notes viewer, or diagram editor on the right side. The platform supports live coding, diagram drawing for system design, exercise/project topics with emoji markers, and downloadable resources.

## Glossary

- **Platform**: The Next.js web application serving as the teaching platform for the full-stack web development curriculum
- **Topic_Navigator**: The left-side panel that displays a hierarchical list of course content organized as Part → Module → Topic
- **Content_Viewer**: The right-side panel that renders theory, notes, or diagrams for non-code topics
- **Code_Editor**: The Monaco-based code editor component that provides live coding capabilities for code-related topics
- **Diagram_Editor**: The drawing component that allows students to create and view system design diagrams
- **Topic**: A single learning unit within a Module, which can be a Code_Topic, Content_Topic, or Exercise_Topic
- **Code_Topic**: A topic that requires hands-on coding practice, displayed with the Code_Editor
- **Content_Topic**: A topic that presents theoretical material, notes, or diagrams, displayed with the Content_Viewer
- **Exercise_Topic**: A hands-on practice topic marked with an emoji indicator (🎨, 🛠️, or 🧩) representing projects, exercises, or challenges
- **Part**: The highest-level grouping in the curriculum hierarchy, representing a major subject area (e.g., Part 1 — Web Foundations)
- **Module**: A collection of related Topics within a Part, representing a focused subject (e.g., Module 1 · HTML | Basics of Web Pages)
- **Resource_Manager**: The component responsible for generating and serving downloadable files
- **Topic_Type_Indicator**: The visual emoji marker displayed alongside Exercise_Topics to indicate the type of hands-on activity
- **Curriculum_Manifest**: The static JSON data file that defines the complete Part → Module → Topic hierarchy and metadata

## Requirements

### Requirement 1: Topic Navigation

**User Story:** As a student, I want to browse topics organized by Part, Module, and Topic, so that I can find and access learning material efficiently within the curriculum hierarchy.

#### Acceptance Criteria

1. THE Platform SHALL display the Topic_Navigator on the left side of the screen showing all available Topics organized in a Part → Module → Topic hierarchy
2. WHEN a student selects a Topic from the Topic_Navigator, THE Platform SHALL display the corresponding content in the right-side panel
3. WHEN a student selects a Code_Topic, THE Platform SHALL render the Code_Editor in the right-side panel
4. WHEN a student selects a Content_Topic, THE Platform SHALL render the Content_Viewer in the right-side panel
5. WHEN a student selects an Exercise_Topic, THE Platform SHALL render the Code_Editor pre-loaded with any exercise starter code and display exercise instructions above the editor
6. THE Topic_Navigator SHALL support collapsible Part sections and collapsible Module sections within each Part
7. WHILE a Topic is actively selected, THE Topic_Navigator SHALL visually highlight the selected Topic with a distinct background color and no other Topic SHALL have the active highlight applied
8. THE Topic_Navigator SHALL display the Topic_Type_Indicator emoji (🎨, 🛠️, or 🧩) next to each Exercise_Topic title
9. WHEN a Topic is selected via URL deep link or navigation, THE Topic_Navigator SHALL auto-expand the Part and Module containing that Topic

### Requirement 2: Code Editor Integration

**User Story:** As a student, I want an integrated code editor for coding topics, so that I can practice writing code directly in the browser.

#### Acceptance Criteria

1. THE Code_Editor SHALL use the Monaco editor library to provide syntax highlighting, autocompletion, and error detection
2. THE Code_Editor SHALL support JavaScript, TypeScript, HTML, CSS, and JSON languages
3. WHEN a Code_Topic is loaded, THE Code_Editor SHALL check session storage for previously saved code and display it if found, otherwise display the starter code associated with that Topic
4. WHEN the student modifies code in the Code_Editor, THE Code_Editor SHALL persist the changes to browser session storage within 1 second of the last keystroke, and the saved state SHALL be retained until the browser tab is closed or the student resets the editor
5. WHEN the student clicks the reset button, THE Code_Editor SHALL restore the original starter code for the current Topic and clear the corresponding session storage entry
6. THE Code_Editor SHALL provide a responsive layout that fills the available container width with a minimum height of 400px
7. IF the Monaco editor library fails to load, THEN THE Code_Editor SHALL display a fallback plain-text textarea that preserves basic code editing capability and show a notice indicating that advanced features are unavailable
8. IF session storage is unavailable or the storage quota is exceeded, THEN THE Code_Editor SHALL display an informational notice to the student indicating that changes will not be saved, and SHALL continue to allow editing without persistence

### Requirement 3: Theory and Notes Viewer

**User Story:** As a student, I want to read theory and notes for content topics, so that I can learn concepts alongside practical coding.

#### Acceptance Criteria

1. THE Content_Viewer SHALL render Markdown-formatted notes converting headings to their corresponding HTML heading elements (h1–h6), lists to ordered/unordered list elements, fenced code blocks to preformatted code elements, and inline formatting (bold, italic, links, inline code) to their respective HTML elements
2. THE Content_Viewer SHALL render embedded images within notes scaled to a maximum width of 100% of the content container while preserving aspect ratio, and SHALL display alt text when an image fails to load
3. WHEN a Content_Topic is loaded, THE Content_Viewer SHALL display the associated notes content within a vertically scrollable container that fills the available height of the content panel
4. THE Content_Viewer SHALL apply syntax highlighting with language-specific token coloring to fenced code blocks that specify a language identifier (e.g., ```javascript), and SHALL render code blocks without a language identifier as plain preformatted text
5. WHEN a Content_Topic contains code blocks, THE Content_Viewer SHALL render each code block with a copy-to-clipboard button that, upon activation, copies the code block text content to the system clipboard and displays a visual confirmation indicator for at least 2 seconds
6. IF the Markdown content string is empty, THEN THE Content_Viewer SHALL display a placeholder message indicating no content is available for the topic

### Requirement 4: Diagram Drawing for System Design

**User Story:** As a student, I want to draw system design diagrams, so that I can practice designing architectures visually.

#### Acceptance Criteria

1. WHEN a student opens a system design Topic within Part 7, THE Diagram_Editor SHALL provide a canvas for drawing diagrams
2. THE Diagram_Editor SHALL support basic shapes including rectangles, circles, arrows, and text labels for creating architecture diagrams
3. THE Diagram_Editor SHALL allow students to move, resize, and delete diagram elements
4. WHEN the student modifies a diagram, THE Diagram_Editor SHALL persist the diagram state to browser session storage within 1 second of the last modification using a debounced save
5. THE Diagram_Editor SHALL provide a clear canvas button that removes all elements from the diagram and clears the corresponding session storage entry
6. WHEN a student revisits a diagram Topic that has saved state in session storage, THE Diagram_Editor SHALL restore the previously saved diagram elements
7. IF the Diagram_Editor library (Excalidraw) fails to load, THEN THE Platform SHALL display an error message with a retry button
8. IF session storage contains corrupted diagram data, THEN THE Diagram_Editor SHALL discard the invalid data, load with an empty canvas, and log a warning to the console

### Requirement 5: Downloadable Resources

**User Story:** As a student, I want to download code files and notes, so that I can reference them offline.

#### Acceptance Criteria

1. WHEN a student clicks the download button on a Code_Topic, THE Resource_Manager SHALL generate a downloadable file containing the current code displayed in the Code_Editor at the time of the click
2. WHEN a student clicks the download button on a Content_Topic, THE Resource_Manager SHALL generate a downloadable file containing the topic notes in Markdown format with a `.md` file extension
3. WHEN a student clicks the download button on a diagram Topic, THE Resource_Manager SHALL export the diagram as a PNG image file
4. THE Resource_Manager SHALL name downloaded files using the Topic title converted to kebab-case format, appending the file extension matching the topic type: `.js`, `.ts`, `.html`, `.css`, or `.json` for code topics based on the topic language, `.md` for content topics, and `.png` for diagram topics
5. IF the Code_Editor content is empty or the diagram canvas contains no elements, THEN THE Resource_Manager SHALL disable the download button
6. IF the PNG export of a diagram fails, THEN THE Resource_Manager SHALL display an error notification indicating the export failed and the download button SHALL remain enabled for retry

### Requirement 6: Curriculum Organization

**User Story:** As a student, I want the curriculum organized into Parts and Modules in a logical learning sequence, so that I can progressively build skills from fundamentals to advanced topics.

#### Acceptance Criteria

1. THE Platform SHALL organize the curriculum into 11 Parts: Web Foundations, JavaScript, TypeScript, ReactJS, Node.js & Express, MongoDB & Mongoose, System Design, Deployment, Git & GitHub, Testing, Next.js, and Data Structures & Algorithms
2. THE Platform SHALL contain 31 Modules distributed across the 11 Parts
3. WHEN the Platform loads, THE Topic_Navigator SHALL display all Parts with their Modules in the defined learning sequence order as specified in the Curriculum_Manifest
4. THE Topic_Navigator SHALL display the total number of Topics within each Module, derived from the topics array length in the Curriculum_Manifest
5. THE Platform SHALL support three Topic types within Modules: Code_Topic for hands-on coding, Content_Topic for theory and notes, and Exercise_Topic for guided projects and exercises
6. THE Platform SHALL display Part titles using the format "Part N — [Subject Area]" and Module titles using the format "Module N · [Subject] | [Subtitle]" where applicable, falling back to "Module N · [Subject]" when no subtitle is defined

### Requirement 7: Responsive Layout

**User Story:** As a student, I want the platform to work well on different screen sizes, so that I can learn on both desktop and tablet devices.

#### Acceptance Criteria

1. WHILE the viewport width is 1024 pixels or greater, THE Platform SHALL display the Topic_Navigator on the left and the content panel on the right in a horizontal side-by-side layout
2. WHILE the viewport width is less than 1024 pixels, THE Platform SHALL hide the Topic_Navigator by default and display a visible toggle control that allows the student to show or hide the Topic_Navigator as an overlay or stacked panel above the content panel
3. THE Code_Editor SHALL maintain a minimum height of 400 pixels regardless of viewport size
4. WHEN the viewport width crosses the 1024-pixel boundary due to resizing, THE Platform SHALL transition between the side-by-side layout and the narrow-viewport layout without losing the currently displayed content or requiring a page reload

### Requirement 8: Exercise and Project Topics

**User Story:** As a student, I want clearly marked exercise and project topics, so that I can identify hands-on practice opportunities within modules.

#### Acceptance Criteria

1. THE Platform SHALL distinguish Exercise_Topics from regular Topics by displaying a Topic_Type_Indicator emoji prefix immediately before the topic title in the Topic_Navigator
2. THE Platform SHALL support three Exercise_Topic types: Art exercises marked with 🎨, Build projects marked with 🛠️, and Challenge exercises marked with 🧩
3. WHEN an Exercise_Topic is loaded, THE Platform SHALL display exercise instructions in a collapsible panel above the content area (Code_Editor, ContentViewer, or DiagramEditor depending on topic type), with the panel expanded by default on initial load
4. WHEN an Exercise_Topic includes reference materials or expected output, THE Platform SHALL display the reference in a separate section below the exercise instructions within the same collapsible panel
5. THE Platform SHALL allow content authors to designate any Topic within a Module as an Exercise_Topic by specifying the emoji type and exercise instructions in the topic metadata
6. IF an Exercise_Topic is loaded and its exercise instructions field is empty or missing, THEN THE Platform SHALL display the topic content without the collapsible instructions panel

### Requirement 9: Topic Content Type Detection

**User Story:** As a content author, I want the platform to correctly determine whether a topic is code-heavy, theory-heavy, or mixed, so that it renders the appropriate interface components.

#### Acceptance Criteria

1. WHEN a Topic is loaded, THE Platform SHALL determine the Topic rendering mode by reading the `type` field from the Topic entity in the Curriculum_Manifest, which must be one of: "code", "content", "mixed", or "diagram"
2. THE Platform SHALL map Topic content type to rendering components as follows: "code" renders the Code_Editor, "content" renders the Content_Viewer, "mixed" renders a vertical split view with the Content_Viewer occupying the top half and the Code_Editor occupying the bottom half, and "diagram" renders the Diagram_Editor
3. WHEN a mixed Topic is loaded, THE Platform SHALL render a vertical split view with the Content_Viewer on top and the Code_Editor on the bottom, where each panel occupies approximately half the available content area height
4. WHEN a diagram Topic is loaded, THE Platform SHALL render the Diagram_Editor in the content panel, and IF the diagram Topic includes Markdown content, THEN THE Platform SHALL render the Content_Viewer beside the Diagram_Editor in a side-by-side horizontal layout
5. IF a Topic is loaded with a missing or unrecognized `type` value, THEN THE Platform SHALL display an error message indicating the content type is unavailable and SHALL NOT render a blank or broken panel

### Requirement 10: Learning Progress Tracking

**User Story:** As a student, I want to track which topics I have completed, so that I can see my progress through the curriculum.

#### Acceptance Criteria

1. WHEN a student clicks a "Mark as completed" control on the currently viewed Topic, THE Platform SHALL toggle the completion state of that Topic (marking it completed if incomplete, or incomplete if already completed)
2. THE Topic_Navigator SHALL display a completion indicator next to each completed Topic
3. THE Topic_Navigator SHALL display Module-level progress as a count of completed Topics out of total Topics in that Module
4. THE Topic_Navigator SHALL display Part-level progress as a count of completed Modules out of total Modules in that Part, where a Module is considered completed when all of its Topics are marked as completed
5. THE Platform SHALL persist completion state in the browser local storage so that progress is retained across browser sessions
6. IF local storage is unavailable or the storage quota is exceeded, THEN THE Platform SHALL display an informational message indicating that progress tracking will not be persisted
