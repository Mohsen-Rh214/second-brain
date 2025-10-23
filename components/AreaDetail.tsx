

import React, { useState, useEffect } from 'react';
import { Area, Project, Note, Resource } from '../types';
import { ProjectIcon, FileTextIcon, ResourceIcon, LinkIcon, ArchiveBoxIcon, TrashIcon, EditIcon, PlusIcon } from './icons';
// FIX: Import View from types.ts instead of App.tsx
import { CaptureContext } from '../App';
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
    onAddItem: (context: CaptureContext) => void;
    onNavigate: (view: View, itemId: string) => void;
}

const ItemCard: React.FC<{icon: React.ReactElement, title: string, children?: React.ReactNode, onAdd?: () => void}> = ({icon, title, children, onAdd}) => (
    <div className="bg-slate-800/50 rounded-lg mb-6">
        <header className="flex items-center justify-between p-4 border-b border-slate-700">
             <div className="flex items-center gap-3">
                {icon}
                <h3 className="font-bold text-lg">{title}</h3>
            </div>
            {onAdd && (
                <button onClick={onAdd} aria-label={`Add new ${title}`} className="p-1 text-slate-400 hover:bg-slate-700 hover:text-white rounded-full transition-colors"><PlusIcon className="w-5 h-5"/></button>
            )}
        </header>
        <div className="p-4">
            {children}
        </div>
    </div>
);


const AreaDetail: React.FC<AreaDetailProps> = ({ area, projects, notes, resources, onArchive, onDelete, onSelectNote, onUpdateArea, onAddItem, onNavigate }) => {
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
        <div className="p-8">
            <header className="mb-8">
                <div className="flex justify-between items-start">
                     {isEditing ? (
                        <div className="flex-1 mr-4">
                            <input
                                type="text"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                className="w-full bg-slate-700/50 border border-slate-600 rounded-md px-3 py-2 text-3xl font-bold mb-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                             <textarea
                                value={editDescription}
                                onChange={(e) => setEditDescription(e.target.value)}
                                rows={3}
                                className="w-full bg-slate-700/50 border border-slate-600 rounded-md px-3 py-2 text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 custom-scrollbar max-w-prose"
                            />
                        </div>
                    ) : (
                        <div>
                            <h1 className="text-3xl font-bold mb-2">{area.title}</h1>
                            <p className="text-slate-400 max-w-prose">{area.description}</p>
                        </div>
                    )}
                    <div className="flex gap-2 flex-shrink-0 ml-4">
                         {isEditing ? (
                            <>
                                <button onClick={handleSave} className="px-3 py-2 text-sm bg-emerald-600 hover:bg-emerald-500 text-white rounded-md transition-colors">Save</button>
                                <button onClick={handleCancel} className="px-3 py-2 text-sm bg-slate-600 hover:bg-slate-500 text-white rounded-md transition-colors">Cancel</button>
                            </>
                        ) : (
                            <>
                                <button onClick={() => setIsEditing(true)} aria-label="Edit Area" className="p-2 text-slate-400 hover:bg-slate-700 hover:text-white rounded-md transition-colors"><EditIcon className="w-5 h-5"/></button>
                                <button onClick={() => onArchive(area.id)} aria-label="Archive Area" className="p-2 text-slate-400 hover:bg-slate-700 hover:text-white rounded-md transition-colors"><ArchiveBoxIcon className="w-5 h-5"/></button>
                                <button onClick={() => onDelete(area.id)} aria-label="Delete Area" className="p-2 text-slate-400 hover:bg-slate-700 hover:text-red-400 rounded-md transition-colors"><TrashIcon className="w-5 h-5"/></button>
                            </>
                        )}
                    </div>
                </div>
            </header>

            <ItemCard icon={<ProjectIcon className="w-6 h-6 text-sky-400" />} title="Projects" onAdd={() => onAddItem({ parentId: area.id, itemType: 'project'})}>
                {projects.length > 0 ? (
                    <ul>
                        {projects.map(project => (
                             <li key={project.id}>
                                <button onClick={() => onNavigate('projects', project.id)} className="w-full text-left mb-2 p-2 rounded hover:bg-slate-700/50">
                                    <p className="font-semibold">{project.title}</p>
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : <p className="text-slate-500 text-sm">No projects in this area yet.</p>}
            </ItemCard>

            <ItemCard icon={<FileTextIcon className="w-6 h-6 text-emerald-400" />} title="Notes" onAdd={() => onAddItem({ parentId: area.id, itemType: 'note'})}>
                 {notes.length > 0 ? (
                    <ul>
                        {notes.map(note => (
                             <li key={note.id}>
                                <button onClick={() => onSelectNote(note.id)} className="w-full text-left mb-2 p-2 rounded hover:bg-slate-700/50">
                                    <p className="font-semibold">{note.title}</p>
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : <p className="text-slate-500 text-sm">No notes in this area yet.</p>}
            </ItemCard>

            <ItemCard icon={<ResourceIcon className="w-6 h-6 text-indigo-400" />} title="Resources" onAdd={() => onAddItem({ parentId: area.id, itemType: 'resource'})}>
                 {resources.length > 0 ? (
                    <ul>
                        {resources.map(resource => (
                            <li key={resource.id} className="flex items-center gap-3 mb-2 p-2 rounded hover:bg-slate-700/50">
                                {resource.type === 'link' ? <LinkIcon className="w-4 h-4 text-slate-500" /> : <ResourceIcon className="w-4 h-4 text-slate-500" />}
                                <a href={resource.type === 'link' ? resource.content : undefined} target="_blank" rel="noopener noreferrer" className="hover:underline">{resource.title}</a>
                            </li>
                        ))}
                    </ul>
                ) : <p className="text-slate-500 text-sm">No resources in this area yet.</p>}
            </ItemCard>

        </div>
    );
};

export default AreaDetail;