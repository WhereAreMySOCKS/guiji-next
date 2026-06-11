"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createTaxonSlug } from '@/lib/taxonomySlug';
import ImageViewer from './ImageViewer';
import TreeNode from './TreeNode';
import type { ExtendedNode } from './TreeNode';

type FocusTarget = { path: string[]; query: string };

function searchTree(node: ExtendedNode, keyword: string, path: string[] = []): string[] | null {
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
}

function buildSlugMap(root: ExtendedNode) {
  const slugCounts = new Map<string, number>();
  const slugById = new Map<string, string>();

  const walk = (node: ExtendedNode) => {
    const base = createTaxonSlug(node);
    const count = (slugCounts.get(base) || 0) + 1;
    slugCounts.set(base, count);
    slugById.set(String(node.id), createTaxonSlug(node, count));

    for (const child of node.children || []) {
      walk(child);
    }
  };

  walk(root);
  return slugById;
}

function findNodeBySlug(root: ExtendedNode, targetSlug: string, lang: 'zh' | 'en'): FocusTarget | null {
  const slugCounts = new Map<string, number>();

  const walk = (node: ExtendedNode, path: string[]): FocusTarget | null => {
    const base = createTaxonSlug(node);
    const count = (slugCounts.get(base) || 0) + 1;
    slugCounts.set(base, count);

    const slug = createTaxonSlug(node, count);
    const currentPath = [...path, node.name];
    if (slug === targetSlug) {
      return {
        path: currentPath,
        query: lang === 'zh' ? node.name : (node.english_name || node.latin_name || node.name),
      };
    }

    for (const child of node.children || []) {
      const match = walk(child, currentPath);
      if (match) return match;
    }

    return null;
  };

  return walk(root, []);
}

export default function TaxonomyClient({ initialTreeData, lang }: { initialTreeData: ExtendedNode; lang: 'zh' | 'en' }) {
  const [viewingPage, setViewingPage] = useState<number | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [notFoundAlert, setNotFoundAlert] = useState(false);

  const [emailCopied, setEmailCopied] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const treeContainerRef = useRef<HTMLDivElement>(null);
  const slugById = useMemo(() => buildSlugMap(initialTreeData), [initialTreeData]);
  const getNodeSlug = useCallback((node: ExtendedNode) => {
    return slugById.get(String(node.id)) || createTaxonSlug(node);
  }, [slugById]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(inputValue);
    if (!inputValue.trim()) { setExpandedNodes(new Set()); return; }

    const path = searchTree(initialTreeData, inputValue);
    if (path) {
      setExpandedNodes(new Set(path));
      setTimeout(() => {
        treeContainerRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      setNotFoundAlert(true);
    }
  };

  useEffect(() => {
    const focusSlug = new URLSearchParams(window.location.search).get('focus');
    if (!focusSlug) return;

    const focusedNode = findNodeBySlug(initialTreeData, focusSlug, lang);
    if (!focusedNode) return;

    setInputValue(focusedNode.query);
    setSearchQuery(focusedNode.query);
    setExpandedNodes(new Set(focusedNode.path));
    setTimeout(() => {
      treeContainerRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  }, [initialTreeData, lang]);

  const handleEmailContact = (e: React.MouseEvent) => {
    e.preventDefault();
    const myEmail = "paulmac1204@gmail.com";
    navigator.clipboard.writeText(myEmail).then(() => {
      setEmailCopied(true);
      setTimeout(() => setEmailCopied(false), 2000);
    });
    window.location.href = `mailto:${myEmail}?subject=${encodeURIComponent(lang === 'zh' ? '龟迹项目交流' : 'CheloniaTrace Inquiry')}`;
  };

  return (
    <div className="min-h-screen flex flex-col relative bg-[#f8f9fa] overflow-x-hidden text-[#191c1d]">
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="flex justify-between items-center h-14 sm:h-16 px-4 sm:px-6 md:px-12 w-full">
          <div className="flex items-center gap-3">
            <a href={`/${lang}`} className="text-xl sm:text-2xl font-bold tracking-tight text-emerald-600">龟迹</a>
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
              href={lang === 'zh' ? '/en/taxonomy' : '/zh/taxonomy'}
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
          {lang === 'zh' ? '全球龟鳖目分类树' : 'Global Testudines Database'}
        </h1>
        <p className="text-base sm:text-lg text-gray-500 max-w-2xl text-center mb-8 sm:mb-12 px-2">
          {lang === 'zh' ? '按目、科、属、种逐层展开，支持学名搜索和原版图鉴翻阅。' : 'The authoritative scientific resource for taxonomy and spatial distribution.'}
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
                <TreeNode node={initialTreeData} lang={lang} onOpenPdf={setViewingPage} expandedNodes={expandedNodes} searchQuery={searchQuery} getNodeSlug={getNodeSlug} />
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
