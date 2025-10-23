import React, { useEffect } from 'react';
import { Area, Project, Note, Resource, Task } from '../../types';
import AreaDetail from './AreaDetail';
import { AreaIcon, PlusIcon } from '../shared/icons';
import { CaptureContext } from '../../types';
import { View } from '../../types';
import EmptyState from '../shared/EmptyState';

interface AreaViewProps {
    areas: Area[];
    activeAreaId: string | null;
    onSelectArea: (id: string | null) => void;
    projects: Project[];
    tasks: Task[];
    notes: Note[];
    resources: Resource[];
    onArchive: (itemId: string) => void;
    onDelete: (itemId: string) => void;
    onSelectNote: (noteId: string) => void;
    onUpdateArea: (areaId: string, updates: { title?: string, description?: string }) => void;
    onOpenCaptureModal: (context: CaptureContext) => void;
    onNavigate: (view: View, itemId: string) => void;
}

const AreaView: React.FC<AreaViewProps> = ({ areas, activeAreaId, onSelectArea, projects, tasks, notes, resources, onArchive, onDelete, onSelectNote, onUpdateArea, onOpenCaptureModal, onNavigate }) => {
    
    useEffect(() => {
        if (areas.length > 0 && (!activeAreaId || !areas.some(a => a.id === activeAreaId))) {
            onSelectArea(areas[0].id);
        } else if (areas.length === 0) {
            onSelectArea(null);
        }
    }, [areas, activeAreaId, onSelectArea]);

    const selectedArea = areas.find(a => a.id === activeAreaId) || null;

    const handleAddNewArea = () => {
        onOpenCaptureModal({ parentId: null, itemType: 'area' });
    }

    return (
        <div className="flex h-full gap-8">
            <aside className="w-1/3 max-w-sm h-full flex flex-col bg-surface/80 backdrop-blur-xl border border-outline rounded-2xl shadow-md">
                <header className="p-4 border-b border-outline-dark flex-shrink-0 flex items-center justify-between">
                    <h2 className="text-lg font-bold font-heading tracking-tight">Areas</h2>
                    <button 
                        onClick={handleAddNewArea} 
                        aria-label="Add new area" 
                        className="p-1.5 text-text-secondary hover:bg-neutral hover:text-text-primary rounded-full transition-colors active:scale-95"
                    >
                        <PlusIcon className="w-5 h-5"/>
                    </button>
                </header>
                <ul className="flex-1 overflow-y-auto custom-scrollbar p-2">
                    {areas.map(area => (
                        <li key={area.id}>
                            <button
                                onClick={() => onSelectArea(area.id)}
                                className={`w-full text-left p-3 mb-1 transition-all duration-200 rounded-xl ${
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
                        tasks={tasks}
                        notes={notes.filter(n => n.parentIds.includes(selectedArea.id))}
                        resources={resources.filter(r => r.parentIds.includes(selectedArea.id))}
                        onArchive={onArchive}
                        onDelete={onDelete}
                        onSelectNote={onSelectNote}
                        onUpdateArea={onUpdateArea}
                        onOpenCaptureModal={onOpenCaptureModal}
                        onNavigate={onNavigate}
                    />
                ) : (
                     <EmptyState 
                        icon={<AreaIcon />}
                        title="Create Your First Area of Life"
                        description="Areas are the broad, ongoing responsibilities that shape your life, like 'Personal Growth' or 'Career'. What's a major part of your life you want to focus on?"
                        actionButton={
                            <button 
                                onClick={handleAddNewArea}
                                className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-accent-content font-semibold px-4 py-2 transition-colors rounded-lg shadow-sm active:scale-95"
                             >
                                <PlusIcon className="w-5 h-5"/>
                                Create New Area
                            </button>
                        }
                    />
                )}
            </section>
        </div>
    );
};

export default React.memo(AreaView);