import Link from 'next/link';
import { notFound } from 'next/navigation';
import { queryD1 } from '@/lib/db';

interface ReadChapterProps {
  params: Promise<{ slug: string; id: string }>;
}

export default async function ReadChapterPage({ params }: ReadChapterProps) {
  const { slug, id } = await params;

  // 1. Ambil data komik berdasarkan slug
  const mangas = await queryD1<any>(
    'SELECT * FROM mangas WHERE slug = ? LIMIT 1',
    [slug]
  );
  const manga = mangas[0];
  if (!manga) notFound();

  // 2. Ambil seluruh chapter dari komik ini untuk menyusun urutan navigasi
  const allChapters = await queryD1<any>(
    'SELECT id, chapter_number, title FROM chapters WHERE manga_id = ? ORDER BY CAST(chapter_number AS REAL) ASC, id ASC',
    [manga.id]
  );

  // 3. Tentukan chapter yang aktif saat ini
  const currentChapterIndex = allChapters.findIndex(
    (ch: any) => String(ch.id) === String(id)
  );
  if (currentChapterIndex === -1) notFound();

  const chapter = allChapters[currentChapterIndex];

  // Chapter sebelum dan sesudahnya
  const prevChapter = currentChapterIndex > 0 ? allChapters[currentChapterIndex - 1] : null;
  const nextChapter =
    currentChapterIndex < allChapters.length - 1
      ? allChapters[currentChapterIndex + 1]
      : null;

  // 4. Ambil gambar-gambar halaman komik
  const images = await queryD1<any>(
    'SELECT * FROM chapter_images WHERE chapter_id = ? ORDER BY page_number ASC',
    [id]
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center">
      {/* Sticky Header Navigasi Atas */}
      <div className="w-full sticky top-0 z-50 bg-slate-900/90 backdrop-blur border-b border-slate-800 p-3 md:p-4 flex flex-wrap justify-between items-center max-w-4xl px-4 gap-2">
        <div>
          <h1 className="font-bold text-sm md:text-base leading-tight">{manga.title}</h1>
          <p className="text-xs text-slate-400">
            Chapter {chapter.chapter_number} {chapter.title ? `- ${chapter.title}` : ''}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {prevChapter ? (
            <Link
              href={`/manga/${manga.slug}/chapter/${prevChapter.id}`}
              className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded border border-slate-700 transition"
            >
              &larr; Prev
            </Link>
          ) : (
            <span className="text-xs bg-slate-900/50 text-slate-600 px-3 py-1.5 rounded border border-slate-800 cursor-not-allowed">
              &larr; Prev
            </span>
          )}

          <Link
            href={`/manga/${manga.slug}`}
            className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded border border-slate-700 transition"
          >
            Daftar Chapter
          </Link>

          {nextChapter ? (
            <Link
              href={`/manga/${manga.slug}/chapter/${nextChapter.id}`}
              className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded border border-slate-700 transition"
            >
              Next &rarr;
            </Link>
          ) : (
            <span className="text-xs bg-slate-900/50 text-slate-600 px-3 py-1.5 rounded border border-slate-800 cursor-not-allowed">
              Next &rarr;
            </span>
          )}
        </div>
      </div>

      {/* Lembaran Gambar Komik */}
      <div className="w-full max-w-3xl flex flex-col items-center my-4 space-y-1">
        {images.map((img: any) => (
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

      {/* Navigasi Bawah */}
      <div className="w-full max-w-3xl px-4 py-8 flex justify-between items-center border-t border-slate-800 my-6">
        {prevChapter ? (
          <Link
            href={`/manga/${manga.slug}/chapter/${prevChapter.id}`}
            className="text-xs md:text-sm bg-slate-800 hover:bg-slate-700 text-white font-medium px-4 py-2 rounded-lg border border-slate-700 transition"
          >
            &larr; Bab Sebelumnya (Ch. {prevChapter.chapter_number})
          </Link>
        ) : (
          <span className="text-xs md:text-sm bg-slate-900 text-slate-600 px-4 py-2 rounded-lg border border-slate-800 cursor-not-allowed">
            &larr; Bab Awal
          </span>
        )}

        <Link
          href={`/manga/${manga.slug}`}
          className="text-xs md:text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg border border-slate-700 transition"
        >
          Menu Komik
        </Link>

        {nextChapter ? (
          <Link
            href={`/manga/${manga.slug}/chapter/${nextChapter.id}`}
            className="text-xs md:text-sm bg-slate-800 hover:bg-slate-700 text-white font-medium px-4 py-2 rounded-lg border border-slate-700 transition"
          >
            Bab Selanjutnya (Ch. {nextChapter.chapter_number}) &rarr;
          </Link>
        ) : (
          <span className="text-xs md:text-sm bg-slate-900 text-slate-600 px-4 py-2 rounded-lg border border-slate-800 cursor-not-allowed">
            Bab Terakhir &rarr;
          </span>
        )}
      </div>
    </div>
  );
}