import { MetadataRoute } from 'next';
import { queryD1 } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://yanama-comic.vercel.app';

  // 1. URL Halaman Statis
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
  ];

  // 2. Ambil seluruh komik dari database D1
  const mangas = await queryD1<any>('SELECT slug FROM mangas');
  const mangaRoutes: MetadataRoute.Sitemap = mangas.map((manga) => ({
    url: `${baseUrl}/manga/${manga.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticRoutes, ...mangaRoutes];
}