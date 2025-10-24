import React, { useMemo, useRef, useCallback } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { Area, Project, Note, Resource, View } from '../../types';

interface GraphViewProps {
    areas: Area[];
    projects: Project[];
    notes: Note[];
    resources: Resource[];
    onNavigate: (view: View, itemId: string) => void;
}

const nodeColors: Record<string, string> = {
    area: '#BF5AF2',
    project: '#F2F2F7',
    note: '#8E8E93',
    resource: '#636366',
};

const GraphView: React.FC<GraphViewProps> = ({ areas, projects, notes, resources, onNavigate }) => {
    const fgRef = useRef(null);

    const graphData = useMemo(() => {
        const nodes: any[] = [];
        const links: any[] = [];
        const linkSet = new Set();

        areas.forEach(a => nodes.push({ id: a.id, name: a.title, type: 'area', val: 20 }));
        projects.forEach(p => nodes.push({ id: p.id, name: p.title, type: 'project', val: 10 }));
        notes.forEach(n => nodes.push({ id: n.id, name: n.title, type: 'note', val: 5 }));
        resources.forEach(r => nodes.push({ id: r.id, name: r.title, type: 'resource', val: 5 }));

        const addLink = (source: string, target: string) => {
            const forward = `${source}-${target}`;
            if (!linkSet.has(forward)) {
                links.push({ source, target });
                linkSet.add(forward);
            }
        }

        projects.forEach(p => {
            if (p.areaId) addLink(p.areaId, p.id);
        });
        notes.forEach(n => {
            n.parentIds.forEach(pid => addLink(pid, n.id));
        });
        resources.forEach(r => {
            r.parentIds.forEach(pid => addLink(pid, r.id));
        });
        
        const linkRegex = /data-link-id="([^"]+)"/g;
        notes.forEach(n => {
            let match;
            while((match = linkRegex.exec(n.content)) !== null) {
                const targetId = match[1];
                addLink(n.id, targetId);
            }
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
        <div className="w-full h-full overflow-clip bg-surface/80 backdrop-blur-xl border border-outline rounded-2xl shadow-md">
             <ForceGraph2D
                ref={fgRef}
                graphData={graphData}
                nodeLabel="name"
                nodeColor={(node: any) => nodeColors[node.type] || '#FFFFFF'}
                linkColor={() => 'rgba(142, 142, 147, 0.3)'}
                linkWidth={1}
                onNodeClick={handleNodeClick}
                nodeCanvasObject={(node: any, ctx, globalScale) => {
                    const label = node.name;
                    const fontSize = 12 / globalScale;
                    ctx.font = `${fontSize}px Inter, sans-serif`;
                    const textWidth = ctx.measureText(label).width;
                    const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.4);

                    ctx.fillStyle = 'rgba(22, 22, 24, 0.8)';
                    ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, bckgDimensions[0], bckgDimensions[1]);

                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillStyle = nodeColors[node.type];
                    ctx.fillText(label, node.x, node.y);

                    node.__bckgDimensions = bckgDimensions;
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

export default React.memo(GraphView);