import React, { useState, useEffect, useRef } from 'react';
import { EditIcon, ArchiveBoxIcon, TrashIcon, EllipsisVerticalIcon } from './icons';

interface ActionMenuProps {
    onEdit?: () => void;
    onArchive: () => void;
    onDelete: () => void;
}

const ActionMenu: React.FC<ActionMenuProps> = ({ onEdit, onArchive, onDelete }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const createClickHandler = (action?: () => void) => () => {
        if (action) {
            action();
        }
        setIsOpen(false);
    }

    return (
        <div className="relative" ref={menuRef}>
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-text-secondary hover:bg-neutral hover:text-text-primary rounded-full transition-colors">
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