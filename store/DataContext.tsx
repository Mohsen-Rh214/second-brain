import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Area, Project, Task, Note, Resource, NewItemPayload, Status, ItemType, TaskStage } from '../types';
import { initialAreas, initialProjects, initialTasks, initialNotes, initialResources } from '../constants';
import { getItemTypeFromId, isUrl } from '../utils';

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
    | { type: 'ADD_SUBTASK'; payload: { parentTaskId: string; subtaskData: NewItemPayload } }
    | { type: 'ADD_INBOX_ITEM'; payload: { content: string; type: 'note' | 'resource' } }
    | { type: 'TOGGLE_TASK'; payload: { taskId: string } }
    | { type: 'REPARENT_TASK'; payload: { taskId: string; newParentId: string } }
    | { type: 'UPDATE_TASK'; payload: { taskId: string; updates: Partial<Task> } }
    | { type: 'UPDATE_TASK_STAGE'; payload: { taskId: string; newStage: TaskStage } }
    | { type: 'UPDATE_MULTIPLE_TASK_STAGES'; payload: { taskIds: string[]; newStage: TaskStage } }
    | { type: 'UPDATE_ITEM_STATUS'; payload: { itemId: string; status: Status } }
    | { type: 'DELETE_ITEM'; payload: { itemId: string } }
    | { type: 'UPDATE_NOTE'; payload: { noteId: string; title: string; content: string; tags: string[] } }
    | { type: 'DRAFT_FROM_NOTE'; payload: { sourceNoteId: string, newNoteId: string } }
    | { type: 'UPDATE_RESOURCE'; payload: { resourceId: string; updates: Partial<Resource> } }
    | { type: 'UPDATE_PROJECT'; payload: { projectId: string; updates: { title?: string; description?: string, tags?: string[] } } }
    | { type: 'UPDATE_AREA'; payload: { areaId: string; updates: Partial<Omit<Area, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'projectIds'>> } }
    | { type: 'ORGANIZE_ITEM'; payload: { itemId: string; newParentIds: string[] } }
    | { type: 'MARK_REVIEWED'; payload: { itemIds: string[]; type: 'project' | 'area' } }
    | { type: 'UPDATE_ITEM_TAGS'; payload: { itemId: string; tags: string[] } }
    | { type: 'REPLACE_STATE'; payload: AppState }
    | { type: 'REORDER_LIST'; payload: {
        listKey: 'areas' | 'projects' | 'tasks';
        sourceId: string;
        targetId: string;
      } }
    | { type: 'REORDER_CHILD_LIST'; payload: {
        parentListKey: 'areas' | 'projects' | 'tasks';
        parentId: string;
        childIdListKey: 'projectIds' | 'taskIds' | 'subtaskIds';
        sourceId: string;
        targetId: string;
      } }
    | { type: 'PROMOTE_SUBTASK'; payload: { taskId: string } };


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
    tags: data.tags || [],
});

const dataReducer = (state: AppState, action: Action): AppState => {
    switch (action.type) {
        case 'REPLACE_STATE':
            return action.payload;
        case 'ADD_ITEM': {
            const { itemData, itemType, parentId } = action.payload;
            switch (itemType) {
                case 'note': {
                    const newNote: Note = createNewItem('note', { ...itemData, parentIds: parentId ? [parentId] : [] });
                    const newProjects = parentId?.startsWith('proj-')
                        ? state.projects.map(p => p.id === parentId ? { ...p, noteIds: [...p.noteIds, newNote.id] } : p)
                        : state.projects;
                    return { ...state, notes: [...state.notes, newNote], projects: newProjects };
                }
                case 'task': {
                    const newTask: Task = createNewItem('task', {
                        ...itemData,
                        projectId: parentId,
                        stage: 'To Do',
                        description: itemData.description || '',
                        subtaskIds: [],
                        parentId: null,
                        noteIds: itemData.noteIds || [],
                        resourceIds: itemData.resourceIds || [],
                    });
                    const newProjects = parentId?.startsWith('proj-')
                        ? state.projects.map(p => p.id === parentId ? { ...p, taskIds: [newTask.id, ...p.taskIds] } : p)
                        : state.projects;
                    return { ...state, tasks: [newTask, ...state.tasks], projects: newProjects };
                }
                case 'resource': {
                    const newResource: Resource = createNewItem('res', { ...itemData, parentIds: parentId ? [parentId] : [] });
                    const newProjects = parentId?.startsWith('proj-')
                        ? state.projects.map(p => p.id === parentId ? { ...p, resourceIds: [...p.resourceIds, newResource.id] } : p)
                        : state.projects;
                    return { ...state, resources: [...state.resources, newResource], projects: newProjects };
                }
                case 'project': {
                    const newProject: Project = createNewItem('proj', { ...itemData, areaId: parentId, taskIds: [], noteIds: [], resourceIds: [] });
                    const newAreas = parentId?.startsWith('area-')
                        ? state.areas.map(a => a.id === parentId ? { ...a, projectIds: [...a.projectIds, newProject.id] } : a)
                        : state.areas;
                    return { ...state, projects: [...state.projects, newProject], areas: newAreas };
                }
                case 'area': {
                    const newArea: Area = createNewItem('area', { ...itemData, projectIds: [], icon: 'area', color: '#94A3B8' });
                    return { ...state, areas: [...state.areas, newArea] };
                }
                default:
                    return state;
            }
        }
        case 'ADD_SUBTASK': {
            const { parentTaskId, subtaskData } = action.payload;
            const parentTask = state.tasks.find(t => t.id === parentTaskId);
            if (!parentTask) return state;

            const newSubtask: Task = createNewItem('task', {
                ...subtaskData,
                projectId: parentTask.projectId,
                stage: 'To Do',
                description: subtaskData.description || '',
                subtaskIds: [],
                parentId: parentTaskId,
                noteIds: [],
                resourceIds: [],
            });
            
            const updatedTasks = state.tasks.map(task =>
                task.id === parentTaskId
                    ? { ...task, subtaskIds: [...task.subtaskIds, newSubtask.id] }
                    : task
            ).concat(newSubtask);
            
            const updatedProjects = parentTask.projectId 
                ? state.projects.map(project => 
                    project.id === parentTask.projectId 
                        ? { ...project, taskIds: [...project.taskIds, newSubtask.id] }
                        : project
                  )
                : state.projects;

            return {
                ...state,
                tasks: updatedTasks,
                projects: updatedProjects
            };
        }
        case 'ADD_INBOX_ITEM': {
            const { content, type } = action.payload;
            let title = content.length > 50 ? content.substring(0, 50) + '...' : content;
            if (type === 'note') {
                const newNote: Note = createNewItem('note', { title, content: content, parentIds: [] });
                return { ...state, notes: [...state.notes, newNote] };
            } else if (type === 'resource') {
                const newResourceData: Partial<Resource> = {};
                if (isUrl(content)) {
                    try {
                        const url = new URL(content.startsWith('http') ? content : `https://${content}`);
                        let potentialTitle = url.hostname.replace('www.', '');
                        const lastDotIndex = potentialTitle.lastIndexOf('.');
                        if (lastDotIndex > 0) { // Keep single-word domains like 'localhost'
                            potentialTitle = potentialTitle.substring(0, lastDotIndex);
                        }
                        title = potentialTitle.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                    } catch {
                        title = 'Link Resource';
                    }
                    newResourceData.url = content;
                } else {
                    title = 'Text Snippet';
                    newResourceData.content = content;
                }
                const newResource: Resource = createNewItem('res', { title, ...newResourceData, parentIds: [] });
                return { ...state, resources: [...state.resources, newResource] };
            }
            return state;
        }
        case 'TOGGLE_TASK': {
            const { taskId } = action.payload;
            return {
                ...state,
                tasks: state.tasks.map(task =>
                    task.id === taskId ? { 
                        ...task, 
                        stage: task.stage === 'Done' ? 'To Do' : 'Done', 
                        updatedAt: new Date().toISOString(),
                        completedAt: task.stage !== 'Done' ? new Date().toISOString() : undefined
                    } : task
                ),
            };
        }
        case 'REORDER_LIST': {
            const { listKey, sourceId, targetId } = action.payload;
            const list = state[listKey];

            const sourceIndex = list.findIndex(item => item.id === sourceId);
            const targetIndex = list.findIndex(item => item.id === targetId);

            if (sourceIndex === -1 || targetIndex === -1) return state;

            const newList = [...list];
            const [movedItem] = newList.splice(sourceIndex, 1);
            newList.splice(targetIndex, 0, movedItem);

            return { ...state, [listKey]: newList };
        }
        case 'REORDER_CHILD_LIST': {
            const { parentListKey, parentId, childIdListKey, sourceId, targetId } = action.payload;
            
            const newParentList = (state[parentListKey] as any[]).map(parent => {
                if (parent.id === parentId) {
                    const childIds = [...(parent[childIdListKey] || [])];
                    const sourceIndex = childIds.indexOf(sourceId);
                    const targetIndex = childIds.indexOf(targetId);

                    if (sourceIndex === -1 || targetIndex === -1) return parent;

                    const [movedId] = childIds.splice(sourceIndex, 1);
                    childIds.splice(targetIndex, 0, movedId);

                    return { ...parent, [childIdListKey]: childIds };
                }
                return parent;
            });

            return { ...state, [parentListKey]: newParentList as any };
        }
        case 'REPARENT_TASK': {
            const { taskId, newParentId } = action.payload;
            const taskToMove = state.tasks.find(t => t.id === taskId);
            const newParentTask = state.tasks.find(t => t.id === newParentId);

            if (!taskToMove || !newParentTask) return state;

            const oldParentId = taskToMove.parentId;

            let newTasks = [...state.tasks];

            // 1. Update old parent (if one existed)
            if (oldParentId) {
                newTasks = newTasks.map(t =>
                    t.id === oldParentId
                        ? { ...t, subtaskIds: t.subtaskIds.filter(id => id !== taskId) }
                        : t
                );
            }

            // 2. Update new parent
            newTasks = newTasks.map(t =>
                t.id === newParentId
                    ? { ...t, subtaskIds: [...t.subtaskIds, taskId] }
                    : t
            );

            // 3. Update the task itself
            newTasks = newTasks.map(t =>
                t.id === taskId
                    ? { ...t, parentId: newParentId, projectId: newParentTask.projectId, updatedAt: new Date().toISOString() }
                    : t
            );

            // 4. If task was a top-level task, remove it from its project's taskIds
            const newProjects = state.projects.map(p => {
                if (p.taskIds.includes(taskId)) {
                    return { ...p, taskIds: p.taskIds.filter(id => id !== taskId) };
                }
                return p;
            });

            return { ...state, tasks: newTasks, projects: newProjects };
        }
        case 'PROMOTE_SUBTASK': {
            const { taskId } = action.payload;
            const taskToPromote = state.tasks.find(t => t.id === taskId);
            if (!taskToPromote || !taskToPromote.parentId || !taskToPromote.projectId) {
                return state;
            }
            
            const { parentId: oldParentId, projectId } = taskToPromote;

            const newTasks = state.tasks.map(task => {
                if (task.id === oldParentId) {
                    return { ...task, subtaskIds: task.subtaskIds.filter(id => id !== taskId) };
                }
                if (task.id === taskId) {
                    return { ...task, parentId: null, updatedAt: new Date().toISOString() };
                }
                return task;
            });

            const newProjects = state.projects.map(project => {
                if (project.id === projectId) {
                    if (project.taskIds.includes(taskId)) return project;
                    return { ...project, taskIds: [taskId, ...project.taskIds] };
                }
                return project;
            });

            return { ...state, tasks: newTasks, projects: newProjects };
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
        case 'UPDATE_TASK_STAGE': {
            const { taskId, newStage } = action.payload;
            const now = new Date().toISOString();
            return {
                ...state,
                tasks: state.tasks.map(task =>
                    task.id === taskId ? { 
                        ...task, 
                        stage: newStage, 
                        updatedAt: now,
                        completedAt: newStage === 'Done' ? now : undefined
                    } : task
                ),
            };
        }
        case 'UPDATE_MULTIPLE_TASK_STAGES': {
            const { taskIds, newStage } = action.payload;
            const now = new Date().toISOString();
            const taskIdsSet = new Set(taskIds);
            return {
                ...state,
                tasks: state.tasks.map(task =>
                    taskIdsSet.has(task.id)
                        ? { 
                            ...task, 
                            stage: newStage, 
                            updatedAt: now,
                            completedAt: newStage === 'Done' ? now : undefined
                          }
                        : task
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
            const { noteId, title, content, tags } = action.payload;
            const now = new Date().toISOString();
            return { ...state, notes: state.notes.map(n => n.id === noteId ? { ...n, title, content, tags, updatedAt: now } : n) };
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
                tags: sourceNote.tags ? [...sourceNote.tags] : [],
            };

            return { ...state, notes: [...state.notes, newNote] };
        }
        case 'UPDATE_RESOURCE': {
            const { resourceId, updates } = action.payload;
            const now = new Date().toISOString();
            return {
                ...state,
                resources: state.resources.map(r =>
                    r.id === resourceId ? { ...r, ...updates, updatedAt: now } : r
                ),
            };
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
        case 'UPDATE_ITEM_TAGS': {
            const { itemId, tags } = action.payload;
            const now = new Date().toISOString();
            const updater = (item: any) => item.id === itemId ? { ...item, tags, updatedAt: now } : item;
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