import { VercelRequest, VercelResponse } from '@vercel/node';
import { kv } from '@vercel/kv';
import { uploadPayloadSchema, type StoredUpload } from "../shared/schema";
import { z } from 'zod';

export default async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const payload = uploadPayloadSchema.parse(req.body);

    const record: StoredUpload = {
      machine_id: payload.machine_id,
      operator: payload.operator,
      upload_time: new Date().toISOString(),
      deeds: payload.deeds,
    };

    const key = `deeds:${payload.date}:${payload.machine_id}`;
    await kv.set(key, JSON.stringify(record));

    res.status(200).json({ success: true, id: key });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        message: err.errors[0].message,
        field: err.errors[0].path.join('.'),
      });
    }
    console.error('Upload error:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
