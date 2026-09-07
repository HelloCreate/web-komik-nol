'use client';

import { useState, useEffect } from 'react';
import { uploadToR2 } from '@/lib/uploadToR2';
import Link from 'next/link';

interface MangaItem {
  id: number;
  title: string;
}

export default function UploadChapterPage() {
  const [mangas, setMangas] = useState<MangaItem[]>([]);
  const [selectedMangaId, setSelectedMangaId] = useState<string>('');
  const [chapterNumber, setChapterNumber] = useState<string>('');
  const [chapterTitle, setChapterTitle] = useState<string>('');
  const [files, setFiles] = useState<FileList | null>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const [progressMsg, setProgressMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    async function fetchMangas() {
      try {
        const res = await fetch('/api/mangas');
        if (!res.ok) throw new Error('Gagal memuat daftar komik');
        const data = await res.json();
        setMangas(data || []);
      } catch (err: any) {
        setErrorMsg(err.message || 'Gagal mengambil data komik');
      }
    }
    fetchMangas();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMangaId || !chapterNumber || !files || files.length === 0) {
      setErrorMsg('Mohon lengkapi semua kolom dan pilih file gambar komik.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    setProgressMsg('Memulai persiapan unggahan...');

    try {
      const fileArray = Array.from(files);
      const totalFiles = fileArray.length;
      const uploadedImagesData: { page_number: number; image_url: string }[] = [];

      for (let i = 0; i < totalFiles; i++) {
        const file = fileArray[i];
        const pageNum = i + 1;
        setProgressMsg(`Mengunggah ke Cloudflare R2: Halaman ${pageNum} dari ${totalFiles}...`);

        const r2Url = await uploadToR2(file, 'chapters');

        uploadedImagesData.push({
          page_number: pageNum,
          image_url: r2Url,
        });
      }

      setProgressMsg('Menyimpan tautan gambar ke database Cloudflare D1...');
      const saveRes = await fetch('/api/chapters/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mangaId: Number(selectedMangaId),
          chapterNumber,
          chapterTitle,
          images: uploadedImagesData,
        }),
      });

      if (!saveRes.ok) {
        const errData = await saveRes.json().catch(() => ({}));
        throw new Error(errData.error || 'Gagal menyimpan data chapter ke database');
      }

      setSuccessMsg('Berhasil mengunggah seluruh halaman chapter!');
      setChapterNumber('');
      setChapterTitle('');
      setFiles(null);
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat proses unggah');
    } finally {
      setLoading(false);
      setProgressMsg('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 flex justify-center">
      <div className="w-full max-w-xl bg-slate-800 p-8 rounded-xl border border-slate-700 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Upload Chapter Komik</h1>
          <Link href="/" className="text-sm bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded">
            Beranda
          </Link>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded text-red-200 text-sm">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-green-500/20 border border-green-500 rounded text-green-200 text-sm">
            {successMsg}
          </div>
        )}

        {progressMsg && (
          <div className="mb-4 p-3 bg-blue-500/20 border border-blue-500 rounded text-blue-200 text-sm animate-pulse">
            {progressMsg}
          </div>
        )}

        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Pilih Komik</label>
            <select
              value={selectedMangaId}
              onChange={(e) => setSelectedMangaId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded p-2.5 text-white"
              required
            >
              <option value="">-- Pilih Komik --</option>
              {mangas.map((manga) => (
                <option key={manga.id} value={manga.id}>
                  {manga.title}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nomor Chapter</label>
              <input
                type="text"
                placeholder="Contoh: 1 atau 1.5"
                value={chapterNumber}
                onChange={(e) => setChapterNumber(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded p-2.5 text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Judul Chapter (Opsional)</label>
              <input
                type="text"
                placeholder="Awal Mula..."
                value={chapterTitle}
                onChange={(e) => setChapterTitle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded p-2.5 text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Pilih Gambar Halaman (Bisa pilih banyak sekaligus)
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setFiles(e.target.files)}
              className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-blue-600 file:text-white hover:file:bg-blue-500"
              required
            />
            {files && <p className="text-xs text-slate-400 mt-1">Terpilih: {files.length} gambar</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-medium transition ${
              loading ? 'bg-amber-600 cursor-not-allowed opacity-70' : 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold'
            }`}
          >
            {loading ? 'Sedang Memproses...' : 'Mulai Unggah ke Cloudflare R2'}
          </button>
        </form>
      </div>
    </div>
  );
}