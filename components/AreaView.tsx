import React, { useEffect } from 'react';
import { Area, Project, Note, Resource } from '../types';
import AreaDetail from './AreaDetail';
import { AreaIcon, PlusIcon } from './icons';
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
    onOpenCommandBar: () => void;
    onOpenCaptureModal: (context: CaptureContext) => void;
    onNavigate: (view: View, itemId: string) => void;
}

const AreaView: React.FC<AreaViewProps> = ({ areas, activeAreaId, onSelectArea, projects, notes, resources, onArchive, onDelete, onSelectNote, onUpdateArea, onOpenCommandBar, onNavigate }) => {
    
    useEffect(() => {
        if (areas.length > 0 && (!activeAreaId || !areas.some(a => a.id === activeAreaId))) {
            onSelectArea(areas[0].id);
        } else if (areas.length === 0) {
            onSelectArea(null);
        }
    }, [areas, activeAreaId, onSelectArea]);

    const selectedArea = areas.find(a => a.id === activeAreaId) || null;

    return (
        <div className="flex h-full gap-6">
            <aside className="w-1/3 max-w-sm h-full flex flex-col bg-surface/80 backdrop-blur-xl border border-outline rounded-xl shadow-md">
                <header className="p-4 border-b border-outline-dark flex-shrink-0 flex items-center justify-between">
                    <h2 className="text-lg font-bold font-heading">Areas</h2>
                </header>
                <ul className="flex-1 overflow-y-auto custom-scrollbar p-2">
                    {areas.map(area => (
                        <li key={area.id}>
                            <button
                                onClick={() => onSelectArea(area.id)}
                                className={`w-full text-left p-3 mb-1 transition-all duration-200 rounded-lg ${
                                    activeAreaId === area.id 
                                    ? 'bg-accent/10 text-accent' 
                                    : 'hover:bg-neutral'
                                }`}
                            >
                                <h3 className="font-semibold text-text-primary">{area.title}</h3>
                                <p className="text-xs text-text-secondary truncate">{area.description}</p>
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
                        onOpenCommandBar={onOpenCommandBar}
                        onNavigate={onNavigate}
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-text-tertiary text-center p-8 bg-surface/80 backdrop-blur-xl border border-outline rounded-xl shadow-md">
                        <AreaIcon className="w-16 h-16 mb-4" />
                        <h2 className="text-xl font-semibold font-heading text-text-primary">No Areas</h2>
                        <p className="max-w-sm mb-4">Areas are long-term responsibilities with no end date, like "Health" or "Finances".</p>
                         <button 
                            onClick={onOpenCommandBar}
                            className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-accent-content font-semibold px-4 py-2 transition-colors rounded-lg shadow-sm"
                         >
                            <PlusIcon className="w-5 h-5"/>
                            Create New Area
                        </button>
                    </div>
                )}
            </section>
        </div>
    );
};

export default AreaView;