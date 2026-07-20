'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function MultiUploadPage() {
  const [files, setFiles] = useState<FileList | null>(null);
  const [chapterId, setChapterId] = useState('');
  const [status, setStatus] = useState('');
  const [progress, setProgress] = useState(0);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!files || files.length === 0 || !chapterId) {
      setStatus('Mohon isi ID Chapter dan pilih file gambar!');
      return;
    }

    setStatus('Sedang memproses upload...');
    setProgress(0);

    // Ubah FileList menjadi Array dan urutkan berdasarkan nama file agar halaman tidak acak
    const fileArray = Array.from(files).sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));

    let successCount = 0;

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      const pageNumber = i + 1; // Otomatis menentukan nomor halaman dari urutan file (1, 2, 3...)
      
      setStatus(`Mengunggah halaman ${pageNumber} dari ${fileArray.length}...`);

      const fileExt = file.name.split('.').pop();
      const fileName = `${chapterId}_page_${pageNumber}_${Date.now()}.${fileExt}`;
      
      // 1. Upload ke Storage
      const { error: storageError } = await supabase.storage
        .from('komik-images')
        .upload(fileName, file);

      if (storageError) {
        console.error(`Gagal upload halaman ${pageNumber}:`, storageError.message);
        continue; // Jika 1 gagal, lanjut ke halaman berikutnya
      }

      // 2. Ambil URL Publik gambar
      const { data: publicUrlData } = supabase.storage
        .from('komik-images')
        .getPublicUrl(fileName);

      const imageUrl = publicUrlData.publicUrl;

      // 3. Simpan ke database
      const { error: dbError } = await supabase
        .from('chapter_images')
        .insert([
          {
            chapter_id: parseInt(chapterId),
            page_number: pageNumber,
            image_url: imageUrl
          }
        ]);

      if (!dbError) {
        successCount++;
        setProgress(Math.round((successCount / fileArray.length) * 100));
      }
    }

    setStatus(`🎉 Sukses mengunggah ${successCount} dari ${fileArray.length} halaman komik!`);
    setFiles(null);
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8 flex flex-col items-center">
      <div className="w-full max-w-md bg-gray-900 border border-gray-800 p-6 rounded-xl shadow-md">
        <h1 className="text-xl font-bold text-orange-500 mb-6 text-center">Multi-Upload Halaman Komik</h1>
        
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">ID Chapter (Angka dari Supabase)</label>
            <input 
              type="number" 
              placeholder="Contoh: 1"
              value={chapterId}
              onChange={(e) => setChapterId(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white focus:outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Pilih Semua Gambar Komik sekaligus</label>
            <input 
              type="file" 
              accept="image/*"
              multiple // <--- Kunci utama agar bisa pilih banyak file sekaligus
              onChange={(e) => setFiles(e.target.files)}
              className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-orange-600 file:text-white hover:file:bg-orange-700 cursor-pointer"
            />
            <p className="text-xs text-gray-500 mt-1">*Tips: Berikan nama file berurutan di laptop (misal: 1.png, 2.png, dst.)</p>
          </div>

          <button 
            type="submit" 
            className="w-full bg-orange-500 hover:bg-orange-600 font-bold py-2 rounded transition"
          >
            Upload Borongan
          </button>
        </form>

        {status && (
          <div className="mt-4 text-center">
            <p className="text-sm text-orange-400 font-medium mb-2">{status}</p>
            {progress > 0 && progress < 100 && (
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div className="bg-orange-500 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}