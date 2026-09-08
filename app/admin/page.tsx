'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Manga {
  id: number;
  title: string;
  slug: string;
  cover_url?: string;
}

export default function AdminDashboardPage() {
  const [mangas, setMangas] = useState<Manga[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadMangas() {
      try {
        const res = await fetch('/api/admin/mangas', { cache: 'no-store' });
        const data = await res.json();
        if (Array.isArray(data)) {
          setMangas(data);
        }
      } catch (err: any) {
        console.error('Gagal mengambil daftar komik:', err.message);
      } finally {
        setLoading(false);
      }
    }
    loadMangas();
  }, []);

  return (
    <div className="min-h-screen bg-[#453a3a] text-[#baa9a9] p-6 md:p-10">
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

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="bg-[#362d2d] hover:bg-[#2b2424] text-[#baa9a9] hover:text-[#f2ecec] text-xs md:text-sm font-semibold px-4 py-2.5 rounded-xl border border-[#baa9a9]/30 transition shadow"
            >
              &larr; Lihat Web Utama
            </Link>
          </div>
        </div>

        {/* Menu Aksi Cepat */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Link
            href="/upload"
            className="group bg-[#362d2d] hover:bg-[#2e2626] p-6 rounded-2xl border border-[#baa9a9]/20 shadow-lg transition flex items-center justify-between"
          >
            <div>
              <h2 className="text-lg font-bold text-[#f2ecec] group-hover:text-white transition">
                + Upload Chapter Komik
              </h2>
              <p className="text-xs text-[#baa9a9]/80 mt-1">
                Unggah gambar halaman dan buat bab baru ke Cloudflare R2
              </p>
            </div>
            <span className="bg-[#baa9a9] text-[#453a3a] font-bold text-xs px-3.5 py-2 rounded-lg group-hover:bg-[#cfc1c1] transition">
              Buka Form
            </span>
          </Link>

          <div className="bg-[#362d2d] p-6 rounded-2xl border border-[#baa9a9]/20 shadow-lg flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#f2ecec]">
                Total Komik Terdaftar
              </h2>
              <p className="text-xs text-[#baa9a9]/80 mt-1">
                Jumlah judul komik aktif dalam database
              </p>
            </div>
            <span className="text-2xl font-black text-[#f2ecec] bg-[#2a2323] px-4 py-2 rounded-xl border border-[#baa9a9]/30">
              {mangas.length}
            </span>
          </div>
        </div>

        {/* Daftar Komik yang Ada */}
        <div className="bg-[#362d2d] p-6 rounded-2xl border border-[#baa9a9]/20 shadow-lg space-y-4">
          <div className="flex justify-between items-center border-b border-[#baa9a9]/20 pb-3">
            <h3 className="text-base font-bold text-[#f2ecec]">
              Daftar Komik
            </h3>
            <span className="text-xs text-[#baa9a9]/70">
              {mangas.length} Judul
            </span>
          </div>

          {loading ? (
            <p className="py-8 text-center text-xs text-[#baa9a9]/70 animate-pulse">
              Memuat data komik...
            </p>
          ) : mangas.length > 0 ? (
            <div className="divide-y divide-[#baa9a9]/10">
              {mangas.map((manga) => (
                <div
                  key={manga.id}
                  className="py-3.5 flex items-center justify-between gap-3"
                >
                  <div>
                    <h4 className="font-semibold text-sm text-[#f2ecec]">
                      {manga.title}
                    </h4>
                    <p className="text-xs text-[#baa9a9]/60">
                      Slug: /{manga.slug}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/manga/${manga.slug}`}
                      className="text-xs bg-[#2a2323] hover:bg-[#201a1a] text-[#baa9a9] hover:text-[#f2ecec] px-3 py-1.5 rounded-lg border border-[#baa9a9]/30 transition"
                    >
                      Lihat
                    </Link>
                    <Link
                      href="/upload"
                      className="text-xs bg-[#baa9a9] hover:bg-[#cfc1c1] text-[#453a3a] font-bold px-3 py-1.5 rounded-lg transition"
                    >
                      + Chapter
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-xs text-[#baa9a9]/60">
              Belum ada komik yang dibuat di database.
            </p>
          )}
        </div>

      </div>
    </div>
  );
}