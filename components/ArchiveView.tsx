import React from 'react';
import { BaseItem } from '../types';
import { AreaIcon, ProjectIcon, ResourceIcon, FileTextIcon, RotateCcwIcon, TrashIcon, ArchiveIcon, ListTodoIcon } from './icons';

interface ArchiveViewProps {
    items: BaseItem[];
    onRestore: (itemId: string) => void;
    onDelete: (itemId: string) => void;
}

const itemTypeConfig = {
    area: { label: "Areas", icon: <AreaIcon className="w-6 h-6 text-accent" /> },
    project: { label: "Projects", icon: <ProjectIcon className="w-6 h-6 text-accent" /> },
    task: { label: "Tasks", icon: <ListTodoIcon className="w-6 h-6 text-accent" /> },
    note: { label: "Notes", icon: <FileTextIcon className="w-6 h-6 text-accent" /> },
    resource: { label: "Resources", icon: <ResourceIcon className="w-6 h-6 text-accent" /> },
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
        <div>
            <header className="mb-8">
                <h1 className="text-3xl font-bold font-heading">Archives</h1>
                <p className="text-text-secondary">View, restore, or permanently delete archived items.</p>
            </header>

            {archivedItems.length === 0 ? (
                 <div className="flex flex-col items-center justify-center h-64 text-text-tertiary border-2 border-dashed border-outline-dark rounded-xl bg-surface/80 backdrop-blur-xl">
                    <ArchiveIcon className="w-16 h-16 mb-4" />
                    <h2 className="text-xl font-semibold font-heading text-text-primary">The Archives are Empty</h2>
                    <p>When you archive an item, it will appear here.</p>
                </div>
            ) : (
                orderedTypes.map(type => {
                    const group = groupedItems[type];
                    if (!group || group.length === 0) return null;

                    const config = itemTypeConfig[type];

                    return (
                        <div key={type} className="bg-surface/80 backdrop-blur-xl border border-outline rounded-xl shadow-md mb-6">
                            <header className="flex items-center gap-3 p-4 border-b border-outline-dark">
                                {config.icon}
                                <h3 className="font-bold text-lg font-heading">{config.label}</h3>
                            </header>
                            <div className="p-2">
                                <ul>
                                    {group.map(item => (
                                        <li key={item.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-neutral">
                                            <span className="font-medium">{item.title}</span>
                                            <div className="flex gap-2">
                                                <button onClick={() => onRestore(item.id)} aria-label={`Restore ${item.title}`} className="p-2 text-text-secondary hover:text-accent transition-colors rounded-full"><RotateCcwIcon className="w-5 h-5"/></button>
                                                <button onClick={() => onDelete(item.id)} aria-label={`Delete ${item.title}`} className="p-2 text-text-secondary hover:text-destructive transition-colors rounded-full"><TrashIcon className="w-5 h-5"/></button>
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