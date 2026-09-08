import { NextResponse } from 'next/server';
import { queryD1 } from '@/lib/db';

export async function GET() {
  try {
    const mangas = await queryD1('SELECT * FROM mangas ORDER BY id DESC');
    return NextResponse.json(mangas);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Gagal memuat komik' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, slug, coverUrl, description, genres, theme, demographic, status, author } = body;

    if (!title || !slug) {
      return NextResponse.json({ error: 'Judul dan slug wajib diisi' }, { status: 400 });
    }

    await queryD1(
      `INSERT INTO mangas (
        title, slug, cover_url, description, genres, theme, demographic, status, author
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        slug,
        coverUrl || '',
        description || '',
        genres || '',
        theme || '',
        demographic || '',
        status || 'Ongoing',
        author || ''
      ]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Gagal menambahkan komik' }, { status: 500 });
  }
}

// INI YANG WAJIB ADA UNTUK EDIT:
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, title, slug, coverUrl, description, genres, theme, demographic, status, author } = body;

    if (!id || !title || !slug) {
      return NextResponse.json({ error: 'ID, judul, dan slug wajib diisi' }, { status: 400 });
    }

    if (coverUrl) {
      await queryD1(
        `UPDATE mangas SET 
          title = ?, slug = ?, cover_url = ?, description = ?, 
          genres = ?, theme = ?, demographic = ?, status = ?, author = ?
        WHERE id = ?`,
        [title, slug, coverUrl, description || '', genres || '', theme || '', demographic || '', status || 'Ongoing', author || '', id]
      );
    } else {
      await queryD1(
        `UPDATE mangas SET 
          title = ?, slug = ?, description = ?, 
          genres = ?, theme = ?, demographic = ?, status = ?, author = ?
        WHERE id = ?`,
        [title, slug, description || '', genres || '', theme || '', demographic || '', status || 'Ongoing', author || '', id]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Gagal memperbarui komik' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID komik tidak ditemukan' }, { status: 400 });
    }

    await queryD1('DELETE FROM mangas WHERE id = ?', [id]);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}