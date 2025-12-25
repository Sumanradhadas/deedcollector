import { db } from "./db";
import { uploads, type InsertUpload, type Upload } from "@shared/schema";
import { eq, sql } from "drizzle-orm";

export interface IStorage {
  createUpload(upload: InsertUpload): Promise<Upload>;
  getUploadsByDate(date: string): Promise<Upload[]>;
  deleteUploadsByDate(date: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async createUpload(insertUpload: InsertUpload): Promise<Upload> {
    const [upload] = await db.insert(uploads).values(insertUpload).returning();
    return upload;
  }

  async getUploadsByDate(date: string): Promise<Upload[]> {
    return await db.select().from(uploads).where(eq(uploads.date, date));
  }

  async deleteUploadsByDate(date: string): Promise<void> {
    await db.delete(uploads).where(eq(uploads.date, date));
  }
}

export const storage = new DatabaseStorage();
