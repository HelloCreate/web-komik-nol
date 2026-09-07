import Link from 'next/link';
import { notFound } from 'next/navigation';
import { queryD1 } from '@/lib/db';

interface ReadChapterProps {
  params: Promise<{ slug: string; id: string }>;
}

export default async function ReadChapterPage({ params }: ReadChapterProps) {
  const { slug, id } = await params;

  const mangas = await queryD1<any>(
    'SELECT * FROM mangas WHERE slug = ? LIMIT 1',
    [slug]
  );
  const manga = mangas[0];
  if (!manga) notFound();

  const chapters = await queryD1<any>(
    'SELECT * FROM chapters WHERE id = ? LIMIT 1',
    [id]
  );
  const chapter = chapters[0];
  if (!chapter) notFound();

  const images = await queryD1<any>(
    'SELECT * FROM chapter_images WHERE chapter_id = ? ORDER BY page_number ASC',
    [id]
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center">
      <div className="w-full sticky top-0 z-50 bg-slate-900/90 backdrop-blur border-b border-slate-800 p-4 flex justify-between items-center max-w-4xl px-4">
        <div>
          <h1 className="font-bold text-sm md:text-base">{manga.title}</h1>
          <p className="text-xs text-slate-400">Chapter {chapter.chapter_number}</p>
        </div>
        <Link
          href={`/manga/${manga.slug}`}
          className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded border border-slate-700"
        >
          Daftar Chapter
        </Link>
      </div>

      <div className="w-full max-w-3xl flex flex-col items-center my-4 space-y-1">
        {images.map((img) => (
          <img
            key={img.id}
            src={img.image_url}
            alt={`Halaman ${img.page_number}`}
            className="w-full h-auto block select-none"
            loading="lazy"
          />
        ))}

        {images.length === 0 && (
          <div className="py-20 text-slate-500 text-sm">
            Tidak ada gambar pada chapter ini.
          </div>
        )}
      </div>
    </div>
  );
}