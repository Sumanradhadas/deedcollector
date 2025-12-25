import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { Monitor, FileText, User, Clock } from "lucide-react";
import type { MachineSummary } from "@shared/schema";
import { Badge } from "@/components/ui/badge";

interface MachinesTableProps {
  data: MachineSummary[];
}

export function MachinesTable({ data }: MachinesTableProps) {
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-border/50 rounded-2xl bg-muted/20">
        <div className="bg-background p-4 rounded-full shadow-sm mb-4">
          <Monitor className="w-8 h-8 text-muted-foreground/50" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">No uploads yet</h3>
        <p className="text-sm text-muted-foreground max-w-xs mt-1">
          Waiting for machines to upload their daily deed data.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border/50 overflow-hidden shadow-sm bg-card">
      <Table>
        <TableHeader className="bg-muted/30">
          <TableRow className="hover:bg-transparent border-border/50">
            <TableHead className="w-[180px] py-4 pl-6 font-semibold">Machine ID</TableHead>
            <TableHead className="py-4 font-semibold">Operator</TableHead>
            <TableHead className="py-4 font-semibold">Deeds Uploaded</TableHead>
            <TableHead className="text-right py-4 pr-6 font-semibold">Last Upload</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((machine) => (
            <TableRow key={machine.machineId} className="hover:bg-muted/30 border-border/50 transition-colors">
              <TableCell className="font-medium pl-6 py-4">
                <div className="flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-primary/70" />
                  <span className="font-mono text-xs md:text-sm bg-primary/5 px-2 py-1 rounded-md text-primary font-semibold">
                    {machine.machineId}
                  </span>
                </div>
              </TableCell>
              <TableCell className="py-4 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground/50" />
                  {machine.operator}
                </div>
              </TableCell>
              <TableCell className="py-4">
                <Badge variant="secondary" className="font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100">
                  <FileText className="w-3 h-3 mr-1" />
                  {machine.deedCount} Deeds
                </Badge>
              </TableCell>
              <TableCell className="text-right pr-6 py-4 text-muted-foreground font-mono text-xs">
                <div className="flex items-center justify-end gap-2">
                  <Clock className="w-3 h-3" />
                  {format(new Date(machine.uploadTime), "h:mm:ss a")}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
