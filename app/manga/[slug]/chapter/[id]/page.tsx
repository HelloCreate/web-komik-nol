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

  // 2. Ambil seluruh chapter dari komik ini untuk urutan navigasi
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
    <div className="min-h-screen bg-[#453a3a] text-[#baa9a9] flex flex-col items-center">
      {/* Sticky Header Navigasi Atas (Tema Coklat) */}
      <header className="w-full sticky top-0 z-50 bg-[#362d2d]/95 backdrop-blur border-b border-[#baa9a9]/20 py-3 px-4 shadow-lg flex justify-center">
        <div className="w-full max-w-4xl flex flex-wrap justify-between items-center gap-3">
          <div>
            <h1 className="font-bold text-sm md:text-base text-[#f2ecec] leading-tight">
              {manga.title}
            </h1>
            <p className="text-xs text-[#baa9a9]/80">
              Chapter {chapter.chapter_number} {chapter.title ? `- ${chapter.title}` : ''}
            </p>
          </div>

          {/* Tombol Navigasi Header */}
          <div className="flex items-center gap-2">
            {prevChapter ? (
              <Link
                href={`/manga/${manga.slug}/chapter/${prevChapter.id}`}
                className="text-xs bg-[#2a2323] hover:bg-[#201a1a] text-[#baa9a9] hover:text-[#f2ecec] border border-[#baa9a9]/30 px-3 py-1.5 rounded-lg transition shadow-sm"
              >
                &larr; Prev
              </Link>
            ) : (
              <span className="text-xs bg-[#2a2323]/50 text-[#baa9a9]/40 border border-[#baa9a9]/10 px-3 py-1.5 rounded-lg cursor-not-allowed">
                &larr; Prev
              </span>
            )}

            <Link
              href={`/manga/${manga.slug}`}
              className="text-xs bg-[#baa9a9] hover:bg-[#a89595] text-[#453a3a] font-bold px-3.5 py-1.5 rounded-lg shadow transition"
            >
              Daftar Chapter
            </Link>

            {nextChapter ? (
              <Link
                href={`/manga/${manga.slug}/chapter/${nextChapter.id}`}
                className="text-xs bg-[#2a2323] hover:bg-[#201a1a] text-[#baa9a9] hover:text-[#f2ecec] border border-[#baa9a9]/30 px-3 py-1.5 rounded-lg transition shadow-sm"
              >
                Next &rarr;
              </Link>
            ) : (
              <span className="text-xs bg-[#2a2323]/50 text-[#baa9a9]/40 border border-[#baa9a9]/10 px-3 py-1.5 rounded-lg cursor-not-allowed">
                Next &rarr;
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Lembaran Gambar Komik */}
      <main className="w-full max-w-3xl flex flex-col items-center my-6 space-y-1 shadow-2xl bg-[#2a2323]">
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
          <div className="py-24 text-[#baa9a9]/70 text-sm text-center">
            Belum ada gambar yang diunggah untuk chapter ini.
          </div>
        )}
      </main>

      {/* Navigasi Bawah (Tema Coklat) */}
      <div className="w-full max-w-3xl px-4 pb-12">
        <div className="bg-[#362d2d] border border-[#baa9a9]/20 rounded-2xl p-4 flex flex-wrap justify-between items-center gap-3 shadow-lg">
          {prevChapter ? (
            <Link
              href={`/manga/${manga.slug}/chapter/${prevChapter.id}`}
              className="text-xs md:text-sm bg-[#2a2323] hover:bg-[#201a1a] text-[#baa9a9] hover:text-[#f2ecec] font-semibold px-4 py-2.5 rounded-xl border border-[#baa9a9]/30 transition"
            >
              &larr; Bab Sebelumnya (Ch. {prevChapter.chapter_number})
            </Link>
          ) : (
            <span className="text-xs md:text-sm bg-[#2a2323]/50 text-[#baa9a9]/40 px-4 py-2.5 rounded-xl border border-[#baa9a9]/10 cursor-not-allowed">
              &larr; Bab Awal
            </span>
          )}

          <Link
            href={`/manga/${manga.slug}`}
            className="text-xs md:text-sm bg-[#baa9a9] hover:bg-[#a89595] text-[#453a3a] font-bold px-4 py-2.5 rounded-xl transition shadow"
          >
            Daftar Chapter
          </Link>

          {nextChapter ? (
            <Link
              href={`/manga/${manga.slug}/chapter/${nextChapter.id}`}
              className="text-xs md:text-sm bg-[#2a2323] hover:bg-[#201a1a] text-[#baa9a9] hover:text-[#f2ecec] font-semibold px-4 py-2.5 rounded-xl border border-[#baa9a9]/30 transition"
            >
              Bab Selanjutnya (Ch. {nextChapter.chapter_number}) &rarr;
            </Link>
          ) : (
            <span className="text-xs md:text-sm bg-[#2a2323]/50 text-[#baa9a9]/40 px-4 py-2.5 rounded-xl border border-[#baa9a9]/10 cursor-not-allowed">
              Bab Terakhir &rarr;
            </span>
          )}
        </div>
      </div>
    </div>
  );
}