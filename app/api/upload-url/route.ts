import { NextResponse } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { r2 } from '@/lib/r2';

export async function POST(req: Request) {
  try {
    const { filename, fileType, folder = 'general' } = await req.json();

    if (!filename || !fileType) {
      return NextResponse.json({ error: 'Data file tidak lengkap' }, { status: 400 });
    }

    const uniqueKey = `${folder}/${Date.now()}-${filename.replace(/\s+/g, '_')}`;

    const command = new PutObjectCommand({
  Bucket: process.env.R2_BUCKET_NAME,
  Key: key,
  ContentType: contentType,
  ChecksumAlgorithm: undefined, // Menghilangkan parameter checksum yang ditolak R2
});

    const uploadUrl = await getSignedUrl(r2, command, { expiresIn: 300 });
    const publicUrl = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${uniqueKey}`;

    return NextResponse.json({ uploadUrl, publicUrl });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}