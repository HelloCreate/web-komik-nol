'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import Link from 'next/link';
import { uploadToR2 } from '@/lib/uploadToR2';

interface Manga {
  id: number;
  title: string;
  slug: string;
  cover_url?: string;
  description?: string;
  status?: string;
  author?: string;
  genre?: string;
  theme?: string;
  demographic?: string;
}

export default function AdminDashboardPage() {
  const [mangas, setMangas] = useState<Manga[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // State Modal Tambah Komik Baru
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [newStatus, setNewStatus] = useState('Ongoing');
  const [newAuthor, setNewAuthor] = useState('');
  const [newGenre, setNewGenre] = useState('');
  const [newTheme, setNewTheme] = useState('');
  const [newDemographic, setNewDemographic] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [creating, setCreating] = useState(false);
  const [createMsg, setCreateMsg] = useState('');

  // State Modal Edit Komik
  const [editingManga, setEditingManga] = useState<Manga | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [editStatus, setEditStatus] = useState('Ongoing');
  const [editAuthor, setEditAuthor] = useState('');
  const [editGenre, setEditGenre] = useState('');
  const [editTheme, setEditTheme] = useState('');
  const [editDemographic, setEditDemographic] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  const fetchMangas = async () => {
    try {
      const res = await fetch('/api/admin/mangas', { cache: 'no-store' });
      const data = await res.json();
      if (Array.isArray(data)) {
        setMangas(data);
      }
    } catch (err: any) {
      console.error('Gagal mengambil daftar komik:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMangas();
  }, []);

  // Helper generate slug otomatis saat ketik judul komik baru
  const handleTitleChange = (val: string) => {
    setNewTitle(val);
    const generated = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');
    setNewSlug(generated);
  };

  // Submit Buat Komik Baru
  const handleCreateManga = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newSlug.trim()) {
      alert('Judul dan Slug wajib diisi!');
      return;
    }

    setCreating(true);
    setCreateMsg('Menyimpan data komik baru...');

    try {
      let coverUrl = '';
      if (coverFile) {
        setCreateMsg('Mengunggah cover komik ke Cloudflare R2...');
        coverUrl = await uploadToR2(coverFile, `covers/${newSlug}`);
      }

      setCreateMsg('Menyimpan ke Cloudflare D1...');
      const res = await fetch('/api/admin/mangas/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          slug: newSlug,
          cover_url: coverUrl,
          status: newStatus,
          author: newAuthor,
          genre: newGenre,
          theme: newTheme,
          demographic: newDemographic,
          description: newDescription,
        }),
      });

      const resData = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(resData?.error || 'Gagal menambahkan komik');
      }

      setCreateMsg('Komik baru berhasil ditambahkan!');
      setTimeout(() => {
        setIsAddOpen(false);
        setNewTitle('');
        setNewSlug('');
        setNewAuthor('');
        setNewGenre('');
        setNewTheme('');
        setNewDemographic('');
        setNewDescription('');
        setCoverFile(null);
        fetchMangas();
      }, 700);
    } catch (err: any) {
      setCreateMsg(`Gagal: ${err.message}`);
    } finally {
      setCreating(false);
    }
  };

  // Buka Modal Edit
  const openEdit = (m: Manga) => {
    setEditingManga(m);
    setEditTitle(m.title || '');
    setEditSlug(m.slug || '');
    setEditStatus(m.status || 'Ongoing');
    setEditAuthor(m.author || '');
    setEditGenre(m.genre || '');
    setEditTheme(m.theme || '');
    setEditDemographic(m.demographic || '');
    setEditDescription(m.description || '');
    setSaveMsg('');
  };

  // Submit Simpan Perubahan Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingManga) return;
    setSaving(true);
    setSaveMsg('Menyimpan perubahan ke Cloudflare D1...');

    try {
      const res = await fetch('/api/admin/mangas/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingManga.id,
          title: editTitle,
          slug: editSlug,
          status: editStatus,
          author: editAuthor,
          genre: editGenre,
          theme: editTheme,
          demographic: editDemographic,
          description: editDescription,
        }),
      });

      const resData = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(resData?.error || `Gagal update (${res.status})`);
      }

      setSaveMsg('Berhasil diperbarui!');
      setTimeout(() => {
        setEditingManga(null);
        fetchMangas();
      }, 700);
    } catch (err: any) {
      setSaveMsg(`Gagal: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#453a3a] text-[#baa9a9] p-6 md:p-10 relative">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header Dashboard */}
        <div className="flex flex-wrap justify-between items-center border-b border-[#baa9a9]/20 pb-5 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#f2ecec]">
              Dashboard Panel Admin
            </h1>
            <p className="text-xs md:text-sm text-[#baa9a9]/80 mt-1">
              Kelola judul komik dan unggah bab terbaru Yanama Komik
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => { setIsAddOpen(true); setCreateMsg(''); }}
              className="bg-[#baa9a9] hover:bg-[#cfc1c1] text-[#453a3a] font-bold text-xs md:text-sm px-4 py-2.5 rounded-xl transition shadow"
            >
              + Tambah Komik Baru
            </button>
            <Link
              href="/"
              className="bg-[#362d2d] hover:bg-[#2b2424] text-[#baa9a9] hover:text-[#f2ecec] text-xs md:text-sm font-semibold px-4 py-2.5 rounded-xl border border-[#baa9a9]/30 transition shadow"
            >
              &larr; Lihat Web Utama
            </Link>
          </div>
        </div>

        {/* Menu Kartu Aksi Cepat */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Kartu Tambah Komik */}
          <div
            onClick={() => { setIsAddOpen(true); setCreateMsg(''); }}
            className="cursor-pointer group bg-[#362d2d] hover:bg-[#2e2626] p-6 rounded-2xl border border-[#baa9a9]/20 shadow-lg transition flex flex-col justify-between"
          >
            <div>
              <h2 className="text-lg font-bold text-[#f2ecec] group-hover:text-white transition">
                + Tambah Komik Baru
              </h2>
              <p className="text-xs text-[#baa9a9]/80 mt-1">
                Daftarkan judul, cover, genre, dan sinopsis komik baru
              </p>
            </div>
            <div className="mt-4">
              <span className="bg-[#baa9a9] text-[#453a3a] font-bold text-xs px-3.5 py-1.5 rounded-lg group-hover:bg-[#cfc1c1] transition inline-block">
                Buat Komik
              </span>
            </div>
          </div>

          {/* Kartu Upload Chapter */}
          <Link
            href="/upload"
            className="group bg-[#362d2d] hover:bg-[#2e2626] p-6 rounded-2xl border border-[#baa9a9]/20 shadow-lg transition flex flex-col justify-between"
          >
            <div>
              <h2 className="text-lg font-bold text-[#f2ecec] group-hover:text-white transition">
                + Upload Chapter Komik
              </h2>
              <p className="text-xs text-[#baa9a9]/80 mt-1">
                Unggah lembaran halaman gambar ke Cloudflare R2
              </p>
            </div>
            <div className="mt-4">
              <span className="bg-[#baa9a9] text-[#453a3a] font-bold text-xs px-3.5 py-1.5 rounded-lg group-hover:bg-[#cfc1c1] transition inline-block">
                Buka Form Upload
              </span>
            </div>
          </Link>

          {/* Kartu Total Komik */}
          <div className="bg-[#362d2d] p-6 rounded-2xl border border-[#baa9a9]/20 shadow-lg flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#f2ecec]">
                Total Komik
              </h2>
              <p className="text-xs text-[#baa9a9]/80 mt-1">
                Judul aktif di D1
              </p>
            </div>
            <span className="text-2xl font-black text-[#f2ecec] bg-[#2a2323] px-4 py-2 rounded-xl border border-[#baa9a9]/30">
              {mangas.length}
            </span>
          </div>
        </div>

        {/* Daftar Komik */}
        <div className="bg-[#362d2d] p-6 rounded-2xl border border-[#baa9a9]/20 space-y-4 shadow-lg">
          <div className="flex justify-between items-center border-b border-[#baa9a9]/20 pb-3">
            <h3 className="text-base font-bold text-[#f2ecec]">Daftar Komik</h3>
            <span className="text-xs text-[#baa9a9]/70">{mangas.length} Judul</span>
          </div>

          {loading ? (
            <p className="py-8 text-center text-xs text-[#baa9a9]/70 animate-pulse">Memuat data komik...</p>
          ) : mangas.length > 0 ? (
            <div className="divide-y divide-[#baa9a9]/10">
              {mangas.map((manga) => (
                <div key={manga.id} className="py-3.5 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h4 className="font-semibold text-sm text-[#f2ecec]">{manga.title}</h4>
                    <p className="text-xs text-[#baa9a9]/60">Slug: /{manga.slug}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/manga/${manga.slug}`}
                      className="text-xs bg-[#2a2323] hover:bg-[#201a1a] text-[#baa9a9] hover:text-[#f2ecec] px-3.5 py-1.5 rounded-lg border border-[#baa9a9]/30 transition"
                    >
                      Lihat
                    </Link>

                    <button
                      type="button"
                      onClick={() => openEdit(manga)}
                      className="text-xs bg-[#baa9a9] hover:bg-[#cfc1c1] text-[#453a3a] font-bold px-3.5 py-1.5 rounded-lg transition cursor-pointer shadow-sm"
                    >
                      Edit
                    </button>

                    <Link
                      href="/upload"
                      className="text-xs bg-[#f2ecec] hover:bg-white text-[#453a3a] font-bold px-3.5 py-1.5 rounded-lg transition"
                    >
                      + Chapter
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-xs text-[#baa9a9]/60">Belum ada komik yang dibuat di database.</p>
          )}
        </div>

      </div>

      {/* MODAL 1: TAMBAH KOMIK BARU */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#362d2d] border border-[#baa9a9]/30 w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-4 my-8 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center border-b border-[#baa9a9]/20 pb-3">
              <h3 className="text-base font-bold text-[#f2ecec]">+ Tambah Judul Komik Baru</h3>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="text-[#baa9a9] hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {createMsg && (
              <div className="p-2.5 bg-[#2a2323] border border-[#baa9a9]/30 text-xs rounded-lg text-white font-medium">
                {createMsg}
              </div>
            )}

            <form onSubmit={handleCreateManga} className="space-y-3.5 overflow-y-auto pr-1">
              <div>
                <label className="block text-xs uppercase mb-1 font-semibold text-[#baa9a9]">Judul Komik *</label>
                <input
                  type="text"
                  placeholder="Contoh: One Piece"
                  value={newTitle}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  required
                  className="w-full bg-[#2a2323] border border-[#baa9a9]/30 rounded-lg p-2 text-white text-sm outline-none focus:border-[#baa9a9]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase mb-1 font-semibold text-[#baa9a9]">Slug (URL) *</label>
                <input
                  type="text"
                  placeholder="one-piece"
                  value={newSlug}
                  onChange={(e) => setNewSlug(e.target.value)}
                  required
                  className="w-full bg-[#2a2323] border border-[#baa9a9]/30 rounded-lg p-2 text-white text-sm outline-none focus:border-[#baa9a9]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase mb-1 font-semibold text-[#baa9a9]">Cover Komik (Opsional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    if (e.target.files && e.target.files[0]) setCoverFile(e.target.files[0]);
                  }}
                  className="w-full text-xs text-[#baa9a9] file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#baa9a9] file:text-[#453a3a] bg-[#2a2323] border border-[#baa9a9]/30 rounded-lg p-1.5 cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase mb-1 font-semibold text-[#baa9a9]">Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full bg-[#2a2323] border border-[#baa9a9]/30 rounded-lg p-2 text-white text-sm outline-none"
                  >
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase mb-1 font-semibold text-[#baa9a9]">Author / Pengarang</label>
                  <input
                    type="text"
                    placeholder="Contoh: Eiichiro Oda"
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    className="w-full bg-[#2a2323] border border-[#baa9a9]/30 rounded-lg p-2 text-white text-sm outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs uppercase mb-1 font-semibold text-[#baa9a9]">Genre</label>
                  <input
                    type="text"
                    placeholder="Action, Fantasy"
                    value={newGenre}
                    onChange={(e) => setNewGenre(e.target.value)}
                    className="w-full bg-[#2a2323] border border-[#baa9a9]/30 rounded-lg p-2 text-white text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase mb-1 font-semibold text-[#baa9a9]">Theme</label>
                  <input
                    type="text"
                    placeholder="Pirates, Adventure"
                    value={newTheme}
                    onChange={(e) => setNewTheme(e.target.value)}
                    className="w-full bg-[#2a2323] border border-[#baa9a9]/30 rounded-lg p-2 text-white text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase mb-1 font-semibold text-[#baa9a9]">Demographic</label>
                  <input
                    type="text"
                    placeholder="Shounen"
                    value={newDemographic}
                    onChange={(e) => setNewDemographic(e.target.value)}
                    className="w-full bg-[#2a2323] border border-[#baa9a9]/30 rounded-lg p-2 text-white text-sm outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase mb-1 font-semibold text-[#baa9a9]">Sinopsis / Deskripsi</label>
                <textarea
                  rows={3}
                  placeholder="Cerita petualangan..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full bg-[#2a2323] border border-[#baa9a9]/30 rounded-lg p-2 text-white text-sm outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#baa9a9]/20">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="bg-[#2a2323] text-[#baa9a9] text-xs px-4 py-2 rounded-lg border border-[#baa9a9]/30"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="bg-[#baa9a9] hover:bg-[#cfc1c1] text-[#453a3a] text-xs font-bold px-4 py-2 rounded-lg transition"
                >
                  {creating ? 'Menyimpan...' : 'Tambah Komik'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT KOMIK */}
      {editingManga && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#362d2d] border border-[#baa9a9]/30 w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-4 my-8 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center border-b border-[#baa9a9]/20 pb-3">
              <h3 className="text-base font-bold text-[#f2ecec]">Edit Detail Komik</h3>
              <button
                type="button"
                onClick={() => setEditingManga(null)}
                className="text-[#baa9a9] hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {saveMsg && (
              <div className="p-2.5 bg-[#2a2323] border border-[#baa9a9]/30 text-xs rounded-lg text-white font-medium">
                {saveMsg}
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-3.5 overflow-y-auto pr-1">
              <div>
                <label className="block text-xs uppercase mb-1 font-semibold text-[#baa9a9]">Judul</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                  className="w-full bg-[#2a2323] border border-[#baa9a9]/30 rounded-lg p-2 text-white text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-xs uppercase mb-1 font-semibold text-[#baa9a9]">Slug (URL)</label>
                <input
                  type="text"
                  value={editSlug}
                  onChange={(e) => setEditSlug(e.target.value)}
                  required
                  className="w-full bg-[#2a2323] border border-[#baa9a9]/30 rounded-lg p-2 text-white text-sm outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase mb-1 font-semibold text-[#baa9a9]">Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full bg-[#2a2323] border border-[#baa9a9]/30 rounded-lg p-2 text-white text-sm outline-none"
                  >
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase mb-1 font-semibold text-[#baa9a9]">Author / Penulis</label>
                  <input
                    type="text"
                    value={editAuthor}
                    onChange={(e) => setEditAuthor(e.target.value)}
                    className="w-full bg-[#2a2323] border border-[#baa9a9]/30 rounded-lg p-2 text-white text-sm outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs uppercase mb-1 font-semibold text-[#baa9a9]">Genre</label>
                  <input
                    type="text"
                    value={editGenre}
                    onChange={(e) => setEditGenre(e.target.value)}
                    className="w-full bg-[#2a2323] border border-[#baa9a9]/30 rounded-lg p-2 text-white text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase mb-1 font-semibold text-[#baa9a9]">Theme</label>
                  <input
                    type="text"
                    value={editTheme}
                    onChange={(e) => setEditTheme(e.target.value)}
                    className="w-full bg-[#2a2323] border border-[#baa9a9]/30 rounded-lg p-2 text-white text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase mb-1 font-semibold text-[#baa9a9]">Demographic</label>
                  <input
                    type="text"
                    value={editDemographic}
                    onChange={(e) => setEditDemographic(e.target.value)}
                    className="w-full bg-[#2a2323] border border-[#baa9a9]/30 rounded-lg p-2 text-white text-sm outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase mb-1 font-semibold text-[#baa9a9]">Sinopsis / Deskripsi</label>
                <textarea
                  rows={4}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full bg-[#2a2323] border border-[#baa9a9]/30 rounded-lg p-2 text-white text-sm outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#baa9a9]/20">
                <button
                  type="button"
                  onClick={() => setEditingManga(null)}
                  className="bg-[#2a2323] text-[#baa9a9] text-xs px-4 py-2 rounded-lg border border-[#baa9a9]/30 hover:bg-[#201a1a]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-[#baa9a9] hover:bg-[#cfc1c1] text-[#453a3a] text-xs font-bold px-4 py-2 rounded-lg transition"
                >
                  {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}