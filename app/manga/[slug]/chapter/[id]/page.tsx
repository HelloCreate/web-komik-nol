import { supabase } from '@/lib/supabase';
import Link from 'next/link';

async function getChapterImages(chapterId: string) {
  const { data, error } = await supabase
    .from('chapter_images')
    .select('*')
    .eq('chapter_id', parseInt(chapterId))
    .order('page_number', { ascending: true });
  
  if (error) return [];
  return data;
}

export default async function ChapterPage({ params }: { params: Promise<{ slug: string; id: string }> }) {
  const resolvedParams = await params;
  const images = await getChapterImages(resolvedParams.id);
  
  // ... sisa kode return di bawahnya tetap sama seperti sebelumnya ...
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center p-4">
      {/* Menu Navigasi Atas */}
      <div className="w-full max-w-2xl bg-gray-900/80 backdrop-blur border border-gray-800 p-4 rounded-xl flex justify-between items-center sticky top-4 z-50 mb-6">
        <Link href={`/manga/${resolvedParams.slug}`} className="text-orange-500 hover:underline text-sm">
          ← Detail Komik
        </Link>
        <span className="font-bold text-sm text-gray-300">Membaca Chapter</span>
      </div>

      {/* Konten Gambar Lembaran Komik */}
      <div className="w-full max-w-2xl flex flex-col items-center bg-gray-950 rounded-lg overflow-hidden shadow-2xl">
        {images.length === 0 ? (
          <div className="p-20 text-center text-gray-500 flex flex-col items-center gap-2">
            <p>Belum ada halaman gambar di chapter ini.</p>
            <Link href="/upload" className="text-orange-500 hover:underline text-sm font-semibold">Yuk upload lewat halaman rahasia!</Link>
          </div>
        ) : (
          images.map((img) => (
            <img 
              key={img.id} 
              src={img.image_url} 
              alt={`Halaman ${img.page_number}`} 
              className="w-full h-auto object-contain block select-none pointer-events-none"
              loading="lazy"
            />
          ))
        )}
      </div>
    </main>
  );
}