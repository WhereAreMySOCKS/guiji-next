"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { apiUrl } from '@/lib/api';

interface PdfGuide {
  id: string;
  page_num: number;
  raw_text?: string;
  ai_content_zh: string;
  ai_content_en: string;
  created_at: string;
}

const ImageViewer: React.FC<{
  pageNum: number;
  onClose: () => void;
  onNavigate: (p: number) => void;
  lang: 'zh' | 'en';
}> = ({ pageNum, onClose, onNavigate, lang }) => {
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
  }, [pageNum]);

  useEffect(() => {
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

    setImgData(apiUrl(`/pdf/page/${pageNum}`));
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
      const res = await fetch(apiUrl(`/pdf/page/${pageNum}/guide`), {
        signal: abortControllerRef.current.signal
      });
      if (res.status === 404) {
        setGuideError(lang === 'zh' ? '该页暂未生成 AI 导读。' : 'AI Guide is not available for this page.');
        return;
      }
      if (!res.ok) throw new Error('API Error');
      const data = await res.json();
      setGuideData(data);
    } catch (e: unknown) {
      if (e instanceof Error && e.name === 'AbortError') return;
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
    } catch {
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

export default ImageViewer;
