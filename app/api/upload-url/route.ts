import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
  requestChecksumCalculation: 'WHEN_REQUIRED',
  responseChecksumValidation: 'WHEN_REQUIRED',
});

export async function POST(req: Request) {
  try {
    const { filename, contentType } = await req.json();

    const uniqueKey = `chapters/${Date.now()}-${filename}`;

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME || 'yanama-comic',
      Key: uniqueKey,
      ContentType: contentType,
    });

    // Buat presigned URL dengan masa aktif 10 menit
    const uploadUrl = await getSignedUrl(r2, command, { 
      expiresIn: 600,
      unhoistableHeaders: new Set(['content-type']),
    });

    const publicUrl = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL?.replace(/\/$/, '')}/${uniqueKey}`;

    return NextResponse.json({ uploadUrl, publicUrl, key: uniqueKey });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}