import { Express } from "express";
import { createServer, type Server } from "http";
import { kv } from "@vercel/kv";
import { uploadPayloadSchema, type StoredUpload, type MachineSummary, type DashboardStats, type ExportData } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/upload", async (req, res) => {
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
      res.json({ success: true, id: key });
    } catch (err: any) {
      console.error("Upload error details:", err);
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: err.message || "Internal Server Error" });
    }
  });

  app.get("/api/fetch", async (req, res) => {
    try {
      const date = req.query.date as string;
      if (!date) return res.status(400).json({ message: "Date required" });
      
      const pattern = `deeds:${date}:*`;
      let keys: string[] = [];
      try {
        keys = await kv.keys(pattern);
      } catch (kvErr) {
        console.error("KV Keys error:", kvErr);
        // Fallback to empty list if keys fails (likely missing env vars)
        keys = [];
      }
      
      let totalDeeds = 0;
      const machines: MachineSummary[] = [];

      for (const key of keys) {
        const record = await kv.get(key);
        if (record) {
          const parsed: StoredUpload = typeof record === "string" ? JSON.parse(record) : (record as StoredUpload);
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
      res.json({ date, totalDeeds, machines });
    } catch (err: any) {
      console.error("Fetch error details:", err);
      res.status(500).json({ message: err.message || "Internal Server Error" });
    }
  });

  app.get("/api/export", async (req, res) => {
    try {
      const date = req.query.date as string;
      if (!date) return res.status(400).json({ message: "Date required" });
      
      const pattern = `deeds:${date}:*`;
      const keys = await kv.keys(pattern);
      const data: StoredUpload[] = [];

      for (const key of keys) {
        const record = await kv.get(key);
        if (record) {
          data.push(typeof record === "string" ? JSON.parse(record) : (record as StoredUpload));
        }
      }
      
      const exportData: ExportData = {
        date,
        exportedAt: new Date().toISOString(),
        totalUploads: data.length,
        data,
      };
      res.json(exportData);
    } catch (err: any) {
      console.error("Export error details:", err);
      res.status(500).json({ message: err.message || "Internal Server Error" });
    }
  });

  app.delete("/api/clear", async (req, res) => {
    try {
      const { date } = z.object({ date: z.string() }).parse(req.body);
      const pattern = `deeds:${date}:*`;
      const keys = await kv.keys(pattern);
      if (keys.length > 0) {
        await Promise.all(keys.map(key => kv.del(key)));
      }
      res.json({ success: true });
    } catch (err: any) {
      console.error("Clear error details:", err);
      res.status(500).json({ message: err.message || "Internal Server Error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
