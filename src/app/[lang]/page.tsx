import TaxonomyClient from '../TaxonomyClient';
import { TaxonomyNode } from '../types';

async function getTaxonomyTree(): Promise<TaxonomyNode | null> {
  try {
    const res = await fetch('https://api.guiji.online/api/v1/taxonomy/tree', {
      next: { revalidate: 3600 } 
    });
    if (!res.ok) throw new Error('Failed to fetch data');
    return res.json();
  } catch (error) {
    console.error("SSR Data Fetch Error:", error);
    return null;
  }
}

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const resolvedParams = await params;
  // 👉 强制断言 lang 的类型为具体的联合类型
  const lang = (resolvedParams.lang === 'en' ? 'en' : 'zh') as 'zh' | 'en';
  const treeData = await getTaxonomyTree();

  return (
    <>
      {treeData ? (
        // 👉 强制断言 treeData 绕过严格的属性检查
        <TaxonomyClient initialTreeData={treeData as any} lang={lang} />
      ) : (
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-red-500 font-medium">数据加载失败，请检查网络连接或接口状态。</p>
        </div>
      )}
    </>
  );
}