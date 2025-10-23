import React from 'react';

interface ProgressBarProps {
    total: number;
    completed: number;
    size?: number;
    strokeWidth?: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ 
    total, 
    completed, 
    size = 20, 
    strokeWidth = 3 
}) => {
    if (total === 0) return null;

    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = completed / total;
    const offset = circumference * (1 - progress);

    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
            <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="rgba(139, 148, 158, 0.2)"
                strokeWidth={strokeWidth}
                fill="transparent"
            />
            <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="currentColor"
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.3s ease-out' }}
            />
        </svg>
    );
};

export default React.memo(ProgressBar);
