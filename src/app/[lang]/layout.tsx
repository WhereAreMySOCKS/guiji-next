import type { Metadata } from "next";

const dictionaries = {
  zh: {
    title: '龟迹 CheloniaTrace | 全球龟鳖目图鉴与 AI 智能导读',
    description: '专为爬行动物爱好者与科研人员打造的可视化龟鳖目（Testudines）分类图鉴平台。提供全球水龟、陆龟、海龟的树状演化族谱，并内置前沿的 AI 智能导读与文献原文提取功能。',
    keywords: ['龟鳖目', '乌龟分类', '乌龟大全', '乌龟品种大全', '乌龟图鉴', '龟鳖目图鉴', 'AI智能导读', 'Testudines', '系统发育树', '海龟', '陆龟', '水龟', '文献分析', 'CheloniaTrace', '爬行动物数据库'],
  },
  en: {
    title: 'CheloniaTrace | Global Testudines Taxonomy & AI Analysis',
    description: 'A visual taxonomy guide and phylogenetic tree for turtle and tortoise enthusiasts. Explore the global database of Testudines, featuring scientific names, lineages, and AI-powered taxonomic literature analysis.',
    keywords: ['Testudines', 'Turtle Taxonomy', 'AI Analysis', 'Tortoise Database', 'Phylogenetic tree', 'CheloniaTrace', 'Reptile Database', 'Sea Turtles', 'AI Guide'],
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
            "alternateName": "全球龟鳖目分类图鉴",
            "url": "https://www.guiji.online",
            "description": "全球龟鳖目分类图鉴与AI导读平台，提供系统发育树与文献智能解析。",
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
            "description": "包含全球龟鳖目（Testudines）系统分类结构、物种树与AI文献导读内容。",
            "url": "https://www.guiji.online/zh",
            "creator": { "@type": "Organization", "name": "CheloniaTrace" },
            "keywords": ["龟鳖目", "乌龟分类", "乌龟大全", "乌龟品种", "分类学", "系统发育", "AI导读", "爬行动物数据库"],
            "license": "https://creativecommons.org/licenses/by/4.0/",
            "inLanguage": "zh-CN"
          },
          {
            "@type": "Article",
            "headline": "全球龟鳖目图鉴与AI智能导读",
            "description": "提供详尽的物种分类结构、高清图鉴及权威生态信息查询。",
            "author": { "@type": "Organization", "name": "CheloniaTrace" },
            "datePublished": "2026-04-30",
            "dateModified": "2026-04-30",
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
            "alternateName": "Global Testudines Database",
            "url": "https://www.guiji.online",
            "description": "Global turtle taxonomy and AI literature guide platform with phylogenetic tree and scientific data.",
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
            "description": "A dataset covering global turtle taxonomy, phylogenetic tree, and AI-assisted literature extraction.",
            "url": "https://www.guiji.online/en",
            "creator": { "@type": "Organization", "name": "CheloniaTrace" },
            "keywords": ["Testudines", "Turtle Taxonomy", "Phylogenetics", "AI Guide"],
            "license": "https://creativecommons.org/licenses/by/4.0/",
            "inLanguage": "en-US"
          },
          {
            "@type": "Article",
            "headline": "Global Testudines Database & AI Guide",
            "description": "Explore taxonomy, images, and AI-generated literature summaries for turtles and tortoises.",
            "author": { "@type": "Organization", "name": "CheloniaTrace" },
            "datePublished": "2026-04-30",
            "dateModified": "2026-04-30",
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
