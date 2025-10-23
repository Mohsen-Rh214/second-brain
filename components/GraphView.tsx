

import React, { useMemo, useRef, useCallback } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { Area, Project, Note, Resource, View } from '../types';

interface GraphViewProps {
    areas: Area[];
    projects: Project[];
    notes: Note[];
    resources: Resource[];
    onNavigate: (view: View, itemId: string) => void;
}

const nodeColors: Record<string, string> = {
    area: '#10b981',     // emerald-500
    project: '#38bdf8',  // sky-400
    note: '#a855f7',     // fuchsia-500
    resource: '#6366f1', // indigo-500
};

const GraphView: React.FC<GraphViewProps> = ({ areas, projects, notes, resources, onNavigate }) => {
    const fgRef = useRef(null);

    const graphData = useMemo(() => {
        const nodes: any[] = [];
        const links: any[] = [];

        // Add nodes
        areas.forEach(a => nodes.push({ id: a.id, name: a.title, type: 'area', val: 20 }));
        projects.forEach(p => nodes.push({ id: p.id, name: p.title, type: 'project', val: 10 }));
        notes.forEach(n => nodes.push({ id: n.id, name: n.title, type: 'note', val: 5 }));
        resources.forEach(r => nodes.push({ id: r.id, name: r.title, type: 'resource', val: 5 }));

        // Add links
        projects.forEach(p => {
            if (p.areaId) links.push({ source: p.areaId, target: p.id });
        });
        notes.forEach(n => {
            n.parentIds.forEach(pid => links.push({ source: pid, target: n.id }));
        });
        resources.forEach(r => {
            r.parentIds.forEach(pid => links.push({ source: pid, target: r.id }));
        });

        return { nodes, links };
    }, [areas, projects, notes, resources]);

    const handleNodeClick = useCallback((node: any) => {
        const { id, type } = node;
        switch(type) {
            case 'area':
                onNavigate('areas', id);
                break;
            case 'project':
                onNavigate('projects', id);
                break;
            case 'note':
            case 'resource':
                const item = [...notes, ...resources].find(i => i.id === id);
                if (item) {
                    const parentProjectId = item.parentIds.find(pid => pid.startsWith('proj-'));
                    if (parentProjectId) onNavigate('projects', parentProjectId);
                }
                break;
        }
        if (fgRef.current) {
            (fgRef.current as any).cameraPosition({ x: node.x * 1.5, y: node.y * 1.5 }, null, 1000);
        }
    }, [onNavigate, notes, resources]);

    return (
        <div className="w-full h-full bg-slate-900">
             <ForceGraph2D
                ref={fgRef}
                graphData={graphData}
                nodeLabel="name"
                nodeColor={(node: any) => nodeColors[node.type] || '#ffffff'}
                linkColor={() => 'rgba(255,255,255,0.2)'}
                linkWidth={1}
                onNodeClick={handleNodeClick}
                nodeCanvasObject={(node: any, ctx, globalScale) => {
                    const label = node.name;
                    const fontSize = 12 / globalScale;
                    ctx.font = `${fontSize}px Sans-Serif`;
                    const textWidth = ctx.measureText(label).width;
                    const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2); // some padding

                    ctx.fillStyle = 'rgba(40, 40, 40, 0.7)';
                    ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, bckgDimensions[0], bckgDimensions[1]);

                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillStyle = nodeColors[node.type];
                    ctx.fillText(label, node.x, node.y);

                    node.__bckgDimensions = bckgDimensions; // to re-use in nodePointerAreaPaint
                }}
                 nodePointerAreaPaint={(node: any, color, ctx) => {
                    ctx.fillStyle = color;
                    const bckgDimensions = node.__bckgDimensions;
                    bckgDimensions && ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, bckgDimensions[0], bckgDimensions[1]);
                }}
            />
        </div>
    );
};

export default GraphView;
