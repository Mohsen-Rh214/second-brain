import React from 'react';
import { XIcon } from './icons';

interface TagProps {
  tag: string;
  onRemove?: (tag: string) => void;
  className?: string;
}

const Tag: React.FC<TagProps> = ({ tag, onRemove, className = '' }) => {
  return (
    <div
      className={`flex items-center bg-secondary text-secondary-content text-xs font-medium px-2.5 py-1 rounded-full ${className}`}
    >
      <span>{tag}</span>
      {onRemove && (
        <button
          onClick={() => onRemove(tag)}
          className="-mr-1 ml-1.5 p-0.5 rounded-full hover:bg-secondary-hover focus:outline-none"
          aria-label={`Remove tag ${tag}`}
        >
          <XIcon className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};

export default React.memo(Tag);