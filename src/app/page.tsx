import { Metadata } from 'next';
import TaxonomyClient from './TaxonomyClient';
import { TaxonomyNode } from './types';

export const metadata: Metadata = {
  title: '龟迹 CheloniaTrace | 全球龟鳖目图鉴',
  description: '提供详尽的龟鳖目物种分类树、高清图鉴及拉丁学名查询。',
};

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

export default async function Home() {
  const treeData = await getTaxonomyTree();

  return (
    <>
      {treeData ? (
        <TaxonomyClient initialTreeData={treeData} />
      ) : (
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-red-500 font-medium">数据加载失败，请检查网络连接或接口状态。</p>
        </div>
      )}
    </>
  );
}
