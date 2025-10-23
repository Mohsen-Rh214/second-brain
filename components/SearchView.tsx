

import React, { useMemo } from 'react';
import { Area, Project, Task, Note, Resource } from '../types';
import { View } from '../types';
import { AreaIcon, ProjectIcon, ResourceIcon, FileTextIcon, CheckSquareIcon, SearchIcon } from './icons';

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
    areas: { label: "Areas", icon: <AreaIcon className="w-5 h-5 text-emerald-400" /> },
    projects: { label: "Projects", icon: <ProjectIcon className="w-5 h-5 text-sky-400" /> },
    tasks: { label: "Tasks", icon: <CheckSquareIcon className="w-5 h-5 text-amber-400" /> },
    notes: { label: "Notes", icon: <FileTextIcon className="w-5 h-5 text-fuchsia-400" /> },
    resources: { label: "Resources", icon: <ResourceIcon className="w-5 h-5 text-indigo-400" /> },
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
                // For tasks, navigate to the parent project
                onNavigate('projects', item.projectId);
                break;
            case 'notes':
            case 'resources':
                // For notes/resources, try to navigate to a parent project first, then area
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
    
    const totalResults = searchResults ? Object.values(searchResults).reduce((sum, arr) => sum + arr.length, 0) : 0;

    return (
        <div className="p-8">
            <header className="mb-8">
                <h1 className="text-3xl font-bold">Search Results</h1>
                <p className="text-slate-400">Found {totalResults} results for "<span className="text-emerald-400 font-semibold">{query}</span>"</p>
            </header>
            
            {totalResults === 0 ? (
                 <div className="flex flex-col items-center justify-center h-64 text-slate-500 border-2 border-dashed border-slate-700 rounded-lg">
                    <SearchIcon className="w-16 h-16 mb-4" />
                    <h2 className="text-xl font-semibold">No Results Found</h2>
                    <p>Try a different search term.</p>
                </div>
            ) : (
                Object.entries(searchResults || {}).map(([type, items]) => {
                    if (items.length === 0) return null;
                    const config = itemTypeConfig[type as keyof typeof itemTypeConfig];
                    
                    return (
                        <div key={type} className="mb-6">
                            <div className="flex items-center gap-3 mb-3">
                                {config.icon}
                                <h2 className="text-xl font-bold">{config.label}</h2>
                            </div>
                            <ul className="space-y-2">
                                {items.map((item: any) => (
                                    <li key={item.id}>
                                        <button 
                                            onClick={() => handleResultClick(item, type as keyof typeof searchResults)}
                                            className="w-full text-left p-3 rounded-md bg-slate-800/50 hover:bg-slate-700/50 transition-colors"
                                        >
                                            <p className="font-semibold">{item.title}</p>
                                            {type === 'tasks' && <p className="text-xs text-slate-500">In Project: {projects.find(p => p.id === item.projectId)?.title}</p>}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    );
                })
            )}

        </div>
    );
};

export default SearchView;
