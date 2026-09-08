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

export default function AdminDashboardPage() {
  const [mangas, setMangas] = useState<Manga[]>([]);
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
      const res = await fetch('/api/admin/mangas');
      const data = await res.json();
      if (Array.isArray(data)) setMangas(data);
    } catch (err: any) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    fetchMangas();
  }, []);

  // Handler saat memilih file cover dari galeri / komputer
  const handleCoverChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleCreateManga = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');

    try {
      let uploadedCoverUrl = '';

      // 1. Upload cover langsung ke Cloudflare R2 jika ada file yang dipilih
      if (coverFile) {
        setMsg('Sedang mengunggah cover ke Cloudflare R2...');
        uploadedCoverUrl = await uploadToR2(coverFile, `covers/${slug || Date.now()}`);
      }

      setMsg('Menyimpan data komik ke Cloudflare D1...');

      // 2. Simpan seluruh data komik ke D1
      const res = await fetch('/api/admin/mangas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          slug,
          coverUrl: uploadedCoverUrl,
          description,
          genres,
          theme,
          demographic,
          status,
          author,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Gagal menyimpan komik');
      }

      setMsg('Komik dan Cover berhasil ditambahkan!');
      setTitle('');
      setSlug('');
      setCoverFile(null);
      setCoverPreview('');
      setDescription('');
      setGenres('');
      setTheme('');
      setAuthor('');
      fetchMangas();
    } catch (err: any) {
      setMsg(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteManga = async (id: number) => {
    if (!confirm('Yakin ingin menghapus komik ini?')) return;

    try {
      const res = await fetch(`/api/admin/mangas?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Gagal menghapus komik');
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

        {/* Form Tambah Komik */}
        <form onSubmit={handleCreateManga} className="bg-[#362d2d] p-6 rounded-xl border border-[#baa9a9]/20 space-y-5">
          <h2 className="text-xl font-bold text-[#f2ecec]">Tambah Komik Baru</h2>

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
              <label className="block text-xs font-semibold mb-1 uppercase tracking-wider">Slug URL (unik)</label>
              <input
                type="text"
                placeholder="contoh: solo-leveling"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
                className="w-full bg-[#2a2323] border border-[#baa9a9]/30 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#baa9a9]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1 uppercase tracking-wider">Author / Studio</label>
              <input
                type="text"
                placeholder="contoh: Chugong, DUBU"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full bg-[#2a2323] border border-[#baa9a9]/30 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#baa9a9]"
              />
            </div>

            {/* Input Upload Gambar Cover */}
            <div>
              <label className="block text-xs font-semibold mb-1 uppercase tracking-wider">Pilih Gambar Cover</label>
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
                  <span className="text-xs text-[#baa9a9]/70 truncate">{coverFile?.name}</span>
                </div>
              )}
            </div>
          </div>

          {/* Baris Kategori: Genre, Theme, Demographic, Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1 uppercase tracking-wider">Genre</label>
              <input
                type="text"
                placeholder="Action, Fantasy, Adventure"
                value={genres}
                onChange={(e) => setGenres(e.target.value)}
                className="w-full bg-[#2a2323] border border-[#baa9a9]/30 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#baa9a9]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 uppercase tracking-wider">Theme</label>
              <input
                type="text"
                placeholder="Isekai, Reincarnation, Magic"
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
              rows={3}
              className="w-full bg-[#2a2323] border border-[#baa9a9]/30 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#baa9a9]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-[#baa9a9] hover:bg-[#a89595] text-[#453a3a] font-bold px-6 py-2.5 rounded-lg transition"
          >
            {loading ? 'Mengunggah & Menyimpan...' : 'Simpan Komik'}
          </button>
        </form>

        {/* List Komik Terdaftar */}
        <div className="bg-[#362d2d] p-6 rounded-xl border border-[#baa9a9]/20">
          <h2 className="text-xl font-bold text-[#f2ecec] mb-4">Daftar Komik Terdaftar</h2>
          <div className="divide-y divide-[#baa9a9]/10">
            {mangas.map((manga) => (
              <div key={manga.id} className="py-3 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  {manga.cover_url && (
                    <img
                      src={manga.cover_url}
                      alt={manga.title}
                      className="w-10 h-14 object-cover rounded border border-[#baa9a9]/20"
                    />
                  )}
                  <div>
                    <p className="font-semibold text-[#f2ecec]">{manga.title}</p>
                    <div className="flex flex-wrap gap-2 text-xs text-[#baa9a9]/70 mt-1">
                      {manga.demographic && <span className="bg-[#2a2323] px-2 py-0.5 rounded">{manga.demographic}</span>}
                      {manga.status && <span className="bg-[#2a2323] px-2 py-0.5 rounded">{manga.status}</span>}
                      {manga.genres && <span>{manga.genres}</span>}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteManga(manga.id)}
                  className="text-red-400 hover:text-red-300 text-sm font-medium ml-4"
                >
                  Hapus
                </button>
              </div>
            ))}
            {mangas.length === 0 && <p className="text-[#baa9a9]/60 text-sm">Belum ada komik.</p>}
          </div>
        </div>

      </div>
    </div>
  );
}