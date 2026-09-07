export async function uploadToR2(file: File, folder: string = 'general'): Promise<string> {
  // 1. Dapatkan Presigned URL dari route API
  const res = await fetch('/api/upload-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      filename: file.name,
      fileType: file.type,
      folder: folder,
    }),
  });

  const data = await res.json();
  if (!res.ok || !data.uploadUrl) {
    throw new Error(data.error || 'Gagal meminta URL upload');
  }

  // 2. Upload file fisik langsung ke Cloudflare R2
  const uploadRes = await fetch(data.uploadUrl, {
    method: 'PUT',
    body: file,
  });

  if (!uploadRes.ok) {
    throw new Error('Gagal mengunggah file ke Cloudflare R2');
  }

  // 3. Mengembalikan URL publik gambar
  return data.publicUrl;
}