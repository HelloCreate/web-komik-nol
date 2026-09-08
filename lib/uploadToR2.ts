export async function uploadToR2(file: File, folder: string = 'uploads'): Promise<string> {
  const fileName = `${folder}/${Date.now()}-${file.name.replace(/\s+/g, '-')}`;

  // 1. Ambil Presigned Upload URL dari API
  const res = await fetch('/api/upload-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      filename: fileName,
      contentType: file.type,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Gagal mendapatkan upload URL');
  }

  const { uploadUrl } = await res.json();

  // 2. Upload biner file langsung ke Cloudflare R2
  const uploadRes = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type,
    },
    body: file,
  });

  if (!uploadRes.ok) {
    throw new Error('Gagal mengunggah file ke Cloudflare R2');
  }

  // 3. Kembalikan URL publik gambar
  const publicBaseUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL?.replace(/\/+$/, '');
  return `${publicBaseUrl}/${fileName}`;
}