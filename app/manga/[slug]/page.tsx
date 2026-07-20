import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import Link from 'next/link';

async function getMangaDetails(slug: string) {
  const { data: manga } = await supabase
    .from('manga')
    .select('id, title, synopsis, cover_url, type, status, genre, author, artist')
    .eq('slug', slug)
    .single();

  if (!manga) return null;

  const { data: chapters } = await supabase
    .from('chapters')
    .select('id, chapter_number, title, created_at')
    .eq('manga_id', manga.id)
    .order('chapter_number', { ascending: false });

  return { manga, chapters: chapters || [] };
}

// Menggunakan Promise pada params untuk Next.js terbaru
export default async function MangaDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const data = await getMangaDetails(resolvedParams.slug);

  if (!data) {
    notFound();
  }

  const { manga, chapters } = data;

  return (
    <main className="min-h-screen bg-gray-950 text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-2xl">
        
        {/* Bagian Atas: Sampul dan Informasi Detail */}
        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
          <img 
            src={manga.cover_url || '/placeholder.jpg'} 
            alt={manga.title} 
            className="w-48 h-68 object-cover rounded-lg shadow-md border border-gray-700"
          />

          <div className="flex-1 space-y-3 w-full">
            <h1 className="text-2xl md:text-3xl font-bold text-orange-500 text-center md:text-left">
              {manga.title}
            </h1>

            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm bg-gray-950/50 p-4 rounded-lg border border-gray-800/60">
              <div>
                <span className="text-gray-400 block text-xs uppercase font-semibold">Jenis</span>
                <span className="text-orange-400 font-medium">{manga.type}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-xs uppercase font-semibold">Status</span>
                <span className="text-green-400 font-medium">{manga.status}</span>
              </div>

              <div className="mt-1 border-t border-gray-800/40 pt-1 col-span-1">
                <span className="text-gray-400 block text-xs uppercase font-semibold">Author</span>
                <span className="text-gray-200">{manga.author || '-'}</span>
              </div>
              <div className="mt-1 border-t border-gray-800/40 pt-1 col-span-1">
                <span className="text-gray-400 block text-xs uppercase font-semibold">Artist</span>
                <span className="text-gray-200">{manga.artist || '-'}</span>
              </div>

              <div className="col-span-2 mt-1 border-t border-gray-800/40 pt-2">
                <span className="text-gray-400 block text-xs uppercase font-semibold mb-1">Genre</span>
                <div className="flex flex-wrap gap-1.5">
                  {manga.genre ? (
                    manga.genre.split(',').map((g: string, i: number) => (
                      <span key={i} className="bg-orange-600/20 text-orange-400 border border-orange-500/30 text-xs px-2 py-0.5 rounded">
                        {g.trim()}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500 text-xs">-</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sinopsis */}
        <div className="mt-8 border-t border-gray-800 pt-6">
          <h2 className="text-lg font-bold text-gray-200 mb-2">Sinopsis</h2>
          <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-line">
            {manga.synopsis || 'Tidak ada sinopsis untuk komik ini.'}
          </p>
        </div>

        {/* Daftar Chapter */}
        <div className="mt-8 border-t border-gray-800 pt-6">
          <h2 className="text-lg font-bold text-gray-200 mb-4">Daftar Chapter</h2>
          <div className="grid gap-2 max-h-96 overflow-y-auto pr-1">
            {chapters.length === 0 ? (
              <p className="text-gray-500 text-sm italic">Belum ada chapter dirilis.</p>
            ) : (
              chapters.map((ch) => (
                <Link 
                  key={ch.id} 
                  href={`/manga/${resolvedParams.slug}/chapter/${ch.chapter_number}`}
                  className="flex justify-between items-center bg-gray-950 hover:bg-orange-600/10 border border-gray-800 hover:border-orange-500/40 p-3 rounded-lg transition"
                >
                  <span className="font-medium text-gray-200 hover:text-orange-400 transition-colors">
                    Chapter {ch.chapter_number} {ch.title ? `- ${ch.title}` : ''}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(ch.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>

      </div>
    </main>
  );
}