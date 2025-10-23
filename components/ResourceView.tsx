
import React from 'react';
import { Resource, Project, Area } from '../types';
import { ResourceIcon, LinkIcon, FileTextIcon, ArchiveBoxIcon, TrashIcon, ProjectIcon, AreaIcon } from './icons';

interface ResourceViewProps {
    resources: Resource[];
    projects: Project[];
    areas: Area[];
    onArchive: (itemId: string) => void;
    onDelete: (itemId: string) => void;
}

const ResourceView: React.FC<ResourceViewProps> = ({ resources, projects, areas, onArchive, onDelete }) => {
    
    const getParentName = (parentId: string) => {
        const project = projects.find(p => p.id === parentId);
        if (project) return { name: project.title, type: 'project' as const };
        const area = areas.find(a => a.id === parentId);
        if (area) return { name: area.title, type: 'area' as const };
        return null;
    }

    const getResourceIcon = (type: Resource['type']) => {
        switch(type) {
            case 'link': return <LinkIcon className="w-5 h-5 text-sky-400" />;
            case 'file': return <FileTextIcon className="w-5 h-5 text-emerald-400" />;
            case 'text': return <FileTextIcon className="w-5 h-5 text-amber-400" />;
            default: return <ResourceIcon className="w-5 h-5 text-slate-400" />;
        }
    }

    return (
        <div className="p-8">
            <header className="mb-8">
                <h1 className="text-3xl font-bold">Resources</h1>
                <p className="text-slate-400">Your personal library of links, files, and text snippets.</p>
            </header>
            
            {resources.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-500 border-2 border-dashed border-slate-700 rounded-lg">
                    <ResourceIcon className="w-16 h-16 mb-4" />
                    <h2 className="text-xl font-semibold">No Resources Yet</h2>
                    <p>Use the '+' button to capture your first resource.</p>
                </div>
            ) : (
                <div className="bg-slate-800/50 rounded-lg">
                    <ul className="divide-y divide-slate-700">
                        {resources.map(resource => (
                            <li key={resource.id} className="flex items-center justify-between p-4 hover:bg-slate-700/50">
                                <div className="flex items-center gap-4">
                                    {getResourceIcon(resource.type)}
                                    <div>
                                        {resource.type === 'link' ? (
                                             <a href={resource.content} target="_blank" rel="noopener noreferrer" className="font-semibold hover:underline">{resource.title}</a>
                                        ) : (
                                            <p className="font-semibold">{resource.title}</p>
                                        )}
                                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                                            {resource.parentIds.map(pid => {
                                                const parent = getParentName(pid);
                                                if (!parent) return null;
                                                return (
                                                    <span key={pid} className="flex items-center gap-1 bg-slate-700 px-2 py-0.5 rounded-full">
                                                        {parent.type === 'project' ? <ProjectIcon className="w-3 h-3"/> : <AreaIcon className="w-3 h-3"/>}
                                                        {parent.name}
                                                    </span>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => onArchive(resource.id)} aria-label={`Archive ${resource.title}`} className="p-2 text-slate-400 hover:text-amber-400 rounded-md transition-colors"><ArchiveBoxIcon className="w-5 h-5"/></button>
                                    <button onClick={() => onDelete(resource.id)} aria-label={`Delete ${resource.title}`} className="p-2 text-slate-400 hover:text-red-400 rounded-md transition-colors"><TrashIcon className="w-5 h-5"/></button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default ResourceView;
