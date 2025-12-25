import { format } from "date-fns";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Download, Trash2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { DashboardStats } from "@shared/schema";

export default function Dashboard() {
  const [date, setDate] = useState<Date>(new Date());
  const formattedDate = format(date, "yyyy-MM-dd");
  const { toast } = useToast();

  const { data: stats, isLoading, refetch } = useQuery<DashboardStats>({
    queryKey: ["/api/fetch", { date: formattedDate }],
    queryFn: async ({ queryKey }) => {
      const [_path, params] = queryKey as [string, { date: string }];
      const res = await fetch(`/api/fetch?date=${params.date}`);
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
    refetchInterval: 30000,
  });

  const clearMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", "/api/clear", { date: formattedDate });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fetch", { date: formattedDate }] });
      toast({ title: "Success", description: "Data cleared for " + formattedDate });
    },
  });

  const handleExport = () => {
    window.open(`/api/export?date=${formattedDate}`, "_blank");
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Deed Collection Dashboard</h1>
          <p className="text-muted-foreground">Monitor and export daily deed submissions</p>
        </div>

        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("w-[240px] justify-start text-left font-normal")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar mode="single" selected={date} onSelect={(d) => d && setDate(d)} initialFocus />
            </PopoverContent>
          </Popover>
          <Button size="icon" variant="ghost" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deeds</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalDeeds || 0}</div>
          </CardContent>
        </Card>
        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Machines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.machines.length || 0}</div>
          </CardContent>
        </Card>
        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button className="flex-1" onClick={handleExport} disabled={!stats?.totalDeeds}>
              <Download className="mr-2 h-4 w-4" /> Export JSON
            </Button>
            <Button variant="destructive" size="icon" onClick={() => {
              if (confirm("Are you sure you want to clear all data for " + formattedDate + "?")) {
                clearMutation.mutate();
              }
            }} disabled={!stats?.totalDeeds || clearMutation.isPending}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Machine Status</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Machine ID</TableHead>
                <TableHead>Operator</TableHead>
                <TableHead className="text-right">Deeds</TableHead>
                <TableHead className="text-right">Last Upload</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats?.machines.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                    No uploads found for this date.
                  </TableCell>
                </TableRow>
              ) : (
                stats?.machines.map((m) => (
                  <TableRow key={m.machineId}>
                    <TableCell className="font-medium">{m.machineId}</TableCell>
                    <TableCell>{m.operator}</TableCell>
                    <TableCell className="text-right">{m.deedCount}</TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {format(new Date(m.uploadTime), "HH:mm:ss")}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
