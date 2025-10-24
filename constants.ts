

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
    tags: ['self-improvement', 'learning', 'well-being'],
    icon: 'brain',
    color: '#22D3EE',
  },
];

// PROJECTS
export const initialProjects: Project[] = [
  {
    id: 'proj-1',
    title: 'Learn Advanced TypeScript',
    description: 'Complete a course and build a project to master advanced TS features.',
    areaId: 'area-1',
    taskIds: ['task-1', 'task-2', 'task-5'],
    noteIds: ['note-1'],
    resourceIds: ['res-1'],
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    status: 'active',
    lastReviewed: sevenDaysAgo.toISOString(),
    tags: ['coding', 'typescript', 'learning-sprint'],
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
    tags: ['health', 'exercise'],
    // This one has not been reviewed to show up in the list
  },
];

// TASKS
export const initialTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Finish Generics chapter',
    projectId: 'proj-1',
    stage: 'To Do',
    priority: 'High',
    description: 'Read and take notes on the Generics chapter in the Advanced TypeScript book. Focus on conditional types and mapped types.',
    subtaskIds: ['task-5'],
    parentId: null,
    noteIds: ['note-1'],
    resourceIds: [],
    dueDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    status: 'active',
    tags: ['reading', 'deep-work'],
  },
  {
    id: 'task-2',
    title: 'Refactor project with mapped types',
    projectId: 'proj-1',
    stage: 'To Do',
    priority: 'Medium',
    description: '',
    subtaskIds: [],
    parentId: null,
    noteIds: [],
    resourceIds: [],
    dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    status: 'active',
    tags: ['coding', 'refactoring'],
  },
  {
    id: 'task-3',
    title: 'Go for a 3-mile run',
    projectId: 'proj-2',
    stage: 'Done',
    priority: 'Low',
    description: '',
    subtaskIds: [],
    parentId: null,
    noteIds: [],
    resourceIds: [],
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    status: 'active',
    completedAt: now.toISOString(),
    tags: ['cardio'],
  },
  {
    id: 'task-4',
    title: 'Review PKM book draft',
    projectId: null,
    stage: 'To Do',
    priority: 'Medium',
    description: 'First pass for structure and flow.',
    subtaskIds: [],
    parentId: null,
    noteIds: [],
    resourceIds: [],
    createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    isMyDay: true,
    tags: ['writing', 'review'],
  },
  {
    id: 'task-5',
    title: 'Take notes on conditional types',
    projectId: 'proj-1',
    stage: 'To Do',
    priority: 'High',
    description: '',
    subtaskIds: [],
    parentId: 'task-1',
    noteIds: [],
    resourceIds: [],
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    status: 'active',
    tags: ['reading'],
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
        tags: ['typescript', 'key-concepts'],
    }
];

// RESOURCES
export const initialResources: Resource[] = [
    {
        id: 'res-1',
        title: 'Official TypeScript Docs',
        url: 'https://www.typescriptlang.org/docs/',
        content: 'The official documentation is the best place to start. Check the Utility Types section.',
        parentIds: ['proj-1'],
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        status: 'active',
        tags: ['documentation', 'official-source'],
    }
];