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
                <h1 className="text-3xl font-bold">Inbox</h1>
                <p className="text-slate-400">Your holding area for new items. Organize them into your projects and areas.</p>
            </header>

            {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-500 border-2 border-dashed border-slate-700 rounded-lg">
                    <InboxIcon className="w-16 h-16 mb-4" />
                    <h2 className="text-xl font-semibold">Inbox Zero!</h2>
                    <p>Use the '+' button to capture new ideas, notes, and resources.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {notes.length > 0 && (
                        <section>
                            <h2 className="text-lg font-semibold flex items-center gap-2 mb-3 text-slate-300">
                                <FileTextIcon className="w-5 h-5 text-sky-400" />
                                Notes
                            </h2>
                            <ul className="bg-slate-800/50 rounded-lg divide-y divide-slate-700">
                                {notes.map(item => (
                                    <li key={item.id} className="p-3 flex justify-between items-center">
                                        <button onClick={() => onSelectItem(item)} className="text-left hover:underline">
                                            {item.title}
                                        </button>
                                        <button onClick={() => onOrganizeItem(item)} className="text-sm bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded-md">
                                            Organize
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}
                    {resources.length > 0 && (
                         <section>
                            <h2 className="text-lg font-semibold flex items-center gap-2 mb-3 text-slate-300">
                                <ResourceIcon className="w-5 h-5 text-indigo-400" />
                                Resources
                            </h2>
                            <ul className="bg-slate-800/50 rounded-lg divide-y divide-slate-700">
                                {resources.map(item => (
                                    <li key={item.id} className="p-3 flex justify-between items-center">
                                        <span className="text-left">{item.title}</span>
                                        <button onClick={() => onOrganizeItem(item)} className="text-sm bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded-md">
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
