import React from 'react';
import { Resource, Project, Area } from '../../types';
import { ResourceIcon, LinkIcon, FileTextIcon, ArchiveBoxIcon, TrashIcon, ProjectIcon, AreaIcon, PlusIcon } from '../shared/icons';
import { CaptureContext } from '../../types';
import EmptyState from '../shared/EmptyState';
import TagList from '../shared/TagList';

interface ResourceViewProps {
    resources: Resource[];
    projects: Project[];
    areas: Area[];
    onArchive: (itemId: string) => void;
    onDelete: (itemId: string) => void;
    onOpenCaptureModal: (context: CaptureContext) => void;
}

const ResourceView: React.FC<ResourceViewProps> = ({ resources, projects, areas, onArchive, onDelete, onOpenCaptureModal }) => {
    
    const getParentName = (parentId: string) => {
        const project = projects.find(p => p.id === parentId);
        if (project) return { name: project.title, type: 'project' as const };
        const area = areas.find(a => a.id === parentId);
        if (area) return { name: area.title, type: 'area' as const };
        return null;
    }

    const getResourceIcon = (type: Resource['type']) => {
        switch(type) {
            case 'link': return <LinkIcon className="w-5 h-5 text-accent" />;
            case 'file': return <FileTextIcon className="w-5 h-5 text-accent" />;
            case 'text': return <FileTextIcon className="w-5 h-5 text-accent" />;
            default: return <ResourceIcon className="w-5 h-5 text-text-secondary" />;
        }
    }

    const handleAddResource = () => {
        onOpenCaptureModal({ parentId: null, itemType: 'resource' });
    }

    return (
        <div>
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold font-heading">Resources</h1>
                    <p className="text-text-secondary">Your personal library of links, files, and text snippets.</p>
                </div>
                 <button 
                    onClick={handleAddResource}
                    className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-accent-content font-semibold px-4 py-2 transition-colors rounded-lg shadow-sm"
                 >
                    <PlusIcon className="w-5 h-5"/>
                    Add Resource
                </button>
            </header>
            
            {resources.length === 0 ? (
                <EmptyState 
                    icon={<ResourceIcon />}
                    title="Build Your Personal Library"
                    description="Resources are topics of interest or useful information, like articles, links, or code snippets. Start capturing knowledge."
                />
            ) : (
                <div className="bg-surface/80 backdrop-blur-xl border border-outline rounded-xl shadow-md">
                    <ul className="divide-y divide-outline-dark">
                        {resources.map(resource => (
                            <li key={resource.id} className="flex items-center justify-between p-4 hover:bg-neutral">
                                <div className="flex items-center gap-4">
                                    {getResourceIcon(resource.type)}
                                    <div>
                                        {resource.type === 'link' ? (
                                             <a href={resource.content} target="_blank" rel="noopener noreferrer" className="font-semibold hover:underline hover:text-accent">{resource.title}</a>
                                        ) : (
                                            <p className="font-semibold">{resource.title}</p>
                                        )}
                                        <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-xs text-text-secondary mt-1">
                                            <div className="flex items-center gap-2">
                                                {resource.parentIds.map(pid => {
                                                    const parent = getParentName(pid);
                                                    if (!parent) return null;
                                                    return (
                                                        <span key={pid} className="flex items-center gap-1 bg-background/50 px-2 py-0.5 border border-outline rounded-md">
                                                            {parent.type === 'project' ? <ProjectIcon className="w-3 h-3"/> : <AreaIcon className="w-3 h-3"/>}
                                                            {parent.name}
                                                        </span>
                                                    )
                                                })}
                                            </div>
                                            <TagList tags={resource.tags} />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => onArchive(resource.id)} aria-label={`Archive ${resource.title}`} className="p-2 text-text-secondary hover:text-accent transition-colors rounded-full"><ArchiveBoxIcon className="w-5 h-5"/></button>
                                    <button onClick={() => onDelete(resource.id)} aria-label={`Delete ${resource.title}`} className="p-2 text-text-secondary hover:text-destructive transition-colors rounded-full"><TrashIcon className="w-5 h-5"/></button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default React.memo(ResourceView);