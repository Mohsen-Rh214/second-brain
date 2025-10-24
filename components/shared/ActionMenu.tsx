import React, { useEffect, useRef } from 'react';
import { EditIcon, ArchiveBoxIcon, TrashIcon, EllipsisVerticalIcon } from './icons';

interface ActionMenuProps {
    onEdit?: () => void;
    onArchive: () => void;
    onDelete: () => void;
    isOpen: boolean;
    onToggle: () => void;
}

const ActionMenu: React.FC<ActionMenuProps> = ({ onEdit, onArchive, onDelete, isOpen, onToggle }) => {
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isOpen && menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onToggle();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onToggle]);

    const createClickHandler = (action?: () => void) => () => {
        if (action) {
            action();
        }
        onToggle();
    }

    return (
        <div className="relative" ref={menuRef}>
            <button onClick={onToggle} className="p-2 text-text-secondary hover:bg-neutral hover:text-text-primary rounded-full transition-colors">
                <EllipsisVerticalIcon className="w-5 h-5" />
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-surface/80 backdrop-blur-xl border border-outline rounded-lg shadow-lg z-10">
                    <ul>
                        {onEdit && (
                            <li>
                                <button onClick={createClickHandler(onEdit)} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm hover:bg-neutral transition-colors">
                                    <EditIcon className="w-4 h-4" /> Edit
                                </button>
                            </li>
                        )}
                        <li>
                            <button onClick={createClickHandler(onArchive)} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm hover:bg-neutral transition-colors">
                                <ArchiveBoxIcon className="w-4 h-4" /> Archive
                            </button>
                        </li>
                        <li>
                            <button onClick={createClickHandler(onDelete)} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-destructive hover:bg-neutral transition-colors">
                                <TrashIcon className="w-4 h-4" /> Delete
                            </button>
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
};

export default React.memo(ActionMenu);