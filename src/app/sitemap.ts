import { MetadataRoute } from 'next';
import clientPromise from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // 1 hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://ktltc.ac.th';

  try {
    const client = await clientPromise;
    const db = client.db("ktltc_db");

    // 1. Fetch News
    const news = await db.collection("news")
      .find({ status: "published" })
      .project({ _id: 1, updatedAt: 1, createdAt: 1 })
      .toArray();

    const newsEntries = news.map((item) => ({
      url: `${baseUrl}/news/${item._id}`,
      lastModified: item.updatedAt || item.createdAt || new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.7,
    }));

    // 2. Fetch Custom Pages
    const pages = await db.collection("pages")
      .find({})
      .project({ slug: 1, updatedAt: 1, createdAt: 1 })
      .toArray();

    const pageEntries = pages.map((item) => ({
      url: `${baseUrl}/${item.slug}`,
      lastModified: item.updatedAt || item.createdAt || new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    // 3. Static Pages
    const staticRoutes = [
      '',
      '/news',
      '/announcement',
      '/tender',
      '/ita',
      '/pressrelease',
      '/service',
      '/policy',
      '/register',
      '/login',
    ];

    const staticEntries = staticRoutes.map((route) => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: route === '' ? 1.0 : 0.9,
    }));

    return [...staticEntries, ...newsEntries, ...pageEntries];
  } catch (error) {
    console.error('Sitemap generation error:', error);
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
    ];
  }
}
