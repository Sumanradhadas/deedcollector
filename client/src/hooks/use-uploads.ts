import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { format } from "date-fns";

// ============================================
// HOOKS FOR DEED COLLECTION API
// ============================================

// GET /api/fetch (Dashboard Data)
// We pass the date as a query parameter
export function useDashboardData(date: Date) {
  const dateStr = format(date, 'yyyy-MM-dd');
  
  return useQuery({
    queryKey: [api.uploads.list.path, dateStr],
    queryFn: async () => {
      const url = buildUrl(api.uploads.list.path) + `?date=${dateStr}`;
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch dashboard data");
      return api.uploads.list.responses[200].parse(await res.json());
    },
    // Refresh every 30 seconds to catch new uploads
    refetchInterval: 30000, 
  });
}

// DELETE /api/clear
export function useClearData() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (date: Date) => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const url = buildUrl(api.uploads.clear.path) + `?date=${dateStr}`;
      
      const res = await fetch(url, { 
        method: api.uploads.clear.method,
        credentials: "include" 
      });
      
      if (!res.ok) throw new Error("Failed to clear data");
      return api.uploads.clear.responses[200].parse(await res.json());
    },
    onSuccess: (_, date) => {
      const dateStr = format(date, 'yyyy-MM-dd');
      queryClient.invalidateQueries({ queryKey: [api.uploads.list.path, dateStr] });
    },
  });
}

// Helper for Export URL
export function getExportUrl(date: Date) {
  const dateStr = format(date, 'yyyy-MM-dd');
  return buildUrl(api.uploads.export.path) + `?date=${dateStr}`;
}
