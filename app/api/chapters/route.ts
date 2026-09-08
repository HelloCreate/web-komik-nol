import { NextResponse } from 'next/server';
import { queryD1 } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { mangaId, chapterNumber, title, images } = body;

    if (!mangaId || !chapterNumber) {
      return NextResponse.json(
        { error: 'ID komik dan nomor chapter wajib diisi' },
        { status: 400 }
      );
    }

    const safeMangaId = Number(mangaId);
    const safeChapterNumber = String(chapterNumber).trim();
    const safeTitle = title ? String(title).trim() : '';

    // 1. Cek apakah chapter sudah terdaftar
    const existing = await queryD1<any>(
      'SELECT id FROM chapters WHERE manga_id = ? AND chapter_number = ? LIMIT 1',
      [safeMangaId, safeChapterNumber]
    );

    let chapterId: number;

    if (existing && existing.length > 0) {
      chapterId = existing[0].id;
      await queryD1(
        'UPDATE chapters SET title = ? WHERE id = ?',
        [safeTitle, chapterId]
      );
    } else {
      await queryD1(
        'INSERT INTO chapters (manga_id, chapter_number, title) VALUES (?, ?, ?)',
        [safeMangaId, safeChapterNumber, safeTitle]
      );

      const created = await queryD1<any>(
        'SELECT id FROM chapters WHERE manga_id = ? AND chapter_number = ? LIMIT 1',
        [safeMangaId, safeChapterNumber]
      );

      if (!created || created.length === 0) {
        throw new Error('Gagal mendapatkan ID chapter baru');
      }

      chapterId = created[0].id;
    }

    // 2. Simpan daftar gambar lembaran chapter
    if (Array.isArray(images) && images.length > 0) {
      await queryD1('DELETE FROM chapter_images WHERE chapter_id = ?', [chapterId]);

      for (const img of images) {
        await queryD1(
          'INSERT INTO chapter_images (chapter_id, page_number, image_url) VALUES (?, ?, ?)',
          [chapterId, Number(img.pageNumber), String(img.imageUrl)]
        );
      }
    }

    return NextResponse.json({ success: true, chapterId });
  } catch (error: any) {
    console.error('Save chapter error:', error);
    return NextResponse.json(
      { error: error?.message || 'Gagal menyimpan chapter ke D1' },
      { status: 500 }
    );
  }
}