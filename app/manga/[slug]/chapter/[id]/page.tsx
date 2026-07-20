import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import Link from 'next/link';

// Fungsi mengambil gambar berdasarkan ID asli chapter dari database
async function getChapterImages(chapterId: number) {
  const { data, error } = await supabase
    .from('chapter_images')
    .select('image_url, page_number')
    .eq('chapter_id', chapterId)
    .order('page_number', { ascending: true });

  if (error) return [];
  return data || [];
}

// Fungsi relasi untuk mencari ID asli chapter berdasarkan Slug dan Nomor Chapter (id dari URL)
async function getChapterData(slug: string, chapterNumFromUrl: string) {
  // 1. Cari komiknya dulu berdasarkan slug
  const { data: manga } = await supabase
    .from('manga')
    .select('id, title')
    .eq('slug', slug)
    .single();

  if (!manga) return null;

  // 2. Cari data chapternya di database dengan mencocokkan nomor chapternya (di-parse ke float)
  const { data: chapter } = await supabase
    .from('chapters')
    .select('id, chapter_number')
    .eq('manga_id', manga.id)
    .eq('chapter_number', parseFloat(chapterNumFromUrl))
    .single();

  if (!chapter) return null;

  // 3. Ambil semua gambar menggunakan ID asli (id = 22)
  const images = await getChapterImages(chapter.id);

  return { manga, chapter, images };
}

export default async function ChapterPage({ params }: { params: Promise<{ slug: string; id: string }> }) {
  const resolvedParams = await params;
  const data = await getChapterData(resolvedParams.slug, resolvedParams.id);

  if (!data) {
    notFound();
  }

  const { manga, chapter, images } = data;

  return (
    <main className="min-h-screen bg-gray-950 text-white p-4">
      <div className="max-w-3xl mx-auto space-y-4">
        
        {/* Navigasi Atas */}
        <div className="bg-gray-900 border border-gray-800 p-4 rounded-xl flex justify-between items-center shadow-lg">
          <Link href={`/manga/${resolvedParams.slug}`} className="text-orange-500 hover:underline text-sm font-medium">
            ← Kembali ke {manga.title}
          </Link>
          <h1 className="text-md md:text-lg font-bold">
            Chapter {chapter.chapter_number}
          </h1>
        </div>

        {/* Tempat Lembaran Gambar Komik */}
        <div className="flex flex-col items-center bg-gray-900 border border-gray-800 rounded-xl p-2 md:p-4 shadow-2xl overflow-hidden">
          {images.length === 0 ? (
            <p className="text-gray-500 py-20 italic text-sm">Belum ada halaman gambar di chapter ini.</p>
          ) : (
            images.map((img: any, index: number) => (
              <img
                key={index}
                src={img.image_url}
                alt={`Halaman ${img.page_number}`}
                className="w-full max-w-2xl object-contain mb-1"
                loading="lazy"
              />
            ))
          )}
        </div>

      </div>
    </main>
  );
}