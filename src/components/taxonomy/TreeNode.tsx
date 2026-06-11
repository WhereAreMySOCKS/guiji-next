"use client";

import React, { useState, useEffect, useRef } from 'react';
import type { TaxonomyNode } from '@/lib/types';

export interface ExtendedNode extends TaxonomyNode {
  english_name?: string;
  children?: ExtendedNode[];
}

export function getRankStyle(rank: string) {
  const styles: Record<string, string> = {
    order: 'border-emerald-500 bg-emerald-50 text-emerald-700',
    suborder: 'border-blue-500 bg-blue-50 text-blue-700',
    superfamily: 'border-indigo-500 bg-indigo-50 text-indigo-700',
    family: 'border-purple-500 bg-purple-50 text-purple-700',
    genus: 'border-slate-500 bg-slate-50 text-slate-700'
  };
  return styles[rank.toLowerCase()] || 'border-gray-300 bg-gray-50 text-gray-700';
}

const TreeNode: React.FC<{
  node: ExtendedNode;
  lang: 'zh' | 'en';
  onOpenPdf: (p: number) => void;
  expandedNodes: Set<string>;
  searchQuery: string;
  getNodeSlug: (node: ExtendedNode) => string;
}> = ({ node, lang, onOpenPdf, expandedNodes, searchQuery, getNodeSlug }) => {
  const hasChildren = !!(node.children && node.children.length > 0);
  const [isExpanded, setIsExpanded] = useState(expandedNodes.has(node.name) || node.rank.toLowerCase() === 'order');
  const nodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (expandedNodes.has(node.name)) setIsExpanded(true); }, [expandedNodes, node.name]);

  const displayName = lang === 'zh' ? node.name : (node.english_name || node.name);

  const isMatch = searchQuery.trim() !== '' && (
    node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (node.english_name && node.english_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (node.latin_name && node.latin_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  useEffect(() => {
    if (isMatch && nodeRef.current) {
      setTimeout(() => {
        nodeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }, 500);
    }
  }, [isMatch]);

  const rankStyle = getRankStyle(node.rank);

  return (
    <li>
      <div className="node-content">
        <div ref={nodeRef} className={`bg-white shadow-sm hover:shadow-lg rounded-lg border border-gray-200 w-[170px] sm:w-[220px] md:w-[240px] flex flex-col overflow-hidden cursor-pointer transition-all duration-300 ${isMatch ? 'highlight-node' : ''}`}
          onClick={(e) => { e.stopPropagation(); if (hasChildren) setIsExpanded(!isExpanded); }}
        >
          <div className={`px-3 py-1.5 flex justify-between items-center border-b border-gray-100 border-l-4 ${rankStyle}`}>
            <span className="text-[10px] uppercase font-bold tracking-wider">{node.rank}</span>
            {node.page && (
              <button className="text-[10px] font-semibold text-emerald-600 hover:text-white bg-emerald-50 hover:bg-emerald-500 px-2 py-0.5 rounded border border-emerald-200 hover:border-emerald-500 transition-colors"
                onClick={(e) => { e.stopPropagation(); onOpenPdf(node.page!); }}
              >
                {lang === 'zh' ? '查看图鉴' : 'View'}
              </button>
            )}
          </div>
          <div className="p-4 flex flex-col items-center text-center bg-white relative">
            <h3 className="text-[15px] font-bold text-gray-900 leading-tight w-full truncate" title={displayName}>{displayName}</h3>
            <p className="text-[11px] italic text-gray-500 mt-1 w-full truncate" title={node.latin_name}>{node.latin_name || 'Unknown'}</p>
            <a
              href={`/${lang}/taxa/${getNodeSlug(node)}`}
              className="mt-2 text-[11px] font-semibold text-gray-400 hover:text-emerald-700 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              {lang === 'zh' ? '分类详情' : 'Taxon detail'}
            </a>
            {hasChildren && (
              <div className={`mt-2 -mb-2 text-gray-300 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                <span className="material-symbols-outlined text-[18px]">expand_more</span>
              </div>
            )}
          </div>
        </div>
      </div>
      {hasChildren && isExpanded && (
        <ul>
          {node.children!.map((child) => (
            <TreeNode key={child.id} lang={lang} node={child as ExtendedNode} onOpenPdf={onOpenPdf} expandedNodes={expandedNodes} searchQuery={searchQuery} getNodeSlug={getNodeSlug} />
          ))}
        </ul>
      )}
    </li>
  );
};

export default TreeNode;
