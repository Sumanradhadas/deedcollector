import { kv } from '@vercel/kv';

export function getKV() {
  return kv;
}

export function buildKey(date: string, machineId?: string): string {
  if (machineId) {
    return `deeds:${date}:${machineId}`;
  }
  return `deeds:${date}:*`;
}
