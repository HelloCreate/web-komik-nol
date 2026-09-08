import { NextResponse } from 'next/server';
import { queryD1 } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      id,
      title,
      coverUrl,
      description,
      genres,
      theme,
      demographic,
      status,
      author,
    } = body;

    if (!id || !title) {
      return NextResponse.json(
        { error: 'ID dan Judul wajib diisi' },
        { status: 400 }
      );
    }

    const numericId = Number(id);
    const safeTitle = String(title).trim();
    const safeDesc = description ? String(description).trim() : '';
    const safeGenres = genres ? String(genres).trim() : '';
    const safeTheme = theme ? String(theme).trim() : '';
    const safeDemo = demographic ? String(demographic) : 'Shounen';
    const safeStatus = status ? String(status) : 'Ongoing';
    const safeAuthor = author ? String(author).trim() : '';

    // Perhatikan: KITA SAMA SEKALI TIDAK MENGUPDATE KOLOM SLUG!
    // Ini menjamin SQLITE TIDAK AKAN PERNAH memicu UNIQUE constraint slug.
    if (coverUrl && typeof coverUrl === 'string' && coverUrl.trim() !== '') {
      await queryD1(
        `UPDATE mangas SET 
          title = ?, cover_url = ?, description = ?, 
          genres = ?, theme = ?, demographic = ?, status = ?, author = ?
        WHERE id = ?`,
        [
          safeTitle,
          coverUrl.trim(),
          safeDesc,
          safeGenres,
          safeTheme,
          safeDemo,
          safeStatus,
          safeAuthor,
          numericId,
        ]
      );
    } else {
      await queryD1(
        `UPDATE mangas SET 
          title = ?, description = ?, 
          genres = ?, theme = ?, demographic = ?, status = ?, author = ?
        WHERE id = ?`,
        [
          safeTitle,
          safeDesc,
          safeGenres,
          safeTheme,
          safeDemo,
          safeStatus,
          safeAuthor,
          numericId,
        ]
      );
    }

    return NextResponse.json({ success: true, message: 'Berhasil diperbarui' });
  } catch (error: any) {
    console.error('Update manga error:', error);
    return NextResponse.json(
      { error: error?.message || 'Gagal memperbarui komik di database D1' },
      { status: 500 }
    );
  }
}