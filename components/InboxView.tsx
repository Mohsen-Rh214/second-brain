import React from 'react';
import { InboxItem } from '../types';
import { InboxIcon, FileTextIcon, ResourceIcon } from './icons';

interface InboxViewProps {
    items: InboxItem[];
    onSelectItem: (item: InboxItem) => void;
    onOrganizeItem: (item: InboxItem) => void;
}

const InboxView: React.FC<InboxViewProps> = ({ items, onSelectItem, onOrganizeItem }) => {
    
    const notes = items.filter(item => item.id.startsWith('note-'));
    const resources = items.filter(item => item.id.startsWith('res-'));

    return (
        <div className="p-8">
            <header className="mb-8">
                <h1 className="text-3xl font-bold font-heading">Inbox</h1>
                <p className="text-text-secondary">Your holding area for new items. Organize them into your projects and areas.</p>
            </header>

            {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-text-tertiary border-2 border-dashed border-outline rounded-lg">
                    <InboxIcon className="w-16 h-16 mb-4" />
                    <h2 className="text-xl font-semibold font-heading">Inbox Zero!</h2>
                    <p>Use the Command Bar (Ctrl+K) to capture new ideas, notes, and resources.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {notes.length > 0 && (
                        <section>
                            <h2 className="text-lg font-semibold flex items-center gap-2 mb-3 text-text-primary font-heading">
                                <FileTextIcon className="w-5 h-5 text-accent" />
                                Notes
                            </h2>
                            <ul className="bg-surface border border-outline rounded-lg shadow-sm divide-y divide-outline">
                                {notes.map(item => (
                                    <li key={item.id} className="p-3 flex justify-between items-center">
                                        <button onClick={() => onSelectItem(item)} className="text-left hover:underline hover:text-accent">
                                            {item.title}
                                        </button>
                                        <button onClick={() => onOrganizeItem(item)} className="text-sm bg-accent hover:bg-accent-hover text-accent-content font-semibold px-3 py-1 transition-colors rounded-lg">
                                            Organize
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}
                    {resources.length > 0 && (
                         <section>
                            <h2 className="text-lg font-semibold flex items-center gap-2 mb-3 text-text-primary font-heading">
                                <ResourceIcon className="w-5 h-5 text-accent" />
                                Resources
                            </h2>
                            <ul className="bg-surface border border-outline rounded-lg shadow-sm divide-y divide-outline">
                                {resources.map(item => (
                                    <li key={item.id} className="p-3 flex justify-between items-center">
                                        <span className="text-left">{item.title}</span>
                                        <button onClick={() => onOrganizeItem(item)} className="text-sm bg-accent hover:bg-accent-hover text-accent-content font-semibold px-3 py-1 transition-colors rounded-lg">
                                            Organize
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}
                </div>
            )}
        </div>
    );
};

export default InboxView;