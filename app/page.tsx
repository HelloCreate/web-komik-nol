import { supabase } from '@/lib/supabase';
import Link from 'next/link';

// Fungsi untuk mengambil data komik dari tabel Supabase
async function getMangaList() {
  const { data, error } = await supabase
    .from('manga')
    .select('*')
    .order('id', { ascending: false });
  
  if (error) {
    console.error(error.message);
    return [];
  }
  return data;
}

export default async function HomePage() {
  const mangaList = await getMangaList();

  return (
    <main className="min-h-screen bg-gray-900 text-white p-6">
      {/* Header Website */}
      <header className="mb-8 border-b border-gray-800 pb-4">
        <h1 className="text-3xl font-bold text-orange-500">Yanama Komik</h1>
        <p className="text-gray-400 text-sm mt-1">Situs Baca Manhwa & Manga Favoritmu</p>
      </header>
      
      {/* Grid Daftar Komik */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-6">
        {mangaList.length === 0 ? (
          <p className="text-gray-400 col-span-full text-center py-10">
            Belum ada komik di database. Yuk isi data di Supabase!
          </p>
        ) : (
          mangaList.map((manga) => (
            <Link 
              href={`/manga/${manga.slug}`} 
              key={manga.id} 
              className="group bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:scale-105 transition duration-200"
            >
              {/* Cover Komik */}
              <img 
                src={manga.cover_url || 'https://placehold.co/400x600?text=No+Cover'} 
                alt={manga.title} 
                className="w-full h-64 object-cover"
              />
              {/* Detail Singkat */}
              <div className="p-3">
                <span className="text-[10px] px-2 py-0.5 bg-orange-600 rounded font-semibold text-white">
                  {manga.type}
                </span>
                <h2 className="font-bold text-sm mt-2 line-clamp-2 group-hover:text-orange-400 transition">
                  {manga.title}
                </h2>
              </div>
            </Link>
          ))
        )}
      </div>
    </main>
  );
}