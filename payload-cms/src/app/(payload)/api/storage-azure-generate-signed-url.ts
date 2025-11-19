import type { NextApiRequest, NextApiResponse } from 'next';
import {
  BlobServiceClient,
  StorageSharedKeyCredential,
  BlobSASPermissions,
  SASProtocol,
  generateBlobSASQueryParameters,
} from '@azure/storage-blob';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'POST only' });
    }

    const { filename } = req.body;
    if (!filename) {
      return res.status(400).json({ message: 'Missing filename' });
    }

    const conn = process.env.AZURE_STORAGE_CONNECTION_STRING!;
    const name = conn.match(/AccountName=([^;]+)/)?.[1];
    const key = conn.match(/AccountKey=([^;]+)/)?.[1];

    const shared = new StorageSharedKeyCredential(name!, key!);
    const container = process.env.AZURE_STORAGE_CONTAINER_NAME || 'media';

    const serviceUrl = `https://${name}.blob.core.windows.net`;
    const blobUrl = `${serviceUrl}/${container}/${filename}`;

    const expires = new Date(Date.now() + 5 * 60 * 1000);

    const sasToken = generateBlobSASQueryParameters({
      containerName: container,
      blobName: filename,
      permissions: BlobSASPermissions.parse('cw'),
      startsOn: new Date(),
      expiresOn: expires,
      protocol: SASProtocol.Https,
    }, shared).toString();

    const uploadUrl = `${blobUrl}?${sasToken}`;
    const publicUrl = `${process.env.AZURE_STORAGE_ACCOUNT_BASEURL}/${filename}`;

    return res.status(200).json({ uploadUrl, publicUrl, expiresAt: expires.toISOString() });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
