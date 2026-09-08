import { NextResponse } from 'next/server';
import { queryD1 } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      id,
      title,
      slug,
      description,
      status,
      author,
      genre,
      theme,
      demographic,
    } = body;

    if (!id || !title || !slug) {
      return NextResponse.json(
        { error: 'ID, Judul, dan Slug wajib diisi' },
        { status: 400 }
      );
    }

    await queryD1(
      `UPDATE mangas SET 
        title = ?, 
        slug = ?, 
        description = ?, 
        status = ?, 
        author = ?, 
        genre = ?, 
        theme = ?, 
        demographic = ?
      WHERE id = ?`,
      [
        String(title).trim(),
        String(slug).trim(),
        description ? String(description).trim() : '',
        status ? String(status).trim() : 'Ongoing',
        author ? String(author).trim() : '',
        genre ? String(genre).trim() : '',
        theme ? String(theme).trim() : '',
        demographic ? String(demographic).trim() : '',
        Number(id),
      ]
    );

    return NextResponse.json({ success: true, message: 'Komik berhasil diperbarui' });
  } catch (error: any) {
    console.error('Update manga error:', error);
    return NextResponse.json(
      { error: error?.message || 'Gagal menyimpan perubahan ke Cloudflare D1' },
      { status: 500 }
    );
  }
}