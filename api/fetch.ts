import { VercelRequest, VercelResponse } from '@vercel/node';
import { kv } from '@vercel/kv';
import type { StoredUpload, MachineSummary, DashboardStats } from "../shared/schema";

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

    if (!keys || keys.length === 0) {
      return res.status(200).json({
        date,
        totalDeeds: 0,
        machines: [],
      });
    }

    let totalDeeds = 0;
    const machines: MachineSummary[] = [];

    for (const key of keys) {
      const record = await kv.get(key);
      if (record) {
        const parsed: StoredUpload = typeof record === 'string' 
          ? JSON.parse(record) 
          : (record as StoredUpload);

        const deedCount = Object.keys(parsed.deeds || {}).length;
        totalDeeds += deedCount;

        machines.push({
          machineId: parsed.machine_id,
          operator: parsed.operator,
          deedCount,
          uploadTime: parsed.upload_time,
        });
      }
    }

    const response: DashboardStats = {
      date,
      totalDeeds,
      machines,
    };

    res.status(200).json(response);
  } catch (err) {
    console.error('Fetch error:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
