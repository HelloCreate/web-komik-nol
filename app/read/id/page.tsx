import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const revalidate = 0;

interface ReadPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ReadPage({ params }: ReadPageProps) {
  const { id } = await params;
  const chapterId = parseInt(id);

  if (isNaN(chapterId)) {
    notFound();
  }

  // 1. Ambil data chapter beserta info komik induknya
  const { data: chapter, error: chapterError } = await supabase
    .from('chapters')
    .select('*, manga(*)')
    .eq('id', chapterId)
    .single();

  if (chapterError || !chapter) {
    notFound();
  }

  // 2. Ambil seluruh gambar halaman chapter ini (diurutkan berdasarkan page_number)
  const { data: images } = await supabase
    .from('chapter_images')
    .select('*')
    .eq('chapter_id', chapterId)
    .order('page_number', { ascending: true });

  // 3. Ambil daftar seluruh chapter komik ini untuk navigasi Next / Prev
  const { data: allChapters } = await supabase
    .from('chapters')
    .select('id, chapter_number')
    .eq('manga_id', chapter.manga_id)
    .order('chapter_number', { ascending: true });

  // Cari chapter sebelum & sesudah
  const currentIndex = allChapters?.findIndex((c) => c.id === chapterId) ?? -1;
  const prevChapter = currentIndex > 0 ? allChapters?.[currentIndex - 1] : null;
  const nextChapter = currentIndex !== -1 && allChapters && currentIndex < allChapters.length - 1 ? allChapters[currentIndex + 1] : null;

  return (
    <main className="min-h-screen bg-gray-950 text-white pb-16">
      
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

        {/* Gambar Halaman Komik (Webtoon View / Scroll Bawah) */}
        <div className="flex flex-col items-center bg-black min-h-[500px] rounded-xl overflow-hidden border border-gray-900 shadow-2xl">
          {images && images.length > 0 ? (
            images.map((img, idx) => (
              <img
                key={img.id || idx}
                src={img.image_url}
                alt={`Halaman ${img.page_number}`}
                className="w-full h-auto block"
                loading="lazy"
              />
            ))
          ) : (
            <div className="p-12 text-center space-y-2">
              <p className="text-orange-400 font-bold text-sm">Halaman gambar belum diunggah.</p>
              <p className="text-xs text-gray-500">Silakan upload gambar halaman untuk Chapter ID {chapterId} via panel admin/upload.</p>
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