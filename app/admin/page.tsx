'use client';

import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import Link from 'next/link';
import { uploadToR2 } from '@/lib/uploadToR2';

interface Manga {
  id: number;
  title: string;
  slug: string;
  cover_url?: string;
  description?: string;
  genres?: string;
  theme?: string;
  demographic?: string;
  status?: string;
  author?: string;
}

function formatCoverUrl(url?: string | null): string {
  if (!url) return '';
  if (url.includes('.r2.dev/')) {
    const key = url.split('.r2.dev/')[1];
    return `/api/image?key=${encodeURIComponent(key)}`;
  }
  return url;
}

export default function AdminDashboardPage() {
  const [mangas, setMangas] = useState<Manga[]>([]);

  // Form State
  const [editId, setEditId] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>('');
  const [description, setDescription] = useState('');
  const [genres, setGenres] = useState('');
  const [theme, setTheme] = useState('');
  const [demographic, setDemographic] = useState('Shounen');
  const [status, setStatus] = useState('Ongoing');
  const [author, setAuthor] = useState('');

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const fetchMangas = async () => {
    try {
      const res = await fetch('/api/admin/mangas', { cache: 'no-store' });
      if (!res.ok) throw new Error('Gagal mengambil daftar komik');
      const data = await res.json();
      if (Array.isArray(data)) setMangas(data);
    } catch (err: any) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    fetchMangas();
  }, []);

  const handleCoverChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleSelectEdit = (manga: Manga) => {
    setEditId(manga.id);
    setTitle(manga.title || '');
    setSlug(manga.slug || '');
    setDescription(manga.description || '');
    setGenres(manga.genres || '');
    setTheme(manga.theme || '');
    setDemographic(manga.demographic || 'Shounen');
    setStatus(manga.status || 'Ongoing');
    setAuthor(manga.author || '');
    setCoverFile(null);
    setCoverPreview(formatCoverUrl(manga.cover_url));
    setMsg('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setTitle('');
    setSlug('');
    setCoverFile(null);
    setCoverPreview('');
    setDescription('');
    setGenres('');
    setTheme('');
    setAuthor('');
    setDemographic('Shounen');
    setStatus('Ongoing');
    setMsg('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');

    try {
      let uploadedCoverUrl = '';

      if (coverFile) {
        setMsg('Sedang mengunggah cover ke Cloudflare R2...');
        uploadedCoverUrl = await uploadToR2(coverFile, `covers/${slug || Date.now()}`);
      }

      if (editId) {
        // === MODE EDIT: PANGGIL ENDPOINT UPDATE SECARA KHUSUS ===
        setMsg('Menyimpan perubahan komik...');
        const res = await fetch('/api/admin/mangas/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editId,
            title,
            coverUrl: uploadedCoverUrl || undefined,
            description,
            genres,
            theme,
            demographic,
            status,
            author,
          }),
        });

        const resText = await res.text();
        let resJson: any = null;
        try {
          resJson = JSON.parse(resText);
        } catch {
          resJson = null;
        }

        if (!res.ok) {
          throw new Error(resJson?.error || resText || `Error ${res.status}`);
        }

        setMsg('Data komik berhasil diperbarui!');
        handleCancelEdit();
      } else {
        // === MODE TAMBAH BARU ===
        setMsg('Menyimpan komik baru...');
        const res = await fetch('/api/admin/mangas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            slug,
            coverUrl: uploadedCoverUrl || '',
            description,
            genres,
            theme,
            demographic,
            status,
            author,
          }),
        });

        const resText = await res.text();
        let resJson: any = null;
        try {
          resJson = JSON.parse(resText);
        } catch {
          resJson = null;
        }

        if (!res.ok) {
          throw new Error(resJson?.error || resText || `Error ${res.status}`);
        }

        setMsg('Komik baru berhasil ditambahkan!');
        handleCancelEdit();
      }

      fetchMangas();
    } catch (err: any) {
      setMsg(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteManga = async (id: number) => {
    if (!confirm('Yakin ingin menghapus komik ini beserta seluruh chapternya?')) return;

    try {
      const res = await fetch(`/api/admin/mangas?id=${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Gagal menghapus komik');
      }
      if (editId === id) handleCancelEdit();
      fetchMangas();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#453a3a] text-[#baa9a9] p-6 md:p-10">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Dashboard */}
        <div className="flex justify-between items-center border-b border-[#baa9a9]/20 pb-4">
          <h1 className="text-2xl md:text-3xl font-bold text-[#f2ecec]">Admin Dashboard</h1>
          <div className="space-x-3">
            <Link
              href="/upload"
              className="bg-[#baa9a9] hover:bg-[#a89595] text-[#453a3a] text-sm font-semibold px-4 py-2 rounded-lg transition"
            >
              Upload Chapter
            </Link>
            <Link
              href="/"
              className="bg-[#362d2d] hover:bg-[#2b2424] text-[#baa9a9] text-sm px-4 py-2 rounded-lg border border-[#baa9a9]/30 transition"
            >
              Beranda
            </Link>
          </div>
        </div>

        {msg && (
          <div className="p-3 bg-[#362d2d] border border-[#baa9a9] text-[#f2ecec] rounded-lg text-sm">
            {msg}
          </div>
        )}

        {/* Form Tambah / Edit Komik */}
        <form onSubmit={handleSubmit} className="bg-[#362d2d] p-6 rounded-xl border border-[#baa9a9]/20 space-y-5">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-[#f2ecec]">
              {editId ? 'Edit Keterangan Komik' : 'Tambah Komik Baru'}
            </h2>
            {editId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="text-xs bg-[#2a2323] hover:bg-[#221c1c] text-[#baa9a9] px-3 py-1.5 rounded-lg border border-[#baa9a9]/30 transition"
              >
                Batal Edit
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1 uppercase tracking-wider">Judul Komik</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full bg-[#2a2323] border border-[#baa9a9]/30 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#baa9a9]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 uppercase tracking-wider">
                Slug URL {editId && <span className="text-[10px] text-yellow-400 font-normal">(Tidak dapat diubah)</span>}
              </label>
              <input
                type="text"
                placeholder="contoh: solo-leveling"
                value={slug}
                disabled={!!editId}
                onChange={(e) => setSlug(e.target.value)}
                required
                className={`w-full border border-[#baa9a9]/30 rounded-lg p-2.5 focus:outline-none ${
                  editId 
                    ? 'bg-[#1f1a1a] text-gray-400 cursor-not-allowed border-dashed' 
                    : 'bg-[#2a2323] text-white focus:border-[#baa9a9]'
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1 uppercase tracking-wider">Author / Studio</label>
              <input
                type="text"
                placeholder="contoh: Komakari"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full bg-[#2a2323] border border-[#baa9a9]/30 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#baa9a9]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 uppercase tracking-wider">
                {editId ? 'Ganti Gambar Cover (Opsional)' : 'Pilih Gambar Cover'}
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverChange}
                className="w-full text-xs text-[#baa9a9] file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#baa9a9] file:text-[#453a3a] hover:file:bg-[#a89595] bg-[#2a2323] border border-[#baa9a9]/30 rounded-lg p-1.5 cursor-pointer focus:outline-none"
              />
              {coverPreview && (
                <div className="mt-2 flex items-center gap-3">
                  <img
                    src={coverPreview}
                    alt="Preview Cover"
                    className="w-12 h-16 object-cover rounded border border-[#baa9a9]/40"
                  />
                  <span className="text-xs text-[#baa9a9]/70 truncate">
                    {coverFile ? coverFile.name : '(Cover saat ini)'}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1 uppercase tracking-wider">Genre</label>
              <input
                type="text"
                placeholder="Action, Fantasy"
                value={genres}
                onChange={(e) => setGenres(e.target.value)}
                className="w-full bg-[#2a2323] border border-[#baa9a9]/30 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#baa9a9]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 uppercase tracking-wider">Theme</label>
              <input
                type="text"
                placeholder="Isekai, Magic"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="w-full bg-[#2a2323] border border-[#baa9a9]/30 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#baa9a9]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 uppercase tracking-wider">Demographic</label>
              <select
                value={demographic}
                onChange={(e) => setDemographic(e.target.value)}
                className="w-full bg-[#2a2323] border border-[#baa9a9]/30 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#baa9a9]"
              >
                <option value="Shounen">Shounen</option>
                <option value="Seinen">Seinen</option>
                <option value="Shoujo">Shoujo</option>
                <option value="Josei">Josei</option>
                <option value="General">General / All Ages</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 uppercase tracking-wider">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-[#2a2323] border border-[#baa9a9]/30 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#baa9a9]"
              >
                <option value="Ongoing">Ongoing</option>
                <option value="Completed">Completed</option>
                <option value="Hiatus">Hiatus</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 uppercase tracking-wider">Deskripsi</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full bg-[#2a2323] border border-[#baa9a9]/30 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#baa9a9]"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="bg-[#baa9a9] hover:bg-[#a89595] text-[#453a3a] font-bold px-6 py-2.5 rounded-lg transition shadow"
            >
              {loading ? 'Memproses...' : editId ? 'Simpan Perubahan' : 'Simpan Komik'}
            </button>
            {editId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="text-xs text-[#baa9a9] hover:text-[#f2ecec] px-4 py-2 transition"
              >
                Batal
              </button>
            )}
          </div>
        </form>

        {/* List Komik Terdaftar */}
        <div className="bg-[#362d2d] p-6 rounded-xl border border-[#baa9a9]/20">
          <h2 className="text-xl font-bold text-[#f2ecec] mb-4">Daftar Komik Terdaftar</h2>
          <div className="divide-y divide-[#baa9a9]/10">
            {mangas.map((manga) => {
              const coverSrc = formatCoverUrl(manga.cover_url);
              return (
                <div key={manga.id} className="py-4 flex justify-between items-center gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-16 bg-[#2a2323] rounded flex-shrink-0 overflow-hidden border border-[#baa9a9]/20 flex items-center justify-center">
                      {coverSrc ? (
                        <img
                          src={coverSrc}
                          alt={manga.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-[10px] text-[#baa9a9]/40">No Cover</span>
                      )}
                    </div>
                    <div className="truncate">
                      <p className="font-semibold text-[#f2ecec] truncate">{manga.title}</p>
                      <div className="flex flex-wrap gap-2 text-xs text-[#baa9a9]/70 mt-1">
                        {manga.status && <span className="bg-[#2a2323] px-2 py-0.5 rounded">{manga.status}</span>}
                        {manga.demographic && <span className="bg-[#2a2323] px-2 py-0.5 rounded">{manga.demographic}</span>}
                        {manga.genres && <span className="truncate max-w-[200px]">{manga.genres}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleSelectEdit(manga)}
                      className="bg-[#2a2323] hover:bg-[#221c1c] text-[#baa9a9] hover:text-[#f2ecec] text-xs font-semibold px-3 py-1.5 rounded-lg border border-[#baa9a9]/30 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteManga(manga.id)}
                      className="text-red-400 hover:text-red-300 text-xs font-semibold px-2 py-1.5 transition"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              );
            })}
            {mangas.length === 0 && <p className="text-[#baa9a9]/60 text-sm">Belum ada komik.</p>}
          </div>
        </div>

      </div>
    </div>
  );
}