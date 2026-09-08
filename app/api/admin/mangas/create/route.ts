import { NextResponse } from 'next/server';
import { queryD1 } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      title,
      slug,
      cover_url,
      description,
      status,
      author,
      genre,
      theme,
      demographic,
    } = body;

    if (!title || !slug) {
      return NextResponse.json(
        { error: 'Judul dan Slug wajib diisi' },
        { status: 400 }
      );
    }

    const cleanSlug = String(slug).trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-');

    // Cek slug apakah sudah terpakai
    const existing = await queryD1<any>(
      'SELECT id FROM mangas WHERE slug = ? LIMIT 1',
      [cleanSlug]
    );

    if (existing && existing.length > 0) {
      return NextResponse.json(
        { error: 'Slug sudah terpakai oleh komik lain' },
        { status: 400 }
      );
    }

    await queryD1(
      `INSERT INTO mangas (
        title, slug, cover_url, description, status, author, genre, theme, demographic
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        String(title).trim(),
        cleanSlug,
        cover_url ? String(cover_url).trim() : '',
        description ? String(description).trim() : '',
        status ? String(status).trim() : 'Ongoing',
        author ? String(author).trim() : '',
        genre ? String(genre).trim() : '',
        theme ? String(theme).trim() : '',
        demographic ? String(demographic).trim() : '',
      ]
    );

    return NextResponse.json({ success: true, message: 'Komik baru berhasil dibuat' });
  } catch (error: any) {
    console.error('Create manga error:', error);
    return NextResponse.json(
      { error: error?.message || 'Gagal menyimpan komik ke database' },
      { status: 500 }
    );
  }
}