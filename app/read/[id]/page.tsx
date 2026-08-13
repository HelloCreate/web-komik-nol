'use client';

import { use, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface ReadPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ReadPage({ params }: ReadPageProps) {
  // Unwraps params di Client Component
  const resolvedParams = use(params);
  const chapterId = parseInt(resolvedParams.id);

  const [chapter, setChapter] = useState<any>(null);
  const [images, setImages] = useState<any[]>([]);
  const [allChapters, setAllChapters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function fetchData() {
      if (isNaN(chapterId)) {
        setErrorMsg('ID Chapter tidak valid');
        setLoading(false);
        return;
      }

      setLoading(true);

      // 1. Ambil data chapter beserta detail komik
      const { data: chData, error: chErr } = await supabase
        .from('chapters')
        .select('*, manga(*)')
        .eq('id', chapterId)
        .single();

      if (chErr || !chData) {
        setErrorMsg(`Chapter ID ${chapterId} tidak ditemukan`);
        setLoading(false);
        return;
      }

      setChapter(chData);

      // 2. Ambil gambar-gambar halaman chapter
      const { data: imgData } = await supabase
        .from('chapter_images')
        .select('*')
        .eq('chapter_id', chapterId)
        .order('page_number', { ascending: true });

      if (imgData) setImages(imgData);

      // 3. Ambil seluruh chapter milik komik ini untuk navigasi
      const { data: allChData } = await supabase
        .from('chapters')
        .select('id, chapter_number')
        .eq('manga_id', chData.manga_id)
        .order('chapter_number', { ascending: true });

      if (allChData) setAllChapters(allChData);

      setLoading(false);
    }

    fetchData();
  }, [chapterId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-950 text-white p-12 text-center flex items-center justify-center">
        <p className="text-orange-400 font-semibold text-sm animate-pulse">⏳ Memuat Halaman Komik...</p>
      </main>
    );
  }

  if (errorMsg || !chapter) {
    return (
      <main className="min-h-screen bg-gray-950 text-white p-12 text-center space-y-4">
        <h1 className="text-2xl font-bold text-orange-500">Gagal Memuat</h1>
        <p className="text-xs text-gray-400">{errorMsg}</p>
        <Link href="/" className="inline-block bg-gray-800 border border-gray-700 text-gray-300 text-xs px-4 py-2 rounded">
          ← Kembali ke Beranda
        </Link>
      </main>
    );
  }

  // Hitung Chapter Sebelum & Sesudah
  const currentIndex = allChapters.findIndex((c) => c.id === chapterId);
  const prevChapter = currentIndex > 0 ? allChapters[currentIndex - 1] : null;
  const nextChapter = currentIndex !== -1 && currentIndex < allChapters.length - 1 ? allChapters[currentIndex + 1] : null;

  return (
    <main className="min-h-screen bg-gray-950 text-white pb-16 select-none">
      
      {/* Header Sticky Atas */}
      <div className="sticky top-0 z-50 bg-gray-900/90 backdrop-blur-md border-b border-gray-800 px-4 py-3">
        <div className="max-w-4xl mx-auto flex justify-between items-center text-xs md:text-sm">
          <Link 
            href={`/manga/${chapter.manga?.slug}`}
            className="text-orange-400 hover:text-orange-300 font-semibold truncate max-w-[200px] md:max-w-none"
          >
            ← {chapter.manga?.title}
          </Link>
          <span className="font-bold text-gray-200">
            Chapter {chapter.chapter_number}
          </span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-2 md:px-0 mt-6 space-y-6">
        
        {/* Tombol Navigasi Atas */}
        <div className="flex justify-between items-center gap-4 bg-gray-900 border border-gray-800 p-3 rounded-xl text-xs font-semibold">
          {prevChapter ? (
            <Link href={`/read/${prevChapter.id}`} className="bg-gray-800 hover:bg-gray-700 text-gray-200 px-3 py-2 rounded transition">
              ← Ch {prevChapter.chapter_number}
            </Link>
          ) : (
            <span className="text-gray-600 px-3 py-2">← Awal</span>
          )}

          <Link href={`/manga/${chapter.manga?.slug}`} className="text-orange-400 hover:underline">
            Daftar Chapter
          </Link>

          {nextChapter ? (
            <Link href={`/read/${nextChapter.id}`} className="bg-orange-600 hover:bg-orange-500 text-white px-3 py-2 rounded transition">
              Ch {nextChapter.chapter_number} →
            </Link>
          ) : (
            <span className="text-gray-600 px-3 py-2">Akhir →</span>
          )}
        </div>

        {/* Gambar Halaman Komik (Dengan Fitur Anti Klik Kanan & Anti Drag) */}
        <div className="flex flex-col items-center bg-black min-h-[400px] rounded-xl overflow-hidden border border-gray-900 shadow-2xl">
          {images && images.length > 0 ? (
            images.map((img, idx) => (
              <img
                key={img.id || idx}
                src={img.image_url}
                alt={`Halaman ${img.page_number}`}
                className="w-full h-auto block select-none pointer-events-auto"
                loading="lazy"
                onContextMenu={(e) => e.preventDefault()} // Blokir Klik Kanan
                onDragStart={(e) => e.preventDefault()}    // Blokir Drag Gambar
              />
            ))
          ) : (
            <div className="p-12 text-center space-y-2">
              <p className="text-orange-400 font-bold text-sm">Halaman gambar belum diunggah.</p>
              <p className="text-xs text-gray-500">Silakan upload gambar halaman via menu /upload untuk Chapter ID {chapterId}.</p>
            </div>
          )}
        </div>

        {/* Tombol Navigasi Bawah */}
        <div className="flex justify-between items-center gap-4 bg-gray-900 border border-gray-800 p-3 rounded-xl text-xs font-semibold">
          {prevChapter ? (
            <Link href={`/read/${prevChapter.id}`} className="bg-gray-800 hover:bg-gray-700 text-gray-200 px-3 py-2 rounded transition">
              ← Chapter Sebelumnya
            </Link>
          ) : (
            <span className="text-gray-600 px-3 py-2">Chapter Pertama</span>
          )}

          {nextChapter ? (
            <Link href={`/read/${nextChapter.id}`} className="bg-orange-600 hover:bg-orange-500 text-white px-3 py-2 rounded transition">
              Chapter Selanjutnya →
            </Link>
          ) : (
            <span className="text-gray-600 px-3 py-2">Chapter Terbaru</span>
          )}
        </div>

      </div>
    </main>
  );
}