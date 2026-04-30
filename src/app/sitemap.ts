// FILE: src/app/sitemap.ts
import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  // 你的正式域名
  const baseUrl = 'https://www.guiji.online'

  // 因为你的项目核心是一个重交互的单页应用（树状图在首页），
  // 所以主要向搜索引擎提交不同语言的首页入口即可。
  return [
    {
      url: `${baseUrl}/zh`,
      lastModified: new Date(),
      changeFrequency: 'weekly', // 告诉搜索引擎建议每周来抓取一次更新
      priority: 1.0,             // 权重设为最高 1.0
      alternates: {
        languages: {
          'zh-CN': `${baseUrl}/zh`,
          'en-US': `${baseUrl}/en`,
        },
      },
    },
    {
      url: `${baseUrl}/en`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
      alternates: {
        languages: {
          'zh-CN': `${baseUrl}/zh`,
          'en-US': `${baseUrl}/en`,
        },
      },
    },
  ]
}