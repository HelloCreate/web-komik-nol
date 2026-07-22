'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function AdminPage() {
  // State Utama List Data
  const [mangaList, setMangaList] = useState<any[]>([]);
  const [activeChapters, setActiveChapters] = useState<any[]>([]);

  // Mode Form Komik: 'TAMBAH' atau 'EDIT'
  const [formMode, setFormMode] = useState<'TAMBAH' | 'EDIT'>('TAMBAH');
  const [selectedMangaIdForEdit, setSelectedMangaIdForEdit] = useState<number | null>(null);

  // State Form Komik
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null); // File gambar cover fisik
  const [uploadingCover, setUploadingCover] = useState(false);
  const [type, setType] = useState('Manga');
  const [status, setStatus] = useState('Ongoing');
  const [genre, setGenre] = useState('');
  const [author, setAuthor] = useState('');
  const [artist, setArtist] = useState('');
  
  const [mangaStatusMsg, setMangaStatusMsg] = useState('');

  // State Form Tambah Chapter
  const [selectedMangaId, setSelectedMangaId] = useState('');
  const [chapterNumber, setChapterNumber] = useState('');
  const [chapterTitle, setChapterTitle] = useState('');
  const [chapterStatusMsg, setChapterStatusMsg] = useState('');

  // State Fitur Hapus Halaman Gambar
  const [targetChapterId, setTargetChapterId] = useState('');
  const [deletePageMsg, setDeletePageMsg] = useState('');

  // Fetch Data
  const refreshData = async () => {
    const { data: mangas } = await supabase.from('manga').select('*').order('title', { ascending: true });
    if (mangas) setMangaList(mangas);

    const { data: chs } = await supabase.from('chapters').select('id, chapter_number, manga(title)').order('id', { ascending: false });
    if (chs) setActiveChapters(chs);
  };

  useEffect(() => {
    refreshData();
  }, []);

  const startEditingManga = (manga: any) => {
    setFormMode('EDIT');
    setSelectedMangaIdForEdit(manga.id);
    setTitle(manga.title || '');
    setSlug(manga.slug || '');
    setSynopsis(manga.synopsis || '');
    setCoverUrl(manga.cover_url || '');
    setCoverFile(null);
    setType(manga.type || 'Manga');
    setStatus(manga.status || 'Ongoing');
    setGenre(manga.genre || '');
    setAuthor(manga.author || '');
    setArtist(manga.artist || '');
    setMangaStatusMsg(`✍️ Sedang mengedit komik: ${manga.title}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEditingManga = () => {
    setFormMode('TAMBAH');
    setSelectedMangaIdForEdit(null);
    setTitle(''); setSlug(''); setSynopsis(''); setCoverUrl(''); setCoverFile(null);
    setGenre(''); setAuthor(''); setArtist(''); setType('Manga'); setStatus('Ongoing');
    setMangaStatusMsg('');
  };

  // FUNGSI SUBMIT (Dengan Auto Upload Gambar Cover ke Supabase Storage)
  const handleMangaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !slug) return;

    setUploadingCover(true);
    let finalCoverUrl = coverUrl;

    // Jika pengguna memilih file gambar baru dari HP/Laptop
    if (coverFile) {
      setMangaStatusMsg('⏳ Mengunggah gambar cover...');
      const fileExt = coverFile.name.split('.').pop();
      const fileName = `covers/cover_${Date.now()}.${fileExt}`;

      const { error: storageError } = await supabase.storage
        .from('komik-images')
        .upload(fileName, coverFile, { cacheControl: '3600', upsert: true });

      if (storageError) {
        setMangaStatusMsg(`Gagal upload cover: ${storageError.message}`);
        setUploadingCover(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from('komik-images')
        .getPublicUrl(fileName);

      finalCoverUrl = publicUrlData.publicUrl;
    }

    const mangaData = { 
      title, 
      slug, 
      synopsis, 
      cover_url: finalCoverUrl, 
      type, 
      status, 
      genre, 
      author, 
      artist 
    };

    if (formMode === 'TAMBAH') {
      const { error } = await supabase.from('manga').insert([mangaData]);
      if (error) setMangaStatusMsg(`Gagal Tambah: ${error.message}`);
      else {
        setMangaStatusMsg('🎉 Judul komik baru berhasil ditambahkan beserta cover!');
        cancelEditingManga();
        refreshData();
      }
    } else {
      if (!selectedMangaIdForEdit) return;
      const { error } = await supabase.from('manga').update(mangaData).eq('id', selectedMangaIdForEdit);
      if (error) setMangaStatusMsg(`Gagal Update: ${error.message}`);
      else {
        setMangaStatusMsg('💾 Perubahan data komik & cover berhasil disimpan!');
        cancelEditingManga();
        refreshData();
      }
    }

    setUploadingCover(false);
  };

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

  const handleDeleteManga = async (id: number, mangaTitle: string) => {
    if (!confirm(`Apakah Anda yakin ingin MENGHAPUS TOTAL komik "${mangaTitle}" beserta seluruh chapternya?`)) return;
    const { error } = await supabase.from('manga').delete().eq('id', id);
    if (error) alert(`Gagal menghapus: ${error.message}`);
    else {
      if (selectedMangaIdForEdit === id) cancelEditingManga();
      refreshData();
    }
  };

  const handleDeleteChapter = async (id: number, num: number, mangaTitle: string) => {
    if (!confirm(`Hapus Chapter ${num} dari komik ${mangaTitle}?`)) return;
    const { error } = await supabase.from('chapters').delete().eq('id', id);
    if (error) alert(`Gagal menghapus chapter: ${error.message}`);
    else refreshData();
  };

  const handleDeleteAllPagesInChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetChapterId) return;
    if (!confirm(`Yakin mengosongkan halaman di Chapter ID ${targetChapterId}?`)) return;
    const { error } = await supabase.from('chapter_images').delete().eq('chapter_id', parseInt(targetChapterId));
    if (error) setDeletePageMsg(`Gagal: ${error.message}`);
    else {
      setDeletePageMsg(`🎉 Halaman di Chapter ID ${targetChapterId} dikosongkan!`);
      setTargetChapterId('');
    }
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Header Navigasi */}
        <div className="flex justify-between items-center border-b border-gray-800 pb-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-orange-500">Panel Admin & Manajemen</h1>
            <p className="text-xs text-green-400 font-medium">🛡️ Sesi Admin Aktif & Terlindungi</p>
          </div>
          <div className="flex gap-3 items-center">
            <Link href="/upload" className="bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded text-sm font-semibold transition">
              → Ke Halaman Upload
            </Link>
            <button 
              onClick={() => {
                document.cookie = "admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Strict";
                window.location.href = '/login';
              }}
              className="bg-gray-800 hover:bg-red-700 border border-gray-700 hover:border-red-600 text-gray-300 hover:text-white px-3 py-2 rounded text-sm font-semibold transition"
            >
              Keluar (Logout)
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* FORM TAMBAH/EDIT KOMIK */}
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-orange-400">
                {formMode === 'TAMBAH' ? '1. Tambah Judul Komik Baru' : '📝 Mode Edit Data Komik'}
              </h2>
              {formMode === 'EDIT' && (
                <button type="button" onClick={cancelEditingManga} className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-400 px-2 py-1 rounded">
                  Batal Edit
                </button>
              )}
            </div>
            
            <form onSubmit={handleMangaSubmit} className="space-y-4">
              <input type="text" placeholder="Judul Komik" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-sm" required />
              <input type="text" placeholder="Slug URL (Contoh: solo-leveling)" value={slug} onChange={(e) => setSlug(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-sm" required />
              
              {/* FIELD UPLOAD GAMBAR COVER FOTONYA LANGSUNG */}
              <div>
                <label className="block text-xs text-gray-400 font-semibold mb-1">
                  Upload Gambar Sampul/Cover (Pilih dari HP / Laptop):
                </label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setCoverFile(e.target.files[0]);
                    }
                  }}
                  className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-sm text-gray-400 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-orange-600/20 file:text-orange-400 hover:file:bg-orange-600/30"
                />
                {coverUrl && !coverFile && (
                  <p className="text-[11px] text-gray-500 mt-1 truncate">Cover terpasang: {coverUrl}</p>
                )}
              </div>

              <input type="text" placeholder="Genre (Action, Drama, Fantasy)" value={genre} onChange={(e) => setGenre(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-sm" />
              
              <div className="grid grid-cols-2 gap-2">
                <input type="text" placeholder="Author / Penulis" value={author} onChange={(e) => setAuthor(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-sm" />
                <input type="text" placeholder="Artist / Penggambar" value={artist} onChange={(e) => setArtist(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-sm" />
              </div>
              
              <textarea placeholder="Sinopsis Komik..." value={synopsis} onChange={(e) => setSynopsis(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-sm h-20" />
              
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

              <button 
                type="submit" 
                disabled={uploadingCover}
                className={`w-full font-bold py-2 rounded text-sm transition ${uploadingCover ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : formMode === 'TAMBAH' ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
              >
                {uploadingCover ? '⏳ Mengunggah Gambar...' : formMode === 'TAMBAH' ? 'Buat Judul Komik' : 'Simpan Perubahan'}
              </button>
            </form>
            {mangaStatusMsg && <p className="mt-2 text-xs text-orange-400 text-center font-medium bg-gray-950/30 p-2 rounded">{mangaStatusMsg}</p>}
          </div>

          {/* FORM TAMBAH CHAPTER */}
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-bold text-orange-400 mb-4">2. Tambah Chapter Baru</h2>
            <form onSubmit={handleCreateChapter} className="space-y-4">
              <select value={selectedMangaId} onChange={(e) => setSelectedMangaId(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-sm" required>
                <option value="">-- Pilih Komik --</option>
                {mangaList.map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}
              </select>
              <input type="number" step="0.1" placeholder="Nomor Chapter (Misal: 1)" value={chapterNumber} onChange={(e) => setChapterNumber(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-sm" required />
              <input type="text" placeholder="Judul/Nama Chapter (Opsional)" value={chapterTitle} onChange={(e) => setChapterTitle(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-sm" />
              <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 font-bold py-2 rounded text-sm">Buat Chapter Baru</button>
            </form>
            {chapterStatusMsg && <p className="mt-2 text-xs text-orange-400 text-center">{chapterStatusMsg}</p>}
          </div>
        </div>

        {/* SECTION 3: KOSONGKAN GAMBAR */}
        <div className="bg-gray-900 border border-red-950 p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-bold text-red-400 mb-2">3. Kosongkan Halaman Gambar</h2>
          <form onSubmit={handleDeleteAllPagesInChapter} className="flex gap-4 max-w-md">
            <input type="number" placeholder="ID Chapter" value={targetChapterId} onChange={(e) => setTargetChapterId(e.target.value)} className="bg-gray-800 border border-gray-700 rounded p-2 text-sm flex-1" />
            <button type="submit" className="bg-red-700 hover:bg-red-800 text-white font-bold px-4 py-2 rounded text-sm transition">Kosongkan Halaman</button>
          </form>
          {deletePageMsg && <p className="mt-2 text-xs text-red-400">{deletePageMsg}</p>}
        </div>

        {/* SECTION 4: DAFTAR KONTEN DENGAN TOMBOL EDIT & HAPUS */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl">
            <h2 className="text-xl font-bold text-gray-300 mb-4">Daftar Judul Komik</h2>
            <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
              {mangaList.map((m) => (
                <div key={m.id} className="flex justify-between items-center bg-gray-800 p-3 rounded border border-gray-700 text-sm">
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-200">{m.title}</span>
                    <span className="text-xs text-gray-500">Slug: {m.slug} | ID: {m.id}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => startEditingManga(m)} className="text-xs bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white px-3 py-1 rounded transition font-medium">
                      Edit
                    </button>
                    <button onClick={() => handleDeleteManga(m.id, m.title)} className="text-xs bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white px-2 py-1 rounded transition">
                      Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl">
            <h2 className="text-xl font-bold text-gray-300 mb-4">Daftar Chapter Terdaftar</h2>
            <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
              {activeChapters.map((ch) => (
                <div key={ch.id} className="flex justify-between items-center bg-gray-800 p-3 rounded border border-gray-700 text-sm">
                  <div>
                    <span className="text-orange-400 font-medium">Ch {ch.chapter_number}</span>
                    <span className="text-gray-400 text-xs block">Komik: {ch.manga?.title || 'Unknown'} (ID Chapter: {ch.id})</span>
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