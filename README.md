# Second Brain: A Personal Knowledge Management System

This is a comprehensive Personal Knowledge Management (PKM) application built as a modern, single-page web app. It is designed to be a digital extension of your mind, helping you capture, organize, connect, and express your ideas effectively.

The application's core philosophy is based on established productivity methodologies, primarily Tiago Forte's "Building a Second Brain," which emphasizes a systematic approach to handling information overload and fostering creativity.

## Core Philosophy

This application is not just a note-taking app; it's a structured environment for thinking, built upon three key pillars:

1.  **The CODE Method:** A four-step process for knowledge workflow.
    *   **C**apture: Effortlessly save ideas, notes, and resources that resonate with you.
    *   **O**rganize: Structure information for action using the PARA system.
    *   **D**istill: Find the essence of your notes through summarization and refinement.
    *   **E**xpress: Use your curated knowledge to create, share, and show your work.

2.  **The PARA System:** An organizational framework for all your digital information.
    *   **P**rojects: Short-term efforts with a defined goal (e.g., "Launch new website").
    *   **A**reas: Long-term responsibilities with no end date (e.g., "Health," "Finances").
    *   **R**esources: Topics of ongoing interest (e.g., "Web Development," "Gardening").
    *   **A**rchives: Inactive items from the other three categories, kept for future reference.

3.  **Knowledge as a Network:** The belief that ideas gain power through connection. The app is designed to help you see the relationships between different pieces of information, sparking new insights.

## Key Features

### 1. Unified Dashboard
A central hub that provides a high-level overview of your Second Brain, with quick stats on active projects, areas, and pending tasks. It also features actionable cards for processing your inbox and jumping back into recent activity.

### 2. Frictionless Capture & Inbox
*   **Global Capture Button:** A prominent "+" button allows you to quickly create a new Note, Task, Resource, or Project from anywhere in the app.
*   **Contextual Creation:** Add items directly within a Project or Area, automatically linking them.
*   **Dedicated Inbox:** All un-filed items land in a central Inbox, allowing you to capture now and organize later, keeping your mind clear.

### 3. Hierarchical Organization
*   **Relational Structure:** Areas contain Projects. Projects contain Tasks, Notes, and Resources. This creates a clear, intuitive hierarchy for your work.
*   **Hub Views:** Dedicated, detailed views for each Area and Project, showing all related items in one place.

### 4. Powerful Task Management
*   **Central "My Tasks" View:** See all your active tasks from every project in a single, unified view.
*   **Smart Grouping:** Group tasks by Project, Priority, or Due Date to plan your work effectively.
*   **Priorities & Due Dates:** Add context to your tasks to stay on top of deadlines.

### 5. Rich Text Notes
The note editor uses a rich text (WYSIWYG) interface, allowing for formatting like **bold**, *italics*, and lists. This is essential for the "Distill" step of the CODE method, enabling techniques like Progressive Summarization.

### 6. Visual Knowledge Graph
Explore your Second Brain as an interactive network of ideas. The Graph View visualizes all your Areas, Projects, Notes, and Resources as nodes, with lines connecting them based on their relationships. This is a powerful tool for discovering new connections and sparking creativity.

### 7. Guided Weekly Review
A dedicated, step-by-step workflow that guides you through the essential habit of a weekly review. It prompts you to:
*   Process your Inbox.
*   Review active Projects and Areas.
*   Check on upcoming Tasks.

### 8. Full Lifecycle Management
*   **Archive:** Move completed or inactive items to the Archives to keep your workspace clean without losing information.
*   **Restore & Delete:** Easily restore archived items or delete them permanently.
*   **Global Search:** Instantly find any item across your entire system with a persistent search bar in the sidebar.

## Technology Stack

This application is built with a modern, professional frontend architecture.

*   **Frontend Framework:** [React](https://react.dev/)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **Build Tool:** [Vite](https://vitejs.dev/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **Package Manager:** [npm](https://www.npmjs.com/)
*   **Data Persistence:** Browser `localStorage`
*   **Rich Text Editor:** [ReactQuill](https://github.com/zenoamaro/react-quill)
*   **Graph Visualization:** [react-force-graph-2d](https://github.com/vasturiano/react-force-graph)

## Getting Started

1.  **Clone the repository.**
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Run the development server:**
    ```bash
    npm run dev
    ```
4.  Open your browser and navigate to the local URL provided by Vite (usually `http://localhost:5173`).


## File Structure

```
.
├── index.html              # Main HTML entry point for Vite
├── index.css               # Central stylesheet with Tailwind directives
├── index.tsx               # React application entry point
├── package.json            # NPM dependencies and scripts
├── vite.config.ts          # Vite build tool configuration
├── tsconfig.json           # TypeScript configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── postcss.config.js       # PostCSS configuration
├── metadata.json           # Application metadata
├── types.ts                # Core TypeScript type definitions
├── constants.ts            # Initial seed data for the application
├── App.tsx                 # The root React component
├── README.md               # This file
└── components/
    ├── AreaDetail.tsx
    ├── AreaView.tsx
    ├── ... (all component files)
    └── icons.tsx           # Reusable SVG icon components
```