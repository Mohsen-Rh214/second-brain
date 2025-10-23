import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Area, Project, Task, Note, Resource, NewItemPayload, Status, ItemType } from '../types';
import { initialAreas, initialProjects, initialTasks, initialNotes, initialResources } from '../constants';
import { getItemTypeFromId } from '../utils';

// State shape
interface AppState {
    areas: Area[];
    projects: Project[];
    tasks: Task[];
    notes: Note[];
    resources: Resource[];
}

// Action types
type Action =
    | { type: 'ADD_ITEM'; payload: { itemData: NewItemPayload; itemType: ItemType; parentId: string | null } }
    | { type: 'ADD_INBOX_ITEM'; payload: { content: string; type: 'note' | 'resource' } }
    | { type: 'TOGGLE_TASK'; payload: { taskId: string } }
    | { type: 'REORDER_TASKS'; payload: { sourceTaskId: string; targetTaskId: string } }
    | { type: 'UPDATE_TASK'; payload: { taskId: string; updates: Partial<Task> } }
    | { type: 'UPDATE_ITEM_STATUS'; payload: { itemId: string; status: Status } }
    | { type: 'DELETE_ITEM'; payload: { itemId: string } }
    | { type: 'UPDATE_NOTE'; payload: { noteId: string; title: string; content: string } }
    | { type: 'DRAFT_FROM_NOTE'; payload: { sourceNoteId: string, newNoteId: string } }
    | { type: 'UPDATE_RESOURCE'; payload: { resourceId: string; title: string; content: string } }
    | { type: 'UPDATE_PROJECT'; payload: { projectId: string; updates: { title?: string; description?: string } } }
    | { type: 'UPDATE_AREA'; payload: { areaId: string; updates: { title?: string; description?: string } } }
    | { type: 'ORGANIZE_ITEM'; payload: { itemId: string; newParentIds: string[] } }
    | { type: 'MARK_REVIEWED'; payload: { itemIds: string[]; type: 'project' | 'area' } };


const initialState: AppState = {
    areas: initialAreas,
    projects: initialProjects,
    tasks: initialTasks,
    notes: initialNotes,
    resources: initialResources,
};

const createNewItem = (prefix: string, data: any) => ({
    id: `${prefix}-${Date.now()}`,
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'active' as const,
});

const dataReducer = (state: AppState, action: Action): AppState => {
    switch (action.type) {
        case 'ADD_ITEM': {
            const { itemData, itemType, parentId } = action.payload;
            switch (itemType) {
                case 'note': {
                    const newNote: Note = createNewItem('note', { title: itemData.title, content: itemData.content || '', parentIds: parentId ? [parentId] : [] });
                    const newProjects = parentId?.startsWith('proj-')
                        ? state.projects.map(p => p.id === parentId ? { ...p, noteIds: [...p.noteIds, newNote.id] } : p)
                        : state.projects;
                    return { ...state, notes: [...state.notes, newNote], projects: newProjects };
                }
                case 'task': {
                    const newTask: Task = createNewItem('task', { title: itemData.title, projectId: parentId, completed: false, dueDate: itemData.dueDate || undefined, priority: itemData.priority || undefined, isMyDay: itemData.isMyDay || false });
                    const newProjects = parentId?.startsWith('proj-')
                        ? state.projects.map(p => p.id === parentId ? { ...p, taskIds: [newTask.id, ...p.taskIds] } : p)
                        : state.projects;
                    return { ...state, tasks: [newTask, ...state.tasks], projects: newProjects };
                }
                case 'resource': {
                    const newResource: Resource = createNewItem('res', { title: itemData.title, type: itemData.type || 'text', content: itemData.content || '', parentIds: parentId ? [parentId] : [] });
                    const newProjects = parentId?.startsWith('proj-')
                        ? state.projects.map(p => p.id === parentId ? { ...p, resourceIds: [...p.resourceIds, newResource.id] } : p)
                        : state.projects;
                    return { ...state, resources: [...state.resources, newResource], projects: newProjects };
                }
                case 'project': {
                    const newProject: Project = createNewItem('proj', { title: itemData.title, description: itemData.description || '', areaId: parentId, taskIds: [], noteIds: [], resourceIds: [] });
                    const newAreas = parentId?.startsWith('area-')
                        ? state.areas.map(a => a.id === parentId ? { ...a, projectIds: [...a.projectIds, newProject.id] } : a)
                        : state.areas;
                    return { ...state, projects: [...state.projects, newProject], areas: newAreas };
                }
                case 'area': {
                    const newArea: Area = createNewItem('area', { title: itemData.title, description: itemData.description || '', projectIds: [] });
                    return { ...state, areas: [...state.areas, newArea] };
                }
                default:
                    return state;
            }
        }
        case 'ADD_INBOX_ITEM': {
            const { content, type } = action.payload;
            let title = content.length > 50 ? content.substring(0, 50) + '...' : content;
            if (type === 'note') {
                const newNote: Note = createNewItem('note', { title, content: content, parentIds: [] });
                return { ...state, notes: [...state.notes, newNote] };
            } else if (type === 'resource') {
                let resourceContent = content;
                if (content.match(/^https?:\/\//)) {
                    try {
                        const url = new URL(content);
                        let potentialTitle = url.hostname.replace('www.', '');
                        const lastDotIndex = potentialTitle.lastIndexOf('.');
                        if (lastDotIndex > 0) { // Keep single-word domains like 'localhost'
                            potentialTitle = potentialTitle.substring(0, lastDotIndex);
                        }
                        title = potentialTitle.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                    } catch {
                        title = 'Link Resource';
                    }
                } else {
                    title = 'Text Resource';
                }
                const newResource: Resource = createNewItem('res', { title, type: 'link', content: resourceContent, parentIds: [] });
                return { ...state, resources: [...state.resources, newResource] };
            }
            return state;
        }
        case 'TOGGLE_TASK': {
            const { taskId } = action.payload;
            return {
                ...state,
                tasks: state.tasks.map(task =>
                    task.id === taskId ? { ...task, completed: !task.completed, updatedAt: new Date().toISOString() } : task
                ),
            };
        }
        case 'REORDER_TASKS': {
            const { sourceTaskId, targetTaskId } = action.payload;
            const tasksCopy = [...state.tasks];
            const sourceIndex = tasksCopy.findIndex(t => t.id === sourceTaskId);
            const targetIndex = tasksCopy.findIndex(t => t.id === targetTaskId);

            if (sourceIndex === -1 || targetIndex === -1 || sourceIndex === targetIndex) {
                return state;
            }

            const [movedTask] = tasksCopy.splice(sourceIndex, 1);
            tasksCopy.splice(targetIndex, 0, movedTask);

            return { ...state, tasks: tasksCopy };
        }
        case 'UPDATE_TASK': {
            const { taskId, updates } = action.payload;
            const now = new Date().toISOString();
            return {
                ...state,
                tasks: state.tasks.map(task =>
                    task.id === taskId ? { ...task, ...updates, updatedAt: now } : task
                ),
            };
        }
        case 'UPDATE_ITEM_STATUS': {
            const { itemId, status } = action.payload;
            const now = new Date().toISOString();
            const updater = (item: any) => item.id === itemId ? { ...item, status, updatedAt: now } : item;
            const itemType = getItemTypeFromId(itemId);

            switch (itemType) {
                case 'area': return { ...state, areas: state.areas.map(updater) };
                case 'project': return { ...state, projects: state.projects.map(updater) };
                case 'task': return { ...state, tasks: state.tasks.map(updater) };
                case 'note': return { ...state, notes: state.notes.map(updater) };
                case 'resource': return { ...state, resources: state.resources.map(updater) };
                default: return state;
            }
        }
        case 'DELETE_ITEM': {
            const { itemId } = action.payload;
            const itemType = getItemTypeFromId(itemId);
            switch (itemType) {
                case 'area': return { ...state, areas: state.areas.filter(i => i.id !== itemId) };
                case 'project': return { ...state, projects: state.projects.filter(i => i.id !== itemId) };
                case 'task': return { ...state, tasks: state.tasks.filter(i => i.id !== itemId) };
                case 'note': return { ...state, notes: state.notes.filter(i => i.id !== itemId) };
                case 'resource': return { ...state, resources: state.resources.filter(i => i.id !== itemId) };
                default: return state;
            }
        }
        case 'UPDATE_NOTE': {
            const { noteId, title, content } = action.payload;
            const now = new Date().toISOString();
            return { ...state, notes: state.notes.map(n => n.id === noteId ? { ...n, title, content, updatedAt: now } : n) };
        }
        case 'DRAFT_FROM_NOTE': {
            const { sourceNoteId, newNoteId } = action.payload;
            const sourceNote = state.notes.find(n => n.id === sourceNoteId);
            if (!sourceNote) return state;

            const linkHtml = `<a href="#" data-link-id="${sourceNote.id}" class="internal-link">${sourceNote.title}</a>`;
            const newContent = `<blockquote>${sourceNote.content}</blockquote><p><br></p><p><em>Inspired by: ${linkHtml}</em></p>`;

            const newNote: Note = {
                id: newNoteId,
                title: `Draft: ${sourceNote.title}`,
                content: newContent,
                parentIds: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                status: 'active',
            };

            return { ...state, notes: [...state.notes, newNote] };
        }
        case 'UPDATE_RESOURCE': {
            const { resourceId, title, content } = action.payload;
            const now = new Date().toISOString();
            return { ...state, resources: state.resources.map(r => r.id === resourceId ? { ...r, title, content, updatedAt: now } : r) };
        }
        case 'UPDATE_PROJECT': {
            const { projectId, updates } = action.payload;
            const now = new Date().toISOString();
            return { ...state, projects: state.projects.map(p => p.id === projectId ? { ...p, ...updates, updatedAt: now } : p) };
        }
        case 'UPDATE_AREA': {
            const { areaId, updates } = action.payload;
            const now = new Date().toISOString();
            return { ...state, areas: state.areas.map(a => a.id === areaId ? { ...a, ...updates, updatedAt: now } : a) };
        }
        case 'ORGANIZE_ITEM': {
            const { itemId, newParentIds } = action.payload;
            const now = new Date().toISOString();
            const itemType = getItemTypeFromId(itemId);

            if (itemType === 'task') {
                const newProjectId = newParentIds[0] || null;
                const newTasks = state.tasks.map(t => t.id === itemId ? { ...t, projectId: newProjectId, isMyDay: false, updatedAt: now } : t);

                // Remove task from any old project
                let newProjects = state.projects.map(p => ({
                    ...p,
                    taskIds: p.taskIds.filter(tid => tid !== itemId)
                }));

                // Add task to new project if one is selected
                if (newProjectId) {
                    newProjects = newProjects.map(p => p.id === newProjectId ? { ...p, taskIds: [itemId, ...p.taskIds] } : p);
                }
                return { ...state, tasks: newTasks, projects: newProjects };
            }

            let newNotes = state.notes;
            let newResources = state.resources;
            let newProjects = [...state.projects];

            // Remove item from any old parent projects
            newProjects = newProjects.map(p => {
                const noteIndex = p.noteIds.indexOf(itemId);
                if (noteIndex > -1) {
                    p.noteIds.splice(noteIndex, 1);
                }
                const resourceIndex = p.resourceIds.indexOf(itemId);
                if (resourceIndex > -1) {
                    p.resourceIds.splice(resourceIndex, 1);
                }
                return p;
            });

            if (itemType === 'note') {
                newNotes = state.notes.map(n => n.id === itemId ? { ...n, parentIds: newParentIds, updatedAt: now } : n);
            } else if (itemType === 'resource') {
                newResources = state.resources.map(r => r.id === itemId ? { ...r, parentIds: newParentIds, updatedAt: now } : r);
            }

            newParentIds.forEach(pid => {
                if (pid.startsWith('proj-')) {
                    newProjects = newProjects.map(p => {
                        if (p.id === pid) {
                            const idArrayName = itemType === 'note' ? 'noteIds' : 'resourceIds';
                            const idArray = p[idArrayName as keyof Project];
                            if (Array.isArray(idArray) && !idArray.includes(itemId)) {
                                return { ...p, [idArrayName]: [...idArray, itemId] };
                            }
                        }
                        return p;
                    });
                }
            });

            return { ...state, notes: newNotes, resources: newResources, projects: newProjects };
        }
        case 'MARK_REVIEWED': {
            const { itemIds, type } = action.payload;
            const now = new Date().toISOString();
            if (type === 'project') {
                return { ...state, projects: state.projects.map(p => itemIds.includes(p.id) ? { ...p, lastReviewed: now, updatedAt: now } : p) };
            } else {
                return { ...state, areas: state.areas.map(a => itemIds.includes(a.id) ? { ...a, lastReviewed: now, updatedAt: now } : a) };
            }
        }
        default:
            return state;
    }
};

const DataContext = createContext<{ state: AppState; dispatch: React.Dispatch<Action> } | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(dataReducer, initialState, (initial) => {
        try {
            const stickyValue = window.localStorage.getItem('sb-data');
            return stickyValue !== null ? JSON.parse(stickyValue) : initial;
        } catch (error) {
            console.error(`Error reading localStorage key “sb-data”:`, error);
            return initial;
        }
    });

    useEffect(() => {
        window.localStorage.setItem('sb-data', JSON.stringify(state));
    }, [state]);

    return (
        <DataContext.Provider value={{ state, dispatch }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};