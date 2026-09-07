'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Manga {
  id: number;
  title: string;
  slug: string;
  cover_url?: string;
  description?: string;
}

export default function AdminPage() {
  const [mangas, setMangas] = useState<Manga[]>([]);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [description, setDescription] = useState('');
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

  const handleCreateManga = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');

    try {
      const res = await fetch('/api/admin/mangas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, slug, coverUrl, description }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Gagal menambahkan komik');
      }

      setMsg('Komik berhasil ditambahkan!');
      setTitle('');
      setSlug('');
      setCoverUrl('');
      setDescription('');
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
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <div className="space-x-3">
            <Link href="/upload" className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded">
              Upload Chapter
            </Link>
            <Link href="/" className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded">
              Beranda
            </Link>
          </div>
        </div>

        {msg && (
          <div className="p-3 bg-blue-500/20 border border-blue-500 rounded text-blue-200">
            {msg}
          </div>
        )}

        {/* Form Tambah Manga */}
        <form onSubmit={handleCreateManga} className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-4">
          <h2 className="text-xl font-bold">Tambah Komik Baru</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Judul Komik</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded p-2.5"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Slug URL (unik)</label>
              <input
                type="text"
                placeholder="contoh: naruto-shippuden"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded p-2.5"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm mb-1">Cover URL (Cloudflare R2)</label>
            <input
              type="text"
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded p-2.5"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Deskripsi</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full bg-slate-900 border border-slate-700 rounded p-2.5"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-500 px-6 py-2.5 rounded font-medium"
          >
            {loading ? 'Menyimpan...' : 'Simpan Komik'}
          </button>
        </form>

        {/* Daftar Manga */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <h2 className="text-xl font-bold mb-4">Daftar Komik Terdaftar</h2>
          <div className="divide-y divide-slate-700">
            {mangas.map((manga) => (
              <div key={manga.id} className="py-3 flex justify-between items-center">
                <div>
                  <p className="font-semibold">{manga.title}</p>
                  <p className="text-xs text-slate-400">/{manga.slug}</p>
                </div>
                <button
                  onClick={() => handleDeleteManga(manga.id)}
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  Hapus
                </button>
              </div>
            ))}
            {mangas.length === 0 && <p className="text-slate-400 text-sm">Belum ada komik.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}