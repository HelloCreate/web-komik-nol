import Link from 'next/link';
import { notFound } from 'next/navigation';
import { queryD1 } from '@/lib/db';

interface MangaDetailProps {
  params: Promise<{ slug: string }>;
}

export default async function MangaDetailPage({ params }: MangaDetailProps) {
  const { slug } = await params;

  const mangas = await queryD1<any>(
    'SELECT * FROM mangas WHERE slug = ? LIMIT 1',
    [slug]
  );
  const manga = mangas[0];
  if (!manga) notFound();

  const chapters = await queryD1<any>(
    'SELECT * FROM chapters WHERE manga_id = ? ORDER BY CAST(chapter_number AS REAL) DESC',
    [manga.id]
  );

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Link href="/" className="inline-block text-sm text-slate-400 hover:text-white">
          &larr; Kembali ke Beranda
        </Link>

        <div className="flex flex-col md:flex-row gap-6 bg-slate-800 p-6 rounded-xl border border-slate-700">
          {manga.cover_url && (
            <img
              src={manga.cover_url}
              alt={manga.title}
              className="w-48 h-64 object-cover rounded-lg mx-auto md:mx-0 shadow-md"
            />
          )}
          <div className="flex-1 space-y-3">
            <h1 className="text-3xl font-bold">{manga.title}</h1>
            <p className="text-slate-300 text-sm leading-relaxed">
              {manga.description || 'Tidak ada deskripsi.'}
            </p>
          </div>
        </div>

        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <h2 className="text-xl font-bold mb-4">Daftar Chapter</h2>
          <div className="divide-y divide-slate-700">
            {chapters.map((ch) => (
              <div key={ch.id} className="py-3 flex justify-between items-center">
                <Link
                  href={`/manga/${manga.slug}/chapter/${ch.id}`}
                  className="text-amber-400 hover:text-amber-300 font-medium"
                >
                  Chapter {ch.chapter_number} {ch.title ? `- ${ch.title}` : ''}
                </Link>
                <span className="text-xs text-slate-500">
                  {new Date(ch.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
            {chapters.length === 0 && (
              <p className="text-slate-400 text-sm">Belum ada chapter yang diunggah.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}