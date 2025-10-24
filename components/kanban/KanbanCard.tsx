import React from 'react';
import { Task } from '../../types';
import TagList from '../shared/TagList';
import { CalendarIcon, FlagIcon } from '../shared/icons';

interface KanbanCardProps {
  task: Task;
  onDoubleClick: () => void;
}

const priorityClasses: Record<string, { text: string, border: string }> = {
    High: { text: 'text-priority-high', border: 'border-l-priority-high' },
    Medium: { text: 'text-priority-medium', border: 'border-l-priority-medium' },
    Low: { text: 'text-priority-low', border: 'border-l-priority-low' },
};

const KanbanCard: React.FC<KanbanCardProps> = ({ task, onDoubleClick }) => {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('taskId', task.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const priorityClass = task.priority ? priorityClasses[task.priority]?.border : 'border-l-transparent';

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDoubleClick={onDoubleClick}
      className={`bg-background/50 border border-outline border-l-4 ${priorityClass} rounded-lg p-3 shadow-sm cursor-grab active:cursor-grabbing transition-all hover:shadow-md hover:-translate-y-0.5`}
    >
      <p className="font-semibold text-sm mb-2 text-text-primary">{task.title}</p>
      <TagList tags={task.tags} />
      <div className="flex items-center justify-between mt-3 text-xs text-text-tertiary">
        {task.dueDate ? (
          <div className="flex items-center gap-1">
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>{new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
          </div>
        ) : <div />}
        {task.priority && (
          <div className="flex items-center gap-1">
            <FlagIcon className="w-3.5 h-3.5" />
            <span>{task.priority}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(KanbanCard);
