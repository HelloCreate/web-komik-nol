import Link from 'next/link';
import { notFound } from 'next/navigation';
import { queryD1 } from '@/lib/db';

interface ReadChapterProps {
  params: Promise<{ slug: string; chapter: string }>;
}

export default async function ReadChapterPage({ params }: ReadChapterProps) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const chapterNumber = resolvedParams.chapter;

  // 1. Ambil data komik berdasarkan slug
  const mangas = await queryD1<any>(
    'SELECT * FROM mangas WHERE slug = ? LIMIT 1',
    [slug]
  );
  const manga = mangas[0];
  if (!manga) notFound();

  // 2. Ambil seluruh chapter komik ini untuk navigasi
  const allChapters = await queryD1<any>(
    'SELECT id, chapter_number, title FROM chapters WHERE manga_id = ? ORDER BY CAST(chapter_number AS REAL) ASC, id ASC',
    [manga.id]
  );

  // 3. Cari chapter yang sedang aktif berdasarkan nomor chapter
  const currentChapterIndex = allChapters.findIndex(
    (ch: any) => String(ch.chapter_number) === String(chapterNumber)
  );
  
  if (currentChapterIndex === -1) notFound();

  const currentChapter = allChapters[currentChapterIndex];

  // Chapter sebelumnya dan sesudahnya
  const prevChapter = currentChapterIndex > 0 ? allChapters[currentChapterIndex - 1] : null;
  const nextChapter =
    currentChapterIndex < allChapters.length - 1
      ? allChapters[currentChapterIndex + 1]
      : null;

  // 4. Ambil gambar halaman komik
  const images = await queryD1<any>(
    'SELECT * FROM chapter_images WHERE chapter_id = ? ORDER BY page_number ASC',
    [currentChapter.id]
  );

  return (
    <div className="min-h-screen bg-[#0b132b] text-[#e2e8f0] flex flex-col items-center">
      {/* Sticky Header Navigasi Atas */}
      <header className="w-full sticky top-0 z-50 bg-[#1c2541]/95 backdrop-blur border-b border-[#3a506b] py-3 px-4 shadow-lg flex justify-center">
        <div className="w-full max-w-4xl flex flex-wrap justify-between items-center gap-3">
          <div>
            <h1 className="font-bold text-sm md:text-base text-white leading-tight">
              {manga.title}
            </h1>
            <p className="text-xs text-cyan-300">
              Chapter {currentChapter.chapter_number} {currentChapter.title ? `- ${currentChapter.title}` : ''}
            </p>
          </div>

          {/* Tombol Navigasi Cepat Atas */}
          <div className="flex items-center gap-2">
            {prevChapter ? (
              <Link
                href={`/${manga.slug}/chapter/${prevChapter.chapter_number}`}
                className="text-xs bg-[#0b132b] hover:bg-[#3a506b] text-cyan-200 border border-[#3a506b] px-3 py-1.5 rounded transition shadow-sm"
              >
                &larr; Prev
              </Link>
            ) : (
              <span className="text-xs bg-[#0b132b]/50 text-gray-500 border border-slate-800 px-3 py-1.5 rounded cursor-not-allowed">
                &larr; Prev
              </span>
            )}

            <Link
              href={`/${manga.slug}`}
              className="text-xs bg-cyan-600 hover:bg-cyan-500 text-white font-medium px-3.5 py-1.5 rounded shadow transition"
            >
              Daftar Chapter
            </Link>

            {nextChapter ? (
              <Link
                href={`/${manga.slug}/chapter/${nextChapter.chapter_number}`}
                className="text-xs bg-[#0b132b] hover:bg-[#3a506b] text-cyan-200 border border-[#3a506b] px-3 py-1.5 rounded transition shadow-sm"
              >
                Next &rarr;
              </Link>
            ) : (
              <span className="text-xs bg-[#0b132b]/50 text-gray-500 border border-slate-800 px-3 py-1.5 rounded cursor-not-allowed">
                Next &rarr;
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Banner Grup Terjemahan */}
      <div className="w-full max-w-3xl px-4 mt-6">
        <div className="border-2 border-[#eab308] rounded-xl p-4 bg-[#1c2541] text-center shadow-md">
          <span className="inline-block bg-[#eab308] text-[#070d18] text-[10px] md:text-xs font-black px-3 py-1 rounded-sm uppercase tracking-wider mb-2">
            Translation Group
          </span>
          <h2 className="text-xl md:text-2xl font-black text-white tracking-wider">
            YANAMA
          </h2>
          <p className="text-xs text-yellow-300 uppercase font-semibold mt-1">
            {manga.title}
          </p>
        </div>
      </div>

      {/* Gambar-Gambar Komik */}
      <main className="w-full max-w-3xl flex flex-col items-center my-6 space-y-1">
        {images.map((img: any) => (
          <img
            key={img.id}
            src={img.image_url}
            alt={`Halaman ${img.page_number}`}
            className="w-full h-auto block select-none bg-black/40"
            loading="lazy"
          />
        ))}

        {images.length === 0 && (
          <div className="py-24 text-slate-400 text-sm text-center">
            Belum ada gambar yang diunggah untuk chapter ini.
          </div>
        )}
      </main>

      {/* Navigasi Bawah */}
      <div className="w-full max-w-3xl px-4 pb-12">
        <div className="bg-[#1c2541] border border-[#3a506b] rounded-xl p-4 flex flex-wrap justify-between items-center gap-3 shadow-lg">
          {prevChapter ? (
            <Link
              href={`/${manga.slug}/chapter/${prevChapter.chapter_number}`}
              className="text-xs md:text-sm bg-[#0b132b] hover:bg-[#3a506b] text-white px-4 py-2 rounded-lg border border-[#3a506b] transition"
            >
              &larr; Bab Sebelumnya (Ch. {prevChapter.chapter_number})
            </Link>
          ) : (
            <span className="text-xs md:text-sm bg-[#0b132b]/40 text-slate-500 px-4 py-2 rounded-lg border border-slate-800 cursor-not-allowed">
              &larr; Bab Awal
            </span>
          )}

          <Link
            href={`/${manga.slug}`}
            className="text-xs md:text-sm bg-cyan-600 hover:bg-cyan-500 text-white font-semibold px-4 py-2 rounded-lg transition shadow"
          >
            Daftar Chapter
          </Link>

          {nextChapter ? (
            <Link
              href={`/${manga.slug}/chapter/${nextChapter.chapter_number}`}
              className="text-xs md:text-sm bg-[#0b132b] hover:bg-[#3a506b] text-white px-4 py-2 rounded-lg border border-[#3a506b] transition"
            >
              Bab Selanjutnya (Ch. {nextChapter.chapter_number}) &rarr;
            </Link>
          ) : (
            <span className="text-xs md:text-sm bg-[#0b132b]/40 text-slate-500 px-4 py-2 rounded-lg border border-slate-800 cursor-not-allowed">
              Bab Terakhir &rarr;
            </span>
          )}
        </div>
      </div>
    </div>
  );
}