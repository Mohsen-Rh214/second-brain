

import React, { useEffect } from 'react';
import { Area, Project, Note, Resource } from '../types';
import AreaDetail from './AreaDetail';
import { AreaIcon } from './icons';
// FIX: Import View from types.ts instead of App.tsx
import { CaptureContext } from '../App';
import { View } from '../types';

interface AreaViewProps {
    areas: Area[];
    activeAreaId: string | null;
    onSelectArea: (id: string | null) => void;
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

const AreaView: React.FC<AreaViewProps> = ({ areas, activeAreaId, onSelectArea, projects, notes, resources, onArchive, onDelete, onSelectNote, onUpdateArea, onAddItem, onNavigate }) => {
    
    useEffect(() => {
        if (areas.length > 0 && (!activeAreaId || !areas.some(a => a.id === activeAreaId))) {
            onSelectArea(areas[0].id);
        } else if (areas.length === 0) {
            onSelectArea(null);
        }
    }, [areas, activeAreaId, onSelectArea]);

    const selectedArea = areas.find(a => a.id === activeAreaId) || null;

    return (
        <div className="flex h-full">
            <aside className="w-1/-3 max-w-sm h-full flex flex-col border-r border-slate-800 bg-slate-950/30">
                <header className="p-4 border-b border-slate-800 flex-shrink-0">
                    <h2 className="text-lg font-bold">Areas</h2>
                </header>
                <ul className="flex-1 overflow-y-auto custom-scrollbar p-2">
                    {areas.map(area => (
                        <li key={area.id}>
                            <button
                                onClick={() => onSelectArea(area.id)}
                                className={`w-full text-left p-3 rounded-md mb-1 transition-colors ${
                                    activeAreaId === area.id 
                                    ? 'bg-slate-700' 
                                    : 'hover:bg-slate-800'
                                }`}
                            >
                                <h3 className="font-semibold">{area.title}</h3>
                                <p className="text-xs text-slate-400 truncate">{area.description}</p>
                            </button>
                        </li>
                    ))}
                </ul>
            </aside>
            <section className="flex-1 overflow-y-auto custom-scrollbar">
                {selectedArea ? (
                    <AreaDetail
                        area={selectedArea}
                        projects={projects.filter(p => selectedArea.projectIds.includes(p.id))}
                        notes={notes.filter(n => n.parentIds.includes(selectedArea.id))}
                        resources={resources.filter(r => r.parentIds.includes(selectedArea.id))}
                        onArchive={onArchive}
                        onDelete={onDelete}
                        onSelectNote={onSelectNote}
                        onUpdateArea={onUpdateArea}
                        onAddItem={onAddItem}
                        onNavigate={onNavigate}
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500">
                        <AreaIcon className="w-16 h-16 mb-4" />
                        <h2 className="text-xl font-semibold">No Areas</h2>
                        <p>Select an area from the list or create a new one.</p>
                    </div>
                )}
            </section>
        </div>
    );
};

export default AreaView;