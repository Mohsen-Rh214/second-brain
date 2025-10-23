import React from 'react';
import { BaseItem } from '../../types';
import { AreaIcon, ProjectIcon, ResourceIcon, FileTextIcon, RotateCcwIcon, TrashIcon, ArchiveIcon, ListTodoIcon } from '../shared/icons';
import { getItemTypeFromId } from '../../utils';
import EmptyState from '../shared/EmptyState';

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

const ArchiveView: React.FC<ArchiveViewProps> = ({ items, onRestore, onDelete }) => {
    const archivedItems = items.filter(item => item.status === 'archived');

    const groupedItems = archivedItems.reduce((acc, item) => {
        const type = getItemTypeFromId(item.id);
        if (type) {
            if (!acc[type as keyof typeof itemTypeConfig]) {
                acc[type as keyof typeof itemTypeConfig] = [];
            }
            acc[type as keyof typeof itemTypeConfig].push(item);
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
                 <EmptyState 
                    icon={<ArchiveIcon />}
                    title="A Clean Slate"
                    description="The archives are currently empty. When you complete a project or an area is no longer active, archive it to keep your workspace tidy."
                />
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

export default React.memo(ArchiveView);