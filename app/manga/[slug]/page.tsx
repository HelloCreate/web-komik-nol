import Link from 'next/link';
import { notFound } from 'next/navigation';
import { queryD1 } from '@/lib/db';

interface MangaPageProps {
  params: Promise<{ slug: string }>;
}

// Helper untuk memecah string berkoma menjadi badge terpisah
function parseTags(value?: string | null): string[] {
  if (!value) return [];
  return value
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

export default async function MangaDetailPage({ params }: MangaPageProps) {
  const { slug } = await params;

  // 1. Ambil data komik lengkap
  const mangas = await queryD1<any>(
    'SELECT * FROM mangas WHERE slug = ? LIMIT 1',
    [slug]
  );
  const manga = mangas[0];
  if (!manga) notFound();

  // 2. Ambil daftar chapter komik
  const chapters = await queryD1<any>(
    'SELECT * FROM chapters WHERE manga_id = ? ORDER BY CAST(chapter_number AS REAL) DESC, id DESC',
    [manga.id]
  );

  // Pisahkan string koma menjadi badge terpisah
  const genres = parseTags(manga.genre);
  const themes = parseTags(manga.theme);
  const demographics = parseTags(manga.demographic);

  return (
    <div className="min-h-screen bg-[#453a3a] text-[#baa9a9] p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Navigasi Atas - Hanya ada tombol Beranda untuk pembaca */}
        <div className="flex justify-start items-center border-b border-[#baa9a9]/20 pb-4">
          <Link
            href="/"
            className="text-xs md:text-sm bg-[#362d2d] hover:bg-[#2b2424] text-[#baa9a9] hover:text-[#f2ecec] px-4 py-2 rounded-lg border border-[#baa9a9]/30 transition shadow-sm font-medium"
          >
            &larr; Beranda
          </Link>
        </div>

        {/* Informasi Utama Komik */}
        <div className="bg-[#362d2d] border border-[#baa9a9]/20 rounded-2xl p-5 md:p-7 shadow-lg flex flex-col md:flex-row gap-6">
          {/* Cover */}
          {manga.cover_url && (
            <div className="w-full md:w-56 flex-shrink-0">
              <img
                src={manga.cover_url}
                alt={manga.title}
                className="w-full h-auto rounded-xl object-cover border border-[#baa9a9]/30 shadow-md"
              />
            </div>
          )}

          {/* Metadata & Badges */}
          <div className="flex-1 space-y-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-[#f2ecec] leading-snug">
                {manga.title}
              </h1>
              {manga.author && (
                <p className="text-xs md:text-sm text-[#baa9a9]/80 mt-1">
                  Author: <span className="text-[#f2ecec] font-medium">{manga.author}</span>
                </p>
              )}
            </div>

            {/* Badges Terpisah Rapi */}
            <div className="flex flex-wrap gap-1.5 items-center">
              {/* Status Badge */}
              <span className="bg-[#baa9a9] text-[#453a3a] text-xs font-bold px-2.5 py-1 rounded-md">
                {manga.status || 'Ongoing'}
              </span>

              {/* Genre Badges */}
              {genres.map((g, idx) => (
                <span
                  key={`genre-${idx}`}
                  className="bg-[#2a2323] text-[#f2ecec] border border-[#baa9a9]/30 text-xs px-2.5 py-1 rounded-md"
                >
                  {g}
                </span>
              ))}

              {/* Theme Badges */}
              {themes.map((t, idx) => (
                <span
                  key={`theme-${idx}`}
                  className="bg-[#2a2323] text-[#baa9a9] border border-[#baa9a9]/20 text-xs px-2.5 py-1 rounded-md"
                >
                  {t}
                </span>
              ))}

              {/* Demographic Badges */}
              {demographics.map((d, idx) => (
                <span
                  key={`demo-${idx}`}
                  className="bg-[#1f1919] text-[#baa9a9]/90 border border-[#baa9a9]/20 text-xs px-2.5 py-1 rounded-md"
                >
                  {d}
                </span>
              ))}
            </div>

            {/* Sinopsis */}
            {manga.description && (
              <div className="pt-2 border-t border-[#baa9a9]/10">
                <p className="text-xs md:text-sm text-[#e2d9d9] leading-relaxed whitespace-pre-line">
                  {manga.description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Daftar Chapter */}
        <div className="bg-[#362d2d] border border-[#baa9a9]/20 rounded-2xl p-5 shadow-lg space-y-3">
          <h2 className="text-base font-bold text-[#f2ecec] border-b border-[#baa9a9]/20 pb-3">
            Daftar Chapter ({chapters.length})
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {chapters.map((ch) => (
              <Link
                key={ch.id}
                href={`/manga/${manga.slug}/chapter/${ch.id}`}
                className="bg-[#2a2323] hover:bg-[#201a1a] p-3 rounded-xl border border-[#baa9a9]/20 flex justify-between items-center transition group"
              >
                <div>
                  <span className="font-semibold text-sm text-[#f2ecec] group-hover:text-white">
                    Chapter {ch.chapter_number}
                  </span>
                  {ch.title && (
                    <p className="text-xs text-[#baa9a9]/70 line-clamp-1">{ch.title}</p>
                  )}
                </div>
                <span className="text-xs bg-[#baa9a9]/20 text-[#baa9a9] px-2 py-1 rounded">
                  Baca &rarr;
                </span>
              </Link>
            ))}

            {chapters.length === 0 && (
              <p className="col-span-full py-8 text-center text-xs text-[#baa9a9]/60">
                Belum ada chapter yang diunggah.
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}