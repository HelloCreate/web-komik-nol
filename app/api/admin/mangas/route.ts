import { NextResponse } from 'next/server';
import { queryD1 } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const mangas = await queryD1('SELECT * FROM mangas ORDER BY id DESC');
    return NextResponse.json(mangas);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Gagal memuat komik' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      title,
      slug,
      coverUrl,
      description,
      genres,
      theme,
      demographic,
      status,
      author,
    } = body;

    if (!title || !slug) {
      return NextResponse.json(
        { error: 'Judul dan slug wajib diisi' },
        { status: 400 }
      );
    }

    const safeTitle = String(title).trim();
    const safeSlug = String(slug).trim();
    const safeCover = coverUrl ? String(coverUrl).trim() : '';
    const safeDesc = description ? String(description).trim() : '';
    const safeGenres = genres ? String(genres).trim() : '';
    const safeTheme = theme ? String(theme).trim() : '';
    const safeDemo = demographic ? String(demographic) : 'Shounen';
    const safeStatus = status ? String(status) : 'Ongoing';
    const safeAuthor = author ? String(author).trim() : '';

    await queryD1(
      `INSERT INTO mangas (
        title, slug, cover_url, description, genres, theme, demographic, status, author
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        safeTitle,
        safeSlug,
        safeCover,
        safeDesc,
        safeGenres,
        safeTheme,
        safeDemo,
        safeStatus,
        safeAuthor,
      ]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Insert manga error:', error);
    return NextResponse.json(
      { error: error?.message || 'Gagal menambahkan komik' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID komik tidak ditemukan' },
        { status: 400 }
      );
    }

    await queryD1('DELETE FROM mangas WHERE id = ?', [Number(id)]);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Gagal menghapus komik' },
      { status: 500 }
    );
  }
}