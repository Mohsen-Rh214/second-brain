import React, { useState, useMemo, useRef, useEffect } from 'react';
import { DOC_STRUCTURE, getTopicContent, Lang } from './docsContent';

type DocTopic = typeof DOC_STRUCTURE[number]['topics'][number]['id'];

const DocsView = () => {
    const [lang, setLang] = useState<Lang>('en');
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
        setVisibleTopicId(topicId); 

        setTimeout(() => {
            if (currentGroup?.category[lang] !== newGroup?.category[lang]) {
                contentContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                setTimeout(() => {
                     document.getElementById(topicId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 300);
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
            root: null,
            rootMargin: '-40% 0px -60% 0px',
            threshold: 0,
        };
        
        const callback = (entries: IntersectionObserverEntry[]) => {
             const intersectingEntries = entries.filter(e => e.isIntersecting);
             if (intersectingEntries.length > 0) {
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
    }, [activeGroup, lang]);

    return (
        <div dir={lang === 'fa' ? 'rtl' : 'ltr'} className="flex flex-col md:flex-row h-full gap-8">
            <aside className="w-full md:w-1/4 md:max-w-xs flex-shrink-0">
                <div className="bg-surface/80 backdrop-blur-xl border border-outline rounded-2xl p-4 h-full sticky top-6">
                    <div className="flex justify-between items-center mb-4 px-2">
                        <h2 className="text-lg font-bold font-heading text-text-primary">Documentation</h2>
                        <div className="flex items-center bg-background/50 border border-outline rounded-lg p-1 text-xs">
                            <button onClick={() => setLang('en')} className={`px-2 py-1 rounded-md ${lang === 'en' ? 'bg-accent text-accent-content' : 'text-text-secondary'}`}>EN</button>
                            <button onClick={() => setLang('it')} className={`px-2 py-1 rounded-md ${lang === 'it' ? 'bg-accent text-accent-content' : 'text-text-secondary'}`}>IT</button>
                            <button onClick={() => setLang('fa')} className={`px-2 py-1 rounded-md ${lang === 'fa' ? 'bg-accent text-accent-content' : 'text-text-secondary'}`}>FA</button>
                        </div>
                    </div>
                    <nav className="space-y-4">
                        {DOC_STRUCTURE.map(section => (
                            <div key={section.category.en}>
                                <h3 className="px-2 mb-2 text-xs font-semibold text-text-tertiary uppercase tracking-wider">{section.category[lang]}</h3>
                                <ul className="space-y-1">
                                    {section.topics.map(topic => (
                                        <li key={topic.id}>
                                            <button
                                                onClick={() => handleTopicSelect(topic.id as DocTopic)}
                                                className={`w-full text-start px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                                                    visibleTopicId === topic.id
                                                        ? 'bg-accent text-accent-content'
                                                        : 'text-text-secondary hover:bg-neutral hover:text-text-primary'
                                                }`}
                                            >
                                                {topic.label[lang]}
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
                            {getTopicContent(topic.id as DocTopic, lang)}
                        </section>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default React.memo(DocsView);
