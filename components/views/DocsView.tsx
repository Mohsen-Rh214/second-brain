import React, { useState, useMemo, useRef, useEffect } from 'react';

const DOC_STRUCTURE = [
    {
        category: 'Introduction',
        topics: [
            { id: 'overview', label: 'Overview' },
            { id: 'getting-started', label: 'Getting Started' },
        ],
    },
    {
        category: 'Core Methodologies',
        topics: [
            { id: 'para', label: 'The P.A.R.A. System' },
            { id: 'code', label: 'The C.O.D.E. Method' },
        ],
    },
    {
        category: 'Using the App',
        topics: [
            { id: 'home', label: 'Home' },
            { id: 'projects-areas', label: 'Projects & Areas' },
            { id: 'tasks', label: 'Tasks' },
            { id: 'graph-view', label: 'Graph View' },
            { id: 'weekly-review', label: 'Weekly Review' },
        ],
    },
    {
        category: 'Advanced Workflows',
        topics: [
            { id: 'linking', label: 'Linking Your Thinking' },
            { id: 'tagging', label: 'Effective Tagging' },
        ],
    },
];

type DocTopic = typeof DOC_STRUCTURE[number]['topics'][number]['id'];

const H2: React.FC<{ children: React.ReactNode }> = ({ children }) => <h2 className="text-3xl font-bold font-heading mb-4 text-text-primary tracking-tight">{children}</h2>;
const H3: React.FC<{ children: React.ReactNode }> = ({ children }) => <h3 className="text-xl font-bold font-heading mt-8 mb-3 text-text-primary">{children}</h3>;
const P: React.FC<{ children: React.ReactNode }> = ({ children }) => <p className="mb-4 text-text-secondary leading-relaxed">{children}</p>;
const Strong: React.FC<{ children: React.ReactNode }> = ({ children }) => <strong className="font-semibold text-text-primary">{children}</strong>;
const UL: React.FC<{ children: React.ReactNode }> = ({ children }) => <ul className="list-disc list-inside space-y-2 mb-4 text-text-secondary pl-4">{children}</ul>;
const OL: React.FC<{ children: React.ReactNode }> = ({ children }) => <ol className="list-decimal list-inside space-y-2 mb-4 text-text-secondary pl-4">{children}</ol>;
const LI: React.FC<{ children: React.ReactNode }> = ({ children }) => <li>{children}</li>;
const Code: React.FC<{ children: React.ReactNode }> = ({ children }) => <code className="bg-background/50 text-accent font-mono text-sm px-1.5 py-1 rounded-md border border-outline">{children}</code>;
const Blockquote: React.FC<{ children: React.ReactNode }> = ({ children }) => <blockquote className="border-l-4 border-accent pl-4 italic my-4 text-text-secondary">{children}</blockquote>;

const contentMap: Record<DocTopic, React.ReactNode> = {
    overview: (
        <>
            <H2>Overview: What is a Second Brain?</H2>
            <P>Welcome to your Second Brain. This application is more than just a place to store notes; it's a comprehensive system designed to help you manage the constant flow of information in your life, turning scattered ideas into tangible results.</P>
            <Blockquote>The goal is not just to collect information, but to connect ideas and create new knowledge that serves your goals and ambitions.</Blockquote>
            <P>This app is built on two proven methodologies:</P>
            <UL>
                <LI><Strong>The P.A.R.A. System:</Strong> A simple, powerful method for organizing all your digital information into four actionable categories.</LI>
                <LI><Strong>The C.O.D.E. Method:</Strong> A four-step workflow for processing information, from initial capture to final creative expression.</LI>
            </UL>
            <P>By using this system, you'll create a reliable, digital extension of your mind. You'll never lose a valuable idea again, and you'll have a structured way to make progress on the things that matter most to you.</P>
        </>
    ),
    'getting-started': (
         <>
            <H2>Getting Started: Your First 5 Minutes</H2>
            <P>Let's get you an immediate win and demonstrate the core workflow of the app. Follow these four simple steps to experience the power of your Second Brain.</P>
            <OL>
                <LI>
                    <Strong>Capture a Fleeting Thought.</Strong> Click the big <Code>+</Code> button in the bottom right (or press <Code>C</Code>) to open the command bar. Select "New Note" and jot down the first thing that comes to mind—an idea, a quote, a reminder. This goes into your Inbox.
                </LI>
                <LI>
                    <Strong>Create Your First Area.</Strong> Navigate to the "Areas" view from the sidebar. An Area is a long-term domain of your life. Click "Create New Area" and make one called <Strong>"Personal Growth"</Strong>.
                </LI>
                <LI>
                    <Strong>Define Your First Project.</Strong> Inside your new Area, you'll see a section for Projects. A Project has a clear goal. Click "Add Project" and create one called <Strong>"Learn a new skill"</Strong>.
                </LI>
                <LI>
                    <Strong>Add an Actionable Task.</Strong> Now, in your new project, click "Add Task" and create a specific, actionable to-do, like <Strong>"Watch a 10-minute tutorial on a topic I'm interested in"</Strong>.
                </LI>
            </OL>
            <P>Congratulations! You've just completed the core loop of capturing an idea, organizing it into a relevant project within a life area, and defining a concrete next step. This is the fundamental habit that will make your Second Brain thrive.</P>
        </>
    ),
    para: (
        <>
            <H2>The P.A.R.A. System: Your Digital Filing Cabinet</H2>
            <P>P.A.R.A. is a simple, universal system for organizing any kind of digital information. It consists of four categories, which represent the only four places information can be.</P>
            <H3>P — Projects</H3>
            <P>A series of tasks linked to a goal with a deadline. This is where you put information related to things you are <Strong>actively working on right now</Strong>.</P>
            <UL>
                <LI>Example: "Plan Holiday Party"</LI>
                <LI>Example: "Complete Q3 Report"</LI>
                <LI>Example: "Develop new feature"</LI>
            </UL>
            <H3>A — Areas</H3>
            <P>A sphere of activity with a standard to be maintained over time. These are the domains of your life where you have ongoing responsibility.</P>
            <UL>
                <LI>Example: "Health & Fitness"</LI>
                <LI>Example: "Finances"</LI>
                <LI>Example: "Career Development"</LI>
            </UL>
            <H3>R — Resources</H3>
            <P>A topic or theme of ongoing interest. This is where you keep information on subjects you want to learn about or refer to in the future.</P>
            <UL>
                <LI>Example: "Web Development"</LI>
                <LI>Example: "Gardening"</LI>
                <LI>Example: "Stoic Philosophy"</LI>
            </UL>
            <H3>A — Archives</H3>
            <P>Inactive items from the other three categories. This is your cold storage for anything that is complete, inactive, or no longer relevant.</P>
            <UL>
                <LI>Example: A completed project.</LI>
                <LI>Example: An area you are no longer maintaining.</LI>
                <LI>Example: A resource you've lost interest in.</LI>
            </UL>
        </>
    ),
    code: (
        <>
            <H2>The C.O.D.E. Method: Your Knowledge Workflow</H2>
            <P>C.O.D.E. is a four-step process for how information flows through your Second Brain, turning raw data into creative output.</P>
            <H3>C — Capture</H3>
            <P>The first step is to get ideas out of your head and into a trusted place. Your <Strong>Inbox</Strong> is the digital landing pad for every thought, idea, link, or snippet that resonates with you. Don't worry about where it belongs yet—just capture it quickly and move on.</P>
            <H3>O — Organize</H3>
            <P>Periodically, review your Inbox and ask the key question: "Where does this go so I can find it when I need it?" Move each item into the appropriate P.A.R.A. bucket. Is it for an active project? A long-term area? Or just a general resource? This step makes information actionable.</P>
            <H3>D — Distill</H3>
            <P>This is the art of finding the essence. Raw notes are not very useful. Over time, make your notes more valuable by highlighting the key passages, bolding the most important points, and eventually, writing your own executive summary at the top. This technique, called <Strong>Progressive Summarization</Strong>, ensures your best ideas are always visible at a glance.</P>
            <H3>E — Express</H3>
            <P>The ultimate purpose of a Second Brain is not just to store information, but to <Strong>use it</Strong>. Express is about turning your curated knowledge into something new: a presentation, a blog post, a project plan, or even just a more informed opinion in a conversation. This is where your thinking pays off.</P>
        </>
    ),
    home: <><H2>Using the App: Home</H2><P>The Home view is your daily dashboard, providing a clear overview of your priorities. Here you can find your "My Day" task list, a quick-capture box, and lists of recent projects and areas to jump back into your work quickly.</P></>,
    'projects-areas': <><H2>Using the App: Projects & Areas</H2><P>These are the core organizational views. The Areas view shows your high-level life domains, and clicking on an Area reveals all the goal-oriented Projects within it. This top-down structure ensures your daily work (in Projects) is always aligned with your long-term responsibilities (in Areas).</P></>,
    tasks: <><H2>Using the App: Tasks</H2><P>The "All Tasks" view provides a master list of every active task across all your projects. You can group your tasks by Project, Priority, or Due Date, giving you powerful ways to plan your work and decide what to focus on next.</P></>,
    'graph-view': <><H2>Using the App: Graph View</H2><P>The Graph View is a powerful tool for creativity and insight. It visualizes your notes, projects, and areas as an interconnected network. Use it to discover unexpected relationships between ideas and to see the bigger picture of your knowledge.</P></>,
    'weekly-review': <><H2>Using the App: Weekly Review</H2><P>The Weekly Review is a guided workflow that walks you through the essential habit of maintaining your Second Brain. It prompts you to clear your inbox, review your projects and areas, and look ahead at your upcoming tasks to ensure nothing falls through the cracks.</P></>,
    linking: <><H2>Advanced: Linking Your Thinking</H2><P>Create a personal wiki by linking notes together. In the note editor, type <Code>/</Code> to bring up a list of other items in your system. Selecting one will create a direct link. This builds a web of knowledge, making it easier to navigate between related concepts and build on previous work.</P></>,
    tagging: <><H2>Advanced: Effective Tagging</H2><P>Tags are a flexible way to add another layer of organization. Use them to denote status (<Code>#status/in-progress</Code>), source (<Code>#source/book</Code>), or topic (<Code>#topic/psychology</Code>). This allows you to create cross-cutting collections of items that live in different P.A.R.A. buckets.</P></>,
};

const DocsView = () => {
    const [selectedTopicId, setSelectedTopicId] = useState<DocTopic>('overview');
    const [visibleTopicId, setVisibleTopicId] = useState<DocTopic>('overview');

    const contentContainerRef = useRef<HTMLDivElement>(null);
    const observerRef = useRef<IntersectionObserver | null>(null);

    const activeGroup = useMemo(() => {
        return DOC_STRUCTURE.find(group => group.topics.some(topic => topic.id === selectedTopicId));
    }, [selectedTopicId]);

    const handleTopicSelect = (topicId: DocTopic) => {
        const currentGroup = DOC_STRUCTURE.find(group => group.topics.some(topic => topic.id === selectedTopicId));
        const newGroup = DOC_STRUCTURE.find(group => group.topics.some(topic => topic.id === topicId));

        setSelectedTopicId(topicId);

        // Instantly update highlight for responsiveness
        setVisibleTopicId(topicId); 

        // Scroll to the element. Use a timeout to ensure the element is in the DOM,
        // especially if we are switching to a new group.
        setTimeout(() => {
            if (currentGroup?.category !== newGroup?.category) {
                // If switching groups, scroll the main container to the top first
                contentContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                // Then scroll the specific item into view after the container scrolls
                setTimeout(() => {
                     document.getElementById(topicId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 300); // Adjust timing if needed
            } else {
                 document.getElementById(topicId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 100);
    };

    useEffect(() => {
        const observer = observerRef.current;
        if (observer) {
            observer.disconnect();
        }

        const options: IntersectionObserverInit = {
            root: null, // observes intersections relative to the viewport
            rootMargin: '-40% 0px -60% 0px', // A horizontal line near the middle top of the viewport
            threshold: 0,
        };
        
        const callback = (entries: IntersectionObserverEntry[]) => {
             const intersectingEntries = entries.filter(e => e.isIntersecting);
             if (intersectingEntries.length > 0) {
                // To avoid flickering, we can be more specific, e.g., pick the top-most one.
                // For simplicity here, we'll take the last one that triggered.
                const topEntry = intersectingEntries.reduce((prev, curr) => {
                    return prev.boundingClientRect.top < curr.boundingClientRect.top ? prev : curr;
                });
                setVisibleTopicId(topEntry.target.id as DocTopic);
            }
        };

        observerRef.current = new IntersectionObserver(callback, options);
        
        const sections = contentContainerRef.current?.querySelectorAll('section[id]');
        sections?.forEach(section => observerRef.current?.observe(section));

        return () => {
            observer?.disconnect();
        };
    }, [activeGroup]);

    return (
        <div className="flex flex-col md:flex-row h-full gap-8">
            <aside className="w-full md:w-1/4 md:max-w-xs flex-shrink-0">
                <div className="bg-surface/80 backdrop-blur-xl border border-outline rounded-2xl p-4 h-full sticky top-6">
                    <h2 className="text-lg font-bold font-heading mb-4 text-text-primary px-2">Documentation</h2>
                    <nav className="space-y-4">
                        {DOC_STRUCTURE.map(section => (
                            <div key={section.category}>
                                <h3 className="px-2 mb-2 text-xs font-semibold text-text-tertiary uppercase tracking-wider">{section.category}</h3>
                                <ul className="space-y-1">
                                    {section.topics.map(topic => (
                                        <li key={topic.id}>
                                            <button
                                                onClick={() => handleTopicSelect(topic.id as DocTopic)}
                                                className={`w-full text-left px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                                                    visibleTopicId === topic.id
                                                        ? 'bg-accent text-accent-content'
                                                        : 'text-text-secondary hover:bg-neutral hover:text-text-primary'
                                                }`}
                                            >
                                                {topic.label}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </nav>
                </div>
            </aside>
             <main ref={contentContainerRef} className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="bg-surface/80 backdrop-blur-xl border border-outline rounded-2xl p-8 max-w-4xl mx-auto">
                    {activeGroup?.topics.map(topic => (
                        <section id={topic.id} key={topic.id} className="mb-20 last:mb-0 scroll-mt-8">
                            {contentMap[topic.id as DocTopic]}
                        </section>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default React.memo(DocsView);