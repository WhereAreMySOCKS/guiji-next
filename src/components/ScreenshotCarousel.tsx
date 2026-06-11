"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";

const SCREENSHOTS = [
  { src: "/images/screenshots/screenshot-1.jpg", alt: "首页" },
  { src: "/images/screenshots/screenshot-2.jpg", alt: "喂食策略" },
  { src: "/images/screenshots/screenshot-3.jpg", alt: "环境监控" },
  { src: "/images/screenshots/screenshot-4.jpg", alt: "设备管理" },
  { src: "/images/screenshots/screenshot-5.jpg", alt: "更多功能" },
];

export default function ScreenshotCarousel({ 
  paused, 
  hideDots 
}: { 
  paused?: boolean; 
  hideDots?: boolean 
}) {  
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const n = SCREENSHOTS.length;
  const effectivePaused = paused || isPaused;

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + n) % n);
  }, [n]);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % n);
  }, [n]);

  useEffect(() => {
    if (effectivePaused) return;
    const timer = setInterval(next, 4000);
    return () => clearInterval(timer);
  }, [effectivePaused, next]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 50) {
      if (delta > 0) prev();
      else next();
      setIsPaused(true);
    }
    touchStartX.current = null;
  };

  return (
    <div
      className="group w-full select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      role="region"
      aria-label="应用截图轮播"
      aria-roledescription="carousel"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") { prev(); setIsPaused(true); }
        if (e.key === "ArrowRight") { next(); setIsPaused(true); }
      }}
    >
      {/* 1. 外层金属质感中框 (模拟 iPhone 钛金属/不锈钢边缘) */}
      <div className="relative mx-auto w-full aspect-[9/19.5] rounded-[2.5rem] sm:rounded-[3rem] bg-[#2a2b2e] p-[3px] sm:p-1 shadow-2xl ring-1 ring-black/50">
        
        {/* 左侧按键 */}
        <div className="absolute -left-[5px] sm:-left-[6px] top-[18%] h-[6%] w-[3px] sm:w-[4px] rounded-l-md bg-[#2a2b2e] shadow-[inset_1px_0_1px_rgba(255,255,255,0.1)]" />
        <div className="absolute -left-[5px] sm:-left-[6px] top-[28%] h-[10%] w-[3px] sm:w-[4px] rounded-l-md bg-[#2a2b2e] shadow-[inset_1px_0_1px_rgba(255,255,255,0.1)]" />
        <div className="absolute -left-[5px] sm:-left-[6px] top-[41%] h-[10%] w-[3px] sm:w-[4px] rounded-l-md bg-[#2a2b2e] shadow-[inset_1px_0_1px_rgba(255,255,255,0.1)]" />
        
        {/* 右侧电源键 */}
        <div className="absolute -right-[5px] sm:-right-[6px] top-[30%] h-[15%] w-[3px] sm:w-[4px] rounded-r-md bg-[#2a2b2e] shadow-[inset_-1px_0_1px_rgba(255,255,255,0.1)]" />

        {/* 2. 内层黑色边框 (屏幕黑边) */}
        <div className="relative h-full w-full rounded-[2.35rem] sm:rounded-[2.85rem] bg-black p-1.5 sm:p-2 shadow-[inset_0_0_2px_rgba(255,255,255,0.1)]">
          
          {/* 3. 屏幕显示区域 */}
          <div
            className="relative h-full w-full overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] bg-slate-950"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            {/* 灵动岛 (带微弱反光模拟传感器细节) */}
            <div className="absolute left-1/2 top-1.5 sm:top-2 z-30 flex h-[20px] sm:h-[24px] w-[70px] sm:w-[82px] -translate-x-1/2 items-center justify-end rounded-full bg-black px-1.5 shadow-[inset_0_-1px_1px_rgba(255,255,255,0.15)]">
               <div className="h-1.5 w-1.5 rounded-full bg-indigo-950/80 shadow-[inset_0_0_1px_rgba(255,255,255,0.4)]" />
            </div>

            {/* 截图轮播 */}
            {SCREENSHOTS.map((shot, index) => (
              <div
                key={shot.src}
                className={`absolute inset-0 transition-all duration-500 motion-reduce:transition-none ${
                  index === current
                    ? "z-10 opacity-100 scale-100"
                    : "z-0 opacity-0 scale-[1.03]"
                }`}
                aria-hidden={index !== current}
              >
                <Image
                  src={shot.src}
                  alt={shot.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 290px, 360px"
                  priority={index === 0}
                />
              </div>
            ))}

            {/* 左右导航控制 */}
            <button
              onClick={(e) => { e.stopPropagation(); prev(); setIsPaused(true); }}
              className="absolute left-2 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/25 text-white opacity-0 backdrop-blur-sm transition-opacity duration-200 hover:bg-black/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white group-hover:opacity-100 group-focus-within:opacity-100 max-md:opacity-100 cursor-pointer"
              aria-label="上一张"
            >
              <span className="material-symbols-outlined text-xl">chevron_left</span>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); next(); setIsPaused(true); }}
              className="absolute right-2 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/25 text-white opacity-0 backdrop-blur-sm transition-opacity duration-200 hover:bg-black/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white group-hover:opacity-100 group-focus-within:opacity-100 max-md:opacity-100 cursor-pointer"
              aria-label="下一张"
            >
              <span className="material-symbols-outlined text-xl">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* 底部指示点 */}
      {!hideDots && (
        <div className="mt-5 flex justify-center gap-2" role="tablist" aria-label="截图列表">
          {SCREENSHOTS.map((shot, index) => (
            <button
              key={shot.src}
              role="tab"
              aria-selected={index === current}
              aria-label={`${shot.alt}，第 ${index + 1} 张`}
              onClick={() => { setCurrent(index); setIsPaused(true); }}
              className={`cursor-pointer rounded-full transition-all duration-300 motion-reduce:transition-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 ${
                index === current
                  ? "h-2.5 w-8 bg-emerald-600"
                  : "h-2.5 w-2.5 bg-slate-300 hover:bg-slate-400"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}