export async function uploadToR2(file: File, folder: string = 'chapters'): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  const res = await fetch('/api/upload-url', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Upload gagal dengan status ${res.status}`);
  }

  const data = await res.json();
  return data.publicUrl;
}