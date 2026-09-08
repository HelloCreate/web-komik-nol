'use client';

import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import Link from 'next/link';
import { uploadToR2 } from '@/lib/uploadToR2';

interface Manga {
  id: number;
  title: string;
  slug: string;
}

export default function UploadChapterPage() {
  const [mangas, setMangas] = useState<Manga[]>([]);
  const [selectedMangaId, setSelectedMangaId] = useState<string>('');
  const [chapterNumber, setChapterNumber] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [files, setFiles] = useState<File[]>([]);

  const [loading, setLoading] = useState<boolean>(false);
  const [progressMsg, setProgressMsg] = useState<string>('');

  useEffect(() => {
    async function loadMangas() {
      try {
        const res = await fetch('/api/admin/mangas', { cache: 'no-store' });
        const data = await res.json();
        if (Array.isArray(data)) {
          setMangas(data);
          if (data.length > 0) setSelectedMangaId(String(data[0].id));
        }
      } catch (err: any) {
        console.error('Gagal mengambil daftar komik:', err.message);
      }
    }
    loadMangas();
  }, []);

  const handleFilesChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileList = Array.from(e.target.files).sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
      );
      setFiles(fileList);
    }
  };

  const handleUpload = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedMangaId || !chapterNumber || files.length === 0) {
      alert('Pilih komik, isi nomor chapter, dan pilih minimal 1 gambar halaman.');
      return;
    }

    setLoading(true);
    setProgressMsg('Menyiapkan upload chapter...');

    try {
      const selectedManga = mangas.find((m) => String(m.id) === String(selectedMangaId));
      const mangaSlug = selectedManga ? selectedManga.slug : 'manga';

      // 1. Unggah gambar ke Cloudflare R2
      const uploadedImages: { pageNumber: number; imageUrl: string }[] = [];

      for (let i = 0; i < files.length; i++) {
        setProgressMsg(`Mengunggah gambar ${i + 1} dari ${files.length} ke Cloudflare R2...`);
        const file = files[i];
        const imageUrl = await uploadToR2(
          file,
          `chapters/${mangaSlug}/ch-${chapterNumber}`
        );
        uploadedImages.push({
          pageNumber: i + 1,
          imageUrl,
        });
      }

      // 2. Kirim data ke endpoint baru /api/chapters/create
      setProgressMsg('Menyimpan data chapter ke database D1...');

      const res = await fetch('/api/chapters/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mangaId: Number(selectedMangaId),
          chapterNumber: String(chapterNumber).trim(),
          title: title.trim(),
          images: uploadedImages,
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

      setProgressMsg('Chapter berhasil diunggah dan tersimpan!');
      setChapterNumber('');
      setTitle('');
      setFiles([]);
    } catch (err: any) {
      setProgressMsg(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#453a3a] text-[#baa9a9] p-6 md:p-10">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Header Dashboard */}
        <div className="flex justify-between items-center border-b border-[#baa9a9]/20 pb-4">
          <h1 className="text-2xl md:text-3xl font-bold text-[#f2ecec]">
            Upload Chapter Komik
          </h1>
          <div className="flex items-center gap-2">
            <Link
              href="/admin"
              className="bg-[#baa9a9] hover:bg-[#a89595] text-[#453a3a] text-sm font-semibold px-4 py-2 rounded-lg transition"
            >
              Panel Admin
            </Link>
            <Link
              href="/"
              className="bg-[#362d2d] hover:bg-[#2b2424] text-[#baa9a9] text-sm px-4 py-2 rounded-lg border border-[#baa9a9]/30 transition"
            >
              Beranda
            </Link>
          </div>
        </div>

        {/* Kotak Pesan Progress */}
        {progressMsg && (
          <div className="p-3.5 bg-[#362d2d] border border-[#baa9a9] text-[#f2ecec] rounded-xl text-sm">
            {progressMsg}
          </div>
        )}

        {/* Form Input Chapter */}
        <form
          onSubmit={handleUpload}
          className="bg-[#362d2d] p-6 rounded-2xl border border-[#baa9a9]/20 space-y-5 shadow-lg"
        >
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-[#baa9a9]">
              Pilih Komik
            </label>
            <select
              value={selectedMangaId}
              onChange={(e) => setSelectedMangaId(e.target.value)}
              required
              className="w-full bg-[#2a2323] border border-[#baa9a9]/30 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#baa9a9]"
            >
              <option value="">- Pilih Komik -</option>
              {mangas.map((manga) => (
                <option key={manga.id} value={manga.id}>
                  {manga.title}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-[#baa9a9]">
                Nomor Chapter
              </label>
              <input
                type="text"
                placeholder="Contoh: 1 atau 1.5"
                value={chapterNumber}
                onChange={(e) => setChapterNumber(e.target.value)}
                required
                className="w-full bg-[#2a2323] border border-[#baa9a9]/30 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#baa9a9]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-[#baa9a9]">
                Judul Chapter (Opsional)
              </label>
              <input
                type="text"
                placeholder="Awal Mula..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#2a2323] border border-[#baa9a9]/30 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#baa9a9]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-[#baa9a9]">
              Pilih Gambar Halaman (Bisa pilih banyak sekaligus)
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFilesChange}
              required
              className="w-full text-xs text-[#baa9a9] file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#baa9a9] file:text-[#453a3a] hover:file:bg-[#a89595] bg-[#2a2323] border border-[#baa9a9]/30 rounded-lg p-2 cursor-pointer focus:outline-none"
            />
            {files.length > 0 && (
              <p className="mt-2 text-xs text-[#baa9a9]/80">
                Terpilih <strong>{files.length}</strong> gambar halaman.
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#baa9a9] hover:bg-[#a89595] text-[#453a3a] font-bold py-3 rounded-xl transition shadow"
          >
            {loading ? 'Sedang Memproses Upload...' : 'Mulai Unggah ke Cloudflare R2'}
          </button>
        </form>

      </div>
    </div>
  );
}