import React, { useState } from 'react';
import { PlusIcon, ChevronDownIcon } from './icons';

interface CardProps {
    icon: React.ReactElement;
    title: string;
    children?: React.ReactNode;
    onAdd?: () => void;
    addLabel?: string;
    className?: string;
    headerPadding?: string;
    bodyPadding?: string;
    isCollapsible?: boolean;
    defaultOpen?: boolean;
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
    isCollapsible = false,
    defaultOpen = true,
}) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    
    // Allow custom header content via slot pattern
    const childrenArray = React.Children.toArray(children);
    const headerSlot = childrenArray.find(child => React.isValidElement(child) && (child.props as any).slot === 'header-content');
    const bodyContent = childrenArray.filter(child => !React.isValidElement(child) || (child.props as any).slot !== 'header-content');


    const DefaultHeaderContent = () => (
        <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
                <div className="text-accent">{icon}</div>
                <h3 className="font-bold text-lg font-heading tracking-tight text-text-primary">{title}</h3>
            </div>
            <div className="flex items-center gap-2">
                {onAdd && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onAdd();
                        }}
                        aria-label={addLabel || `Add new ${title}`}
                        className="p-1 text-text-secondary hover:bg-neutral hover:text-text-primary rounded-full transition-colors"
                    >
                        <PlusIcon className="w-5 h-5" />
                    </button>
                )}
                {isCollapsible && (
                     <ChevronDownIcon className={`w-5 h-5 text-text-secondary transition-transform duration-300 ${isOpen ? '' : '-rotate-90'}`} />
                )}
            </div>
        </div>
    );


    return (
        <div className={`bg-surface/80 backdrop-blur-xl border border-outline rounded-2xl shadow-md h-full flex flex-col ${className}`}>
            <header className={`flex items-center justify-between ${headerPadding} ${isOpen && bodyContent.length > 0 ? 'border-b border-outline-dark' : ''}`}>
                {isCollapsible ? (
                    <div
                        role="button"
                        tabIndex={0}
                        onClick={() => setIsOpen(!isOpen)}
                        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setIsOpen(!isOpen)}
                        aria-expanded={isOpen}
                        className="w-full cursor-pointer"
                    >
                        {headerSlot || <DefaultHeaderContent />}
                    </div>
                ) : (
                    headerSlot || <DefaultHeaderContent />
                )}
            </header>
            {isOpen && (
                <div className={`${bodyPadding} flex-1 overflow-y-auto custom-scrollbar`}>
                    {bodyContent}
                </div>
            )}
        </div>
    );
};

export default React.memo(Card);