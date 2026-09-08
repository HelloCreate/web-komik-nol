import { NextResponse } from 'next/server';
import { queryD1 } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const results: Record<string, string> = {};
  const columns = [
    { name: 'author', type: 'TEXT DEFAULT \'\'' },
    { name: 'genre', type: 'TEXT DEFAULT \'\'' },
    { name: 'theme', type: 'TEXT DEFAULT \'\'' },
    { name: 'demographic', type: 'TEXT DEFAULT \'\'' },
  ];

  for (const col of columns) {
    try {
      await queryD1(`ALTER TABLE mangas ADD COLUMN ${col.name} ${col.type}`);
      results[col.name] = 'Berhasil ditambahkan';
    } catch (err: any) {
      results[col.name] = err.message.includes('duplicate column') 
        ? 'Sudah ada' 
        : `Info: ${err.message}`;
    }
  }

  return NextResponse.json({ success: true, results });
}