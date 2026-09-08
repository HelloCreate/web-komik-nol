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

  // 2. Ambil seluruh chapter dari komik ini untuk navigasi
  const allChapters = await queryD1<any>(
    'SELECT id, chapter_number, title FROM chapters WHERE manga_id = ? ORDER BY CAST(chapter_number AS REAL) ASC, id ASC',
    [manga.id]
  );

  // 3. Tentukan index chapter aktif saat ini
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

  // 4. Ambil lembaran gambar halaman chapter
  const images = await queryD1<any>(
    'SELECT * FROM chapter_images WHERE chapter_id = ? ORDER BY page_number ASC',
    [id]
  );

  return (
    <div className="min-h-screen bg-[#070d18] text-[#e2e8f0] flex flex-col items-center">
      {/* Sticky Header Atas (Aksen Biru & Tombol Daftar Chapter) */}
      <header className="w-full sticky top-0 z-50 bg-[#0c162d]/95 backdrop-blur border-b border-[#1e293b] py-3 px-4 shadow-lg flex justify-center">
        <div className="w-full max-w-4xl flex flex-wrap justify-between items-center gap-3">
          <div>
            <h1 className="font-bold text-sm md:text-base text-white leading-tight">
              {manga.title}
            </h1>
            <p className="text-xs text-blue-300/80">
              Chapter {chapter.chapter_number} {chapter.title ? `- ${chapter.title}` : ''}
            </p>
          </div>

          {/* Tombol Navigasi Cepat Atas */}
          <div className="flex items-center gap-2">
            {prevChapter ? (
              <Link
                href={`/manga/${manga.slug}/chapter/${prevChapter.id}`}
                className="text-xs bg-[#172554] hover:bg-[#1e3a8a] text-blue-200 border border-blue-900/60 px-3 py-1.5 rounded transition shadow-sm"
              >
                &larr; Prev
              </Link>
            ) : (
              <span className="text-xs bg-[#0b1329] text-gray-500 border border-slate-800/60 px-3 py-1.5 rounded cursor-not-allowed">
                &larr; Prev
              </span>
            )}

            <Link
              href={`/manga/${manga.slug}`}
              className="text-xs bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-medium px-3.5 py-1.5 rounded shadow transition"
            >
              Daftar Chapter
            </Link>

            {nextChapter ? (
              <Link
                href={`/manga/${manga.slug}/chapter/${nextChapter.id}`}
                className="text-xs bg-[#172554] hover:bg-[#1e3a8a] text-blue-200 border border-blue-900/60 px-3 py-1.5 rounded transition shadow-sm"
              >
                Next &rarr;
              </Link>
            ) : (
              <span className="text-xs bg-[#0b1329] text-gray-500 border border-slate-800/60 px-3 py-1.5 rounded cursor-not-allowed">
                Next &rarr;
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Banner Grup Terjemahan (Sesuai gaya emas di foto) */}
      <div className="w-full max-w-3xl px-4 mt-6">
        <div className="border-2 border-[#eab308] rounded-xl p-4 bg-[#0a1122] text-center shadow-md">
          <span className="inline-block bg-[#eab308] text-[#070d18] text-[10px] md:text-xs font-black px-3 py-1 rounded-sm uppercase tracking-wider mb-2">
            Translation Group
          </span>
          <h2 className="text-xl md:text-2xl font-black text-white tracking-wider">
            YANAMA
          </h2>
          <p className="text-xs text-yellow-300/80 uppercase font-semibold mt-1">
            {manga.title}
          </p>
        </div>
      </div>

      {/* Area Gambar Lembaran Komik */}
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
        <div className="bg-[#0c162d] border border-[#1e293b] rounded-xl p-4 flex flex-wrap justify-between items-center gap-3 shadow-lg">
          {prevChapter ? (
            <Link
              href={`/manga/${manga.slug}/chapter/${prevChapter.id}`}
              className="text-xs md:text-sm bg-[#1e293b] hover:bg-[#334155] text-white px-4 py-2 rounded-lg border border-slate-700 transition"
            >
              &larr; Bab Sebelumnya (Ch. {prevChapter.chapter_number})
            </Link>
          ) : (
            <span className="text-xs md:text-sm bg-[#0a1122] text-slate-500 px-4 py-2 rounded-lg border border-slate-800 cursor-not-allowed">
              &larr; Bab Awal
            </span>
          )}

          <Link
            href={`/manga/${manga.slug}`}
            className="text-xs md:text-sm bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold px-4 py-2 rounded-lg transition shadow"
          >
            Daftar Chapter
          </Link>

          {nextChapter ? (
            <Link
              href={`/manga/${manga.slug}/chapter/${nextChapter.id}`}
              className="text-xs md:text-sm bg-[#1e293b] hover:bg-[#334155] text-white px-4 py-2 rounded-lg border border-slate-700 transition"
            >
              Bab Selanjutnya (Ch. {nextChapter.chapter_number}) &rarr;
            </Link>
          ) : (
            <span className="text-xs md:text-sm bg-[#0a1122] text-slate-500 px-4 py-2 rounded-lg border border-slate-800 cursor-not-allowed">
              Bab Terakhir &rarr;
            </span>
          )}
        </div>
      </div>
    </div>
  );
}