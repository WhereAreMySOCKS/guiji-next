import type { Metadata } from "next";

const dictionaries = {
  zh: {
    title: '龟迹 CheloniaTrace | 智能喂食 · 龟鳖百科 · 下载APP',
    description: '龟迹（CheloniaTrace）提供智能喂食策略在线计算、龟鳖目物种百科、研究资料库和养龟助手APP下载。',
    keywords: ['智能喂食', '龟类喂食策略', '乌龟喂食计算器', '龟鳖百科', '龟鳖目物种', '乌龟大全', '养龟助手', '龟迹 App', 'CheloniaTrace'],
  },
  en: {
    title: 'CheloniaTrace | Smart Feeding · Turtle Encyclopedia · App',
    description: 'CheloniaTrace offers a smart turtle feeding calculator, Testudines encyclopedia, research database, and turtle care assistant app.',
    keywords: ['Turtle Feeding Calculator', 'CheloniaTrace', 'Testudines', 'Turtle Encyclopedia', 'Turtle Taxonomy', 'Tortoise Database', 'Turtle Care App'],
  }
};

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const lang = resolvedParams.lang === 'en' ? 'en' : 'zh';
  const dict = dictionaries[lang];
  const baseUrl = 'https://www.guiji.online';

  return {
    title: dict.title,
    description: dict.description,
    keywords: dict.keywords,
    authors: [{ name: 'CheloniaTrace Team' }],
    creator: 'CheloniaTrace',
    alternates: {
      canonical: `${baseUrl}/${lang}`,
      languages: {
        'zh-CN': `${baseUrl}/zh`,
        'en-US': `${baseUrl}/en`,
      },
    },
    openGraph: {
      title: dict.title,
      description: dict.description,
      url: `${baseUrl}/${lang}`,
      siteName: 'CheloniaTrace',
      locale: lang === 'zh' ? 'zh_CN' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: dict.title,
      description: dict.description,
    },
  };
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const resolvedParams = await params;
  const lang = resolvedParams.lang === 'en' ? 'en' : 'zh';

  const jsonLd = lang === "zh"
    ? {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "WebSite",
            "name": "龟迹 CheloniaTrace",
            "alternateName": "智能喂食策略与龟鳖百科",
            "url": "https://www.guiji.online",
            "description": "智能喂食策略在线计算、龟鳖目物种百科、研究资料库和养龟助手APP。",
            "inLanguage": ["zh-CN", "en-US"],
            "publisher": {
              "@type": "Organization",
              "name": "CheloniaTrace",
              "url": "https://www.guiji.online"
            }
          },
          {
            "@type": "Organization",
            "name": "CheloniaTrace",
            "url": "https://www.guiji.online"
          },
          {
            "@type": "Dataset",
            "name": "全球龟鳖目分类与文献数据库",
            "description": "龟迹（CheloniaTrace）研究数据库，收录原始来源、结构化证据、策略参数依据、龟鳖目分类树和物种百科。",
            "url": "https://www.guiji.online/zh",
            "creator": { "@type": "Organization", "name": "CheloniaTrace" },
            "keywords": ["龟鳖目", "乌龟分类", "乌龟大全", "乌龟品种", "分类学", "系统发育", "爬行动物数据库"],
            "license": "https://creativecommons.org/licenses/by/4.0/",
            "inLanguage": "zh-CN"
          },
          {
            "@type": "Article",
            "headline": "智能喂食策略 · 龟鳖百科 · 下载APP",
            "description": "智能喂食策略在线计算，龟鳖目物种百科浏览，研究资料库，养龟助手APP下载。",
            "author": { "@type": "Organization", "name": "CheloniaTrace" },
            "datePublished": "2026-04-30",
            "dateModified": "2026-06-09",
            "inLanguage": "zh-CN",
            "mainEntityOfPage": "https://www.guiji.online/zh"
          }
        ]
      }
    : {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "WebSite",
            "name": "CheloniaTrace",
            "alternateName": "Smart Turtle Feeding and Encyclopedia",
            "url": "https://www.guiji.online",
            "description": "Smart turtle feeding calculator, Testudines encyclopedia, research database, and turtle care app.",
            "inLanguage": ["en-US", "zh-CN"],
            "publisher": {
              "@type": "Organization",
              "name": "CheloniaTrace",
              "url": "https://www.guiji.online"
            }
          },
          {
            "@type": "Organization",
            "name": "CheloniaTrace",
            "url": "https://www.guiji.online"
          },
          {
            "@type": "Dataset",
            "name": "Global Testudines Taxonomy Dataset",
            "description": "CheloniaTrace turtle research dataset covering original sources, structured evidence, care strategy provenance, taxonomy, and species pages.",
            "url": "https://www.guiji.online/en",
            "creator": { "@type": "Organization", "name": "CheloniaTrace" },
            "keywords": ["Testudines", "Turtle Taxonomy", "Phylogenetics", "Turtle Encyclopedia"],
            "license": "https://creativecommons.org/licenses/by/4.0/",
            "inLanguage": "en-US"
          },
          {
            "@type": "Article",
            "headline": "Smart Feeding · Turtle Encyclopedia · App Download",
            "description": "Smart feeding calculator, Testudines encyclopedia, research database, and turtle care app.",
            "author": { "@type": "Organization", "name": "CheloniaTrace" },
            "datePublished": "2026-04-30",
            "dateModified": "2026-06-09",
            "inLanguage": "en-US",
            "mainEntityOfPage": "https://www.guiji.online/en"
          }
        ]
      };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd, null, 2) }}
      />
      {children}
    </>
  );
}
