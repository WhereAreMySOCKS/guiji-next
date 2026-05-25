import TaxonomyClient from '../TaxonomyClient';
import { getTaxonomyTree } from '@/lib/taxonomy';

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const resolvedParams = await params;
  // 👉 强制断言 lang 的类型为具体的联合类型
  const lang = (resolvedParams.lang === 'en' ? 'en' : 'zh') as 'zh' | 'en';
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
