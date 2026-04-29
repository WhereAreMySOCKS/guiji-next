"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TaxonomyNode } from './types';

const API_BASE_URL = 'https://api.guiji.online';

interface ExtendedNode extends TaxonomyNode {
  english_name?: string;
  children?: ExtendedNode[];
}

// 新增：AI 导读数据接口
interface PdfGuide {
  id: string;
  page_num: number;
  raw_text?: string;
  ai_content: string;
  created_at: string;
}

const ImageViewer: React.FC<{ pageNum: number; onClose: () => void; onNavigate: (p: number) => void; lang: 'zh' | 'en' }> = ({ pageNum, onClose, onNavigate, lang }) => {
  const [zoom, setZoom] = useState(1);
  const [imgData, setImgData] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  // AI 导读状态管理
  const [showGuide, setShowGuide] = useState(false);
  const [guideLoading, setGuideLoading] = useState(false);
  const [guideData, setGuideData] = useState<PdfGuide | null>(null);
  const [guideError, setGuideError] = useState<string | null>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && pageNum > 1) onNavigate(pageNum - 1);
      if (e.key === 'ArrowRight') onNavigate(pageNum + 1);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose, onNavigate, pageNum]);

  // 当页码变化时，重新获取图片并重置导读状态
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setPosition({ x: 0, y: 0 }); 
    setShowGuide(false);
    setGuideData(null);
    setGuideError(null);

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

  // 拉取 AI 导读数据
  const handleToggleGuide = async () => {
    if (showGuide) {
      setShowGuide(false);
      return;
    }
    setShowGuide(true);
    if (guideData) return; // 已有缓存数据则不重复请求

    setGuideLoading(true);
    setGuideError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/pdf/page/${pageNum}/guide`);
      if (res.status === 404) {
        setGuideError(lang === 'zh' ? '该页暂未生成 AI 导读。' : 'AI Guide is not available for this page.');
        return;
      }
      if (!res.ok) throw new Error('API Error');
      const data = await res.json();
      setGuideData(data);
    } catch (e) {
      setGuideError(lang === 'zh' ? '导读加载失败，请检查网络。' : 'Failed to load guide. Please try again.');
    } finally {
      setGuideLoading(false);
    }
  };

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
          <button onClick={() => onNavigate(pageNum - 1)} disabled={pageNum <= 1} className="hover:text-[#4edea3] disabled:opacity-30">◀ {lang === 'zh' ? '上一页' : 'Prev'}</button>
          <span className="font-medium tracking-widest text-sm text-gray-300">PAGE {pageNum}</span>
          <button onClick={() => onNavigate(pageNum + 1)} className="hover:text-[#4edea3]">{lang === 'zh' ? '下一页' : 'Next'} ▶</button>
        </div>
        <div className="flex items-center gap-2">
          {/* AI 导读触发按钮 */}
          <button onClick={handleToggleGuide} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors mr-4 ${showGuide ? 'bg-emerald-500 text-white' : 'bg-white/10 hover:bg-white/20'}`}>
            <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
            {lang === 'zh' ? 'AI 导读' : 'AI Guide'}
          </button>

          <span className="text-xs text-gray-400 mr-4 hidden sm:inline">{lang === 'zh' ? '按住图片可自由拖拽' : 'Drag to move'}</span>
          <button onClick={() => {setZoom(1); setPosition({x:0, y:0})}} className="text-sm px-3 py-1 hover:bg-white/10 rounded-lg mr-2">{lang === 'zh' ? '还原' : 'Reset'}</button>
          <button onClick={() => setZoom(z => z + 0.2)} className="p-2 hover:bg-white/10 rounded-lg"><span className="material-symbols-outlined">zoom_in</span></button>
          <button onClick={() => setZoom(z => Math.max(0.2, z - 0.2))} className="p-2 hover:bg-white/10 rounded-lg"><span className="material-symbols-outlined">zoom_out</span></button>
          <button onClick={onClose} className="p-2 bg-red-500/80 hover:bg-red-500 rounded-lg ml-4"><span className="material-symbols-outlined">close</span></button>
        </div>
      </div>

      <div className="flex-1 relative w-full h-full flex justify-center items-center" onClick={e => e.stopPropagation()}>
        {/* 悬浮的 AI 导读面板 */}
        {showGuide && (
          <div className="absolute top-6 right-6 w-80 max-h-[80vh] overflow-y-auto bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl z-50 p-5 flex flex-col text-gray-800 border border-white/20 custom-scrollbar">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg flex items-center gap-2 text-emerald-700">
                <span className="material-symbols-outlined text-xl">auto_awesome</span>
                {lang === 'zh' ? 'AI 导读' : 'AI Guide'}
              </h3>
            </div>

            {guideLoading ? (
              <div className="flex flex-col items-center justify-center py-10 gap-3 text-gray-500">
                <span className="material-symbols-outlined animate-spin text-3xl text-emerald-500">autorenew</span>
                <span className="text-sm">{lang === 'zh' ? '正在解析...' : 'Analyzing...'}</span>
              </div>
            ) : guideError ? (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm leading-relaxed border border-red-100">
                {guideError}
              </div>
            ) : guideData ? (
              <div className="flex flex-col gap-4">
                <div className="text-[15px] leading-relaxed font-medium">
                  {guideData.ai_content}
                </div>
                {guideData.raw_text && (
                  <div className="mt-2 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-400 font-semibold mb-2 tracking-widest uppercase">
                      {lang === 'zh' ? '原文提取' : 'Extracted Text'}
                    </p>
                    <div className="bg-gray-50 text-gray-600 text-[13px] leading-relaxed p-3 rounded-xl max-h-40 overflow-y-auto custom-scrollbar border border-gray-100">
                      {guideData.raw_text}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        )}

        {loading ? <div className="text-white text-lg tracking-widest animate-pulse">{lang === 'zh' ? '高清渲染中...' : 'Rendering...'}</div> : 
          <div className={`absolute ${isDragging ? 'grabbing-cursor' : 'grab-cursor'} transition-transform duration-75`}
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

const TreeNode: React.FC<{ node: ExtendedNode; lang: 'zh' | 'en'; onOpenPdf: (p: number) => void; expandedNodes: Set<string>; searchQuery: string; }> = ({ node, lang, onOpenPdf, expandedNodes, searchQuery }) => {
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
      setTimeout(() => { nodeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' }); }, 300);
    }
  }, [isMatch]);

  const rankStyle = getRankStyle(node.rank);

  return (
    <li>
      <div className="node-content">
        <div ref={nodeRef} className={`bg-white shadow-sm hover:shadow-lg rounded-lg border border-gray-200 w-[240px] flex flex-col overflow-hidden cursor-pointer transition-all duration-300 ${isMatch ? 'highlight-node' : ''}`}
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

export default function TaxonomyClient({ initialTreeData, lang }: { initialTreeData: ExtendedNode, lang: 'zh' | 'en' }) {
  const [mounted, setMounted] = useState(false);
  const [viewingPage, setViewingPage] = useState<number | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
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
    if (!inputValue.trim()) { setExpandedNodes(new Set()); return; }
    const path = searchTree(initialTreeData, inputValue);
    if (path) {
      setExpandedNodes(new Set(path));
      setTimeout(() => { treeContainerRef.current?.scrollIntoView({ behavior: 'smooth' }); }, 100);
    } else {
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
            <a 
              href={lang === 'zh' ? '/en' : '/zh'}
              className="flex items-center gap-1 text-gray-500 hover:text-emerald-600 hover:bg-gray-50 px-2 py-1 rounded transition-colors font-medium cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">language</span>
              {lang === 'zh' ? 'EN' : '中文'}
            </a>
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
          <div className="pl-6 text-emerald-600 flex items-center"><span className="material-symbols-outlined text-2xl">search</span></div>
          <input className="w-full h-16 px-4 bg-transparent text-lg outline-none border-none placeholder-gray-400" type="text" 
            placeholder={lang === 'zh' ? "请输入物种学名 (例如: Testudines)..." : "Search by Latin Name..."} 
            value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
          <button type="submit" className="h-16 px-8 bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-lg transition-colors flex items-center gap-2 cursor-pointer shrink-0">
            {lang === 'zh' ? '搜索' : 'Search'}<span className="material-symbols-outlined text-sm font-bold">arrow_forward</span>
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

      {notFoundAlert && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4" onClick={() => setNotFoundAlert(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center transform transition-all" onClick={e => e.stopPropagation()}>
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-5"><span className="material-symbols-outlined text-3xl">search_off</span></div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{lang === 'zh' ? '未找到该学名' : 'Species Not Found'}</h3>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">{lang === 'zh' ? '请检查您输入的学名拼写是否正确，或尝试输入更短的关键字。' : 'Please check your spelling or try a shorter keyword.'}</p>
            <button onClick={() => setNotFoundAlert(false)} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3 rounded-xl transition-colors shadow-sm">
              {lang === 'zh' ? '我知道了' : 'Got it'}
            </button>
          </div>
        </div>
      )}

      {/* 修改点：挂载 ImageViewer 时向下传递 lang 属性 */}
      {viewingPage && <ImageViewer pageNum={viewingPage} onClose={() => setViewingPage(null)} onNavigate={setViewingPage} lang={lang} />}
    </div>
  );
}