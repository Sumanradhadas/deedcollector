import { z } from 'zod';
import { uploadPayloadSchema } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  uploads: {
    create: {
      method: 'POST' as const,
      path: '/api/upload',
      input: uploadPayloadSchema,
      responses: {
        200: z.object({ success: z.boolean(), id: z.string().optional() }),
        400: errorSchemas.validation,
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/fetch',
      input: z.object({
        date: z.string(),
      }),
      responses: {
        200: z.object({
          date: z.string(),
          totalDeeds: z.number(),
          machines: z.array(z.object({
            machineId: z.string(),
            operator: z.string(),
            deedCount: z.number(),
            uploadTime: z.string(),
          }))
        }),
      },
    },
    export: {
      method: 'GET' as const,
      path: '/api/export',
      input: z.object({
        date: z.string(),
      }),
      responses: {
        200: z.any(),
      },
    },
    clear: {
      method: 'DELETE' as const,
      path: '/api/clear',
      input: z.object({
        date: z.string(),
      }),
      responses: {
        200: z.object({ success: z.boolean() }),
      },
    }
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
