import React, { useState, useEffect, useMemo } from 'react';
import { Area, Project, Note, Resource, View, CaptureContext, Task } from '../../types';
import { ProjectIcon, FileTextIcon, ResourceIcon, LinkIcon, AreaIcon, BriefcaseIcon, HeartIcon, BookOpenIcon, DollarSignIcon, UsersIcon, BrainCircuitIcon, ListTodoIcon, CalendarIcon, MaximizeIcon, MinimizeIcon } from '../shared/icons';
import Card from '../shared/Card';
import ActionMenu from '../shared/ActionMenu';
import ProgressBar from '../shared/ProgressBar';
import { useEditable } from '../../hooks/useEditable';
import CardEmptyState from '../shared/CardEmptyState';
import TagInput from '../shared/TagInput';
import TagList from '../shared/TagList';
import { useData } from '../../store/DataContext';
import { useDraggableList } from '../../hooks/useDraggableList';
import { stripHtml } from '../../utils';

interface AreaDetailProps {
    area: Area;
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

const ICON_LIST = [
    { name: 'default', component: <AreaIcon className="w-6 h-6" /> },
    { name: 'brain', component: <BrainCircuitIcon className="w-6 h-6" /> },
    { name: 'briefcase', component: <BriefcaseIcon className="w-6 h-6" /> },
    { name: 'heart', component: <HeartIcon className="w-6 h-6" /> },
    { name: 'book', component: <BookOpenIcon className="w-6 h-6" /> },
    { name: 'finance', component: <DollarSignIcon className="w-6 h-6" /> },
    { name: 'social', component: <UsersIcon className="w-6 h-6" /> },
];

const COLOR_PALETTE = ['#F43F5E', '#F97316', '#FBBF24', '#4ADE80', '#FF9F0A', '#3B82F6', '#A855F7', '#EC4899'];

const StatCard: React.FC<{ icon: React.ReactElement, value: number, label: string }> = ({ icon, value, label }) => (
    <div className="bg-background/50 p-4 rounded-xl border border-outline flex items-center gap-4">
        <div className="text-accent">{icon}</div>
        <div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-sm text-text-secondary">{label}</p>
        </div>
    </div>
);


const AreaDetail: React.FC<AreaDetailProps> = ({ area, projects, tasks, notes, resources, onArchive, onDelete, onSelectNote, onUpdateArea, onOpenCaptureModal, onNavigate, isFocusMode, onToggleFocusMode }) => {
    const titleEditor = useEditable(area.title, (newTitle) => onUpdateArea(area.id, { title: newTitle }));
    const descriptionEditor = useEditable(area.description, (newDescription) => onUpdateArea(area.id, { description: newDescription }));
    const [tags, setTags] = useState(area.tags || []);
    const [color, setColor] = useState(area.color);
    const [icon, setIcon] = useState(area.icon);

    const { dispatch } = useData();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const { draggedId, dropAction, getDragAndDropProps, getContainerProps } = useDraggableList<Project>({
        items: projects,
        onReorder: (sourceId, targetId) => {
            dispatch({ type: 'REORDER_CHILD_LIST', payload: {
                parentListKey: 'areas',
                parentId: area.id,
                childIdListKey: 'projectIds',
                sourceId,
                targetId,
            }});
        }
    });

    useEffect(() => {
        setTags(area.tags || []);
        setColor(area.color);
        setIcon(area.icon);
    }, [area]);

    const isEditing = titleEditor.isEditing || descriptionEditor.isEditing;

    const areaTasks = useMemo(() => {
        const projectTaskIds = new Set(projects.flatMap(p => p.taskIds));
        return tasks.filter(t => projectTaskIds.has(t.id));
    }, [projects, tasks]);

    const stats = useMemo(() => {
        const upcomingTasks = areaTasks.filter(t => t.stage !== 'Done' && t.dueDate && new Date(t.dueDate) > new Date());
        return {
            projects: projects.length,
            tasks: areaTasks.length,
            notes: notes.length,
            upcoming: upcomingTasks.length,
        };
    }, [projects, areaTasks, notes]);

    const handleEdit = () => {
        titleEditor.handleEdit();
        descriptionEditor.handleEdit();
        setIsMenuOpen(false);
    };

    const handleSave = () => {
        const updates: Partial<Omit<Area, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'projectIds'>> = {};
        if (titleEditor.value !== area.title) updates.title = titleEditor.value;
        if (descriptionEditor.value !== area.description) updates.description = descriptionEditor.value;
        if (JSON.stringify(tags) !== JSON.stringify(area.tags || [])) updates.tags = tags;
        if (icon !== area.icon) updates.icon = icon;
        if (color !== area.color) updates.color = color;

        if (Object.keys(updates).length > 0) {
            onUpdateArea(area.id, updates);
        }

        titleEditor.handleSave();
        descriptionEditor.handleSave();
    };

    const handleCancel = () => {
        titleEditor.handleCancel();
        descriptionEditor.handleCancel();
        setTags(area.tags || []);
        setColor(area.color);
        setIcon(area.icon);
    };
    
    const getProjectProgress = (project: Project) => {
        const projectTasks = tasks.filter(t => project.taskIds.includes(t.id));
        const completed = projectTasks.filter(t => t.stage === 'Done').length;
        return { completed, total: projectTasks.length };
    };

    return (
        <div>
            <header className="mb-8">
                <div className="flex justify-between items-start">
                     {isEditing ? (
                        <div className="flex-1 mr-4 space-y-4">
                            <div>
                                <label htmlFor="area-title" className="sr-only">Title</label>
                                <input
                                    id="area-title"
                                    type="text"
                                    value={titleEditor.value}
                                    onChange={(e) => titleEditor.setValue(e.target.value)}
                                    className="w-full bg-background/50 border border-outline rounded-lg px-3 py-2 text-4xl font-bold text-text-primary focus:outline-none focus:ring-1 focus:ring-accent font-heading tracking-tight"
                                />
                            </div>
                            <div>
                                 <label htmlFor="area-description" className="sr-only">Description</label>
                                 <textarea
                                    id="area-description"
                                    value={descriptionEditor.value}
                                    onChange={(e) => descriptionEditor.setValue(e.target.value)}
                                    rows={3}
                                    className="w-full bg-background/50 border border-outline rounded-lg px-3 py-2 text-text-secondary focus:outline-none focus:ring-1 focus:ring-accent custom-scrollbar max-w-prose"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-text-secondary">Color</label>
                                <div className="flex flex-wrap gap-2">
                                    {COLOR_PALETTE.map(c => 
                                        <button key={c} type="button" style={{backgroundColor: c}} onClick={() => setColor(c)} className={`w-8 h-8 rounded-full transition-all ${color === c ? 'ring-2 ring-offset-2 ring-offset-background ring-white' : ''}`} aria-label={`Color ${c}`} />
                                    )}
                                </div>
                            </div>
                             <div className="space-y-2">
                                <label className="block text-sm font-medium text-text-secondary">Icon</label>
                                <div className="grid grid-cols-8 gap-2 bg-background/50 p-2 rounded-lg border border-outline">
                                    {ICON_LIST.map(i => 
                                        <button key={i.name} type="button" onClick={() => setIcon(i.name)} className={`p-2 rounded-lg transition-colors ${icon === i.name ? 'bg-accent text-accent-content' : 'hover:bg-neutral'}`} aria-label={`Icon ${i.name}`}>
                                            {i.component}
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">Tags</label>
                                <TagInput tags={tags} onTagsChange={setTags} />
                            </div>
                             <div className="flex gap-2 mt-2">
                                <button onClick={handleSave} className="px-3 py-1.5 text-sm bg-accent hover:bg-accent-hover text-accent-content transition-all rounded-lg active:scale-95">Save</button>
                                <button onClick={handleCancel} className="px-3 py-1.5 text-sm bg-secondary hover:bg-secondary-hover text-secondary-content transition-all rounded-lg active:scale-95">Cancel</button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            <div style={{ color: area.color || 'currentColor', backgroundColor: `${area.color}1A` }} className="p-3 rounded-xl flex-shrink-0">
                                {getIconByName(area.icon || 'default', 'w-8 h-8')}
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold font-heading tracking-tight">{area.title}</h1>
                                <p className="text-text-secondary max-w-prose mt-1">{area.description}</p>
                                <TagList tags={area.tags} className="mt-4" />
                            </div>
                        </div>
                    )}
                    <div className="flex-shrink-0 ml-4 flex items-center">
                        <button onClick={onToggleFocusMode} aria-label={isFocusMode ? "Exit focus mode" : "Enter focus mode"} className="p-2 text-text-secondary hover:bg-neutral hover:text-text-primary rounded-full transition-colors">
                            {isFocusMode ? <MinimizeIcon className="w-5 h-5" /> : <MaximizeIcon className="w-5 h-5" />}
                        </button>
                         <ActionMenu 
                            isOpen={isMenuOpen}
                            onToggle={() => setIsMenuOpen(!isMenuOpen)}
                            onEdit={handleEdit}
                            onArchive={() => onArchive(area.id)}
                            onDelete={() => onDelete(area.id)}
                         />
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <StatCard icon={<ProjectIcon className="w-6 h-6"/>} value={stats.projects} label="Active Projects" />
                <StatCard icon={<ListTodoIcon className="w-6 h-6"/>} value={stats.tasks} label="Total Tasks" />
                <StatCard icon={<CalendarIcon className="w-6 h-6"/>} value={stats.upcoming} label="Upcoming" />
                <StatCard icon={<FileTextIcon className="w-6 h-6"/>} value={stats.notes} label="Notes" />
            </div>

            <Card icon={<ProjectIcon className="w-6 h-6 text-accent" />} title="Projects" onAdd={() => onOpenCaptureModal({ parentId: area.id, itemType: 'project' })} isCollapsible defaultOpen>
                {projects.length > 0 ? (
                    <ul className="space-y-2" {...getContainerProps()}>
                        {projects.map(project => {
                            const { completed, total } = getProjectProgress(project);
                            return (
                             <li 
                                key={project.id}
                                {...getDragAndDropProps(project.id)}
                                className={`relative cursor-grab rounded-lg ${draggedId === project.id ? 'opacity-30' : ''}`}
                             >
                                {dropAction?.type === 'REORDER' && dropAction.targetId === project.id && (
                                    <div className="absolute -top-1 left-2 right-2 h-0.5 bg-accent rounded-full" />
                                )}
                                <button onClick={() => onNavigate('projects', project.id)} className="w-full text-left p-3 hover:bg-neutral rounded-lg transition-colors flex justify-between items-center gap-4">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold truncate">{project.title}</p>
                                        <p className="text-xs text-text-secondary truncate mb-2">{project.description}</p>
                                        <TagList tags={project.tags} />
                                    </div>
                                    {total > 0 && (
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <span className="text-xs font-mono text-text-tertiary">{completed}/{total}</span>
                                            <ProgressBar completed={completed} total={total} />
                                        </div>
                                    )}
                                </button>
                            </li>
                        )})}
                    </ul>
                ) : <CardEmptyState>No projects in this area yet. Add one to get started!</CardEmptyState>}
            </Card>

            <Card icon={<FileTextIcon className="w-6 h-6 text-accent" />} title="Notes" onAdd={() => onOpenCaptureModal({ parentId: area.id, itemType: 'note' })} isCollapsible defaultOpen>
                 {notes.length > 0 ? (
                    <ul className="space-y-2">
                        {notes.map(note => (
                             <li key={note.id}>
                                <button onClick={() => onSelectNote(note.id)} className="w-full text-left p-3 hover:bg-neutral rounded-lg transition-colors">
                                    <p className="font-semibold">{note.title}</p>
                                    <p className="text-sm text-text-secondary truncate mt-1">{stripHtml(note.content)}</p>
                                    <TagList tags={note.tags} className="mt-2" />
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : <CardEmptyState>Capture notes related to this area of your life.</CardEmptyState>}
            </Card>

            <Card icon={<ResourceIcon className="w-6 h-6 text-accent" />} title="Resources" onAdd={() => onOpenCaptureModal({ parentId: area.id, itemType: 'resource' })} isCollapsible defaultOpen>
                 {resources.length > 0 ? (
                    <ul className="space-y-1">
                        {resources.map(resource => (
                            <li key={resource.id} className="p-3 hover:bg-neutral rounded-lg transition-colors">
                                <div className="flex items-center gap-3">
                                    {resource.url ? <LinkIcon className="w-4 h-4 text-text-tertiary flex-shrink-0" /> : <ResourceIcon className="w-4 h-4 text-text-tertiary flex-shrink-0" />}
                                    <div className="flex-grow">
                                        <a href={resource.url ? (resource.url.startsWith('http') ? resource.url : `https://${resource.url}`) : undefined} target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-accent">{resource.title}</a>
                                        <TagList tags={resource.tags} className="mt-1" />
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : <CardEmptyState>Add resources that support this long-term responsibility.</CardEmptyState>}
            </Card>
        </div>
    );
};

export default React.memo(AreaDetail);
