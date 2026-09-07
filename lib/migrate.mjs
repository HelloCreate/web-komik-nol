import { createClient } from '@supabase/supabase-js';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const BUCKET_NAME = process.env.R2_BUCKET_NAME || 'yanama-comic';
const PUBLIC_R2_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL?.replace(/\/$/, '');

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

async function runMigration() {
  console.log('Membaca data chapter_images dari Supabase...');
  const { data: images, error } = await supabase.from('chapter_images').select('id, image_url');
  if (error) {
    console.error('Error Supabase:', error.message);
    return;
  }

  const target = images.filter(img => img.image_url && img.image_url.includes('supabase.co'));
  console.log(`Ditemukan ${target.length} gambar untuk dimigrasi.`);

  for (let i = 0; i < target.length; i++) {
    const item = target[i];
    try {
      const res = await fetch(item.image_url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const arrayBuffer = await res.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const path = item.image_url.split('/komik-images/')[1] || `legacy/${item.id}.jpg`;
      const mimeType = res.headers.get('content-type') || 'image/jpeg';

      await r2.send(new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: path,
        Body: buffer,
        ContentType: mimeType,
      }));

      const newUrl = `${PUBLIC_R2_URL}/${path}`;
      await supabase.from('chapter_images').update({ image_url: newUrl }).eq('id', item.id);
      console.log(`[${i + 1}/${target.length}] Sukses: ${path}`);
    } catch (err) {
      console.error(`[${i + 1}/${target.length}] Gagal: ${item.image_url} ->`, err.message);
    }
  }
  console.log('Selesai!');
}

runMigration();