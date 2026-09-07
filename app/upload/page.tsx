'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/db';
import { uploadToR2 } from '@/lib/uploadToR2';
import Link from 'next/link';

export default function UploadChapterPage() {
  const [mangas, setMangas] = useState<any[]>([]);
  const [selectedMangaId, setSelectedMangaId] = useState<string>('');
  const [chapterNumber, setChapterNumber] = useState<string>('');
  const [chapterTitle, setChapterTitle] = useState<string>('');
  const [files, setFiles] = useState<FileList | null>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const [progressMsg, setProgressMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Ambil daftar komik untuk dropdown
  useEffect(() => {
    async function fetchMangas() {
      const { data, error } = await supabase
        .from('manga')
        .select('id, title')
        .order('title', { ascending: true });

      if (!error && data) {
        setMangas(data);
        if (data.length > 0) setSelectedMangaId(data[0].id.toString());
      }
    }
    fetchMangas();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setProgressMsg('');

    if (!selectedMangaId) {
      setErrorMsg('Pilih komik terlebih dahulu!');
      return;
    }
    if (!chapterNumber) {
      setErrorMsg('Nomor chapter wajib diisi!');
      return;
    }
    if (!files || files.length === 0) {
      setErrorMsg('Pilih minimal satu gambar halaman!');
      return;
    }

    setLoading(true);

    try {
      // 1. Cek atau Buat data Chapter baru di Supabase Database
      setProgressMsg('Membuat data chapter di database...');
      const chNum = parseFloat(chapterNumber);

      const { data: chapterData, error: chapterErr } = await supabase
        .from('chapters')
        .insert({
          manga_id: parseInt(selectedMangaId),
          chapter_number: chNum,
          title: chapterTitle || null,
        })
        .select()
        .single();

      if (chapterErr || !chapterData) {
        throw new Error(chapterErr?.message || 'Gagal membuat chapter baru');
      }

      // 2. Upload file gambar satu per satu ke Cloudflare R2
      // Urutkan file berdasarkan nama file (misal: 01.jpg, 02.jpg)
      const fileArray = Array.from(files).sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
      );

      const totalFiles = fileArray.length;
      const uploadedImagesData: { chapter_id: number; page_number: number; image_url: string }[] = [];

      for (let i = 0; i < totalFiles; i++) {
        const file = fileArray[i];
        const pageNum = i + 1;
        setProgressMsg(`Mengunggah ke Cloudflare R2: Halaman ${pageNum} dari ${totalFiles}...`);

        // Upload ke folder 'chapters' di R2
        const r2Url = await uploadToR2(file, 'chapters');

        uploadedImagesData.push({
          chapter_id: chapterData.id,
          page_number: pageNum,
          image_url: r2Url,
        });
      }

      // 3. Simpan URL Cloudflare R2 ke tabel chapter_images di Supabase
      setProgressMsg('Menyimpan tautan gambar ke database...');
      const { error: imgErr } = await supabase
        .from('chapter_images')
        .insert(uploadedImagesData);

      if (imgErr) throw new Error(imgErr.message);

      setSuccessMsg(`Berhasil! Chapter ${chapterNumber} dengan ${totalFiles} halaman telah diunggah ke Cloudflare R2.`);
      setChapterNumber('');
      setChapterTitle('');
      setFiles(null);
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat mengunggah.');
    } finally {
      setLoading(false);
      setProgressMsg('');
    }
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white p-6 md:p-12">
      <div className="max-w-2xl mx-auto bg-gray-900 border border-gray-800 p-8 rounded-2xl shadow-2xl space-y-6">
        <div className="flex justify-between items-center border-b border-gray-800 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-orange-500">Upload Chapter Komik</h1>
            <p className="text-xs text-gray-400 mt-1">Penyimpanan otomatis ke Cloudflare R2 (Bebas Batas Bandwidth)</p>
          </div>
          <Link href="/" className="text-xs bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded text-gray-300 transition">
            ← Beranda
          </Link>
        </div>

        {errorMsg && (
          <div className="bg-red-900/40 border border-red-700/60 p-3 rounded-lg text-xs text-red-300">
            ❌ {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="bg-green-900/40 border border-green-700/60 p-3 rounded-lg text-xs text-green-300">
            ✅ {successMsg}
          </div>
        )}

        <form onSubmit={handleUpload} className="space-y-5 text-sm">
          {/* Pilih Komik */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-2">Pilih Komik</label>
            <select
              value={selectedMangaId}
              onChange={(e) => setSelectedMangaId(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-orange-500 text-xs"
              required
            >
              {mangas.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title}
                </option>
              ))}
            </select>
          </div>

          {/* Nomor & Judul Chapter */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-2">Nomor Chapter (contoh: 1 atau 1.5)</label>
              <input
                type="number"
                step="any"
                value={chapterNumber}
                onChange={(e) => setChapterNumber(e.target.value)}
                placeholder="1"
                className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-orange-500 text-xs"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-2">Judul Chapter (Opsional)</label>
              <input
                type="text"
                value={chapterTitle}
                onChange={(e) => setChapterTitle(e.target.value)}
                placeholder="Awal Mula..."
                className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-orange-500 text-xs"
              />
            </div>
          </div>

          {/* Input File Gambar */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-2">
              Pilih Gambar Halaman (Bisa pilih banyak sekaligus)
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setFiles(e.target.files)}
              className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-orange-600 file:text-white hover:file:bg-orange-500 cursor-pointer"
              required
            />
            {files && (
              <p className="text-[11px] text-gray-400 mt-2">
                Terpilih: <strong className="text-orange-400">{files.length}</strong> gambar
              </p>
            )}
          </div>

          {/* Tombol Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-bold transition text-xs ${
              loading
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                : 'bg-orange-600 hover:bg-orange-500 text-white shadow-lg shadow-orange-600/30'
            }`}
          >
            {loading ? progressMsg || 'Sedang memproses...' : 'Mulai Unggah ke Cloudflare R2'}
          </button>
        </form>
      </div>
    </main>
  );
}