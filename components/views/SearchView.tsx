import React, { useMemo } from 'react';
import { Area, Project, Task, Note, Resource } from '../../types';
import { View } from '../../types';
import { AreaIcon, ProjectIcon, ResourceIcon, FileTextIcon, SearchIcon, ListTodoIcon } from '../shared/icons';

interface SearchViewProps {
    query: string;
    areas: Area[];
    projects: Project[];
    tasks: Task[];
    notes: Note[];
    resources: Resource[];
    onNavigate: (view: View, itemId: string) => void;
}

const itemTypeConfig = {
    areas: { label: "Areas", icon: <AreaIcon className="w-5 h-5 text-accent" /> },
    projects: { label: "Projects", icon: <ProjectIcon className="w-5 h-5 text-accent" /> },
    tasks: { label: "Tasks", icon: <ListTodoIcon className="w-5 h-5 text-accent" /> },
    notes: { label: "Notes", icon: <FileTextIcon className="w-5 h-5 text-accent" /> },
    resources: { label: "Resources", icon: <ResourceIcon className="w-5 h-5 text-accent" /> },
}

const SearchView: React.FC<SearchViewProps> = ({ query, areas, projects, tasks, notes, resources, onNavigate }) => {

    const searchResults = useMemo(() => {
        const lowerCaseQuery = query.toLowerCase();
        if (!lowerCaseQuery) return null;

        const filter = (items: any[]) => items.filter(item => item.title.toLowerCase().includes(lowerCaseQuery) && item.status === 'active');

        return {
            areas: filter(areas),
            projects: filter(projects),
            tasks: filter(tasks),
            notes: filter(notes),
            resources: filter(resources),
        };
    }, [query, areas, projects, tasks, notes, resources]);
    
    const handleResultClick = (item: any, type: keyof typeof searchResults) => {
        switch(type) {
            case 'areas':
                onNavigate('areas', item.id);
                break;
            case 'projects':
                onNavigate('projects', item.id);
                break;
            case 'tasks':
                if (item.projectId) onNavigate('projects', item.projectId);
                break;
            case 'notes':
            case 'resources':
                const parentProject = item.parentIds.find((id:string) => id.startsWith('proj-'));
                if (parentProject) {
                    onNavigate('projects', parentProject);
                } else {
                    const parentArea = item.parentIds.find((id:string) => id.startsWith('area-'));
                    if (parentArea) {
                        onNavigate('areas', parentArea);
                    }
                }
                break;
        }
    }
    
    const totalResults = searchResults ? Object.values(searchResults).reduce((sum, arr) => sum + (arr as any[]).length, 0) : 0;

    return (
        <div>
            <header className="mb-8">
                <h1 className="text-3xl font-bold font-heading">Search Results</h1>
                <p className="text-text-secondary">Found {totalResults} results for "<span className="text-accent font-semibold">{query}</span>"</p>
            </header>
            
            {totalResults === 0 ? (
                 <div className="flex flex-col items-center justify-center h-64 text-text-tertiary border-2 border-dashed border-outline-dark rounded-xl bg-surface/80 backdrop-blur-xl">
                    <SearchIcon className="w-16 h-16 mb-4" />
                    <h2 className="text-xl font-semibold font-heading text-text-primary">No Results Found</h2>
                    <p>Try a different search term.</p>
                </div>
            ) : (
                Object.entries(searchResults || {}).map(([type, items]) => {
                    const itemsArray = items as (Area | Project | Task | Note | Resource)[];
                    if (itemsArray.length === 0) return null;

                    const config = itemTypeConfig[type as keyof typeof itemTypeConfig];
                    return (
                        <div key={type} className="mb-6">
                            <h2 className="font-bold text-lg flex items-center gap-2 mb-3 font-heading">
                                {config.icon}
                                <span>{config.label}</span>
                            </h2>
                            <ul className="bg-surface/80 backdrop-blur-xl border border-outline rounded-xl shadow-md divide-y divide-outline-dark">
                                {itemsArray.map((item: any) => (
                                    <li key={item.id}>
                                        <button onClick={() => handleResultClick(item, type as keyof typeof searchResults)} className="w-full text-left p-3 hover:bg-neutral">
                                            {item.title}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )
                })
            )}
        </div>
    );
};

export default React.memo(SearchView);