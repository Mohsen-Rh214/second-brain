import React from 'react';

interface EmptyStateProps {
  // This provides a more specific type for React.cloneElement, resolving the TypeScript error.
  icon: React.ReactElement<{ className?: string }>;
  title: string;
  description: string;
  actionButton?: React.ReactElement;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, actionButton }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-text-tertiary text-center p-8 bg-surface/80 backdrop-blur-xl border-2 border-dashed border-outline-dark rounded-2xl">
      {React.cloneElement(icon, { className: "w-16 h-16 mb-4" })}
      <h2 className="text-xl font-semibold font-heading text-text-primary mb-2">{title}</h2>
      <p className="max-w-sm mb-4">{description}</p>
      {actionButton && <div className="mt-2">{actionButton}</div>}
    </div>
  );
};

export default EmptyState;
