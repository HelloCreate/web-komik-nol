import { supabase } from '@/lib/supabase';
import Link from 'next/link';

// Memaksa halaman selalu mengambil data paling baru (anti cache)
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function HomePage() {
  // Ambil data komik diurutkan berdasarkan ID terbaru
  const { data: mangas, error } = await supabase
    .from('manga')
    .select('*')
    .order('id', { ascending: false });

  if (error) {
    console.error('Gagal mengambil data manga:', error.message);
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Title */}
        <div className="border-b border-gray-800 pb-4">
          <h1 className="text-3xl font-extrabold text-orange-500">Yanama Komik</h1>
          <p className="text-sm text-gray-400 mt-1">Situs Baca Manhwa & Manga Favoritmu</p>
        </div>

        {/* Grid Daftar Komik */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {mangas && mangas.length > 0 ? (
            mangas.map((manga) => (
              <Link 
                key={manga.id} 
                href={`/manga/${manga.slug}`}
                className="group bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-orange-500 transition-all duration-300 flex flex-col"
              >
                {/* Pembungkus Gambar Sampul */}
                <div className="relative aspect-[3/4] w-full bg-gray-800 overflow-hidden">
                  {manga.cover_url ? (
                    <img 
                      src={manga.cover_url} 
                      alt={manga.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-500 p-2 text-center">
                      Tidak ada cover
                    </div>
                  )}

                  <span className="absolute bottom-2 left-2 bg-orange-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                    {manga.type || 'Manga'}
                  </span>
                </div>

                {/* Info Judul Komik */}
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <h2 className="font-bold text-sm text-gray-100 group-hover:text-orange-400 line-clamp-2 transition-colors">
                    {manga.title}
                  </h2>
                  <span className="text-[11px] text-gray-400 mt-2 block">
                    {manga.status || 'Ongoing'}
                  </span>
                </div>
              </Link>
            ))
          ) : (
            <p className="col-span-full text-gray-500 text-sm">Belum ada komik yang ditambahkan.</p>
          )}
        </div>

      </div>
    </main>
  );
}