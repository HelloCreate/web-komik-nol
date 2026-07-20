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

  // State untuk Fitur Hapus Halaman
  const [targetChapterId, setTargetChapterId] = useState('');
  const [deletePageMsg, setDeletePageMsg] = useState('');

  // State untuk menampilkan daftar lengkap (Fitur Manajemen/Hapus)
  const [activeChapters, setActiveChapters] = useState<any[]>([]);

  // Ambil data dari Supabase
  const refreshData = async () => {
    const { data: mangas } = await supabase.from('manga').select('id, title, slug');
    if (mangas) setMangaList(mangas);

    const { data: chs } = await supabase
      .from('chapters')
      .select('id, chapter_number, manga(title)');
    if (chs) setActiveChapters(chs);
  };

  useEffect(() => {
    refreshData();
  }, []);

  // 1. Fungsi Tambah Komik
  const handleCreateManga = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !slug) return;
    const { error } = await supabase.from('manga').insert([{ title, slug, synopsis, cover_url: coverUrl, type, status }]);
    if (error) setMangaStatusMsg(`Gagal: ${error.message}`);
    else {
      setMangaStatusMsg('🎉 Komik berhasil ditambahkan!');
      setTitle(''); setSlug(''); setSynopsis(''); setCoverUrl('');
      refreshData();
    }
  };

  // 2. Fungsi Tambah Chapter
  const handleCreateChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMangaId || !chapterNumber) return;
    const { data, error } = await supabase.from('chapters').insert([{ manga_id: parseInt(selectedMangaId), chapter_number: parseFloat(chapterNumber), title: chapterTitle }]).select().single();
    if (error) setChapterStatusMsg(`Gagal: ${error.message}`);
    else {
      setChapterStatusMsg(`🎉 Chapter dibuat! ID = ${data.id}`);
      setChapterNumber(''); setChapterTitle('');
      refreshData();
    }
  };

  // 3. HAPUS MANGA (Otomatis menghapus chapter & gambar di dalamnya jika relasi CASCADE aktif)
  const handleDeleteManga = async (id: number, title: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus komik "${title}" beserta seluruh chapter di dalamnya?`)) return;
    const { error } = await supabase.from('manga').delete().eq('id', id);
    if (error) alert(`Gagal menghapus: ${error.message}`);
    else refreshData();
  };

  // 4. HAPUS CHAPTER (Otomatis menghapus halaman gambar di dalamnya jika CASCADE aktif)
  const handleDeleteChapter = async (id: number, num: number, mangaTitle: string) => {
    if (!confirm(`Hapus Chapter ${num} dari komik ${mangaTitle}?`)) return;
    const { error } = await supabase.from('chapters').delete().eq('id', id);
    if (error) alert(`Gagal menghapus chapter: ${error.message}`);
    else refreshData();
  };

  // 5. HAPUS SELURUH HALAMAN GAMBAR DI DALAM CHAPTER CERTAIN
  const handleDeleteAllPagesInChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetChapterId) return;
    if (!confirm(`Apakah Anda yakin ingin MENGOSONGKAN/MENGHAPUS SEMUA HALAMAN GAMBAR di dalam Chapter ID ${targetChapterId}?`)) return;

    const { error } = await supabase.from('chapter_images').delete().eq('chapter_id', parseInt(targetChapterId));
    if (error) setDeletePageMsg(`Gagal: ${error.message}`);
    else {
      setDeletePageMsg(`🎉 Semua halaman gambar di Chapter ID ${targetChapterId} berhasil dikosongkan!`);
      setTargetChapterId('');
    }
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="flex justify-between items-center border-b border-gray-800 pb-4">
          <h1 className="text-3xl font-bold text-orange-500">Panel Admin & Manajemen Yanama Comic</h1>
          <Link href="/upload" className="bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded text-sm font-semibold transition">
            → Ke Halaman Upload Gambar
          </Link>
        </div>

        {/* SECTION 1: DUA FORM INPUT TAMBAH */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-bold text-orange-400 mb-4">1. Tambah Judul Komik Baru</h2>
            <form onSubmit={handleCreateManga} className="space-y-4">
              <input type="text" placeholder="Judul Komik" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-sm" />
              <input type="text" placeholder="Slug URL" value={slug} onChange={(e) => setSlug(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-sm" />
              <input type="text" placeholder="Link URL Gambar Sampul" value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-sm" />
              <textarea placeholder="Sinopsis Komik..." value={synopsis} onChange={(e) => setSynopsis(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-sm h-20" />
              <div className="grid grid-cols-2 gap-2">
                <select value={type} onChange={(e) => setType(e.target.value)} className="bg-gray-800 border border-gray-700 rounded p-2 text-sm text-gray-300"><option value="Manga">Manga</option><option value="Manhwa">Manhwa</option></select>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="bg-gray-800 border border-gray-700 rounded p-2 text-sm text-gray-300"><option value="Ongoing">Ongoing</option><option value="Completed">Completed</option></select>
              </div>
              <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 font-bold py-2 rounded text-sm">Buat Komik</button>
            </form>
            {mangaStatusMsg && <p className="mt-2 text-xs text-orange-400 text-center">{mangaStatusMsg}</p>}
          </div>

          <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-bold text-orange-400 mb-4">2. Tambah Chapter Baru</h2>
            <form onSubmit={handleCreateChapter} className="space-y-4">
              <select value={selectedMangaId} onChange={(e) => setSelectedMangaId(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-sm">
                <option value="">-- Pilih Komik --</option>
                {mangaList.map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}
              </select>
              <input type="number" step="0.1" placeholder="Nomor Chapter (Misal: 1)" value={chapterNumber} onChange={(e) => setChapterNumber(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-sm" />
              <input type="text" placeholder="Judul/Nama Chapter (Opsional)" value={chapterTitle} onChange={(e) => setChapterTitle(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-sm" />
              <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 font-bold py-2 rounded text-sm">Buat Chapter Baru</button>
            </form>
            {chapterStatusMsg && <p className="mt-2 text-xs text-orange-400 text-center">{chapterStatusMsg}</p>}
          </div>
        </div>

        {/* SECTION 2: PENGHAPUSAN JALUR PINTAS HALAMAN GAMBAR */}
        <div className="bg-gray-900 border border-red-950 p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-bold text-red-400 mb-2">3. Hapus Seluruh Halaman Gambar (Reset Isi Chapter)</h2>
          <p className="text-xs text-gray-400 mb-4">Gunakan ini jika kamu salah mengunggah urutan gambar dalam suatu chapter dan ingin mengunggah ulangnya dari nol.</p>
          <form onSubmit={handleDeleteAllPagesInChapter} className="flex gap-4 max-w-md">
            <input type="number" placeholder="Masukkan ID Chapter" value={targetChapterId} onChange={(e) => setTargetChapterId(e.target.value)} className="bg-gray-800 border border-gray-700 rounded p-2 text-sm flex-1" />
            <button type="submit" className="bg-red-700 hover:bg-red-800 text-white font-bold px-4 py-2 rounded text-sm transition">Kosongkan Halaman</button>
          </form>
          {deletePageMsg && <p className="mt-2 text-xs text-red-400">{deletePageMsg}</p>}
        </div>

        {/* SECTION 3: DAFTAR KONTEN & TOMBOL HAPUS MANGA / CHAPTER */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Daftar Komik */}
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl">
            <h2 className="text-xl font-bold text-gray-300 mb-4">Daftar Judul Komik</h2>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
              {mangaList.map((m) => (
                <div key={m.id} className="flex justify-between items-center bg-gray-800 p-3 rounded border border-gray-700 text-sm">
                  <span>{m.title} <span className="text-xs text-gray-500">(ID: {m.id})</span></span>
                  <button onClick={() => handleDeleteManga(m.id, m.title)} className="text-xs bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white px-2 py-1 rounded transition">Hapus</button>
                </div>
              ))}
            </div>
          </div>

          {/* Daftar Chapter */}
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl">
            <h2 className="text-xl font-bold text-gray-300 mb-4">Daftar Chapter Terdaftar</h2>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
              {activeChapters.map((ch) => (
                <div key={ch.id} className="flex justify-between items-center bg-gray-800 p-3 rounded border border-gray-700 text-sm">
                  <div>
                    <span className="text-orange-400 font-medium">Ch {ch.chapter_number}</span>
                    <span className="text-gray-400 text-xs block">Komik: {ch.manga?.title || 'Tidak Diketahui'} (ID Chapter: {ch.id})</span>
                  </div>
                  <button onClick={() => handleDeleteChapter(ch.id, ch.chapter_number, ch.manga?.title)} className="text-xs bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white px-2 py-1 rounded transition">Hapus</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}