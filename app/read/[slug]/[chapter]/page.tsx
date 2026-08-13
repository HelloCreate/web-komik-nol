'use client';

import { use, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface ReadPageProps {
  params: Promise<{
    slug: string;
    chapter: string;
  }>;
}

export default function ReadChapterPage({ params }: ReadPageProps) {
  const resolvedParams = use(params);
  const { slug, chapter: chapterNumStr } = resolvedParams;
  const chapterNumber = parseFloat(chapterNumStr);

  const [manga, setManga] = useState<any>(null);
  const [currentChapter, setCurrentChapter] = useState<any>(null);
  const [images, setImages] = useState<any[]>([]);
  const [allChapters, setAllChapters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function fetchData() {
      if (isNaN(chapterNumber)) {
        setErrorMsg('Nomor Chapter tidak valid');
        setLoading(false);
        return;
      }

      setLoading(true);

      // 1. Ambil data komik berdasarkan slug
      const { data: mangaData, error: mangaErr } = await supabase
        .from('manga')
        .select('*')
        .eq('slug', slug)
        .single();

      if (mangaErr || !mangaData) {
        setErrorMsg('Komik tidak ditemukan');
        setLoading(false);
        return;
      }

      setManga(mangaData);

      // 2. Ambil chapter spesifik berdasarkan manga_id & chapter_number
      const { data: chData, error: chErr } = await supabase
        .from('chapters')
        .select('*')
        .eq('manga_id', mangaData.id)
        .eq('chapter_number', chapterNumber)
        .single();

      if (chErr || !chData) {
        setErrorMsg(`Chapter ${chapterNumber} tidak ditemukan untuk komik ini`);
        setLoading(false);
        return;
      }

      setCurrentChapter(chData);

      // 3. Ambil gambar halaman
      const { data: imgData } = await supabase
        .from('chapter_images')
        .select('*')
        .eq('chapter_id', chData.id)
        .order('page_number', { ascending: true });

      if (imgData) setImages(imgData);

      // 4. Ambil list chapter untuk navigasi
      const { data: allChData } = await supabase
        .from('chapters')
        .select('id, chapter_number')
        .eq('manga_id', mangaData.id)
        .order('chapter_number', { ascending: true });

      if (allChData) setAllChapters(allChData);

      setLoading(false);
    }

    fetchData();
  }, [slug, chapterNumber]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-950 text-white p-12 text-center flex items-center justify-center">
        <p className="text-orange-400 font-semibold text-sm animate-pulse">⏳ Memuat Halaman Komik...</p>
      </main>
    );
  }

  if (errorMsg || !manga || !currentChapter) {
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

  const currentIndex = allChapters.findIndex((c) => c.chapter_number === chapterNumber);
  const prevChapter = currentIndex > 0 ? allChapters[currentIndex - 1] : null;
  const nextChapter = currentIndex !== -1 && currentIndex < allChapters.length - 1 ? allChapters[currentIndex + 1] : null;

  return (
    <main className="min-h-screen bg-gray-950 text-white pb-16 select-none">
      
      {/* Header Sticky Atas */}
      <div className="sticky top-0 z-50 bg-gray-900/90 backdrop-blur-md border-b border-gray-800 px-4 py-3">
        <div className="max-w-4xl mx-auto flex justify-between items-center text-xs md:text-sm">
          <Link 
            href={`/manga/${manga.slug}`}
            className="text-orange-400 hover:text-orange-300 font-semibold truncate max-w-[200px] md:max-w-none"
          >
            ← {manga.title}
          </Link>
          <span className="font-bold text-gray-200">
            Chapter {currentChapter.chapter_number}
          </span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-2 md:px-0 mt-6 space-y-6">
        
        {/* Navigasi Atas */}
        <div className="flex justify-between items-center gap-4 bg-gray-900 border border-gray-800 p-3 rounded-xl text-xs font-semibold">
          {prevChapter ? (
            <Link href={`/read/${slug}/${prevChapter.chapter_number}`} className="bg-gray-800 hover:bg-gray-700 text-gray-200 px-3 py-2 rounded transition">
              ← Ch {prevChapter.chapter_number}
            </Link>
          ) : (
            <span className="text-gray-600 px-3 py-2">← Awal</span>
          )}

          <Link href={`/manga/${manga.slug}`} className="text-orange-400 hover:underline">
            Daftar Chapter
          </Link>

          {nextChapter ? (
            <Link href={`/read/${slug}/${nextChapter.chapter_number}`} className="bg-orange-600 hover:bg-orange-500 text-white px-3 py-2 rounded transition">
              Ch {nextChapter.chapter_number} →
            </Link>
          ) : (
            <span className="text-gray-600 px-3 py-2">Akhir →</span>
          )}
        </div>

        {/* Gambar Halaman Komik */}
        <div className="flex flex-col items-center bg-black min-h-[400px] rounded-xl overflow-hidden border border-gray-900 shadow-2xl">
          {images && images.length > 0 ? (
            images.map((img, idx) => (
              <img
                key={img.id || idx}
                src={img.image_url}
                alt={`Halaman ${img.page_number}`}
                className="w-full h-auto block select-none pointer-events-auto"
                loading="lazy"
                onContextMenu={(e) => e.preventDefault()}
                onDragStart={(e) => e.preventDefault()}
              />
            ))
          ) : (
            <div className="p-12 text-center space-y-2">
              <p className="text-orange-400 font-bold text-sm">Halaman gambar belum diunggah.</p>
              <p className="text-xs text-gray-500">Silakan upload gambar halaman untuk Chapter ID {currentChapter.id} via menu /upload.</p>
            </div>
          )}
        </div>

        {/* Navigasi Bawah */}
        <div className="flex justify-between items-center gap-4 bg-gray-900 border border-gray-800 p-3 rounded-xl text-xs font-semibold">
          {prevChapter ? (
            <Link href={`/read/${slug}/${prevChapter.chapter_number}`} className="bg-gray-800 hover:bg-gray-700 text-gray-200 px-3 py-2 rounded transition">
              ← Chapter Sebelumnya
            </Link>
          ) : (
            <span className="text-gray-600 px-3 py-2">Chapter Pertama</span>
          )}

          {nextChapter ? (
            <Link href={`/read/${slug}/${nextChapter.chapter_number}`} className="bg-orange-600 hover:bg-orange-500 text-white px-3 py-2 rounded transition">
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