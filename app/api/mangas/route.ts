import { NextResponse } from 'next/server';
import { queryD1 } from '@/lib/db';

export async function GET() {
  try {
    const mangas = await queryD1('SELECT id, title, slug, cover_url FROM mangas ORDER BY title ASC');
    return NextResponse.json(mangas);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Gagal memuat daftar komik' }, { status: 500 });
  }
}