

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
        areas.forEach(a => nodes.push({ id: a.id, title: a.title, type: 'area' }));
        projects.forEach(p => nodes.push({ id: p.id, title: p.title, type: 'project' }));
        notes.forEach(n => nodes.push({ id: n.id, title: n.title, type: 'note' }));
        resources.forEach(r => nodes.push({ id: r.id, title: r.title, type: 'resource' }));
        
        const nodeIds = new Set(nodes.map(n => n.id));

        // Add links only if both source and target nodes exist
        projects.forEach(p => {
            if (p.areaId && nodeIds.has(p.id) && nodeIds.has(p.areaId)) {
                links.push({ source: p.id, target: p.areaId });
            }
        });
        notes.forEach(n => {
            n.parentIds.forEach(pid => {
                if (nodeIds.has(n.id) && nodeIds.has(pid)) {
                    links.push({ source: n.id, target: pid });
                }
            });
        });
        resources.forEach(r => {
            r.parentIds.forEach(pid => {
                if (nodeIds.has(r.id) && nodeIds.has(pid)) {
                    links.push({ source: r.id, target: pid });
                }
            });
        });

        return { nodes, links };
    }, [areas, projects, notes, resources]);

    const handleNodeClick = useCallback((node: any) => {
        // Center view on node
        // @ts-ignore
        fgRef.current?.centerAt(node.x, node.y, 1000);
        // @ts-ignore
        fgRef.current?.zoom(2, 1000);

        // Navigate to the respective view
        if (node.type === 'area') {
            onNavigate('areas', node.id);
        } else if (node.type === 'project') {
            onNavigate('projects', node.id);
        }
    }, [fgRef, onNavigate]);

    const handleNodeCanvasObject = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
        // FIX: Add a guard clause to prevent rendering if coordinates are not yet defined.
        if (typeof node.x === 'undefined' || typeof node.y === 'undefined') {
            return;
        }

        const label = node.title;
        const fontSize = 12 / globalScale;
        ctx.font = `${fontSize}px Sans-Serif`;
        
        const textWidth = ctx.measureText(label).width;
        const r = Math.min(10, Math.sqrt(textWidth) + 2) / globalScale;
        
        // Draw circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false);
        ctx.fillStyle = nodeColors[node.type] || 'grey';
        ctx.fill();

        // Draw label
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = 'rgba(241, 245, 249, 0.8)'; // slate-100
        ctx.fillText(label, node.x, node.y + r + fontSize * 0.6);
    }, []);

    return (
        <div className="h-full w-full relative">
            <ForceGraph2D
                ref={fgRef}
                graphData={graphData}
                nodeLabel="title"
                onNodeClick={handleNodeClick}
                nodeCanvasObject={handleNodeCanvasObject}
                linkWidth={0.5}
                linkColor={() => 'rgba(100, 116, 139, 0.5)'} // slate-500
                backgroundColor="#0f172a" // slate-900
                cooldownTicks={100}
                onEngineStop={() => {
                    // @ts-ignore
                    if (fgRef.current && graphData.nodes.length > 0) {
                        // @ts-ignore
                        fgRef.current.zoomToFit(400, 100);
                    }
                }}
            />
            <div className="absolute top-4 left-4 bg-slate-950/50 p-4 rounded-lg text-slate-300 backdrop-blur-sm max-w-sm">
                <h1 className="text-xl font-bold mb-2">Knowledge Graph</h1>
                <p className="text-sm mb-4">Explore the connections between your ideas. Click a node to focus and navigate.</p>
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs">
                    {Object.entries(nodeColors).map(([type, color]) => (
                        <div key={type} className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></span>
                            <span>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default GraphView;