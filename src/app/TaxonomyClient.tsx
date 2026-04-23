"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TaxonomyNode } from './types';

const API_BASE_URL = 'https://api.guiji.online';

interface ExtendedNode extends TaxonomyNode {
  english_name?: string;
  children?: ExtendedNode[];
}

// ------------------------------------------------------------------
// 1. 高清画廊组件
// ------------------------------------------------------------------
const ImageViewer: React.FC<{ pageNum: number; onClose: () => void; onNavigate: (p: number) => void }> = ({ pageNum, onClose, onNavigate }) => {
  const [zoom, setZoom] = useState(1);
  const [imgData, setImgData] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && pageNum > 1) onNavigate(pageNum - 1);
      if (e.key === 'ArrowRight') onNavigate(pageNum + 1);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose, onNavigate, pageNum]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setPosition({ x: 0, y: 0 }); 
    fetch(`${API_BASE_URL}/api/v1/pdf/page/${pageNum}`)
      .then(res => res.blob())
      .then(blob => {
        if (isMounted) {
          setImgData(URL.createObjectURL(blob));
          setLoading(false);
          setZoom(1);
        }
      });
    return () => { isMounted = false; if (imgData) URL.revokeObjectURL(imgData); };
  }, [pageNum]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartPos({ x: e.clientX - position.x, y: e.clientY - position.y });
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({ x: e.clientX - startPos.x, y: e.clientY - startPos.y });
  };
  const handleMouseUp = () => setIsDragging(false);

  return (
    <div className="fixed inset-0 bg-black/95 z-[9999] flex flex-col overflow-hidden" onClick={onClose}>
      <div className="flex justify-between items-center px-6 py-4 bg-black/50 text-white z-20" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-4">
          <button onClick={() => onNavigate(pageNum - 1)} disabled={pageNum <= 1} className="hover:text-[#4edea3] disabled:opacity-30">◀ 上一页</button>
          <span className="font-medium tracking-widest text-sm text-gray-300">PAGE {pageNum}</span>
          <button onClick={() => onNavigate(pageNum + 1)} className="hover:text-[#4edea3]">下一页 ▶</button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 mr-4">按住图片可自由拖拽</span>
          <button onClick={() => {setZoom(1); setPosition({x:0, y:0})}} className="text-sm px-3 py-1 hover:bg-white/10 rounded-lg mr-2">还原位置</button>
          <button onClick={() => setZoom(z => z + 0.2)} className="p-2 hover:bg-white/10 rounded-lg"><span className="material-symbols-outlined">zoom_in</span></button>
          <button onClick={() => setZoom(z => Math.max(0.2, z - 0.2))} className="p-2 hover:bg-white/10 rounded-lg"><span className="material-symbols-outlined">zoom_out</span></button>
          <button onClick={onClose} className="p-2 bg-red-500/80 hover:bg-red-500 rounded-lg ml-4"><span className="material-symbols-outlined">close</span></button>
        </div>
      </div>
      
      <div className="flex-1 relative w-full h-full flex justify-center items-center" onClick={e => e.stopPropagation()}>
        {loading ? <div className="text-white text-lg tracking-widest animate-pulse">高清渲染中...</div> : 
          <div 
            className={`absolute ${isDragging ? 'grabbing-cursor' : 'grab-cursor'} transition-transform duration-75`}
            style={{ transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`, transformOrigin: 'center' }}
            onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
          >
            {imgData && <img src={imgData} className="block w-[100vw] max-w-none shadow-[0_0_50px_rgba(0,0,0,0.8)] bg-white select-none pointer-events-none" alt="Page" draggable={false} />}
          </div>
        }
      </div>
    </div>
  );
};

// ------------------------------------------------------------------
// 2. 高密度仪表盘风格 - 家族树递归节点
// ------------------------------------------------------------------
const getRankStyle = (rank: string) => {
  const styles: Record<string, string> = { 
    order: 'border-emerald-500 bg-emerald-50 text-emerald-700', 
    suborder: 'border-blue-500 bg-blue-50 text-blue-700', 
    superfamily: 'border-indigo-500 bg-indigo-50 text-indigo-700', 
    family: 'border-purple-500 bg-purple-50 text-purple-700', 
    genus: 'border-slate-500 bg-slate-50 text-slate-700' 
  };
  return styles[rank.toLowerCase()] || 'border-gray-300 bg-gray-50 text-gray-700';
};

const TreeNode: React.FC<{ 
  node: ExtendedNode; 
  lang: 'zh' | 'en';
  onOpenPdf: (p: number) => void; 
  expandedNodes: Set<string>; 
  searchQuery: string;
}> = ({ node, lang, onOpenPdf, expandedNodes, searchQuery }) => {
  const hasChildren = !!(node.children && node.children.length > 0);
  const [isExpanded, setIsExpanded] = useState(expandedNodes.has(node.name) || node.rank.toLowerCase() === 'order');
  const nodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (expandedNodes.has(node.name)) setIsExpanded(true);
  }, [expandedNodes, node.name]);

  const displayName = lang === 'zh' ? node.name : (node.english_name || node.name);
  
  // 恢复严格匹配模式
  const isMatch = searchQuery.trim() !== '' && (
    node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (node.english_name && node.english_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (node.latin_name && node.latin_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  useEffect(() => {
    if (isMatch && nodeRef.current) {
      setTimeout(() => { nodeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' }); }, 300);
    }
  }, [isMatch]);

  const rankStyle = getRankStyle(node.rank);

  return (
    <li>
      <div className="node-content">
        <div 
          ref={nodeRef} 
          className={`bg-white shadow-sm hover:shadow-lg rounded-lg border border-gray-200 w-[240px] flex flex-col overflow-hidden cursor-pointer transition-all duration-300 ${isMatch ? 'highlight-node' : ''}`}
          onClick={(e) => { e.stopPropagation(); if (hasChildren) setIsExpanded(!isExpanded); }}
        >
          <div className={`px-3 py-1.5 flex justify-between items-center border-b border-gray-100 border-l-4 ${rankStyle}`}>
            <span className="text-[10px] uppercase font-bold tracking-wider">{node.rank}</span>
            {node.page && (
              <button 
                className="text-[10px] font-semibold text-emerald-600 hover:text-white bg-emerald-50 hover:bg-emerald-500 px-2 py-0.5 rounded border border-emerald-200 hover:border-emerald-500 transition-colors"
                onClick={(e) => { e.stopPropagation(); onOpenPdf(node.page!); }}
              >
                {lang === 'zh' ? '查看图鉴' : 'View'}
              </button>
            )}
          </div>
          
          <div className="p-4 flex flex-col items-center text-center bg-white relative">
            <h3 className="text-[15px] font-bold text-gray-900 leading-tight w-full truncate" title={displayName}>{displayName}</h3>
            <p className="text-[11px] italic text-gray-500 mt-1 w-full truncate" title={node.latin_name}>{node.latin_name || 'Unknown'}</p>
            
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
            <TreeNode key={child.id} lang={lang} node={child} onOpenPdf={onOpenPdf} expandedNodes={expandedNodes} searchQuery={searchQuery} />
          ))}
        </ul>
      )}
    </li>
  );
};

// ------------------------------------------------------------------
// 3. 页面主容器
// ------------------------------------------------------------------
export default function TaxonomyClient({ initialTreeData }: { initialTreeData: ExtendedNode }) {
  const [mounted, setMounted] = useState(false);
  const [viewingPage, setViewingPage] = useState<number | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [lang, setLang] = useState<'zh' | 'en'>('zh');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  
  // 增加未找到的定制化弹窗状态
  const [notFoundAlert, setNotFoundAlert] = useState(false);
  const treeContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  const searchTree = useCallback((node: ExtendedNode, keyword: string, path: string[] = []): string[] | null => {
    const currentPath = [...path, node.name];
    if (
      node.name.toLowerCase().includes(keyword.toLowerCase()) || 
      (node.english_name && node.english_name.toLowerCase().includes(keyword.toLowerCase())) ||
      (node.latin_name && node.latin_name.toLowerCase().includes(keyword.toLowerCase()))
    ) {
      return currentPath;
    }
    if (node.children) {
      for (const child of node.children) {
        const result = searchTree(child, keyword, currentPath);
        if (result) return result;
      }
    }
    return null;
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(inputValue);
    
    if (!inputValue.trim()) { 
      setExpandedNodes(new Set()); 
      return; 
    }
    
    const path = searchTree(initialTreeData, inputValue);
    if (path) {
      setExpandedNodes(new Set(path));
      setTimeout(() => { treeContainerRef.current?.scrollIntoView({ behavior: 'smooth' }); }, 100);
    } else {
      // 触发定制化错误弹窗，替换原生 alert()
      setNotFoundAlert(true);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex flex-col relative bg-[#f8f9fa] overflow-x-hidden text-[#191c1d]">
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="flex justify-between items-center h-16 px-6 md:px-12 w-full">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold tracking-tight text-emerald-600">龟迹</span>
            <span className="text-sm font-medium text-gray-400 border-l border-gray-300 pl-3">CheloniaTrace</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="https://github.com/WhereAreMySOCKS/guiji-next" target="_blank" rel="noreferrer" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors hidden sm:block">GitHub</a>
            <a href="https://iucn-tftsg.org/checklist/" target="_blank" rel="noreferrer" className="text-sm font-medium text-gray-500 hover:text-emerald-600 transition-colors hidden sm:block">
              {lang === 'zh' ? '数据源 (IUCN)' : 'Data Source'}
            </a>
            <div className="w-[1px] h-4 bg-gray-300 hidden sm:block"></div>
            <button 
              className="flex items-center gap-1 text-gray-500 hover:text-emerald-600 hover:bg-gray-50 px-2 py-1 rounded transition-colors font-medium cursor-pointer"
              onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
            >
              <span className="material-symbols-outlined text-[18px]">language</span>
              {lang === 'zh' ? 'EN' : '中文'}
            </button>
          </div>
        </div>
      </header>

      <div className="relative z-10 w-full min-h-[calc(100vh-64px)] flex flex-col items-center justify-center px-6 pb-20">
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#191c1d] mb-6 text-center tracking-tight">
          {lang === 'zh' ? '全球龟鳖目图鉴' : 'Global Testudines Database'}
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl text-center mb-12">
          {lang === 'zh' ? '提供详尽的物种分类结构、高清图鉴及权威生态信息查询。' : 'The authoritative scientific resource for taxonomy and spatial distribution.'}
        </p>

        <form onSubmit={handleSearchSubmit} className="relative w-full max-w-3xl flex items-center shadow-md rounded-full bg-white border border-gray-200 focus-within:ring-2 focus-within:ring-emerald-500 transition-all overflow-hidden group">
          <div className="pl-6 text-emerald-600 flex items-center">
            <span className="material-symbols-outlined text-2xl">search</span>
          </div>
          <input 
            className="w-full h-16 px-4 bg-transparent text-lg outline-none border-none placeholder-gray-400" 
            type="text" 
            placeholder={lang === 'zh' ? "请输入物种学名 (例如: Testudines)..." : "Search by Latin Name..."} 
            value={inputValue} 
            onChange={(e) => setInputValue(e.target.value)} 
          />
          <button type="submit" className="h-16 px-8 bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-lg transition-colors flex items-center gap-2 cursor-pointer shrink-0">
            {lang === 'zh' ? '搜索' : 'Search'}
            <span className="material-symbols-outlined text-sm font-bold">arrow_forward</span>
          </button>
        </form>

        <div className="absolute bottom-10 flex flex-col items-center gap-2 text-gray-400 cursor-pointer hover:text-emerald-500 transition-colors" onClick={() => treeContainerRef.current?.scrollIntoView({ behavior: 'smooth' })}>
          <span className="text-xs uppercase tracking-widest font-semibold">{lang === 'zh' ? '下滑探索分类树' : 'Scroll down to explore'}</span>
          <span className="material-symbols-outlined animate-bounce text-2xl mt-1">keyboard_arrow_down</span>
        </div>
      </div>

      <div ref={treeContainerRef} className="w-full bg-[#f8f9fa] border-t border-gray-200 pt-16 flex flex-col min-h-screen">
        <div className="w-full overflow-x-auto custom-scrollbar text-center flex-1 pb-16">
          <div className="inline-block min-w-full px-10">
            <div className="org-tree">
              <ul>
                <TreeNode node={initialTreeData} lang={lang} onOpenPdf={setViewingPage} expandedNodes={expandedNodes} searchQuery={searchQuery} />
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 定制化错误弹窗 */}
      {notFoundAlert && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4" onClick={() => setNotFoundAlert(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center transform transition-all" onClick={e => e.stopPropagation()}>
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-5">
              <span className="material-symbols-outlined text-3xl">search_off</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {lang === 'zh' ? '未找到该学名' : 'Species Not Found'}
            </h3>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
              {lang === 'zh' ? '请检查您输入的学名拼写是否正确，或尝试输入更短的关键字。' : 'Please check your spelling or try a shorter keyword.'}
            </p>
            <button
              onClick={() => setNotFoundAlert(false)}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3 rounded-xl transition-colors shadow-sm"
            >
              {lang === 'zh' ? '我知道了' : 'Got it'}
            </button>
          </div>
        </div>
      )}

      {viewingPage && <ImageViewer pageNum={viewingPage} onClose={() => setViewingPage(null)} onNavigate={setViewingPage} />}
    </div>
  );
}
