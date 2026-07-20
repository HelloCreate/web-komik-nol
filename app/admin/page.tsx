'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function AdminPage() {
  // State untuk Tambah Komik
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [type, setType] = useState('Manga');
  const [status, setStatus] = useState('Ongoing');
  const [mangaStatusMsg, setMangaStatusMsg] = useState('');

  // State untuk Tambah Chapter
  const [mangaList, setMangaList] = useState<any[]>([]);
  const [selectedMangaId, setSelectedMangaId] = useState('');
  const [chapterNumber, setChapterNumber] = useState('');
  const [chapterTitle, setChapterTitle] = useState('');
  const [chapterStatusMsg, setChapterStatusMsg] = useState('');

  // Ambil daftar komik untuk pilihan dropdown chapter
  useEffect(() => {
    async function fetchManga() {
      const { data } = await supabase.from('manga').select('id, title');
      if (data) setMangaList(data);
    }
    fetchManga();
  }, [mangaStatusMsg]);

  // Fungsi Tambah Komik Baru
  const handleCreateManga = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !slug) {
      setMangaStatusMsg('Judul dan Slug wajib diisi!');
      return;
    }

    const { error } = await supabase
      .from('manga')
      .insert([{ title, slug, synopsis, cover_url: coverUrl, type, status }]);

    if (error) {
      setMangaStatusMsg(`Gagal: ${error.message}`);
    } else {
      setMangaStatusMsg('🎉 Komik baru berhasil ditambahkan!');
      setTitle(''); setSlug(''); setSynopsis(''); setCoverUrl('');
    }
  };

  // Fungsi Tambah Chapter Baru
  const handleCreateChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMangaId || !chapterNumber) {
      setChapterStatusMsg('Pilih Komik dan isi Nomor Chapter!');
      return;
    }

    const { data, error } = await supabase
      .from('chapters')
      .insert([
        { 
          manga_id: parseInt(selectedMangaId), 
          chapter_number: parseFloat(chapterNumber), 
          title: chapterTitle 
        }
      ])
      .select()
      .single();

    if (error) {
      setChapterStatusMsg(`Gagal: ${error.message}`);
    } else {
      setChapterStatusMsg(`🎉 Chapter berhasil dibuat! ID Chapter = ${data.id}. Catat ID ini untuk upload gambar!`);
      setChapterNumber(''); setChapterTitle('');
    }
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="flex justify-between items-center border-b border-gray-800 pb-4">
          <h1 className="text-3xl font-bold text-orange-500">Panel Admin Yanama Comic</h1>
          <Link href="/upload" className="bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded text-sm font-semibold transition">
            → Ke Halaman Upload Gambar
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Form 1: Tambah Judul Komik Baru */}
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-bold text-orange-400 mb-4">1. Tambah Judul Komik Baru</h2>
            <form onSubmit={handleCreateManga} className="space-y-4">
              <input type="text" placeholder="Judul Komik (Contoh: Yankee JK Ayaka san)" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-sm" />
              <input type="text" placeholder="Slug URL (Contoh: yankee-jk-ayaka-san)" value={slug} onChange={(e) => setSlug(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-sm" />
              <input type="text" placeholder="Link URL Gambar Sampul/Cover" value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-sm" />
              <textarea placeholder="Sinopsis Komik..." value={synopsis} onChange={(e) => setSynopsis(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-sm h-24" />
              <div className="grid grid-cols-2 gap-2">
                <select value={type} onChange={(e) => setType(e.target.value)} className="bg-gray-800 border border-gray-700 rounded p-2 text-sm text-gray-300">
                  <option value="Manga">Manga (Jepang)</option>
                  <option value="Manhwa">Manhwa (Korea)</option>
                  <option value="Manhua">Manhua (China)</option>
                </select>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="bg-gray-800 border border-gray-700 rounded p-2 text-sm text-gray-300">
                  <option value="Ongoing">Ongoing</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 font-bold py-2 rounded transition text-sm">Buat Komik</button>
            </form>
            {mangaStatusMsg && <p className="mt-3 text-xs text-orange-400 text-center">{mangaStatusMsg}</p>}
          </div>

          {/* Form 2: Tambah Chapter Baru */}
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-bold text-orange-400 mb-4">2. Tambah Chapter Baru</h2>
            <form onSubmit={handleCreateChapter} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Pilih Judul Komik</label>
                <select value={selectedMangaId} onChange={(e) => setSelectedMangaId(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-sm text-white">
                  <option value="">-- Pilih Komik --</option>
                  {mangaList.map((m) => (
                    <option key={m.id} value={m.id}>{m.title}</option>
                  ))}
                </select>
              </div>
              <input type="number" step="0.1" placeholder="Nomor Chapter (Contoh: 1 atau 1.5)" value={chapterNumber} onChange={(e) => setChapterNumber(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-sm" />
              <input type="text" placeholder="Judul/Nama Chapter (Opsional, Contoh: Awal Pertemuan)" value={chapterTitle} onChange={(e) => setChapterTitle(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-sm" />
              <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 font-bold py-2 rounded transition text-sm">Buat Chapter Baru</button>
            </form>
            {chapterStatusMsg && <p className="mt-3 text-xs text-orange-400 text-center">{chapterStatusMsg}</p>}
          </div>
        </div>
      </div>
    </main>
  );
}