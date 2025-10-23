import React, { useState, useMemo } from 'react';
import { Project, Area, Task, View } from '../types';
import { InboxIcon, ProjectIcon, AreaIcon, ListTodoIcon, CheckSquareIcon } from './icons';

interface ReviewViewProps {
    inboxCount: number;
    projects: Project[];
    areas: Area[];
    tasks: Task[];
    onNavigate: (view: View, itemId?: string) => void;
    onMarkReviewed: (itemIds: string[], type: 'project' | 'area') => void;
}

type ReviewStep = 'inbox' | 'projects' | 'areas' | 'tasks' | 'complete';

const ONE_WEEK_AGO = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

const ReviewView: React.FC<ReviewViewProps> = ({ inboxCount, projects, areas, tasks, onNavigate, onMarkReviewed }) => {
    const [currentStep, setCurrentStep] = useState<ReviewStep>('inbox');
    
    const projectsToReview = useMemo(() => 
        projects.filter(p => !p.lastReviewed || new Date(p.lastReviewed) < ONE_WEEK_AGO),
        [projects]
    );

    const areasToReview = useMemo(() =>
        areas.filter(a => !a.lastReviewed || new Date(a.lastReviewed) < ONE_WEEK_AGO),
        [areas]
    );

    const upcomingTasks = useMemo(() => {
        const next7days = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        return tasks.filter(t => t.dueDate && new Date(t.dueDate) <= next7days);
    }, [tasks]);

    const steps: { id: ReviewStep, title: string, count: number }[] = [
        { id: 'inbox', title: 'Process Your Inbox', count: inboxCount },
        { id: 'projects', title: 'Review Active Projects', count: projectsToReview.length },
        { id: 'areas', title: 'Review Active Areas', count: areasToReview.length },
        { id: 'tasks', title: 'Look at Upcoming Tasks', count: upcomingTasks.length }
    ];

    const handleMarkAllReviewed = (type: 'project' | 'area') => {
        if (type === 'project') {
            onMarkReviewed(projectsToReview.map(p => p.id), 'project');
        } else {
            onMarkReviewed(areasToReview.map(a => a.id), 'area');
        }
    }

    const renderStepContent = () => {
        switch(currentStep) {
            case 'inbox':
                return (
                    <div>
                        <p className="mb-4">You have {inboxCount} {inboxCount === 1 ? 'item' : 'items'} in your inbox to process.</p>
                        <button onClick={() => onNavigate('inbox')} className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-4 py-2 rounded-md">
                            Go to Inbox
                        </button>
                    </div>
                );
            case 'projects':
                return (
                     <div>
                        <p className="mb-4">You have {projectsToReview.length} {projectsToReview.length === 1 ? 'project' : 'projects'} that haven't been reviewed in the last week.</p>
                        <ul className="space-y-2 mb-4">
                            {projectsToReview.map(p => (
                                <li key={p.id}><button onClick={() => onNavigate('projects', p.id)} className="text-emerald-400 hover:underline">{p.title}</button></li>
                            ))}
                        </ul>
                        <button onClick={() => handleMarkAllReviewed('project')} className="bg-sky-600 hover:bg-sky-500 text-white font-semibold px-4 py-2 rounded-md">
                            Mark all as reviewed
                        </button>
                    </div>
                );
            case 'areas':
                 return (
                     <div>
                        <p className="mb-4">You have {areasToReview.length} {areasToReview.length === 1 ? 'area' : 'areas'} that haven't been reviewed in the last week.</p>
                        <ul className="space-y-2 mb-4">
                            {areasToReview.map(a => (
                                <li key={a.id}><button onClick={() => onNavigate('areas', a.id)} className="text-emerald-400 hover:underline">{a.title}</button></li>
                            ))}
                        </ul>
                         <button onClick={() => handleMarkAllReviewed('area')} className="bg-sky-600 hover:bg-sky-500 text-white font-semibold px-4 py-2 rounded-md">
                            Mark all as reviewed
                        </button>
                    </div>
                );
            case 'tasks':
                 return (
                     <div>
                        <p className="mb-4">You have {upcomingTasks.length} {upcomingTasks.length === 1 ? 'task' : 'tasks'} due in the next 7 days.</p>
                        <button onClick={() => onNavigate('tasks')} className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-4 py-2 rounded-md">
                            View All Tasks
                        </button>
                    </div>
                );
            case 'complete':
                return (
                    <div className="text-center">
                        <CheckSquareIcon className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold">Review Complete!</h3>
                        <p className="text-slate-400">Your Second Brain is organized and ready for the week ahead.</p>
                    </div>
                )
        }
    }
    
    const activeStepIndex = steps.findIndex(s => s.id === currentStep);

    const goToNextStep = () => {
        if (activeStepIndex < steps.length - 1) {
            setCurrentStep(steps[activeStepIndex + 1].id);
        } else {
            setCurrentStep('complete');
        }
    }
    
    return (
        <div className="p-8 max-w-4xl mx-auto">
            <header className="mb-12 text-center">
                <h1 className="text-4xl font-bold">Weekly Review</h1>
                <p className="text-slate-400 mt-2">A guided tour to keep your digital mind clear and focused.</p>
            </header>

            <div className="flex gap-8">
                {/* Stepper */}
                <div className="w-1/3">
                    <ol className="space-y-4">
                        {steps.map((step, index) => {
                            const isCompleted = index < activeStepIndex;
                            const isActive = index === activeStepIndex;
                            return (
                                <li key={step.id} className="flex items-center gap-3">
                                    <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                                        isActive ? 'bg-emerald-500 text-white' : isCompleted ? 'bg-slate-600 text-slate-300' : 'bg-slate-700 text-slate-400'
                                    }`}>
                                        {index + 1}
                                    </span>
                                    <div className="flex-1">
                                        <p className={`font-semibold ${isActive ? 'text-slate-100' : 'text-slate-300'}`}>{step.title}</p>
                                        <p className="text-xs text-slate-400">{step.count} {step.count === 1 ? 'item' : 'items'}</p>
                                    </div>
                                </li>
                            )
                        })}
                    </ol>
                </div>

                {/* Step Content */}
                <div className="w-2/3 bg-slate-800/50 p-6 rounded-lg">
                    {renderStepContent()}

                    {currentStep !== 'complete' && (
                        <div className="mt-6 pt-6 border-t border-slate-700 text-right">
                             <button onClick={goToNextStep} className="bg-slate-600 hover:bg-slate-500 text-white font-semibold px-4 py-2 rounded-md">
                                Next Step &rarr;
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReviewView;