import React from 'react';
import { Area, Project, Note, Resource, View, CaptureContext } from '../../types';
import { ProjectIcon, FileTextIcon, ResourceIcon, LinkIcon } from '../shared/icons';
import Card from '../shared/Card';
import ActionMenu from '../shared/ActionMenu';
import { useEditable } from '../../hooks/useEditable';

interface AreaDetailProps {
    area: Area;
    projects: Project[];
    notes: Note[];
    resources: Resource[];
    onArchive: (itemId: string) => void;
    onDelete: (itemId: string) => void;
    onSelectNote: (noteId: string) => void;
    onUpdateArea: (areaId: string, updates: { title?: string, description?: string }) => void;
    onOpenCaptureModal: (context: CaptureContext) => void;
    onNavigate: (view: View, itemId: string) => void;
}

const AreaDetail: React.FC<AreaDetailProps> = ({ area, projects, notes, resources, onArchive, onDelete, onSelectNote, onUpdateArea, onOpenCaptureModal, onNavigate }) => {
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
                                <button onClick={handleSave} className="px-3 py-1.5 text-sm bg-accent hover:bg-accent-hover text-accent-content transition-colors rounded-lg">Save</button>
                                <button onClick={handleCancel} className="px-3 py-1.5 text-sm bg-secondary hover:bg-secondary-hover text-secondary-content transition-colors rounded-lg">Cancel</button>
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

            <Card icon={<ProjectIcon className="w-6 h-6 text-accent" />} title="Projects" onAdd={() => onOpenCaptureModal({ parentId: area.id, itemType: 'project' })}>
                {projects.length > 0 ? (
                    <ul className="space-y-2">
                        {projects.map(project => (
                             <li key={project.id}>
                                <button onClick={() => onNavigate('projects', project.id)} className="w-full text-left p-3 hover:bg-neutral rounded-lg transition-colors">
                                    <p className="font-semibold">{project.title}</p>
                                    <p className="text-xs text-text-secondary truncate">{project.description}</p>
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : <p className="text-text-tertiary text-sm text-center py-4">No projects in this area yet.</p>}
            </Card>

            <Card icon={<FileTextIcon className="w-6 h-6 text-accent" />} title="Notes" onAdd={() => onOpenCaptureModal({ parentId: area.id, itemType: 'note' })}>
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
                ) : <p className="text-text-tertiary text-sm text-center py-4">No notes in this area yet.</p>}
            </Card>

            <Card icon={<ResourceIcon className="w-6 h-6 text-accent" />} title="Resources" onAdd={() => onOpenCaptureModal({ parentId: area.id, itemType: 'resource' })}>
                 {resources.length > 0 ? (
                    <ul className="space-y-1">
                        {resources.map(resource => (
                            <li key={resource.id} className="flex items-center gap-3 p-3 hover:bg-neutral rounded-lg transition-colors">
                                {resource.type === 'link' ? <LinkIcon className="w-4 h-4 text-text-tertiary" /> : <ResourceIcon className="w-4 h-4 text-text-tertiary" />}
                                <a href={resource.type === 'link' ? resource.content : undefined} target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-accent">{resource.title}</a>
                            </li>
                        ))}
                    </ul>
                ) : <p className="text-text-tertiary text-sm text-center py-4">No resources in this area yet.</p>}
            </Card>
        </div>
    );
};

export default React.memo(AreaDetail);