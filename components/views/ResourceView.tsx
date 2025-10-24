import React, { useState, useMemo, useEffect } from 'react';
import { Resource, Project, Area, View } from '../../types';
import { ResourceIcon, LinkIcon, ProjectIcon, AreaIcon, PlusIcon, FileTextIcon } from '../shared/icons';
import { CaptureContext } from '../../types';
import EmptyState from '../shared/EmptyState';
import TagList from '../shared/TagList';
import FilterSortControls from '../shared/FilterSortControls';
import ActionMenu from '../shared/ActionMenu';

interface ResourceViewProps {
    resources: Resource[];
    projects: Project[];
    areas: Area[];
    onArchive: (itemId: string) => void;
    onDelete: (itemId: string) => void;
    onOpenCaptureModal: (context: CaptureContext) => void;
    onEditResource: (resourceId: string) => void;
    onNavigate: (view: View, itemId: string) => void;
}

const getDomain = (url: string) => {
    try {
        const urlObject = new URL(url.startsWith('http') ? url : `https://${url}`);
        return urlObject.hostname.replace(/^www\./, '');
    } catch {
        return null;
    }
};

interface ResourceCardProps {
    resource: Resource;
    getParentName: (parentId: string) => { name: string; type: 'project' | 'area' } | null;
    onNavigate: (view: View, itemId: string) => void;
    onEditResource: (resourceId: string) => void;
    onArchive: (itemId: string) => void;
    onDelete: (itemId: string) => void;
}

const ResourceCard: React.FC<ResourceCardProps> = ({ resource, getParentName, onNavigate, onEditResource, onArchive, onDelete }) => {
    const [imageError, setImageError] = useState(false);
    // FIX: Add state to manage the ActionMenu's visibility.
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        setImageError(false);
    }, [resource.id]);

    const isLink = !!resource.url;
    const domain = isLink ? getDomain(resource.url!) : null;
    const href = isLink ? (resource.url!.startsWith('http') ? resource.url : `https://${resource.url}`) : '#';
    const isImage = isLink && !imageError && /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(resource.url!);
    const faviconUrl = domain ? `https://www.google.com/s2/favicons?sz=64&domain_url=${domain}` : null;

    const parentLinks = resource.parentIds.map(pid => {
        const parent = getParentName(pid);
        if (!parent) return null;
        return (
            <button
                key={pid}
                onClick={(e) => {
                    e.stopPropagation();
                    onNavigate(parent.type === 'project' ? 'projects' : 'areas', pid);
                }}
                className="flex items-center gap-1 bg-background/50 px-2 py-0.5 border border-outline rounded-md hover:bg-neutral transition-colors"
                aria-label={`Navigate to ${parent.type} ${parent.name}`}
            >
                {parent.type === 'project' ? <ProjectIcon className="w-3 h-3"/> : <AreaIcon className="w-3 h-3"/>}
                {parent.name}
            </button>
        );
    }).filter(Boolean);

    const cardContent = (
        <div className="p-4 flex flex-col flex-grow">
            <div className="flex justify-between items-start gap-2">
                <h4 className="font-semibold flex-1 clamp-2-lines">{resource.title}</h4>
                <div className="-mr-2 -mt-2" onClick={e => e.stopPropagation()}>
                    <ActionMenu isOpen={isMenuOpen} onToggle={() => setIsMenuOpen(!isMenuOpen)} onEdit={() => onEditResource(resource.id)} onArchive={() => onArchive(resource.id)} onDelete={() => onDelete(resource.id)} />
                </div>
            </div>
            {domain && (
                <p className="text-xs text-text-tertiary mt-1 truncate">{domain}</p>
            )}

            {resource.content && (
                <p className="text-sm text-text-secondary mt-2 clamp-3-lines">{resource.content}</p>
            )}

            <div className="mt-auto pt-4 space-y-2">
                {parentLinks.length > 0 && <div className="flex items-center flex-wrap gap-2 text-xs text-text-secondary">{parentLinks}</div>}
                <TagList tags={resource.tags} />
            </div>
        </div>
    );

    const topSection = isImage ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className="block aspect-video bg-background/50 rounded-t-xl overflow-hidden border-b border-outline group">
            <img src={href} alt={resource.title} onError={() => setImageError(true)} className="w-full h-full object-cover" />
        </a>
    ) : isLink ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className="block aspect-video bg-background/50 flex items-center justify-center rounded-t-xl overflow-hidden border-b border-outline group">
            {faviconUrl ? (
                <img src={faviconUrl} alt={`${domain} favicon`} className="w-12 h-12" />
            ) : (
                <LinkIcon className="w-12 h-12 text-text-tertiary group-hover:text-accent transition-colors" />
            )}
        </a>
    ) : (
        <div className="block aspect-video bg-background/50 flex items-center justify-center rounded-t-xl overflow-hidden border-b border-outline group cursor-pointer" onClick={() => onEditResource(resource.id)}>
            <ResourceIcon className="w-12 h-12 text-text-tertiary group-hover:text-accent transition-colors" />
        </div>
    );

    return (
        <div className="flex flex-col h-full bg-surface/80 backdrop-blur-xl border border-outline rounded-xl shadow-md transition-all duration-300 ease-soft hover:shadow-lg hover:-translate-y-1">
            {topSection}
            <div onClick={() => onEditResource(resource.id)} className="flex flex-col flex-grow cursor-pointer">
                {cardContent}
            </div>
        </div>
    );
};


const ResourceView: React.FC<ResourceViewProps> = ({ resources, projects, areas, onArchive, onDelete, onOpenCaptureModal, onEditResource, onNavigate }) => {
    const [tagFilter, setTagFilter] = useState<string | null>(null);
    const [sortOption, setSortOption] = useState<string>('Creation Date (Newest First)');

    const allTags = useMemo(() => {
        const tagSet = new Set<string>();
        resources.forEach(res => res.tags?.forEach(tag => tagSet.add(tag)));
        return Array.from(tagSet).sort();
    }, [resources]);

    const filteredAndSortedResources = useMemo(() => {
        let processedResources = [...resources];
        if (tagFilter) {
            processedResources = processedResources.filter(res => res.tags?.includes(tagFilter));
        }
        switch (sortOption) {
            case 'Title (A-Z)':
                processedResources.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'Updated Date (Newest First)':
                processedResources.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
                break;
            case 'Creation Date (Newest First)':
            default:
                processedResources.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                break;
        }
        return processedResources;
    }, [resources, tagFilter, sortOption]);

    const getParentName = (parentId: string) => {
        const project = projects.find(p => p.id === parentId);
        if (project) return { name: project.title, type: 'project' as const };
        const area = areas.find(a => a.id === parentId);
        if (area) return { name: area.title, type: 'area' as const };
        return null;
    }

    const handleAddResource = () => {
        onOpenCaptureModal({ parentId: null, itemType: 'resource' });
    }

    const resourceSortOptions = ['Creation Date (Newest First)', 'Updated Date (Newest First)', 'Title (A-Z)'];

    
    // some helper css for clamping lines
    const customCSS = `
        .clamp-2-lines {
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
        }
        .clamp-3-lines {
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
        }
    `;

    return (
        <div>
            <style>{customCSS}</style>
            <header className="mb-8 flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold font-heading">Resources</h1>
                    <p className="text-text-secondary">Your personal library of links, files, and text snippets.</p>
                </div>
                 <div className="flex items-center gap-4">
                    <FilterSortControls
                        tags={allTags}
                        sortOptions={resourceSortOptions}
                        tagFilter={tagFilter}
                        onTagFilterChange={setTagFilter}
                        sortOption={sortOption}
                        onSortChange={setSortOption}
                    />
                    <button 
                        onClick={handleAddResource}
                        className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-accent-content font-semibold px-4 py-2 transition-colors rounded-lg shadow-sm active:scale-95"
                    >
                        <PlusIcon className="w-5 h-5"/>
                        Add Resource
                    </button>
                </div>
            </header>
            
            {filteredAndSortedResources.length === 0 ? (
                <EmptyState 
                    icon={<ResourceIcon />}
                    title={tagFilter ? 'No Matching Resources' : 'Build Your Personal Library'}
                    description={tagFilter ? `No resources found with the tag "${tagFilter}".` : "Resources are topics of interest or useful information, like articles, links, or code snippets. Start capturing knowledge."}
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAndSortedResources.map(resource => (
                        <div key={resource.id}>
                           <ResourceCard 
                                resource={resource}
                                getParentName={getParentName}
                                onNavigate={onNavigate}
                                onEditResource={onEditResource}
                                onArchive={onArchive}
                                onDelete={onDelete}
                           />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default React.memo(ResourceView);