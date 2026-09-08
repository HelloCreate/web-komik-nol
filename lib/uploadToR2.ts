export async function uploadToR2(file: File, folder: string = 'uploads'): Promise<string> {
  const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const fileKey = `${folder}/${Date.now()}-${cleanFileName}`;

  // 1. Ambil Presigned URL untuk upload
  const res = await fetch('/api/upload-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      filename: fileKey,
      contentType: file.type || 'image/jpeg',
    }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Gagal menyiapkan URL unggahan');
  }

  const { uploadUrl } = await res.json();

  // 2. Upload file langsung ke Cloudflare R2
  const uploadRes = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type || 'image/jpeg',
    },
    body: file,
  });

  if (!uploadRes.ok) {
    throw new Error('Gagal mengunggah file ke Cloudflare R2');
  }

  // 3. Kembalikan URL proxy internal agar bebas error SSL di semua perangkat
  return `/api/image?key=${encodeURIComponent(fileKey)}`;
}