import { NextResponse } from 'next/server';
import { queryD1 } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { mangaId, chapterNumber, title, images } = body;

    if (!mangaId || !chapterNumber) {
      return NextResponse.json(
        { error: 'mangaId dan chapterNumber wajib diisi' },
        { status: 400 }
      );
    }

    const safeMangaId = Number(mangaId);
    const safeChapterNumber = String(chapterNumber).trim();
    const safeTitle = title ? String(title).trim() : '';

    // 1. Simpan atau perbarui entri chapter di tabel chapters
    await queryD1(
      `INSERT INTO chapters (manga_id, chapter_number, title)
       VALUES (?, ?, ?)
       ON CONFLICT(manga_id, chapter_number) DO UPDATE SET
         title = excluded.title`,
      [safeMangaId, safeChapterNumber, safeTitle]
    );

    // 2. Ambil ID dari chapter yang baru dibuat/diperbarui
    const chapterRows = await queryD1<any>(
      'SELECT id FROM chapters WHERE manga_id = ? AND chapter_number = ? LIMIT 1',
      [safeMangaId, safeChapterNumber]
    );

    if (!chapterRows || chapterRows.length === 0) {
      throw new Error('Gagal mendapatkan ID chapter yang baru disimpan');
    }

    const chapterId = chapterRows[0].id;

    // 3. Simpan daftar gambar halaman ke tabel chapter_images
    if (Array.isArray(images) && images.length > 0) {
      // Hapus data halaman lama jika chapter ini di-upload ulang
      await queryD1('DELETE FROM chapter_images WHERE chapter_id = ?', [chapterId]);

      for (const img of images) {
        await queryD1(
          `INSERT INTO chapter_images (chapter_id, page_number, image_url)
           VALUES (?, ?, ?)`,
          [chapterId, Number(img.pageNumber), String(img.imageUrl)]
        );
      }
    }

    return NextResponse.json({ success: true, chapterId });
  } catch (error: any) {
    console.error('Error simpan chapter:', error);
    return NextResponse.json(
      { error: error?.message || 'Gagal menyimpan chapter ke database D1' },
      { status: 500 }
    );
  }
}