'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function UploadPage() {
  const [mangaList, setMangaList] = useState<any[]>([]);
  const [selectedMangaId, setSelectedMangaId] = useState('');
  const [chapters, setChapters] = useState<any[]>([]);
  const [selectedChapterId, setSelectedChapterId] = useState('');
  
  const [files, setFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  // 1. Ambil daftar komik saat halaman pertama kali dimuat
  useEffect(() => {
    async function fetchMangas() {
      const { data } = await supabase.from('manga').select('id, title').order('title', { ascending: true });
      if (data) setMangaList(data);
    }
    fetchMangas();
  }, []);

  // 2. Ambil daftar chapter begitu komik dipilih
  useEffect(() => {
    async function fetchChapters() {
      if (!selectedMangaId) {
        setChapters([]);
        return;
      }
      const { data } = await supabase
        .from('chapters')
        .select('id, chapter_number')
        .eq('manga_id', parseInt(selectedMangaId))
        .order('chapter_number', { ascending: true });
      
      if (data) setChapters(data);
    }
    fetchChapters();
  }, [selectedMangaId]);

  // 3. Fungsi Unggah Gambar Borongan
  const handleUploadBorongan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChapterId || !files || files.length === 0) {
      setStatusMsg('❌ Silakan pilih chapter dan file gambar terlebih dahulu!');
      return;
    }

    setUploading(true);
    setStatusMsg('⏳ Memulai proses unggah borongan...');

    // Ubah FileList menjadi Array dan urutkan berdasarkan nama file secara alfabetis
    const fileArray = Array.from(files).sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));

    let successCount = 0;

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      const pageNumber = i + 1;
      
      // Susun nama file unik di Storage Supabase: contoh "chapter_22/page_1_17182910.jpg"
      const fileExt = file.name.split('.').pop();
      const fileName = `chapter_${selectedChapterId}/page_${pageNumber}_${Date.now()}.${fileExt}`;

      setStatusMsg(`⏳ Mengunggah halaman ${pageNumber} dari ${fileArray.length}...`);

      // A. Upload file fisik gambar ke Supabase Storage Bucket 'komik-images'
      const { data: storageData, error: storageError } = await supabase.storage
        .from('komik-images')
        .upload(fileName, file, { cacheControl: '3600', upsert: true });

      if (storageError) {
        console.error(`Gagal upload file ke storage pada halaman ${pageNumber}:`, storageError.message);
        continue;
      }

      // Dapatkan URL Publik resmi dari file gambar yang baru saja diupload
      const { data: publicUrlData } = supabase.storage
        .from('komik-images')
        .getPublicUrl(fileName);

      const publicUrl = publicUrlData.publicUrl;

      // B. Simpan data alamat URL link gambar tersebut ke tabel 'chapter_images'
      const { error: dbError } = await supabase
        .from('chapter_images')
        .insert([{
          chapter_id: parseInt(selectedChapterId),
          image_url: publicUrl,
          page_number: pageNumber
        }]);

      if (dbError) {
        console.error(`Gagal mencatat data ke database pada halaman ${pageNumber}:`, dbError.message);
      } else {
        successCount++;
      }
    }

    setUploading(false);
    setStatusMsg(`🎉 Sukses mengunggah ${successCount} dari ${fileArray.length} halaman komik!`);
    setFiles(null);
    // Reset form input file secara manual
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white p-6 md:p-12">
      <div className="max-w-xl mx-auto bg-gray-900 border border-gray-800 p-8 rounded-xl shadow-2xl">
        
        {/* Navigasi Atas & Status Proteksi Keamanan */}
        <div className="flex justify-between items-center border-b border-gray-800 pb-4 mb-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-orange-500">Panel Upload Borongan</h1>
            <p className="text-xs text-green-400 font-medium">🛡️ Sesi Terlindungi</p>
          </div>
          <div className="flex gap-3 items-center">
            <Link href="/admin" className="bg-gray-800 hover:bg-gray-700 border border-gray-700 px-4 py-2 rounded text-sm font-semibold transition">
              ← Panel Admin
            </Link>
            <button 
              onClick={() => {
                // Menghapus cookie tanda login admin agar sistem mengunci kembali secara global
                document.cookie = "admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Strict";
                window.location.href = '/login';
              }}
              className="bg-gray-800 hover:bg-red-700 border border-gray-700 hover:border-red-600 text-gray-300 hover:text-white px-3 py-2 rounded text-sm font-semibold transition"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Form Input Upload Gambar */}
        <form onSubmit={handleUploadBorongan} className="space-y-5">
          <div>
            <label className="block text-xs uppercase text-gray-400 font-semibold mb-1">1. Pilih Judul Komik</label>
            <select 
              value={selectedMangaId} 
              onChange={(e) => { setSelectedMangaId(e.target.value); setSelectedChapterId(''); }}
              className="w-full bg-gray-800 border border-gray-700 rounded p-2.5 text-sm text-gray-200 focus:outline-none focus:border-orange-500"
              required
            >
              <option value="">-- Pilih Komik --</option>
              {mangaList.map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs uppercase text-gray-400 font-semibold mb-1">2. Pilih Target Chapter</label>
            <select 
              value={selectedChapterId} 
              onChange={(e) => setSelectedChapterId(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded p-2.5 text-sm text-gray-200 focus:outline-none focus:border-orange-500"
              disabled={!selectedMangaId}
              required
            >
              <option value="">-- Pilih Chapter --</option>
              {chapters.map((ch) => (
                <option key={ch.id} value={ch.id}>Chapter {ch.chapter_number} (ID: {ch.id})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs uppercase text-gray-400 font-semibold mb-1">3. Pilih File Gambar Komik (Bisa Banyak Sekaligus)</label>
            <input 
              id="file-input"
              type="file" 
              multiple 
              accept="image/*"
              onChange={(e) => setFiles(e.target.files)}
              className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-sm text-gray-400 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-orange-600/20 file:text-orange-400 hover:file:bg-orange-600/30"
              required
            />
            <p className="text-[11px] text-gray-500 mt-1">Tips: Pastikan urutan nama file gambar kamu rapi (misal: 01.jpg, 02.png, dst.) agar halaman tersusun berurutan.</p>
          </div>

          <button 
            type="submit" 
            disabled={uploading}
            className={`w-full font-bold py-2.5 rounded text-sm transition ${uploading ? 'bg-orange-800 text-gray-400 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600 text-white'}`}
          >
            {uploading ? '⏳ Sedang Memproses...' : '🚀 Mulai Upload Borongan'}
          </button>
        </form>

        {/* Notifikasi Status Aksi */}
        {statusMsg && (
          <div className="mt-5 text-center p-3 bg-gray-950/40 rounded border border-gray-800 text-xs text-orange-400 font-medium leading-relaxed">
            {statusMsg}
          </div>
        )}

      </div>
    </main>
  );
}