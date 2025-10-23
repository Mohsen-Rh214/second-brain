
import { Area, Project, Task, Note, Resource } from './types';

const now = new Date();
const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

// AREAS
export const initialAreas: Area[] = [
  {
    id: 'area-1',
    title: 'Personal Growth',
    description: 'Focusing on self-improvement, learning, and well-being.',
    projectIds: ['proj-1', 'proj-2'],
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    status: 'active',
    lastReviewed: sevenDaysAgo.toISOString(),
  },
];

// PROJECTS
export const initialProjects: Project[] = [
  {
    id: 'proj-1',
    title: 'Learn Advanced TypeScript',
    description: 'Complete a course and build a project to master advanced TS features.',
    areaId: 'area-1',
    taskIds: ['task-1', 'task-2'],
    noteIds: ['note-1'],
    resourceIds: ['res-1'],
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    status: 'active',
    lastReviewed: sevenDaysAgo.toISOString(),
  },
  {
    id: 'proj-2',
    title: 'Fitness Journey',
    description: 'Improve overall health through consistent exercise and diet.',
    areaId: 'area-1',
    taskIds: ['task-3'],
    noteIds: [],
    resourceIds: [],
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    status: 'active',
    // This one has not been reviewed to show up in the list
  },
];

// TASKS
export const initialTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Finish Generics chapter',
    projectId: 'proj-1',
    completed: false,
    priority: 'High',
    dueDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    status: 'active',
  },
  {
    id: 'task-2',
    title: 'Refactor project with mapped types',
    projectId: 'proj-1',
    completed: false,
    priority: 'Medium',
    dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    status: 'active',
  },
  {
    id: 'task-3',
    title: 'Go for a 3-mile run',
    projectId: 'proj-2',
    completed: true,
    priority: 'Low',
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    status: 'active',
  },
];

// NOTES
export const initialNotes: Note[] = [
    {
        id: 'note-1',
        title: 'Key Takeaways on Utility Types',
        content: '<p><code>Partial</code>, <code>Pick</code>, and <code>Omit</code> are powerful for creating new types from existing ones. Remember to use them to keep code DRY.</p>',
        parentIds: ['proj-1'],
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        status: 'active',
    }
];

// RESOURCES
export const initialResources: Resource[] = [
    {
        id: 'res-1',
        title: 'Official TypeScript Docs',
        type: 'link',
        content: 'https://www.typescriptlang.org/docs/',
        parentIds: ['proj-1'],
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        status: 'active',
    }
];
