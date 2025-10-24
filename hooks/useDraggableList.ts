import { useState, useCallback, useMemo } from 'react';

type ReorderAction = { type: 'REORDER'; targetId: string };
type ReparentAction = { type: 'REPARENT'; targetId: string };
type PromoteToRootAction = { type: 'PROMOTE_TO_ROOT' };
export type DropAction = ReorderAction | ReparentAction | PromoteToRootAction | null;

interface DraggableListOptions<T> {
  items: T[];
  onReorder: (sourceId: string, targetId: string) => void;
  onReparent?: (sourceId: string, targetId: string) => void;
  onPromote?: (sourceId: string) => void;
  isReorderAllowed?: (sourceItem: T, targetItem: T) => boolean;
  isReparentAllowed?: (sourceItem: T, targetItem: T) => boolean;
  isPromotable?: (sourceItem: T) => boolean;
}

export const useDraggableList = <T extends { id: string }>({
  items,
  onReorder,
  onReparent,
  onPromote,
  isReorderAllowed = () => true,
  isReparentAllowed = () => true,
  isPromotable = () => false,
}: DraggableListOptions<T>) => {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropAction, setDropAction] = useState<DropAction>(null);

  const itemsMap = useMemo(() => new Map(items.map(item => [item.id, item])), [items]);

  const handleDragStart = useCallback((e: React.DragEvent<HTMLElement>, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedId(id);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedId(null);
    setDropAction(null);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLElement>, targetId: string) => {
    if (!draggedId || draggedId === targetId) return;

    const sourceItem = itemsMap.get(draggedId);
    const targetItem = itemsMap.get(targetId);
    if (!sourceItem || !targetItem) return;

    e.preventDefault();

    if (onReparent && isReparentAllowed(sourceItem, targetItem)) {
      const rect = e.currentTarget.getBoundingClientRect();
      const dropZoneThreshold = rect.height * 0.4;
      
      if (e.clientY > rect.top + dropZoneThreshold && e.clientY < rect.bottom - dropZoneThreshold) {
        setDropAction({ type: 'REPARENT', targetId });
        return;
      }
    }
    
    if (isReorderAllowed(sourceItem, targetItem)) {
      setDropAction({ type: 'REORDER', targetId });
    } else {
        setDropAction(null);
    }
  }, [draggedId, onReparent, itemsMap, isReorderAllowed, isReparentAllowed]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedId && dropAction) {
      if (dropAction.type === 'REORDER') {
        onReorder(draggedId, dropAction.targetId);
      } else if (dropAction.type === 'REPARENT' && onReparent) {
        onReparent(draggedId, dropAction.targetId);
      }
    }
    handleDragEnd();
  }, [draggedId, dropAction, onReorder, onReparent, handleDragEnd]);

  const getDragAndDropProps = useCallback((id: string) => ({
    draggable: true,
    onDragStart: (e: React.DragEvent<HTMLElement>) => handleDragStart(e, id),
    onDragEnd: handleDragEnd,
    onDragOver: (e: React.DragEvent<HTMLElement>) => handleDragOver(e, id),
    onDrop: handleDrop,
  }), [handleDragStart, handleDragEnd, handleDragOver, handleDrop]);
  
  const getContainerProps = useCallback(() => ({
    onDragOver: (e: React.DragEvent<HTMLElement>) => {
        if (!draggedId || !onPromote) return;
        const sourceItem = itemsMap.get(draggedId);
        if (sourceItem && isPromotable(sourceItem)) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            setDropAction({ type: 'PROMOTE_TO_ROOT' });
        }
    },
    onDrop: (e: React.DragEvent<HTMLElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (draggedId && onPromote && dropAction?.type === 'PROMOTE_TO_ROOT') {
            onPromote(draggedId);
        }
        handleDragEnd();
    },
    onDragLeave: (e: React.DragEvent<HTMLElement>) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
             setDropAction(null);
        }
    }
  }), [draggedId, onPromote, isPromotable, itemsMap, dropAction, handleDragEnd]);

  return {
    draggedId,
    dropAction,
    getDragAndDropProps,
    getContainerProps
  };
};