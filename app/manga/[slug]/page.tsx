import { supabase } from '@/lib/supabase';
import Link from 'next/link';

async function getMangaDetail(slug: string) {
  const { data, error } = await supabase
    .from('manga')
    .select('*')
    .eq('slug', slug)
    .single();
  
  if (error) return null;
  return data;
}

async function getChapters(mangaId: number) {
  const { data, error } = await supabase
    .from('chapters')
    .select('*')
    .eq('manga_id', mangaId)
    .order('chapter_number', { ascending: false });
  
  if (error) return [];
  return data;
}

export default async function MangaDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  // Kita bongkar dulu params-nya menggunakan await di sini
  const resolvedParams = await params;
  
  // Baru setelah itu kita panggil fungsi getMangaDetail menggunakan slug yang sudah dibongkar
  const manga = await getMangaDetail(resolvedParams.slug);

  if (!manga) {
    return <div className="text-center p-10 text-white bg-gray-900 min-h-screen">Komik tidak ditemukan.</div>;
  }

  const chapters = await getChapters(manga.id);

  return (
    <main className="min-h-screen bg-gray-950 text-white p-6 md:p-12">
      <Link href="/" className="text-orange-500 hover:underline text-sm">← Kembali ke Beranda</Link>
      
      <div className="flex flex-col md:flex-row gap-8 mt-6">
        <img src={manga.cover_url} alt={manga.title} className="w-full md:w-64 h-96 object-cover rounded-lg shadow-xl" />
        <div className="flex-1">
          <span className="px-3 py-1 bg-orange-600 rounded text-xs font-semibold">{manga.type}</span>
          <h1 className="text-4xl font-bold mt-2 text-orange-400">{manga.title}</h1>
          <p className="mt-4 text-gray-300 leading-relaxed">{manga.synopsis}</p>
          <p className="mt-2 text-sm text-gray-400">Status: <span className="text-green-400">{manga.status}</span></p>
        </div>
      </div>

      <div className="mt-12 max-w-2xl">
        <h2 className="text-xl font-bold border-b border-gray-800 pb-2 mb-4">Daftar Chapter ({chapters.length})</h2>
        <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800">
          {chapters.length === 0 ? (
            <p className="p-4 text-gray-500 text-center">Belum ada chapter yang dirilis.</p>
          ) : (
            chapters.map((ch) => (
              <Link 
                key={ch.id} 
                href={`/manga/${resolvedParams.slug}/chapter/${ch.id}`}
                className="flex justify-between items-center p-4 hover:bg-gray-800 border-b border-gray-800 last:border-0 transition"
              >
                <span className="font-medium text-gray-200">Chapter {ch.chapter_number} {ch.title && `- ${ch.title}`}</span>
                <span className="text-xs text-gray-500">{new Date(ch.created_at).toLocaleDateString('id-ID')}</span>
              </Link>
            ))
          )}
        </div>
      </div>
    </main>
  );
}