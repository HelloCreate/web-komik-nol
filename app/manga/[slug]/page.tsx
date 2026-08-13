'use client';

import { use, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface MangaDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function MangaDetailPage({ params }: MangaDetailPageProps) {
  const resolvedParams = use(params);
  const { slug } = resolvedParams;

  const [manga, setManga] = useState<any>(null);
  const [chapters, setChapters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Proteksi Global: Blokir Klik Kanan & Shortcut Simpan (Ctrl+S / Ctrl+U)
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault(); // Mematikan Klik Kanan Bawaan Browser
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Blokir Ctrl+S (Save) dan Ctrl+U (View Source)
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'u' || e.key === 'S' || e.key === 'U')) {
        e.preventDefault();
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      // Ambil data detail komik
      const { data: mangaData } = await supabase
        .from('manga')
        .select('*')
        .eq('slug', slug)
        .single();

      if (mangaData) {
        setManga(mangaData);

        // Ambil list chapter
        const { data: chData } = await supabase
          .from('chapters')
          .select('*')
          .eq('manga_id', mangaData.id)
          .order('chapter_number', { ascending: false });

        if (chData) setChapters(chData);
      }

      setLoading(false);
    }

    fetchData();
  }, [slug]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-950 text-white p-12 text-center flex items-center justify-center">
        <p className="text-orange-400 font-semibold text-sm animate-pulse">⏳ Memuat Detail Komik...</p>
      </main>
    );
  }

  if (!manga) {
    return (
      <main className="min-h-screen bg-gray-950 text-white p-12 text-center space-y-4">
        <h1 className="text-2xl font-bold text-orange-500">Komik Tidak Ditemukan</h1>
        <Link href="/" className="inline-block bg-gray-800 border border-gray-700 text-gray-300 text-xs px-4 py-2 rounded">
          ← Kembali ke Beranda
        </Link>
      </main>
    );
  }

  const genreList = manga.genre ? manga.genre.split(',').map((g: string) => g.trim()) : [];
  const themeList = manga.theme ? manga.theme.split(',').map((t: string) => t.trim()) : [];

  return (
    <main className="min-h-screen bg-gray-950 text-white p-6 md:p-12 select-none">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Navigasi Kembali */}
        <Link href="/" className="inline-block bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-300 text-xs px-4 py-2 rounded font-semibold transition">
          ← Kembali ke Beranda
        </Link>

        {/* Informasi Utama Komik */}
        <div className="flex flex-col md:flex-row gap-8 bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-2xl">
          
          {/* Cover Komik */}
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="aspect-[3/4] bg-gray-800 rounded-xl overflow-hidden border border-gray-700 shadow-md">
              {manga.cover_url ? (
                <img 
                  src={manga.cover_url} 
                  alt={manga.title} 
                  className="w-full h-full object-cover" 
                  onDragStart={(e) => e.preventDefault()}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">Tidak ada cover</div>
              )}
            </div>
          </div>

          {/* Rincian Info */}
          <div className="flex-1 space-y-5">
            <h1 className="text-3xl font-extrabold text-orange-500 leading-tight">{manga.title}</h1>

            {/* Tabel Ringkasan Info */}
            <div className="grid grid-cols-2 gap-4 bg-gray-950/60 p-4 rounded-xl border border-gray-800/80 text-xs">
              <div>
                <span className="text-gray-500 uppercase font-bold block mb-1">Jenis</span>
                <span className="text-orange-400 font-semibold">{manga.type || 'Manga'}</span>
              </div>
              <div>
                <span className="text-gray-500 uppercase font-bold block mb-1">Status</span>
                <span className="text-green-400 font-semibold">{manga.status || 'Ongoing'}</span>
              </div>
              <div>
                <span className="text-gray-500 uppercase font-bold block mb-1">Author</span>
                <span className="text-gray-200">{manga.author || '-'}</span>
              </div>
              <div>
                <span className="text-gray-500 uppercase font-bold block mb-1">Artist</span>
                <span className="text-gray-200">{manga.artist || '-'}</span>
              </div>
              <div>
                <span className="text-gray-500 uppercase font-bold block mb-1">Demographic</span>
                <span className="text-blue-400 font-semibold">{manga.demographic || '-'}</span>
              </div>
            </div>

            {/* GENRE */}
            {genreList.length > 0 && (
              <div>
                <span className="text-xs text-gray-500 uppercase font-bold block mb-2">Genre</span>
                <div className="flex flex-wrap gap-2">
                  {genreList.map((g: string, idx: number) => (
                    <span key={idx} className="bg-orange-950/40 border border-orange-800/50 text-orange-300 text-xs px-2.5 py-1 rounded-md font-medium">
                      {g}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* THEME */}
            {themeList.length > 0 && (
              <div>
                <span className="text-xs text-gray-500 uppercase font-bold block mb-2">Theme</span>
                <div className="flex flex-wrap gap-2">
                  {themeList.map((t: string, idx: number) => (
                    <span key={idx} className="bg-purple-950/40 border border-purple-800/50 text-purple-300 text-xs px-2.5 py-1 rounded-md font-medium">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Sinopsis */}
            <div>
              <span className="text-xs text-gray-500 uppercase font-bold block mb-1">Sinopsis</span>
              <p className="text-xs text-gray-300 leading-relaxed bg-gray-950/30 p-3 rounded-lg border border-gray-800/50">
                {manga.synopsis || 'Belum ada sinopsis untuk komik ini.'}
              </p>
            </div>

          </div>
        </div>

        {/* Daftar Chapter */}
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-xl space-y-4">
          <h2 className="text-xl font-bold text-orange-400">Daftar Chapter</h2>
          <div className="grid gap-2 max-h-96 overflow-y-auto pr-2">
            {chapters && chapters.length > 0 ? (
              chapters.map((ch) => (
                <Link
                  key={ch.id}
                  href={/read/${manga.slug}/${ch.chapter_number}}
                  className="flex justify-between items-center bg-gray-800 hover:bg-gray-750 border border-gray-700/70 p-3.5 rounded-xl transition text-sm group"
                >
                  <span className="font-semibold text-gray-200 group-hover:text-orange-400 transition">
                    Chapter {ch.chapter_number} {ch.title ? `- ${ch.title}` : ''}
                  </span>
                  <span className="text-xs text-gray-400 group-hover:text-white font-medium">
                    Baca →
                  </span>
                </Link>
              ))
            ) : (
              <p className="text-xs text-gray-500">Belum ada chapter yang rilis.</p>
            )}
          </div>
        </div>

      </div>
    </main>
  );
}