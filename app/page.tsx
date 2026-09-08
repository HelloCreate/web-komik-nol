import Link from 'next/link';
import { queryD1 } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const mangas = await queryD1<any>(
    'SELECT * FROM mangas ORDER BY id DESC'
  );

  return (
    <div className="min-h-screen bg-[#453a3a] text-[#baa9a9] p-4 md:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Bersih Tanpa Tombol Admin & Upload */}
        <header className="border-b border-[#baa9a9]/20 pb-5">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#f2ecec]">
            Yanama Comic
          </h1>
        </header>

        {/* Section List Komik */}
        <section>
          <h2 className="text-lg md:text-xl font-semibold text-[#f2ecec] mb-6">
            Daftar Komik
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {mangas.map((manga) => (
              <Link
                key={manga.id}
                href={`/manga/${manga.slug}`}
                className="group bg-[#362d2d] rounded-xl overflow-hidden border border-[#baa9a9]/20 hover:border-[#baa9a9] transition duration-200 shadow-md"
              >
                <div className="aspect-[3/4] bg-[#2a2323] relative overflow-hidden flex items-center justify-center">
                  {manga.cover_url ? (
                    <img
                      src={manga.cover_url}
                      alt={manga.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  ) : (
                    <span className="text-xs text-[#baa9a9]/50">No Cover</span>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-sm text-[#f2ecec] truncate group-hover:text-[#baa9a9] transition">
                    {manga.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>

          {mangas.length === 0 && (
            <div className="text-center py-24 text-[#baa9a9]/60 text-sm">
              Belum ada komik yang tersedia.
            </div>
          )}
        </section>

      </div>
    </div>
  );
}