import { z } from "zod";

// === UPLOAD PAYLOAD SCHEMA ===
// This is the exact format userscripts send
export const uploadPayloadSchema = z.object({
  machine_id: z.string(),
  operator: z.string(),
  date: z.string(), // YYYY-MM-DD
  deeds: z.record(z.any()), // keys are string, values are deed payloads
});

export type UploadPayload = z.infer<typeof uploadPayloadSchema>;

// === STORED RECORD IN KV ===
// What gets stored in Vercel KV with key: deeds:${date}:${machine_id}
export interface StoredUpload {
  machine_id: string;
  operator: string;
  upload_time: string; // ISO timestamp
  deeds: Record<string, any>;
}

// === DASHBOARD RESPONSE TYPES ===
export interface MachineSummary {
  machineId: string;
  operator: string;
  deedCount: number;
  uploadTime: string;
}

export interface DashboardStats {
  date: string;
  totalDeeds: number;
  machines: MachineSummary[];
}

export type ExportData = {
  date: string;
  exportedAt: string;
  totalUploads: number;
  data: StoredUpload[];
};
