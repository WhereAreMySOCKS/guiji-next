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

// 注意这里：params 改为 Promise，并使用 await 解包
export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const resolvedParams = await params;
  const lang = resolvedParams.lang === 'en' ? 'en' : 'zh';
  const treeData = await getTaxonomyTree();

  return (
    <>
      {treeData ? (
        <TaxonomyClient initialTreeData={treeData} lang={lang} />
      ) : (
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-red-500 font-medium">数据加载失败，请检查网络连接或接口状态。</p>
        </div>
      )}
    </>
  );
}
