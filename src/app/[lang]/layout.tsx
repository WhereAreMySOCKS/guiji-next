import type { Metadata } from "next";
import "../globals.css";

const dictionaries = {
  zh: {
    title: '龟迹 CheloniaTrace | 全球龟鳖目分类图鉴',
    description: '专为爬行动物爱好者与科研人员打造的可视化龟鳖目（Testudines）分类图鉴平台。提供全球水龟、陆龟、海龟的树状族谱演化路径及学名对照。',
  },
  en: {
    title: 'CheloniaTrace | Global Testudines Taxonomy Guide',
    description: 'Visual taxonomy guide and phylogenetic tree for turtle and tortoise enthusiasts. Explore the global database of Testudines.',
  }
}

// 注意这里：params 类型改为 Promise，并使用 await 解包
export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const lang = resolvedParams.lang === 'en' ? 'en' : 'zh';
  const dict = dictionaries[lang];

  return {
    title: dict.title,
    description: dict.description,
    alternates: {
      canonical: `https://www.guiji.online/${lang}`,
      languages: {
        'zh-CN': 'https://www.guiji.online/zh',
        'en-US': 'https://www.guiji.online/en',
      },
    },
  };
}

// 注意这里：RootLayout 变更为 async 函数，并 await params
export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const resolvedParams = await params;
  const lang = resolvedParams.lang === 'en' ? 'en' : 'zh';
  
  return (
    <html lang={lang}>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen flex flex-col bg-[#f8f9fa] text-[#191c1d] font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
