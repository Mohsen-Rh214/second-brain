import React from 'react';
import { Task, TaskStage } from '../../types';
import KanbanColumn from './KanbanColumn';

interface KanbanBoardProps {
  tasks: Task[];
  onUpdateTaskStage: (taskId: string, newStage: TaskStage) => void;
}

const STAGES: TaskStage[] = ['To Do', 'In Progress', 'Done'];

const KanbanBoard: React.FC<KanbanBoardProps> = ({ tasks, onUpdateTaskStage }) => {
  const tasksByStage = STAGES.reduce((acc, stage) => {
    acc[stage] = tasks.filter(task => task.stage === stage);
    return acc;
  }, {} as Record<TaskStage, Task[]>);

  // Handle tasks that might have an invalid stage by placing them in 'To Do'
  const otherTasks = tasks.filter(task => !STAGES.includes(task.stage));
  if (otherTasks.length > 0) {
      tasksByStage['To Do'] = [...tasksByStage['To Do'], ...otherTasks];
  }

  return (
    <div className="flex gap-6 overflow-x-auto custom-scrollbar pb-4 -mx-4 px-4">
      {STAGES.map(stage => (
        <KanbanColumn
          key={stage}
          stage={stage}
          tasks={tasksByStage[stage]}
          onTaskDrop={onUpdateTaskStage}
        />
      ))}
    </div>
  );
};

export default React.memo(KanbanBoard);
