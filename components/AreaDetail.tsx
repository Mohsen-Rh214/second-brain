import React, { useState, useEffect, useRef } from 'react';
import { Area, Project, Note, Resource } from '../types';
import { ProjectIcon, FileTextIcon, ResourceIcon, LinkIcon, ArchiveBoxIcon, TrashIcon, EditIcon, PlusIcon, EllipsisVerticalIcon } from './icons';
import { View } from '../types';

interface AreaDetailProps {
    area: Area;
    projects: Project[];
    notes: Note[];
    resources: Resource[];
    onArchive: (itemId: string) => void;
    onDelete: (itemId: string) => void;
    onSelectNote: (noteId: string) => void;
    onUpdateArea: (areaId: string, updates: { title?: string, description?: string }) => void;
    onOpenCommandBar: () => void;
    onNavigate: (view: View, itemId: string) => void;
}

const ItemCard: React.FC<{icon: React.ReactElement, title: string, children?: React.ReactNode, onAdd?: () => void}> = ({icon, title, children, onAdd}) => (
    <div className="bg-surface/80 backdrop-blur-xl border border-outline rounded-xl shadow-md mb-6">
        <header className="flex items-center justify-between p-4 border-b border-outline-dark">
             <div className="flex items-center gap-3">
                {icon}
                <h3 className="font-bold text-lg font-heading">{title}</h3>
            </div>
            {onAdd && (
                <button onClick={onAdd} aria-label={`Add new ${title}`} className="p-1 text-text-secondary hover:bg-neutral hover:text-text-primary rounded-full transition-colors"><PlusIcon className="w-5 h-5"/></button>
            )}
        </header>
        <div className="p-4">
            {children}
        </div>
    </div>
);

const ActionMenu: React.FC<{ onEdit?: () => void, onArchive: () => void, onDelete: () => void }> = ({ onEdit, onArchive, onDelete }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={menuRef}>
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-text-secondary hover:bg-neutral hover:text-text-primary rounded-full transition-colors">
                <EllipsisVerticalIcon className="w-5 h-5" />
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-surface/80 backdrop-blur-xl border border-outline rounded-lg shadow-lg z-10">
                    <ul>
                        {onEdit && <li><button onClick={() => { onEdit(); setIsOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm hover:bg-neutral transition-colors"><EditIcon className="w-4 h-4" /> Edit</button></li>}
                        <li><button onClick={() => { onArchive(); setIsOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm hover:bg-neutral transition-colors"><ArchiveBoxIcon className="w-4 h-4" /> Archive</button></li>
                        <li><button onClick={() => { onDelete(); setIsOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-destructive hover:bg-neutral transition-colors"><TrashIcon className="w-4 h-4" /> Delete</button></li>
                    </ul>
                </div>
            )}
        </div>
    )
}

const AreaDetail: React.FC<AreaDetailProps> = ({ area, projects, notes, resources, onArchive, onDelete, onSelectNote, onUpdateArea, onOpenCommandBar, onNavigate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(area.title);
    const [editDescription, setEditDescription] = useState(area.description);

    useEffect(() => {
        setEditTitle(area.title);
        setEditDescription(area.description);
        setIsEditing(false);
    }, [area]);

    const handleSave = () => {
        onUpdateArea(area.id, { title: editTitle, description: editDescription });
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditTitle(area.title);
        setEditDescription(area.description);
        setIsEditing(false);
    }

    return (
        <div>
            <header className="mb-8">
                <div className="flex justify-between items-start">
                     {isEditing ? (
                        <div className="flex-1 mr-4">
                            <input
                                type="text"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                className="w-full bg-background/50 border border-outline rounded-lg px-3 py-2 text-3xl font-bold mb-2 text-text-primary focus:outline-none focus:ring-1 focus:ring-accent font-heading"
                            />
                             <textarea
                                value={editDescription}
                                onChange={(e) => setEditDescription(e.target.value)}
                                rows={3}
                                className="w-full bg-background/50 border border-outline rounded-lg px-3 py-2 text-text-secondary focus:outline-none focus:ring-1 focus:ring-accent custom-scrollbar max-w-prose"
                            />
                             <div className="flex gap-2 mt-2">
                                <button onClick={handleSave} className="px-3 py-1.5 text-sm bg-accent hover:bg-accent-hover text-accent-content transition-colors rounded-lg">Save</button>
                                <button onClick={handleCancel} className="px-3 py-1.5 text-sm bg-secondary hover:bg-secondary-hover text-secondary-content transition-colors rounded-lg">Cancel</button>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <h1 className="text-3xl font-bold mb-2 font-heading">{area.title}</h1>
                            <p className="text-text-secondary max-w-prose">{area.description}</p>
                        </div>
                    )}
                    <div className="flex-shrink-0 ml-4">
                         <ActionMenu 
                            onEdit={() => setIsEditing(true)}
                            onArchive={() => onArchive(area.id)}
                            onDelete={() => onDelete(area.id)}
                         />
                    </div>
                </div>
            </header>

            <ItemCard icon={<ProjectIcon className="w-6 h-6 text-accent" />} title="Projects" onAdd={onOpenCommandBar}>
                {projects.length > 0 ? (
                    <ul className="space-y-2">
                        {projects.map(project => (
                             <li key={project.id}>
                                <button onClick={() => onNavigate('projects', project.id)} className="w-full text-left p-3 hover:bg-neutral rounded-lg transition-colors">
                                    <p className="font-semibold">{project.title}</p>
                                    <p className="text-xs text-text-secondary truncate">{project.description}</p>
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : <p className="text-text-tertiary text-sm text-center py-4">No projects in this area yet.</p>}
            </ItemCard>

            <ItemCard icon={<FileTextIcon className="w-6 h-6 text-accent" />} title="Notes" onAdd={onOpenCommandBar}>
                 {notes.length > 0 ? (
                    <ul className="space-y-2">
                        {notes.map(note => (
                             <li key={note.id}>
                                <button onClick={() => onSelectNote(note.id)} className="w-full text-left p-3 hover:bg-neutral rounded-lg transition-colors">
                                    <p className="font-semibold">{note.title}</p>
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : <p className="text-text-tertiary text-sm text-center py-4">No notes in this area yet.</p>}
            </ItemCard>

            <ItemCard icon={<ResourceIcon className="w-6 h-6 text-accent" />} title="Resources" onAdd={onOpenCommandBar}>
                 {resources.length > 0 ? (
                    <ul className="space-y-1">
                        {resources.map(resource => (
                            <li key={resource.id} className="flex items-center gap-3 p-3 hover:bg-neutral rounded-lg transition-colors">
                                {resource.type === 'link' ? <LinkIcon className="w-4 h-4 text-text-tertiary" /> : <ResourceIcon className="w-4 h-4 text-text-tertiary" />}
                                <a href={resource.type === 'link' ? resource.content : undefined} target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-accent">{resource.title}</a>
                            </li>
                        ))}
                    </ul>
                ) : <p className="text-text-tertiary text-sm text-center py-4">No resources in this area yet.</p>}
            </ItemCard>

        </div>
    );
};

export default AreaDetail;