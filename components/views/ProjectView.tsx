import React, { useEffect } from 'react';
import { Project, Task, Note, Resource, NewItemPayload, ItemType } from '../../types';
import ProjectDetail from './ProjectDetail';
import { ProjectIcon, PlusIcon } from '../shared/icons';
import ProgressBar from '../shared/ProgressBar';
import { CaptureContext } from '../../types';
import EmptyState from '../shared/EmptyState';
import TagList from '../shared/TagList';

interface ProjectViewProps {
    projects: Project[];
    activeProjectId: string | null;
    onSelectProject: (id: string | null) => void;
    tasks: Task[];
    notes: Note[];
    resources: Resource[];
    onToggleTask: (taskId: string) => void;
    onArchive: (itemId: string) => void;
    onDelete: (itemId: string) => void;
    onSelectNote: (noteId: string) => void;
    onUpdateProject: (projectId: string, updates: { title?: string, description?: string, tags?: string[] }) => void;
    onOpenCaptureModal: (context: CaptureContext) => void;
    onSaveNewItem: (itemData: NewItemPayload, itemType: ItemType, parentId: string | null) => void;
    onReorderTasks: (sourceTaskId: string, targetTaskId: string) => void;
    onUpdateTask: (taskId: string, updates: Partial<Pick<Task, 'title' | 'priority' | 'dueDate'>>) => void;
}

const ProjectView: React.FC<ProjectViewProps> = ({ projects, activeProjectId, onSelectProject, tasks, notes, resources, onToggleTask, onArchive, onDelete, onSelectNote, onUpdateProject, onOpenCaptureModal, onSaveNewItem, onReorderTasks, onUpdateTask }) => {
    
    useEffect(() => {
        // If there's no active project, or the active one is no longer in the list, select the first one.
        if (projects.length > 0 && (!activeProjectId || !projects.some(p => p.id === activeProjectId))) {
            onSelectProject(projects[0].id);
        } else if (projects.length === 0) {
            onSelectProject(null);
        }
    }, [projects, activeProjectId, onSelectProject]);
    
    const selectedProject = projects.find(p => p.id === activeProjectId) || null;

    const handleAddNewProject = () => {
        onOpenCaptureModal({ parentId: null, itemType: 'project' });
    }
    
    const getProjectProgress = (project: Project) => {
        const projectTasks = tasks.filter(t => project.taskIds.includes(t.id));
        const completed = projectTasks.filter(t => t.completed).length;
        return { completed, total: projectTasks.length };
    };

    return (
        <div className="flex h-full gap-8">
            <aside className="w-1/3 max-w-sm h-full flex flex-col bg-surface/80 backdrop-blur-xl border border-outline rounded-2xl shadow-md">
                <header className="p-4 border-b border-outline-dark flex-shrink-0 flex items-center justify-between">
                    <h2 className="text-lg font-bold font-heading tracking-tight">Projects</h2>
                     <button 
                        onClick={handleAddNewProject} 
                        aria-label="Add new project" 
                        className="p-1.5 text-text-secondary hover:bg-neutral hover:text-text-primary rounded-full transition-colors active:scale-95"
                    >
                        <PlusIcon className="w-5 h-5"/>
                    </button>
                </header>
                <ul className="flex-1 overflow-y-auto custom-scrollbar p-2">
                    {projects.map(project => {
                        const { completed, total } = getProjectProgress(project);
                        return (
                            <li key={project.id}>
                                <button
                                    onClick={() => onSelectProject(project.id)}
                                    className={`w-full text-left p-3 mb-1 transition-all duration-200 rounded-xl ${
                                        activeProjectId === project.id 
                                        ? 'bg-accent/10 text-accent' 
                                        : 'hover:bg-neutral'
                                    }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-semibold text-text-primary truncate">{project.title}</h3>
                                        {total > 0 && (
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <span className="text-xs font-mono text-text-tertiary">{completed}/{total}</span>
                                                <ProgressBar completed={completed} total={total} />
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-xs text-text-secondary truncate mt-1">{project.description || 'No description'}</p>
                                    <TagList tags={project.tags} className="mt-2" />
                                </button>
                            </li>
                        )
                    })}
                </ul>
            </aside>
            <section className="flex-1 overflow-y-auto custom-scrollbar">
                {selectedProject ? (
                    <ProjectDetail 
                        project={selectedProject}
                        tasks={tasks.filter(t => selectedProject.taskIds.includes(t.id))}
                        notes={notes.filter(n => selectedProject.noteIds.includes(n.id) || n.parentIds.includes(selectedProject.id))}
                        resources={resources.filter(r => selectedProject.resourceIds.includes(r.id) || r.parentIds.includes(selectedProject.id))}
                        onToggleTask={onToggleTask}
                        onArchive={onArchive}
                        onDelete={onDelete}
                        onSelectNote={onSelectNote}
                        onUpdateProject={onUpdateProject}
                        onOpenCaptureModal={onOpenCaptureModal}
                        onSaveNewItem={onSaveNewItem}
                        onReorderTasks={onReorderTasks}
                        onUpdateTask={onUpdateTask}
                    />
                ) : (
                    <EmptyState 
                        icon={<ProjectIcon />}
                        title="Start Your First Project"
                        description="A project has a clear goal and a finish line, like 'Plan Vacation' or 'Launch New Website'. What will you accomplish next?"
                        actionButton={
                            <button 
                                onClick={handleAddNewProject}
                                className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-accent-content font-semibold px-4 py-2 transition-colors rounded-lg shadow-sm active:scale-95"
                            >
                                <PlusIcon className="w-5 h-5"/>
                                Create New Project
                            </button>
                        }
                    />
                )}
            </section>
        </div>
    );
};

export default React.memo(ProjectView);