import { VercelRequest, VercelResponse } from '@vercel/node';
import { kv } from '@vercel/kv';
import type { StoredUpload, ExportData } from "../shared/schema";

export default async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const date = req.query.date as string;

    if (!date) {
      return res.status(400).json({ message: 'Date is required' });
    }

    const pattern = `deeds:${date}:*`;
    const keys = await kv.keys(pattern);

    const data: StoredUpload[] = [];

    if (keys && keys.length > 0) {
      for (const key of keys) {
        const record = await kv.get(key);
        if (record) {
          const parsed: StoredUpload = typeof record === 'string'
            ? JSON.parse(record)
            : (record as StoredUpload);
          data.push(parsed);
        }
      }
    }

    const exportData: ExportData = {
      date,
      exportedAt: new Date().toISOString(),
      totalUploads: data.length,
      data,
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="deeds-${date}.json"`);
    res.status(200).json(exportData);
  } catch (err) {
    console.error('Export error:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
