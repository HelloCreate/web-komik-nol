import { NextResponse } from 'next/server';
import { queryD1 } from '@/lib/db';

// GET: Mengambil seluruh daftar komik untuk halaman admin
export async function GET() {
  try {
    const mangas = await queryD1('SELECT * FROM mangas ORDER BY id DESC');
    return NextResponse.json(mangas);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Gagal mengambil daftar komik' }, { status: 500 });
  }
}

// POST: Menambah komik baru ke Cloudflare D1
export async function POST(req: Request) {
  try {
    const { title, slug, coverUrl, description } = await req.json();

    if (!title || !slug) {
      return NextResponse.json({ error: 'Judul dan slug wajib diisi' }, { status: 400 });
    }

    await queryD1(
      'INSERT INTO mangas (title, slug, cover_url, description) VALUES (?, ?, ?, ?)',
      [title, slug, coverUrl || '', description || '']
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Gagal menambahkan komik' }, { status: 500 });
  }
}

// DELETE: Menghapus komik berdasarkan ID
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
    return NextResponse.json({ error: error.message || 'Gagal menghapus komik' }, { status: 500 });
  }
}