import { VercelRequest, VercelResponse } from '@vercel/node';
import { kv } from '@vercel/kv';
import { z } from 'zod';

const clearSchema = z.object({
  date: z.string(),
});

export default async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const input = clearSchema.parse(req.body);
    const pattern = `deeds:${input.date}:*`;
    const keys = await kv.keys(pattern);

    if (keys && keys.length > 0) {
      await Promise.all(keys.map(key => kv.del(key)));
    }

    res.status(200).json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        message: err.errors[0].message
      });
    }
    console.error('Clear error:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
