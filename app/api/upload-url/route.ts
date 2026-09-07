import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || process.env.R2_ACCESS_KEY || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || process.env.R2_SECRET_KEY || '',
  },
});

export async function POST(req: Request) {
  try {
    const { filename } = await req.json();
    const cleanFileName = filename.replace(/\s+/g, '-');
    const uniqueKey = `chapters/${Date.now()}-${cleanFileName}`;

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME || 'yanama-comic',
      Key: uniqueKey,
    });

    const uploadUrl = await getSignedUrl(r2, command, {
      expiresIn: 600,
      signableHeaders: new Set(['host']),
    });

    const publicUrl = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL?.replace(/\/$/, '')}/${uniqueKey}`;

    return NextResponse.json({ uploadUrl, publicUrl, key: uniqueKey });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}