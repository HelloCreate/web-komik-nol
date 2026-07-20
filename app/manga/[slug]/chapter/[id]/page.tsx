import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import Link from 'next/link';

// PAKSA NEXT.JS UNTUK SELALU AMBIL DATA TERBARU DARI DATABASE (ANTI-CACHE)
export const dynamic = 'force-dynamic';

async function getChapterImages(chapterId: number) {
  const { data, error } = await supabase
    .from('chapter_images')
    .select('image_url, page_number')
    .eq('chapter_id', chapterId)
    .order('page_number', { ascending: true });

  if (error) {
    console.error("Error ambil gambar:", error.message);
    return [];
  }
  return data || [];
}

async function getChapterData(slug: string, chapterNumFromUrl: string) {
  const { data: manga } = await supabase
    .from('manga')
    .select('id, title')
    .eq('slug', slug)
    .single();

  if (!manga) return null;

  const { data: chapter } = await supabase
    .from('chapters')
    .select('id, chapter_number')
    .eq('manga_id', manga.id)
    .eq('chapter_number', parseFloat(chapterNumFromUrl))
    .single();

  if (!chapter) return null;

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
        
        <div className="bg-gray-900 border border-gray-800 p-4 rounded-xl flex justify-between items-center shadow-lg">
          <Link href={`/manga/${resolvedParams.slug}`} className="text-orange-500 hover:underline text-sm font-medium">
            ← Kembali ke {manga.title}
          </Link>
          <h1 className="text-md md:text-lg font-bold">
            Chapter {chapter.chapter_number}
          </h1>
        </div>

        <div className="flex flex-col items-center bg-gray-900 border border-gray-800 rounded-xl p-2 md:p-4 shadow-2xl overflow-hidden">
          {images.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500 italic text-sm mb-2">Belum ada halaman gambar di chapter ini.</p>
              <p className="text-xs text-gray-700">DEBUG info: Terhubung ke Chapter ID {chapter.id}</p>
            </div>
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