'use client';
import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { motion } from 'motion/react';
import { Maximize2, Minimize2, RefreshCw } from 'lucide-react';

interface DependencyGraphProps {
  files: Record<string, string>;
}

export default function DependencyGraph({ files }: DependencyGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [resetTicker, setResetTicker] = useState(0);

  const simulationRef = useRef<d3.Simulation<d3.SimulationNodeDatum, undefined> | null>(null);

  // Parse files to create nodes and links
  const { nodes, links } = useMemo(() => {
    const fileNames = Object.keys(files).filter(name => !name.endsWith('/.keep'));
    const nodeList = fileNames.map(name => ({ id: name, group: name.split('/')[0] || 'root', radius: 25 }));
    const linkList: { source: string; target: string; value: number }[] = [];

    // Simple heuristic parser for imports/exports
    fileNames.forEach(file => {
      const content = files[file];
      const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
      const requireRegex = /const\s+.*?=\s+require\(['"]([^'"]+)['"]\)/g;
      const exportRegex = /export\s+\*?\s*from\s+['"]([^'"]+)['"]/g;
      
      const addLink = (matchPath: string) => {
        // Resolve relative paths naively
        let targetPath = matchPath;
        if (targetPath.startsWith('.')) {
          const parts = file.split('/').slice(0, -1);
          const targetParts = targetPath.split('/');
          for (const p of targetParts) {
            if (p === '..') parts.pop();
            else if (p !== '.') parts.push(p);
          }
          targetPath = parts.join('/') + (targetPath.endsWith('.ts') || targetPath.endsWith('.tsx') ? '' : '');
          
          let resolvedTarget = fileNames.find(f => f.startsWith(targetPath));
          if (!resolvedTarget) {
             resolvedTarget = fileNames.find(f => f === targetPath + '.ts' || f === targetPath + '.tsx' || f === targetPath + '/index.ts');
          }
          if (resolvedTarget) {
            linkList.push({ source: file, target: resolvedTarget, value: 1 });
          }
        } else {
           const externalId = `external:${targetPath}`;
           if (!nodeList.find(n => n.id === externalId)) {
               nodeList.push({ id: externalId, group: 'external', radius: 15 });
           }
           linkList.push({ source: file, target: externalId, value: 0.5 });
        }
      };

      let match;
      while ((match = importRegex.exec(content)) !== null) addLink(match[1]);
      while ((match = requireRegex.exec(content)) !== null) addLink(match[1]);
      while ((match = exportRegex.exec(content)) !== null) addLink(match[1]);
    });

    return { nodes: nodeList, links: linkList };
  }, [files]);

  useEffect(() => {
    const parent = containerRef.current?.parentElement;
    if (!parent) return;

    const updateDim = () => {
       const rect = parent.getBoundingClientRect();
       setDimensions({ width: rect.width || 800, height: rect.height || 600 });
    };
    
    updateDim();
    const observer = new ResizeObserver(updateDim);
    observer.observe(parent);
    
    return () => observer.disconnect();
  }, [isFullscreen]);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    if (svg.select('g.container').empty()) {
        const g = svg.append('g').attr('class', 'container');
        g.append('g').attr('class', 'links');
        g.append('g').attr('class', 'nodes');
        
        svg.append('defs').append('marker')
          .attr('id', 'arrowhead')
          .attr('viewBox', '-0 -5 10 10')
          .attr('refX', 20)
          .attr('refY', 0)
          .attr('orient', 'auto')
          .attr('markerWidth', 6)
          .attr('markerHeight', 6)
          .attr('xoverflow', 'visible')
          .append('svg:path')
          .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
          .attr('fill', '#4f46e5')
          .style('stroke', 'none');

       const zoom = d3.zoom()
         .scaleExtent([0.1, 4])
         .on('zoom', (event) => g.attr('transform', event.transform));
       svg.call(zoom as any);
       
       // Center initial container
       const initTransform = d3.zoomIdentity.translate(dimensions.width/2, dimensions.height/2).scale(0.8);
       svg.call(zoom.transform as any, initTransform);
    }
  }, [dimensions.width, dimensions.height]);

  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    const gContainer = svg.select('g.container');
    const width = dimensions.width;
    const height = dimensions.height;
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    if (!simulationRef.current) {
       simulationRef.current = d3.forceSimulation()
         .force('charge', d3.forceManyBody().strength(-300))
         .force('center', d3.forceCenter(width / 2, height / 2))
         .force('collide', d3.forceCollide().radius((d: any) => d.radius + 10).iterations(2));
    }
    const simulation = simulationRef.current;
    
    // Update center force based on dimensions
    simulation.force('center', d3.forceCenter(width / 2, height / 2));

    const linkGroup = gContainer.select('g.links');
    const nodeGroup = gContainer.select('g.nodes');

    // Keep active nodes and link mappings
    const linkSelection = linkGroup
      .selectAll('line.link')
      .data(links, (d: any) => `${d.source.id || d.source}-${d.target.id || d.target}`);

    const linkEnter = linkSelection.enter()
      .append('line')
      .attr('class', 'link')
      .attr('stroke', '#4f46e5')
      .attr('stroke-opacity', 0)
      .attr('stroke-width', (d: any) => Math.sqrt(d.value))
      .attr('marker-end', 'url(#arrowhead)');

    linkEnter.transition().duration(500).attr('stroke-opacity', 0.4);

    linkSelection.exit()
      .transition().duration(500)
      .attr('stroke-opacity', 0)
      .remove();

    const linkMerged = linkEnter.merge(linkSelection as any);

    const nodeSelection = nodeGroup
      .selectAll('g.node')
      .data(nodes, (d: any) => d.id);

    const nodeEnter = nodeSelection.enter()
      .append('g')
      .attr('class', 'node')
      // Place new nodes randomly to avoid everything bursting from center identically
      .attr('transform', `translate(${width/2 + Math.random()*10 - 5}, ${height/2 + Math.random()*10 - 5})`);

    nodeEnter.append('circle')
      .attr('r', 0)
      .attr('fill', (d: any) => d.group === 'external' ? '#111' : color(d.group))
      .attr('stroke', (d: any) => d.group === 'external' ? '#333' : '#fff')
      .attr('stroke-width', 2)
      .style('filter', 'drop-shadow(0px 8px 16px rgba(0,0,0,0.5))')
      .transition().duration(500).ease(d3.easeElastic)
      .attr('r', (d: any) => d.radius);

    nodeEnter.append('text')
      .attr('class', 'label-text')
      .attr('dx', 15)
      .attr('dy', 5)
      .text((d: any) => d.id.split('/').pop())
      .attr('fill', '#e5e7eb')
      .attr('font-size', '12px')
      .attr('font-family', 'ui-monospace, monospace')
      .attr('pointer-events', 'none')
      .style('text-shadow', '0 2px 4px rgba(0,0,0,0.8)')
      .style('opacity', 0)
      .transition().duration(500)
      .style('opacity', 1);
      
    nodeEnter.append('text')
      .attr('class', 'icon-text')
      .attr('dx', -10)
      .attr('dy', 5)
      .text((d: any) => d.group === 'external' ? '📦' : '📄')
      .attr('font-size', '14px')
      .attr('pointer-events', 'none')
      .style('opacity', 0)
      .transition().duration(500)
      .style('opacity', 1);

    nodeEnter.append('title')
      .text((d: any) => d.id);

    nodeSelection.exit()
      .transition().duration(500)
      .style('opacity', 0)
      .remove();

    const nodeMerged = nodeEnter.merge(nodeSelection as any);

    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    nodeMerged.call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended) as any);

    // Apply the exact old nodes mapping into the new nodes layout so physics don't pop
    const oldNodes = simulation.nodes();
    const oldNodeMap = new Map(oldNodes.map((n:any) => [n.id, n]));
    
    const preservedNodes = nodes.map(n => {
       const o = oldNodeMap.get(n.id);
       return o ? { ...n, x: o.x, y: o.y, vx: o.vx, vy: o.vy } : n;
    });

    simulation.nodes(preservedNodes as any);
    simulation.force('link', d3.forceLink(links).id((d: any) => d.id).distance(100));
    simulation.alpha(1).restart();

    simulation.on('tick', () => {
      linkMerged
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      nodeMerged.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });
    
    if (resetTicker > 0) {
      // Re-center logic
      const zoom = d3.zoom()
         .scaleExtent([0.1, 4])
         .on('zoom', (event) => gContainer.attr('transform', event.transform));
      svg.transition().duration(750).call(
          zoom.transform as any, 
          d3.zoomIdentity,
          d3.zoomTransform(svg.node() as any).invert([width / 2, height / 2])
      );
    }
  }, [nodes, links, dimensions.width, dimensions.height, resetTicker]);

  return (
    <div ref={containerRef} className={`relative w-full ${isFullscreen ? 'fixed inset-0 z-[9999] bg-[#050505]' : 'h-full bg-black/50 border border-white/5 rounded-3xl overflow-hidden'}`}>
       <div className="absolute top-4 right-4 z-10 gap-2 flex">
         <button onClick={() => setResetTicker(t => t + 1)} className="p-2 bg-white/5 backdrop-blur-md rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors border border-white/10 shadow-lg">
           <RefreshCw className="w-4 h-4" />
         </button>
         <button onClick={() => setIsFullscreen(!isFullscreen)} className="p-2 bg-white/5 backdrop-blur-md rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors border border-white/10 shadow-lg">
           {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
         </button>
       </div>
       {nodes.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-gray-500 font-mono text-[13px]">
             No files discovered in workspace structure.
          </div>
       ) : (
          <svg 
            ref={svgRef} 
            width="100%" 
            height="100%" 
            style={{ display: 'block', background: 'transparent', cursor: 'grab' }}
            onMouseDown={(e) => e.currentTarget.style.cursor = 'grabbing'}
            onMouseUp={(e) => e.currentTarget.style.cursor = 'grab'}
            onMouseLeave={(e) => e.currentTarget.style.cursor = 'grab'}
          />
       )}
    </div>
  );
}
