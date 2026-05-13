"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TaxonomyNode } from './types';

const API_BASE_URL = 'https://api.guiji.online';

export interface ExtendedNode extends TaxonomyNode {
  english_name?: string;
  children?: ExtendedNode[];
}

interface PdfGuide {
  id: string;
  page_num: number;
  raw_text?: string;
  ai_content_zh: string;
  ai_content_en: string;
  created_at: string;
}

const ImageViewer: React.FC<{ pageNum: number; onClose: () => void; onNavigate: (p: number) => void; lang: 'zh' | 'en' }> = ({ pageNum, onClose, onNavigate, lang }) => {
  const [zoom, setZoom] = useState(1);
  const [imgData, setImgData] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  
  const [showGuide, setShowGuide] = useState(false);
  const [guideLoading, setGuideLoading] = useState(false);
  const [guideData, setGuideData] = useState<PdfGuide | null>(null);
  const [guideError, setGuideError] = useState<string | null>(null);
  
  const [activeGuideIndex, setActiveGuideIndex] = useState(0);
  const [ocrCopied, setOcrCopied] = useState(false);
  const [toolbarVisible, setToolbarVisible] = useState(true);
  
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // 修复闭包陷阱：缓存最新的回调函数，避免键盘事件重复绑定
  const onCloseRef = useRef(onClose);
  const onNavigateRef = useRef(onNavigate);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);
  useEffect(() => { onNavigateRef.current = onNavigate; }, [onNavigate]);

  const resetHideTimer = useCallback(() => {
    setToolbarVisible(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => setToolbarVisible(false), 3000);
  }, []);

  useEffect(() => {
    resetHideTimer();
    return () => { if (hideTimerRef.current) clearTimeout(hideTimerRef.current); };
  }, [pageNum, resetHideTimer]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current();
      if (e.key === 'ArrowLeft' && pageNum > 1) onNavigateRef.current(pageNum - 1);
      if (e.key === 'ArrowRight') onNavigateRef.current(pageNum + 1);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [pageNum]); // 仅依赖 pageNum，回调使用 Ref

  useEffect(() => {
    // 阻断上一页未完成的 AI 导读请求，防止竞态覆盖
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setLoading(true);
    setPosition({ x: 0, y: 0 }); 
    setShowGuide(false);
    setGuideData(null);
    setGuideError(null);
    setActiveGuideIndex(0); 
    setOcrCopied(false);
    setZoom(1);

    setImgData(`${API_BASE_URL}/api/v1/pdf/page/${pageNum}`);
  }, [pageNum]);

  const handleToggleGuide = async () => {
    if (showGuide) {
      setShowGuide(false);
      return;
    }
    setShowGuide(true);
    if (guideData) return;

    setGuideLoading(true);
    setGuideError(null);
    
    abortControllerRef.current = new AbortController();

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/pdf/page/${pageNum}/guide`, {
        signal: abortControllerRef.current.signal
      });
      if (res.status === 404) {
        setGuideError(lang === 'zh' ? '该页暂未生成 AI 导读。' : 'AI Guide is not available for this page.');
        return;
      }
      if (!res.ok) throw new Error('API Error');
      const data = await res.json();
      setGuideData(data);
    } catch (e: any) {
      if (e.name === 'AbortError') return; // 忽略被主动取消的请求错误
      setGuideError(lang === 'zh' ? '导读加载失败，请检查网络。' : 'Failed to load guide. Please try again.');
    } finally {
      setGuideLoading(false);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartPos({ x: e.clientX - position.x, y: e.clientY - position.y });
    resetHideTimer();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({ x: e.clientX - startPos.x, y: e.clientY - startPos.y });
  };
  const handleMouseUp = () => setIsDragging(false);

  const pinchRef = useRef<{ startDist: number; startZoom: number }>({ startDist: 0, startZoom: 1 });

  const getTouchDist = (touches: React.TouchList) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    resetHideTimer();
    if (e.touches.length === 2) {
      setIsDragging(false);
      pinchRef.current = { startDist: getTouchDist(e.touches), startZoom: zoom };
    } else if (e.touches.length === 1) {
      setIsDragging(true);
      setStartPos({ x: e.touches[0].clientX - position.x, y: e.touches[0].clientY - position.y });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const ratio = getTouchDist(e.touches) / pinchRef.current.startDist;
      setZoom(Math.max(0.5, Math.min(5, pinchRef.current.startZoom * ratio)));
    } else if (isDragging && e.touches.length === 1) {
      setPosition({ x: e.touches[0].clientX - startPos.x, y: e.touches[0].clientY - startPos.y });
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length === 0) {
      setIsDragging(false);
    } else if (e.touches.length === 1) {
      setIsDragging(true);
      setStartPos({ x: e.touches[0].clientX - position.x, y: e.touches[0].clientY - position.y });
    }
  };

  const handleCopyOCR = (e: React.MouseEvent) => {
    e.preventDefault();
    if (guideData?.raw_text) {
      navigator.clipboard.writeText(guideData.raw_text).then(() => {
        setOcrCopied(true);
        setTimeout(() => setOcrCopied(false), 2000);
      });
    }
  };

  const getParsedGuideData = () => {
    if (!guideData) return [];
    try {
      const targetString = lang === 'zh' ? guideData.ai_content_zh : guideData.ai_content_en;
      const parsed = JSON.parse(targetString);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch (e) {
      console.error("JSON parse error:", e);
      return [];
    }
  };

  const parsedGuides = getParsedGuideData();
  const currentGuide = parsedGuides[activeGuideIndex] || {};

  return (
    <div className="fixed inset-0 bg-black/95 z-[9999] overflow-hidden overscroll-none" onClick={onClose}>
      
      <div
        className={`absolute top-0 left-0 w-full bg-black/50 backdrop-blur-md text-white z-20 transition-transform duration-300 flex items-center justify-between px-3 sm:px-6 py-2 sm:py-3 ${toolbarVisible ? 'translate-y-0' : '-translate-y-full'}`}
        onClick={e => { e.stopPropagation(); resetHideTimer(); }}
      >
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <button onClick={() => { onNavigate(pageNum - 1); resetHideTimer(); }} disabled={pageNum <= 1} className="text-sm sm:text-base hover:text-[#4edea3] disabled:opacity-30 px-2 py-1">◀</button>
          <span className="font-mono tracking-widest text-xs sm:text-sm text-gray-300 min-w-[60px] text-center">P{pageNum}</span>
          <button onClick={() => { onNavigate(pageNum + 1); resetHideTimer(); }} className="text-sm sm:text-base hover:text-[#4edea3] px-2 py-1">▶</button>
        </div>

        <div className="flex items-center justify-center gap-2 flex-1 px-4">
          <button onClick={() => { handleToggleGuide(); resetHideTimer(); }} className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all shadow-sm ${showGuide ? 'bg-emerald-500 text-white' : 'bg-white/10 hover:bg-white/20'}`}>
            <span className="material-symbols-outlined text-[16px] sm:text-[18px]">auto_awesome</span>
            <span className="hidden sm:inline">{lang === 'zh' ? 'AI 导读' : 'AI Guide'}</span>
          </button>
          <span className="text-[10px] text-gray-400 hidden sm:inline mx-1">{lang === 'zh' ? '拖拽/捏合移动' : 'Drag/pinch to move'}</span>
          <button onClick={() => {setZoom(1); setPosition({x:0, y:0}); resetHideTimer();}} className="hidden sm:inline text-xs sm:text-sm px-2 sm:px-3 py-1.5 hover:bg-white/10 rounded-lg">{lang === 'zh' ? '还原' : 'Reset'}</button>
          <button onClick={() => { setZoom(z => Math.min(5, z + 0.3)); resetHideTimer(); }} className="hidden sm:inline p-1.5 sm:p-2 hover:bg-white/10 rounded-lg"><span className="material-symbols-outlined text-[18px] sm:text-[20px]">zoom_in</span></button>
          <button onClick={() => { setZoom(z => Math.max(0.5, z - 0.3)); resetHideTimer(); }} className="hidden sm:inline p-1.5 sm:p-2 hover:bg-white/10 rounded-lg"><span className="material-symbols-outlined text-[18px] sm:text-[20px]">zoom_out</span></button>
        </div>

        <button onClick={onClose} className="p-2 bg-red-500/80 hover:bg-red-500 rounded-lg shrink-0">
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>

      <div className="absolute inset-0 flex justify-center items-center" onClick={e => { e.stopPropagation(); resetHideTimer(); }}>
        
        {showGuide && (
          <div className="absolute top-[70px] right-6 w-[calc(100vw-48px)] sm:w-[400px] md:w-[480px] max-h-[80vh] flex flex-col bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl z-50 overflow-hidden text-gray-800 border border-white/40">
            
            <div className="flex justify-between items-center p-5 pb-3 border-b border-gray-100 shrink-0">
              <h3 className="font-bold text-lg flex items-center gap-2 text-emerald-700">
                <span className="material-symbols-outlined text-xl">auto_awesome</span>
                {lang === 'zh' ? '内容提取与导读' : 'Content Analysis'}
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-5 pt-3">
              {guideLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-gray-500">
                  <span className="material-symbols-outlined animate-spin text-3xl text-emerald-500">autorenew</span>
                  <span className="text-sm">{lang === 'zh' ? '正在智能解析图鉴内容...' : 'Analyzing encyclopedia content...'}</span>
                </div>
              ) : guideError ? (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm leading-relaxed border border-red-100">
                  {guideError}
                </div>
              ) : guideData ? (
                <div className="flex flex-col">
                  {parsedGuides.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-4 mb-4 border-b border-gray-100 custom-scrollbar shrink-0">
                      {parsedGuides.map((guide, idx) => {
                        const tabName = guide['学名'] || guide['Scientific Name'] || `${lang === 'zh' ? '物种' : 'Species'} ${idx + 1}`;
                        return (
                          <button
                            key={idx}
                            onClick={() => setActiveGuideIndex(idx)}
                            className={`px-3 py-1.5 whitespace-nowrap text-[13px] font-bold rounded-lg transition-colors ${
                              activeGuideIndex === idx 
                                ? 'bg-emerald-100 text-emerald-800 shadow-sm border border-emerald-200' 
                                : 'text-gray-500 hover:bg-gray-100 border border-transparent'
                            }`}
                          >
                            {tabName}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {parsedGuides.length > 0 ? (
                    <div className="flex flex-col gap-4">
                      {Object.entries(currentGuide).map(([key, value], idx) => {
                        if (key === '学名' || key === 'Scientific Name') return null;
                        return (
                          <div key={idx} className="text-[14px]">
                            <h4 className="font-bold text-emerald-700 mb-1.5 flex items-center gap-1.5">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                              {key}
                            </h4>
                            <p className="text-gray-600 leading-relaxed text-justify">
                              {value as string}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-[14px] text-gray-600 leading-relaxed">
                      {lang === 'zh' ? guideData.ai_content_zh : guideData.ai_content_en}
                    </div>
                  )}

                  {guideData.raw_text && (
                    <div className="mt-6 pt-5 border-t border-dashed border-gray-200">
                      <button 
                        onClick={handleCopyOCR}
                        className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold transition-all duration-300 ${
                          ocrCopied 
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-sm' 
                            : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100 hover:text-gray-700'
                        }`}
                      >
                        {ocrCopied ? (
                          <>
                            <span className="material-symbols-outlined text-[16px]">check_circle</span>
                            {lang === 'zh' ? '已复制' : 'OCR Text Copied!'}
                          </>
                        ) : (
                          <>
                            <span className="material-symbols-outlined text-[16px]">content_copy</span>
                            {lang === 'zh' ? '点击复制 OCR 识别结果' : 'Copy OCR Extracted Text'}
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        )}

        {loading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/40 backdrop-blur-md pointer-events-none transition-opacity duration-300">
            <span className="material-symbols-outlined animate-spin text-5xl text-emerald-500 mb-4 drop-shadow-lg">autorenew</span>
            <div className="text-white text-lg font-medium tracking-widest animate-pulse drop-shadow-md">
              {lang === 'zh' ? '高清渲染中...' : 'Rendering...'}
            </div>
          </div>
        )}

        <div className={`absolute ${isDragging ? 'grabbing-cursor' : 'grab-cursor'} transition-transform duration-75`}
          style={{ transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`, transformOrigin: 'center', touchAction: 'none' }}
          onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}
        >
          {imgData && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={imgData} onLoad={() => setLoading(false)} 
              className={`block w-[95vw] sm:w-[85vw] md:w-[75vw] max-w-[1000px] shadow-[0_0_50px_rgba(0,0,0,0.8)] bg-white select-none pointer-events-none transition-all duration-300 ease-in-out ${loading ? 'opacity-30 blur-sm scale-95' : 'opacity-100 blur-0 scale-100'}`} 
              alt="Page" draggable={false} 
            />
          )}          
        </div>
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
            <TreeNode key={child.id} lang={lang} node={child as ExtendedNode} onOpenPdf={onOpenPdf} expandedNodes={expandedNodes} searchQuery={searchQuery} />
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
  
  const [emailCopied, setEmailCopied] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      // 简化滚动逻辑：将滚动委托给目标节点的 useEffect，此处仅保证容器进入视野
      setTimeout(() => {
        treeContainerRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      setNotFoundAlert(true);
    }
  };
  
  const handleEmailContact = (e: React.MouseEvent) => {
    e.preventDefault();
    const myEmail = "paulmac1204@gmail.com";
    navigator.clipboard.writeText(myEmail).then(() => {
      setEmailCopied(true);
      setTimeout(() => setEmailCopied(false), 2000); 
    });
    window.location.href = `mailto:${myEmail}?subject=${encodeURIComponent(lang === 'zh' ? '龟迹项目交流' : 'CheloniaTrace Inquiry')}`;
  };

  if (!mounted) return null;
  
  return (
    <div className="min-h-screen flex flex-col relative bg-[#f8f9fa] overflow-x-hidden text-[#191c1d]">
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="flex justify-between items-center h-14 sm:h-16 px-4 sm:px-6 md:px-12 w-full">
          <div className="flex items-center gap-3">
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-emerald-600">龟迹</span>
            <span className="text-xs sm:text-sm font-medium text-gray-400 border-l border-gray-300 pl-2 sm:pl-3 hidden sm:inline">CheloniaTrace</span>
          </div>
          <div className="flex items-center gap-4">
            
            <button 
              onClick={handleEmailContact}
              className={`flex items-center gap-1.5 text-sm font-medium transition-all duration-300 hidden sm:flex px-2 py-1 rounded-md cursor-pointer ${
                emailCopied 
                  ? 'text-emerald-500 bg-emerald-50 scale-95' 
                  : 'text-gray-500 hover:text-emerald-600 hover:bg-gray-50 active:scale-95'
              }`}
            >
              {emailCopied ? (
                <>
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  {lang === 'zh' ? '邮箱已复制' : 'Copied!'}
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">mail</span>
                  {lang === 'zh' ? '联系我' : 'Email Me'}
                </>
              )}
            </button>

            <a href="https://iucn-tftsg.org/checklist/" target="_blank" rel="noreferrer" className="text-sm font-medium text-gray-500 hover:text-emerald-600 transition-colors hidden sm:block">
              {lang === 'zh' ? '数据源 (IUCN)' : 'Data Source'}
            </a>
            <div className="w-[1px] h-4 bg-gray-300 hidden sm:block"></div>

            <div className="relative sm:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-100 text-gray-500 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[22px]">more_vert</span>
              </button>
              {mobileMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMobileMenuOpen(false)}></div>
                  <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 py-2 min-w-[160px] z-20">
                    <button
                      onClick={(e) => { handleEmailContact(e); setMobileMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 hover:text-emerald-600 transition-colors text-left cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">mail</span>
                      {lang === 'zh' ? '联系我' : 'Email Me'}
                    </button>
                    <a
                      href="https://iucn-tftsg.org/checklist/"
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 hover:text-emerald-600 transition-colors no-underline"
                    >
                      <span className="material-symbols-outlined text-[18px]">dataset</span>
                      {lang === 'zh' ? '数据源 (IUCN)' : 'Data Source'}
                    </a>
                  </div>
                </>
              )}
            </div>

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

      <div className="relative z-10 w-full min-h-[calc(100vh-64px)] flex flex-col items-center justify-center px-4 sm:px-6 pb-16 sm:pb-20">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#191c1d] mb-4 sm:mb-6 text-center tracking-tight">
          {lang === 'zh' ? '全球龟鳖目图鉴' : 'Global Testudines Database'}
        </h1>
        <p className="text-base sm:text-lg text-gray-500 max-w-2xl text-center mb-8 sm:mb-12 px-2">
          {lang === 'zh' ? '提供详尽的物种分类结构、高清图鉴及权威生态信息查询。' : 'The authoritative scientific resource for taxonomy and spatial distribution.'}
        </p>
        <form onSubmit={handleSearchSubmit} className="relative w-full max-w-3xl flex items-center shadow-md rounded-full bg-white border border-gray-200 focus-within:ring-2 focus-within:ring-emerald-500 transition-all overflow-hidden group">
          <div className="pl-6 text-emerald-600 flex items-center"><span className="material-symbols-outlined text-2xl">search</span></div>
          <input className="w-full h-14 md:h-16 px-4 bg-transparent text-base md:text-lg outline-none border-none placeholder-gray-400" type="text"
            placeholder={lang === 'zh' ? "请输入物种学名 (例如: Testudines)..." : "Search by Latin Name..."} 
            value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
          <button type="submit" className="h-14 md:h-16 px-6 md:px-8 bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-base md:text-lg transition-colors flex items-center gap-2 cursor-pointer shrink-0">
            {lang === 'zh' ? '搜索' : 'Search'}<span className="material-symbols-outlined text-sm font-bold">arrow_forward</span>
          </button>
        </form>
        <div className="absolute bottom-10 flex flex-col items-center gap-2 text-gray-400 cursor-pointer hover:text-emerald-500 transition-colors" onClick={() => treeContainerRef.current?.scrollIntoView({ behavior: 'smooth' })}>
          <span className="text-xs uppercase tracking-widest font-semibold">{lang === 'zh' ? '下滑探索分类树' : 'Scroll down to explore'}</span>
          <span className="material-symbols-outlined animate-bounce text-2xl mt-1">keyboard_arrow_down</span>
        </div>
      </div>

      <div ref={treeContainerRef} className="w-full bg-[#f8f9fa] border-t border-gray-200 pt-10 sm:pt-16 flex flex-col min-h-screen">
        <div className="w-full overflow-x-auto custom-scrollbar text-center flex-1 pb-16">
          <div className="inline-block min-w-full px-4 md:px-10">
            <div className={`org-tree ${searchQuery ? 'search-active' : ''}`}>
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

      {viewingPage && <ImageViewer pageNum={viewingPage} onClose={() => setViewingPage(null)} onNavigate={setViewingPage} lang={lang} />}
    </div>
  );
}