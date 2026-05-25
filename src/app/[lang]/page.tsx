import TaxonomyClient from '../TaxonomyClient';
import { flattenTaxonomyTree, getTaxonomyTree } from '@/lib/taxonomy';
import { nodeDisplayName, rankLabel } from '@/lib/taxonomySlug';

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const resolvedParams = await params;
  // 👉 强制断言 lang 的类型为具体的联合类型
  const lang = (resolvedParams.lang === 'en' ? 'en' : 'zh') as 'zh' | 'en';
  const treeData = await getTaxonomyTree();
  const taxonEntries = flattenTaxonomyTree(treeData);
  const indexEntries = taxonEntries.filter((entry) =>
    ['family', 'genus', 'species', 'subspecies'].includes(entry.node.rank.toLowerCase())
  );

  return (
    <>
      {treeData ? (
        <>
          <TaxonomyClient initialTreeData={treeData} lang={lang} />
          <section className="bg-white border-t border-gray-200 px-4 py-12 sm:px-6">
            <div className="mx-auto max-w-6xl">
              <div className="max-w-3xl">
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-700">
                  {lang === 'zh' ? '分类索引' : 'Taxonomy Index'}
                </p>
                <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-gray-950">
                  {lang === 'zh' ? '乌龟分类、乌龟大全与龟鳖目图鉴索引' : 'Turtle taxonomy and Testudines database index'}
                </h2>
                <p className="mt-4 text-base leading-7 text-gray-600">
                  {lang === 'zh'
                    ? '按科、属、物种浏览龟鳖目分类。每个分类节点都提供独立页面，便于查询密西西比麝香龟、麝香龟属、动胸龟科等具体条目。'
                    : 'Browse Testudines by family, genus, and species. Each taxon has an indexable page for scientific names, common names, lineage, and plate references.'}
                </p>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {indexEntries.map((entry) => (
                  <a
                    key={`${entry.slug}-${entry.node.id}`}
                    href={`/${lang}/taxa/${entry.slug}`}
                    className="rounded-2xl border border-gray-200 bg-gray-50 p-4 transition-colors hover:border-emerald-200 hover:bg-emerald-50"
                  >
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-400">
                      {rankLabel(entry.node.rank, lang)}
                    </p>
                    <h3 className="mt-2 font-bold text-gray-950">{nodeDisplayName(entry.node, lang)}</h3>
                    {entry.node.latin_name && (
                      <p className="mt-1 text-sm italic text-gray-500">{entry.node.latin_name}</p>
                    )}
                  </a>
                ))}
              </div>
            </div>
          </section>
        </>
      ) : (
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-red-500 font-medium">数据加载失败，请检查网络连接或接口状态。</p>
        </div>
      )}
    </>
  );
}
