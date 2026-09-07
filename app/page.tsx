import Link from 'next/link';
import { queryD1 } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const mangas = await queryD1<any>(
    'SELECT * FROM mangas ORDER BY id DESC'
  );

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex justify-between items-center border-b border-slate-800 pb-6">
          <h1 className="text-3xl font-bold tracking-tight text-amber-400">Yanama Comic</h1>
          <div className="space-x-3">
            <Link
              href="/admin"
              className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg text-sm border border-slate-700 transition"
            >
              Admin
            </Link>
            <Link
              href="/upload"
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-lg text-sm transition"
            >
              Upload Chapter
            </Link>
          </div>
        </header>

        <section>
          <h2 className="text-xl font-semibold mb-6">Daftar Komik</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {mangas.map((manga) => (
              <Link
                key={manga.id}
                href={`/manga/${manga.slug}`}
                className="group bg-slate-800 rounded-xl overflow-hidden border border-slate-700/60 hover:border-amber-400/50 transition duration-200"
              >
                <div className="aspect-[3/4] bg-slate-950 relative overflow-hidden">
                  {manga.cover_url ? (
                    <img
                      src={manga.cover_url}
                      alt={manga.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs">
                      No Cover
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-amber-400 transition">
                    {manga.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>

          {mangas.length === 0 && (
            <p className="text-slate-500 text-center py-20">Belum ada komik yang tersedia.</p>
          )}
        </section>
      </div>
    </div>
  );
}