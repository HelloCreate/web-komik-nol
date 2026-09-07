import { NextResponse } from 'next/server';
import { queryD1 } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { mangaId, chapterNumber, chapterTitle, images } = await req.json();

    if (!mangaId || !chapterNumber || !images || !images.length) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
    }

    // 1. Simpan chapter baru dan ambil id
    const insertChapterResult = await queryD1<{ id: number }>(
      'INSERT INTO chapters (manga_id, chapter_number, title) VALUES (?, ?, ?) RETURNING id',
      [mangaId, chapterNumber, chapterTitle || null]
    );

    const chapterId = insertChapterResult[0]?.id;
    if (!chapterId) {
      throw new Error('Gagal membuat record chapter di D1');
    }

    // 2. Simpan seluruh gambar halaman
    for (const img of images) {
      await queryD1(
        'INSERT INTO chapter_images (chapter_id, page_number, image_url) VALUES (?, ?, ?)',
        [chapterId, img.page_number, img.image_url]
      );
    }

    return NextResponse.json({ success: true, chapterId });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Gagal menyimpan chapter' }, { status: 500 });
  }
}