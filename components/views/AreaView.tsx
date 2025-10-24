import React, { useEffect, useMemo, useState } from 'react';
import { Area, Project, Note, Resource, Task } from '../../types';
import AreaDetail from './AreaDetail';
import { AreaIcon, PlusIcon, BriefcaseIcon, HeartIcon, BookOpenIcon, DollarSignIcon, UsersIcon, BrainCircuitIcon } from '../shared/icons';
import { CaptureContext } from '../../types';
import { View } from '../../types';
import EmptyState from '../shared/EmptyState';
import TagList from '../shared/TagList';
import { useData } from '../../store/DataContext';
import { useDraggableList } from '../../hooks/useDraggableList';
import { useUI } from '../../store/UIContext';

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
    onUpdateArea: (areaId: string, updates: Partial<Omit<Area, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'projectIds'>>) => void;
    onOpenCaptureModal: (context: CaptureContext) => void;
    onNavigate: (view: View, itemId: string) => void;
    onDirectOrganizeItem: (itemId: string, newParentIds: string[]) => void;
    isFocusMode: boolean;
    onToggleFocusMode: () => void;
}

const getIconByName = (name: string, className: string) => {
    switch (name) {
        case 'briefcase': return <BriefcaseIcon className={className} />;
        case 'heart': return <HeartIcon className={className} />;
        case 'book': return <BookOpenIcon className={className} />;
        case 'finance': return <DollarSignIcon className={className} />;
        case 'social': return <UsersIcon className={className} />;
        case 'brain': return <BrainCircuitIcon className={className} />;
        default: return <AreaIcon className={className} />;
    }
};

const AreaView: React.FC<AreaViewProps> = ({ areas, activeAreaId, onSelectArea, projects, tasks, notes, resources, onArchive, onDelete, onSelectNote, onUpdateArea, onOpenCaptureModal, onNavigate, onDirectOrganizeItem, isFocusMode, onToggleFocusMode }) => {
    const { dispatch: dataDispatch } = useData();
    const { state: uiState } = useUI();
    const { draggedItemId, draggedItemType } = uiState;
    const [dropTargetAreaId, setDropTargetAreaId] = useState<string | null>(null);

    const { draggedId, dropAction, getDragAndDropProps, getContainerProps } = useDraggableList<Area>({
        items: areas,
        onReorder: (sourceId, targetId) => {
            dataDispatch({ type: 'REORDER_LIST', payload: { listKey: 'areas', sourceId, targetId } });
        }
    });
    
    useEffect(() => {
        if (areas.length > 0 && (!activeAreaId || !areas.some(a => a.id === activeAreaId))) {
            onSelectArea(areas[0].id);
        } else if (areas.length === 0) {
            onSelectArea(null);
        }
    }, [areas, activeAreaId, onSelectArea]);

    const selectedArea = areas.find(a => a.id === activeAreaId) || null;

    const orderedProjects = useMemo(() => {
        if (!selectedArea) return [];
        return selectedArea.projectIds
            .map(id => projects.find(p => p.id === id))
            .filter((p): p is Project => !!p && p.status === 'active');
    }, [selectedArea, projects]);

    const handleAddNewArea = () => {
        onOpenCaptureModal({ parentId: null, itemType: 'area' });
    }

    const handleQuickAdd = (e: React.MouseEvent, areaId: string) => {
        e.stopPropagation();
        onOpenCaptureModal({ parentId: areaId, itemType: 'project' });
    };

    const handleDragOver = (e: React.DragEvent, areaId: string) => {
        if (draggedItemType === 'note' || draggedItemType === 'resource') {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            setDropTargetAreaId(areaId);
        }
    };
    
    const handleDragLeave = (e: React.DragEvent) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
             setDropTargetAreaId(null);
        }
    };
    
    const handleDrop = (e: React.DragEvent, areaId: string) => {
        e.preventDefault();
        e.stopPropagation();
        if (draggedItemId) {
            onDirectOrganizeItem(draggedItemId, [areaId]);
        }
        setDropTargetAreaId(null);
    };

    return (
        <div className="flex h-full gap-8">
            {!isFocusMode && (
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
                    <ul className="flex-1 overflow-y-auto custom-scrollbar p-2" {...getContainerProps()}>
                        {areas.map(area => (
                            <li 
                                key={area.id}
                                {...getDragAndDropProps(area.id)}
                                onDragOver={(e) => handleDragOver(e, area.id)}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, area.id)}
                                className={`relative cursor-grab rounded-xl transition-all duration-300 group ${draggedId === area.id ? 'opacity-30' : ''} ${dropTargetAreaId === area.id ? 'ring-2 ring-accent ring-inset' : ''}`}
                            >
                                {dropAction?.type === 'REORDER' && dropAction.targetId === area.id && (
                                    <div className="absolute -top-1 left-2 right-2 h-0.5 bg-accent rounded-full" />
                                )}
                                <button
                                    onClick={() => onSelectArea(area.id)}
                                    className={`w-full text-left p-3 mb-1 transition-all duration-200 rounded-xl border-l-4 ${
                                        activeAreaId === area.id 
                                        ? 'bg-neutral' 
                                        : 'border-transparent hover:bg-neutral'
                                    }`}
                                    style={{ borderColor: activeAreaId === area.id ? area.color : 'transparent' }}
                                >
                                    <div className="flex items-center gap-3">
                                        <div style={{ color: area.color || 'currentColor' }}>
                                            {getIconByName(area.icon || 'default', 'w-5 h-5 flex-shrink-0')}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-text-primary truncate">{area.title}</h3>
                                            <p className="text-xs text-text-secondary truncate">{area.description}</p>
                                            <TagList tags={area.tags} className="mt-2" />
                                        </div>
                                    </div>
                                </button>
                                <button
                                    onClick={(e) => handleQuickAdd(e, area.id)}
                                    aria-label={`Quick add to ${area.title}`}
                                    className="absolute top-1/2 -translate-y-1/2 right-2 p-1.5 bg-secondary hover:bg-secondary-hover rounded-full text-secondary-content opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-200"
                                >
                                    <PlusIcon className="w-4 h-4" />
                                </button>
                            </li>
                        ))}
                    </ul>
                </aside>
            )}
            <section className="flex-1 overflow-y-auto custom-scrollbar">
                {selectedArea ? (
                    <AreaDetail
                        area={selectedArea}
                        projects={orderedProjects}
                        tasks={tasks}
                        notes={notes.filter(n => n.parentIds.includes(selectedArea.id))}
                        resources={resources.filter(r => r.parentIds.includes(selectedArea.id))}
                        onArchive={onArchive}
                        onDelete={onDelete}
                        onSelectNote={onSelectNote}
                        onUpdateArea={onUpdateArea}
                        onOpenCaptureModal={onOpenCaptureModal}
                        onNavigate={onNavigate}
                        isFocusMode={isFocusMode}
                        onToggleFocusMode={onToggleFocusMode}
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
