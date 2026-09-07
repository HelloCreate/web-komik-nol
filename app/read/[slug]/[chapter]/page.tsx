import Link from 'next/link';
import { notFound } from 'next/navigation';
import { queryD1 } from '@/lib/db';

interface ReadChapterPageProps {
  params: Promise<{ slug: string; chapter: string }>;
}

export default async function ReadChapterPage({ params }: ReadChapterPageProps) {
  const { slug, chapter } = await params;

  // 1. Ambil manga
  const mangas = await queryD1<any>(
    'SELECT * FROM mangas WHERE slug = ? LIMIT 1',
    [slug]
  );
  const manga = mangas[0];
  if (!manga) notFound();

  // 2. Ambil chapter
  const chapters = await queryD1<any>(
    'SELECT * FROM chapters WHERE manga_id = ? AND chapter_number = ? LIMIT 1',
    [manga.id, chapter]
  );
  const currentChapter = chapters[0];
  if (!currentChapter) notFound();

  // 3. Ambil seluruh gambar halaman dari Cloudflare R2 yang tersimpan di D1
  const images = await queryD1<any>(
    'SELECT * FROM chapter_images WHERE chapter_id = ? ORDER BY page_number ASC',
    [currentChapter.id]
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center">
      {/* Bar Navigasi Atas */}
      <div className="w-full sticky top-0 z-50 bg-slate-900/90 backdrop-blur border-b border-slate-800 p-4 flex justify-between items-center max-w-4xl px-4">
        <div>
          <h1 className="font-bold text-sm md:text-base">{manga.title}</h1>
          <p className="text-xs text-slate-400">Chapter {currentChapter.chapter_number}</p>
        </div>
        <Link
          href={`/manga/${manga.slug}`}
          className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded border border-slate-700"
        >
          Daftar Chapter
        </Link>
      </div>

      {/* Kontainer Lembaran Gambar Komik */}
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