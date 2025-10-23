import React from 'react';
import { PlusIcon } from './icons';

interface CardProps {
    icon: React.ReactElement;
    title: string;
    children?: React.ReactNode;
    onAdd?: () => void;
    addLabel?: string;
    className?: string;
    headerPadding?: string;
    bodyPadding?: string;
}

const Card: React.FC<CardProps> = ({
    icon,
    title,
    children,
    onAdd,
    addLabel,
    className = 'mb-6',
    headerPadding = 'p-4',
    bodyPadding = 'p-4',
}) => {
    return (
        <div className={`bg-surface/80 backdrop-blur-xl border border-outline rounded-2xl shadow-md ${className}`}>
            <header className={`flex items-center justify-between ${headerPadding} border-b border-outline-dark`}>
                <div className="flex items-center gap-3">
                    <div className="text-accent">{icon}</div>
                    <h3 className="font-bold text-lg font-heading tracking-tight text-text-primary">{title}</h3>
                </div>
                {onAdd && (
                    <button
                        onClick={onAdd}
                        aria-label={addLabel || `Add new ${title}`}
                        className="p-1 text-text-secondary hover:bg-neutral hover:text-text-primary rounded-full transition-colors"
                    >
                        <PlusIcon className="w-5 h-5" />
                    </button>
                )}
            </header>
            <div className={`${bodyPadding} flex-1`}>
                {children}
            </div>
        </div>
    );
};

export default React.memo(Card);