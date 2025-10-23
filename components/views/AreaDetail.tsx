import React from 'react';
import { Area, Project, Note, Resource, View, CaptureContext, Task } from '../../types';
import { ProjectIcon, FileTextIcon, ResourceIcon, LinkIcon } from '../shared/icons';
import Card from '../shared/Card';
import ActionMenu from '../shared/ActionMenu';
import ProgressBar from '../shared/ProgressBar';
import { useEditable } from '../../hooks/useEditable';
import CardEmptyState from '../shared/CardEmptyState';

interface AreaDetailProps {
    area: Area;
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

const AreaDetail: React.FC<AreaDetailProps> = ({ area, projects, tasks, notes, resources, onArchive, onDelete, onSelectNote, onUpdateArea, onOpenCaptureModal, onNavigate }) => {
    const titleEditor = useEditable(area.title, (newTitle) => onUpdateArea(area.id, { title: newTitle }));
    const descriptionEditor = useEditable(area.description, (newDescription) => onUpdateArea(area.id, { description: newDescription }));

    const isEditing = titleEditor.isEditing || descriptionEditor.isEditing;

    const handleEdit = () => {
        titleEditor.handleEdit();
        descriptionEditor.handleEdit();
    };

    const handleSave = () => {
        titleEditor.handleSave();
        descriptionEditor.handleSave();
    };

    const handleCancel = () => {
        titleEditor.handleCancel();
        descriptionEditor.handleCancel();
    };
    
    const getProjectProgress = (project: Project) => {
        const projectTasks = tasks.filter(t => project.taskIds.includes(t.id));
        const completed = projectTasks.filter(t => t.completed).length;
        return { completed, total: projectTasks.length };
    };

    return (
        <div>
            <header className="mb-8">
                <div className="flex justify-between items-start">
                     {isEditing ? (
                        <div className="flex-1 mr-4">
                            <input
                                type="text"
                                value={titleEditor.value}
                                onChange={(e) => titleEditor.setValue(e.target.value)}
                                className="w-full bg-background/50 border border-outline rounded-lg px-3 py-2 text-4xl font-bold mb-2 text-text-primary focus:outline-none focus:ring-1 focus:ring-accent font-heading tracking-tight"
                            />
                             <textarea
                                value={descriptionEditor.value}
                                onChange={(e) => descriptionEditor.setValue(e.target.value)}
                                rows={3}
                                className="w-full bg-background/50 border border-outline rounded-lg px-3 py-2 text-text-secondary focus:outline-none focus:ring-1 focus:ring-accent custom-scrollbar max-w-prose"
                            />
                             <div className="flex gap-2 mt-2">
                                <button onClick={handleSave} className="px-3 py-1.5 text-sm bg-accent hover:bg-accent-hover text-accent-content transition-all rounded-lg active:scale-95">Save</button>
                                <button onClick={handleCancel} className="px-3 py-1.5 text-sm bg-secondary hover:bg-secondary-hover text-secondary-content transition-all rounded-lg active:scale-95">Cancel</button>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <h1 className="text-4xl font-bold mb-2 font-heading tracking-tight">{area.title}</h1>
                            <p className="text-text-secondary max-w-prose">{area.description}</p>
                        </div>
                    )}
                    <div className="flex-shrink-0 ml-4">
                         <ActionMenu 
                            onEdit={handleEdit}
                            onArchive={() => onArchive(area.id)}
                            onDelete={() => onDelete(area.id)}
                         />
                    </div>
                </div>
            </header>

            <Card icon={<ProjectIcon className="w-6 h-6 text-accent" />} title="Projects" onAdd={() => onOpenCaptureModal({ parentId: area.id, itemType: 'project' })} isCollapsible defaultOpen>
                {projects.length > 0 ? (
                    <ul className="space-y-2">
                        {projects.map(project => {
                            const { completed, total } = getProjectProgress(project);
                            return (
                             <li key={project.id}>
                                <button onClick={() => onNavigate('projects', project.id)} className="w-full text-left p-3 hover:bg-neutral rounded-lg transition-colors flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold">{project.title}</p>
                                        <p className="text-xs text-text-secondary truncate">{project.description}</p>
                                    </div>
                                    {total > 0 && (
                                        <div className="flex items-center gap-2">
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
                            <li key={resource.id} className="flex items-center gap-3 p-3 hover:bg-neutral rounded-lg transition-colors">
                                {resource.type === 'link' ? <LinkIcon className="w-4 h-4 text-text-tertiary" /> : <ResourceIcon className="w-4 h-4 text-text-tertiary" />}
                                <a href={resource.type === 'link' ? resource.content : undefined} target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-accent">{resource.title}</a>
                            </li>
                        ))}
                    </ul>
                ) : <CardEmptyState>Add resources that support this long-term responsibility.</CardEmptyState>}
            </Card>
        </div>
    );
};

export default React.memo(AreaDetail);