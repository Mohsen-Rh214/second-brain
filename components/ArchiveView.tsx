
import React from 'react';
import { BaseItem } from '../types';
import { AreaIcon, ProjectIcon, ResourceIcon, FileTextIcon, CheckSquareIcon, RotateCcwIcon, TrashIcon, ArchiveIcon } from './icons';

interface ArchiveViewProps {
    items: BaseItem[];
    onRestore: (itemId: string) => void;
    onDelete: (itemId: string) => void;
}

const itemTypeConfig = {
    area: { label: "Areas", icon: <AreaIcon className="w-6 h-6 text-emerald-400" /> },
    project: { label: "Projects", icon: <ProjectIcon className="w-6 h-6 text-sky-400" /> },
    task: { label: "Tasks", icon: <CheckSquareIcon className="w-6 h-6 text-amber-400" /> },
    note: { label: "Notes", icon: <FileTextIcon className="w-6 h-6 text-fuchsia-400" /> },
    resource: { label: "Resources", icon: <ResourceIcon className="w-6 h-6 text-indigo-400" /> },
}

const getItemTypeFromId = (id: string): keyof typeof itemTypeConfig | null => {
    const prefix = id.split('-')[0];
    switch (prefix) {
        case 'area': return 'area';
        case 'proj': return 'project';
        case 'task': return 'task';
        case 'note': return 'note';
        case 'res': return 'resource';
        default: return null;
    }
}

const ArchiveView: React.FC<ArchiveViewProps> = ({ items, onRestore, onDelete }) => {
    const archivedItems = items.filter(item => item.status === 'archived');

    const groupedItems = archivedItems.reduce((acc, item) => {
        const type = getItemTypeFromId(item.id);
        if (type) {
            if (!acc[type]) {
                acc[type] = [];
            }
            acc[type].push(item);
        }
        return acc;
    }, {} as Record<keyof typeof itemTypeConfig, BaseItem[]>);

    const orderedTypes = ['area', 'project', 'task', 'note', 'resource'] as const;

    return (
        <div className="p-8">
            <header className="mb-8">
                <h1 className="text-3xl font-bold">Archives</h1>
                <p className="text-slate-400">View, restore, or permanently delete archived items.</p>
            </header>

            {archivedItems.length === 0 ? (
                 <div className="flex flex-col items-center justify-center h-64 text-slate-500 border-2 border-dashed border-slate-700 rounded-lg">
                    <ArchiveIcon className="w-16 h-16 mb-4" />
                    <h2 className="text-xl font-semibold">The Archives are Empty</h2>
                    <p>When you archive an item, it will appear here.</p>
                </div>
            ) : (
                orderedTypes.map(type => {
                    const group = groupedItems[type];
                    if (!group || group.length === 0) return null;

                    const config = itemTypeConfig[type];

                    return (
                        <div key={type} className="bg-slate-800/50 rounded-lg mb-6">
                            <header className="flex items-center gap-3 p-4 border-b border-slate-700">
                                {config.icon}
                                <h3 className="font-bold text-lg">{config.label}</h3>
                            </header>
                            <div className="p-2">
                                <ul>
                                    {group.map(item => (
                                        <li key={item.id} className="flex items-center justify-between p-2 rounded-md hover:bg-slate-700/50">
                                            <span className="font-medium">{item.title}</span>
                                            <div className="flex gap-2">
                                                <button onClick={() => onRestore(item.id)} aria-label={`Restore ${item.title}`} className="p-2 text-slate-400 hover:text-emerald-400 rounded-md transition-colors"><RotateCcwIcon className="w-5 h-5"/></button>
                                                <button onClick={() => onDelete(item.id)} aria-label={`Delete ${item.title}`} className="p-2 text-slate-400 hover:text-red-400 rounded-md transition-colors"><TrashIcon className="w-5 h-5"/></button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )
                })
            )}
        </div>
    );
};

export default ArchiveView;
