'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Manga {
  id: number;
  title: string;
  slug: string;
  description?: string;
  status?: string;
}

export default function AdminDashboardPage() {
  const [mangas, setMangas] = useState<Manga[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [editingManga, setEditingManga] = useState<Manga | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStatus, setEditStatus] = useState('Ongoing');
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
      console.error('Gagal memuat komik:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMangas();
  }, []);

  const openEdit = (m: Manga) => {
    setEditingManga(m);
    setEditTitle(m.title || '');
    setEditSlug(m.slug || '');
    setEditDescription(m.description || '');
    setEditStatus(m.status || 'Ongoing');
    setSaveMsg('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingManga) return;
    setSaving(true);
    setSaveMsg('Menyimpan...');

    try {
      const res = await fetch(`/api/admin/mangas/${editingManga.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle,
          slug: editSlug,
          description: editDescription,
          status: editStatus,
        }),
      });

      if (!res.ok) throw new Error('Gagal update komik');
      setSaveMsg('Berhasil diperbarui!');
      setTimeout(() => {
        setEditingManga(null);
        fetchMangas();
      }, 600);
    } catch (err: any) {
      setSaveMsg(err.message || 'Error saat menyimpan');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#453a3a] text-[#baa9a9] p-6 md:p-10">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center border-b border-[#baa9a9]/20 pb-5 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#f2ecec]">
              Dashboard Panel Admin
            </h1>
            <p className="text-xs md:text-sm text-[#baa9a9]/80 mt-1">
              Kelola judul komik dan unggah bab terbaru Yanama Komik
            </p>
          </div>
          <Link
            href="/"
            className="bg-[#362d2d] hover:bg-[#2b2424] text-[#baa9a9] hover:text-[#f2ecec] text-xs md:text-sm font-semibold px-4 py-2.5 rounded-xl border border-[#baa9a9]/30 transition"
          >
            &larr; Lihat Web Utama
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Link
            href="/upload"
            className="bg-[#362d2d] hover:bg-[#2e2626] p-6 rounded-2xl border border-[#baa9a9]/20 flex items-center justify-between transition"
          >
            <div>
              <h2 className="text-lg font-bold text-[#f2ecec]">+ Upload Chapter Komik</h2>
              <p className="text-xs text-[#baa9a9]/80 mt-1">Unggah gambar halaman ke Cloudflare R2</p>
            </div>
            <span className="bg-[#baa9a9] text-[#453a3a] font-bold text-xs px-3.5 py-2 rounded-lg">Buka Form</span>
          </Link>

          <div className="bg-[#362d2d] p-6 rounded-2xl border border-[#baa9a9]/20 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#f2ecec]">Total Komik Terdaftar</h2>
              <p className="text-xs text-[#baa9a9]/80 mt-1">Jumlah judul komik aktif di database</p>
            </div>
            <span className="text-2xl font-black text-[#f2ecec] bg-[#2a2323] px-4 py-2 rounded-xl border border-[#baa9a9]/30">
              {mangas.length}
            </span>
          </div>
        </div>

        {/* Daftar Komik */}
        <div className="bg-[#362d2d] p-6 rounded-2xl border border-[#baa9a9]/20 space-y-4">
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

                  {/* Tombol Aksi Lengkap: Lihat | Edit | + Chapter */}
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

      {/* Modal Popup Edit */}
      {editingManga && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#362d2d] border border-[#baa9a9]/30 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-[#baa9a9]/20 pb-3">
              <h3 className="text-base font-bold text-[#f2ecec]">Edit Komik</h3>
              <button type="button" onClick={() => setEditingManga(null)} className="text-[#baa9a9] hover:text-white">✕</button>
            </div>

            {saveMsg && (
              <div className="p-2 bg-[#2a2323] border border-[#baa9a9]/30 text-xs rounded text-white">{saveMsg}</div>
            )}

            <form onSubmit={handleSave} className="space-y-3">
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
                <label className="block text-xs uppercase mb-1 font-semibold text-[#baa9a9]">Slug</label>
                <input
                  type="text"
                  value={editSlug}
                  onChange={(e) => setEditSlug(e.target.value)}
                  required
                  className="w-full bg-[#2a2323] border border-[#baa9a9]/30 rounded-lg p-2 text-white text-sm outline-none"
                />
              </div>

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
                <label className="block text-xs uppercase mb-1 font-semibold text-[#baa9a9]">Deskripsi</label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full bg-[#2a2323] border border-[#baa9a9]/30 rounded-lg p-2 text-white text-sm outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingManga(null)}
                  className="bg-[#2a2323] text-[#baa9a9] text-xs px-3.5 py-2 rounded-lg border border-[#baa9a9]/30"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-[#baa9a9] hover:bg-[#cfc1c1] text-[#453a3a] text-xs font-bold px-4 py-2 rounded-lg"
                >
                  {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}