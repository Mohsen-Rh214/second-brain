import React from 'react';
import Tag from './Tag';

interface TagListProps {
  tags?: string[];
  className?: string;
  itemClassName?: string;
}

const TagList: React.FC<TagListProps> = ({ tags, className = '', itemClassName = '' }) => {
  if (!tags || tags.length === 0) {
    return null;
  }

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {tags.map(tag => (
        <Tag key={tag} tag={tag} className={itemClassName} />
      ))}
    </div>
  );
};

export default React.memo(TagList);