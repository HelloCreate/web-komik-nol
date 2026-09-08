'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Manga {
  id: number;
  title: string;
  slug: string;
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

  // State Modal Edit
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

  const handleSave = async (e: React.FormEvent) => {
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
        throw new Error(resData?.error || `Gagal update (Status: ${res.status})`);
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
          <Link
            href="/"
            className="bg-[#362d2d] hover:bg-[#2b2424] text-[#baa9a9] hover:text-[#f2ecec] text-xs md:text-sm font-semibold px-4 py-2.5 rounded-xl border border-[#baa9a9]/30 transition shadow"
          >
            &larr; Lihat Web Utama
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Link
            href="/upload"
            className="bg-[#362d2d] hover:bg-[#2e2626] p-6 rounded-2xl border border-[#baa9a9]/20 flex items-center justify-between transition shadow-lg"
          >
            <div>
              <h2 className="text-lg font-bold text-[#f2ecec]">+ Upload Chapter Komik</h2>
              <p className="text-xs text-[#baa9a9]/80 mt-1">Unggah gambar halaman ke Cloudflare R2</p>
            </div>
            <span className="bg-[#baa9a9] text-[#453a3a] font-bold text-xs px-3.5 py-2 rounded-lg">Buka Form</span>
          </Link>

          <div className="bg-[#362d2d] p-6 rounded-2xl border border-[#baa9a9]/20 flex items-center justify-between shadow-lg">
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

      {/* Modal Popup Edit Komik */}
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

            <form onSubmit={handleSave} className="space-y-3.5 overflow-y-auto pr-1">
              <div>
                <label className="block text-xs uppercase mb-1 font-semibold text-[#baa9a9]">Judul</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                  className="w-full bg-[#2a2323] border border-[#baa9a9]/30 rounded-lg p-2 text-white text-sm outline-none focus:border-[#baa9a9]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase mb-1 font-semibold text-[#baa9a9]">Slug (URL)</label>
                <input
                  type="text"
                  value={editSlug}
                  onChange={(e) => setEditSlug(e.target.value)}
                  required
                  className="w-full bg-[#2a2323] border border-[#baa9a9]/30 rounded-lg p-2 text-white text-sm outline-none focus:border-[#baa9a9]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase mb-1 font-semibold text-[#baa9a9]">Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full bg-[#2a2323] border border-[#baa9a9]/30 rounded-lg p-2 text-white text-sm outline-none focus:border-[#baa9a9]"
                  >
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase mb-1 font-semibold text-[#baa9a9]">Author / Penulis</label>
                  <input
                    type="text"
                    placeholder="Contoh: Eiichiro Oda"
                    value={editAuthor}
                    onChange={(e) => setEditAuthor(e.target.value)}
                    className="w-full bg-[#2a2323] border border-[#baa9a9]/30 rounded-lg p-2 text-white text-sm outline-none focus:border-[#baa9a9]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs uppercase mb-1 font-semibold text-[#baa9a9]">Genre</label>
                  <input
                    type="text"
                    placeholder="Action, Comedy"
                    value={editGenre}
                    onChange={(e) => setEditGenre(e.target.value)}
                    className="w-full bg-[#2a2323] border border-[#baa9a9]/30 rounded-lg p-2 text-white text-sm outline-none focus:border-[#baa9a9]"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase mb-1 font-semibold text-[#baa9a9]">Theme</label>
                  <input
                    type="text"
                    placeholder="School, Delinquents"
                    value={editTheme}
                    onChange={(e) => setEditTheme(e.target.value)}
                    className="w-full bg-[#2a2323] border border-[#baa9a9]/30 rounded-lg p-2 text-white text-sm outline-none focus:border-[#baa9a9]"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase mb-1 font-semibold text-[#baa9a9]">Demographic</label>
                  <input
                    type="text"
                    placeholder="Shounen, Seinen"
                    value={editDemographic}
                    onChange={(e) => setEditDemographic(e.target.value)}
                    className="w-full bg-[#2a2323] border border-[#baa9a9]/30 rounded-lg p-2 text-white text-sm outline-none focus:border-[#baa9a9]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase mb-1 font-semibold text-[#baa9a9]">Sinopsis / Deskripsi</label>
                <textarea
                  rows={4}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full bg-[#2a2323] border border-[#baa9a9]/30 rounded-lg p-2 text-white text-sm outline-none focus:border-[#baa9a9]"
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