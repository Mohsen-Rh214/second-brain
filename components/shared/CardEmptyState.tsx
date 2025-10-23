import React from 'react';

const CardEmptyState: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <p className="text-text-tertiary text-sm text-center py-4 italic">
      {children}
    </p>
  );
};

export default React.memo(CardEmptyState);