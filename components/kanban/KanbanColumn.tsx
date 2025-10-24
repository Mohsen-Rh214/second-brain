import React, { useState } from 'react';
import { Task, TaskStage } from '../../types';
import KanbanCard from './KanbanCard';

interface KanbanColumnProps {
  stage: TaskStage;
  tasks: Task[];
  allTasks: Task[];
  onUpdateTaskStage: (taskId: string, stage: TaskStage) => void;
  onUpdateMultipleTaskStages: (taskIds: string[], newStage: TaskStage) => void;
  onSelectTask: (taskId: string) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ stage, tasks, allTasks, onUpdateTaskStage, onUpdateMultipleTaskStages, onSelectTask }) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    const droppedTask = allTasks.find(t => t.id === taskId);

    if (!droppedTask || droppedTask.stage === stage) {
        setIsDragOver(false);
        return;
    }

    if (stage === 'Done' && (droppedTask.subtaskIds?.length || 0) > 0) {
        const incompleteSubtasks = (droppedTask.subtaskIds || [])
            .map(id => allTasks.find(t => t.id === id))
            .filter((t): t is Task => !!t && t.stage !== 'Done');

        if (incompleteSubtasks.length > 0) {
            const userConfirmed = window.confirm(
                `This task has ${incompleteSubtasks.length} incomplete subtask(s). Do you want to mark them as complete as well?`
            );

            if (userConfirmed) {
                const taskIdsToUpdate = [taskId, ...incompleteSubtasks.map(t => t.id)];
                onUpdateMultipleTaskStages(taskIdsToUpdate, 'Done');
            } else {
                onUpdateTaskStage(taskId, stage);
            }
        } else {
            onUpdateTaskStage(taskId, stage);
        }
    } else {
        onUpdateTaskStage(taskId, stage);
    }

    setIsDragOver(false);
  };


  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex-1 flex flex-col bg-background/50 border border-outline rounded-xl min-w-[300px] h-[400px] transition-colors ${isDragOver ? 'bg-accent/10' : ''}`}
    >
      <header className="p-4 border-b border-outline-dark flex items-center gap-2 flex-shrink-0">
        <h3 className="font-bold font-heading text-text-primary">{stage}</h3>
        <span className="text-sm font-mono bg-surface px-2 py-0.5 rounded-full text-text-secondary">{tasks.length}</span>
      </header>
      <div className="flex-1 p-4 space-y-4 overflow-y-auto custom-scrollbar">
        {tasks.map(task => (
          <KanbanCard key={task.id} task={task} onSelectTask={onSelectTask} subtaskCount={task.subtaskIds?.length || 0} />
        ))}
      </div>
    </div>
  );
};

export default React.memo(KanbanColumn);