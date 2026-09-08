import Link from 'next/link';
import { notFound } from 'next/navigation';
import { queryD1 } from '@/lib/db';

export const dynamic = 'force-dynamic';

interface MangaDetailPageProps {
  params: Promise<{ slug: string }>;
}

function formatCoverUrl(url?: string | null): string {
  if (!url) return '';
  if (url.includes('.r2.dev/')) {
    const key = url.split('.r2.dev/')[1];
    return `/api/image?key=${encodeURIComponent(key)}`;
  }
  return url;
}

export default async function MangaDetailPage({ params }: MangaDetailPageProps) {
  const { slug } = await params;

  // 1. Ambil detail data komik dari D1
  const mangaResults = await queryD1<any>(
    'SELECT * FROM mangas WHERE slug = ? LIMIT 1',
    [slug]
  );

  const manga = mangaResults[0];
  if (!manga) {
    notFound();
  }

  // 2. Ambil daftar chapter komik ini
  const chapters = await queryD1<any>(
    'SELECT * FROM chapters WHERE manga_id = ? ORDER BY CAST(chapter_number AS REAL) DESC',
    [manga.id]
  );

  const coverSrc = formatCoverUrl(manga.cover_url);

  return (
    <div className="min-h-screen bg-[#453a3a] text-[#baa9a9] p-4 md:p-10">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Tombol Navigasi Kembali */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-[#baa9a9] hover:text-[#f2ecec] transition font-medium"
        >
          &larr; Kembali ke Beranda
        </Link>

        {/* Panel Informasi Komik */}
        <div className="bg-[#362d2d] rounded-2xl border border-[#baa9a9]/20 p-5 md:p-8 flex flex-col md:flex-row gap-6 shadow-lg">
          {/* Cover Gambar */}
          <div className="w-full md:w-52 flex-shrink-0 aspect-[3/4] bg-[#2a2323] rounded-xl overflow-hidden border border-[#baa9a9]/20 flex items-center justify-center">
            {coverSrc ? (
              <img
                src={coverSrc}
                alt={manga.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xs text-[#baa9a9]/50">No Cover</span>
            )}
          </div>

          {/* Info & Metadata */}
          <div className="flex-1 flex flex-col justify-start space-y-4">
            <h1 className="text-2xl md:text-3xl font-bold text-[#f2ecec] leading-snug">
              {manga.title}
            </h1>

            {/* Author */}
            {manga.author && (
              <p className="text-xs text-[#baa9a9]/80">
                <span className="font-semibold text-[#f2ecec]">Author: </span>
                {manga.author}
              </p>
            )}

            {/* Badges Status & Demographic */}
            <div className="flex flex-wrap gap-2 text-xs">
              {manga.status && (
                <span className="bg-[#453a3a] text-[#f2ecec] px-3 py-1 rounded-full border border-[#baa9a9]/30">
                  {manga.status}
                </span>
              )}
              {manga.demographic && (
                <span className="bg-[#453a3a] text-[#baa9a9] px-3 py-1 rounded-full border border-[#baa9a9]/30">
                  {manga.demographic}
                </span>
              )}
              {manga.theme && (
                <span className="bg-[#2a2323] text-[#baa9a9]/90 px-3 py-1 rounded-full border border-[#baa9a9]/20">
                  {manga.theme}
                </span>
              )}
            </div>

            {/* Genre List */}
            {manga.genres && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {manga.genres.split(',').map((genre: string, idx: number) => (
                  <span
                    key={idx}
                    className="bg-[#2a2323] text-[#baa9a9] text-[11px] font-medium px-2.5 py-0.5 rounded border border-[#baa9a9]/10"
                  >
                    {genre.trim()}
                  </span>
                ))}
              </div>
            )}

            {/* Sinopsis / Deskripsi */}
            <div className="pt-2 border-t border-[#baa9a9]/15">
              <p className="text-xs md:text-sm text-[#baa9a9]/90 leading-relaxed line-clamp-6">
                {manga.description || 'Tidak ada deskripsi tersedia.'}
              </p>
            </div>
          </div>
        </div>

        {/* Panel Daftar Chapter */}
        <div className="bg-[#362d2d] rounded-2xl border border-[#baa9a9]/20 p-5 md:p-8 shadow-lg">
          <h2 className="text-lg md:text-xl font-bold text-[#f2ecec] mb-4">
            Daftar Chapter
          </h2>

          <div className="space-y-2">
            {chapters.map((ch) => (
              <Link
                key={ch.id}
                href={`/manga/${manga.slug}/chapter/${ch.chapter_number}`}
                className="flex items-center justify-between p-3.5 bg-[#2a2323] hover:bg-[#221c1c] border border-[#baa9a9]/15 hover:border-[#baa9a9]/50 rounded-xl transition group"
              >
                <div>
                  <span className="font-semibold text-sm text-[#f2ecec] group-hover:text-[#baa9a9] transition">
                    Chapter {ch.chapter_number}
                  </span>
                  {ch.title && (
                    <span className="text-xs text-[#baa9a9]/70 ml-2">
                      - {ch.title}
                    </span>
                  )}
                </div>
                <span className="text-xs text-[#baa9a9]/50 group-hover:text-[#f2ecec] transition">
                  Baca &rarr;
                </span>
              </Link>
            ))}

            {chapters.length === 0 && (
              <div className="text-center py-10 text-sm text-[#baa9a9]/60">
                Belum ada chapter yang diunggah.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}