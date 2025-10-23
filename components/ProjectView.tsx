

import React, { useState, useEffect } from 'react';
import { Project, Task, Note, Resource } from '../types';
import ProjectDetail from './ProjectDetail';
import { ProjectIcon } from './icons';
import { CaptureContext } from '../App';

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
    onUpdateProject: (projectId: string, updates: { title?: string, description?: string }) => void;
    onAddItem: (context: CaptureContext) => void;
    onUpdateTask: (taskId: string, updates: Partial<Pick<Task, 'title' | 'priority' | 'dueDate'>>) => void;
}

const ProjectView: React.FC<ProjectViewProps> = ({ projects, activeProjectId, onSelectProject, tasks, notes, resources, onToggleTask, onArchive, onDelete, onSelectNote, onUpdateProject, onAddItem, onUpdateTask }) => {
    
    useEffect(() => {
        // If there's no active project, or the active one is no longer in the list, select the first one.
        if (projects.length > 0 && (!activeProjectId || !projects.some(p => p.id === activeProjectId))) {
            onSelectProject(projects[0].id);
        } else if (projects.length === 0) {
            onSelectProject(null);
        }
    }, [projects, activeProjectId, onSelectProject]);
    
    const selectedProject = projects.find(p => p.id === activeProjectId) || null;

    return (
        <div className="flex h-full">
            <aside className="w-1/3 max-w-sm h-full flex flex-col border-r border-slate-800 bg-slate-950/30">
                <header className="p-4 border-b border-slate-800 flex-shrink-0">
                    <h2 className="text-lg font-bold">Projects</h2>
                </header>
                <ul className="flex-1 overflow-y-auto custom-scrollbar p-2">
                    {projects.map(project => (
                        <li key={project.id}>
                            <button
                                onClick={() => onSelectProject(project.id)}
                                className={`w-full text-left p-3 rounded-md mb-1 transition-colors ${
                                    activeProjectId === project.id 
                                    ? 'bg-slate-700' 
                                    : 'hover:bg-slate-800'
                                }`}
                            >
                                <h3 className="font-semibold">{project.title}</h3>
                                <p className="text-xs text-slate-400 truncate">{project.description}</p>
                            </button>
                        </li>
                    ))}
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
                        onAddItem={onAddItem}
                        onUpdateTask={onUpdateTask}
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500">
                        <ProjectIcon className="w-16 h-16 mb-4" />
                        <h2 className="text-xl font-semibold">No Projects</h2>
                        <p>Select a project from the list or create a new one.</p>
                    </div>
                )}
            </section>
        </div>
    );
};

export default ProjectView;
