import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  className?: string;
  trend?: "up" | "down" | "neutral";
}

export function StatCard({ title, value, icon: Icon, description, className, trend }: StatCardProps) {
  return (
    <div className={cn(
      "glass-card rounded-2xl p-6 relative overflow-hidden group",
      className
    )}>
      <div className="flex justify-between items-start z-10 relative">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <h3 className="text-3xl font-bold tracking-tight text-foreground">{value}</h3>
          {description && (
            <p className="text-xs text-muted-foreground mt-2 font-medium">{description}</p>
          )}
        </div>
        <div className="p-3 bg-primary/10 rounded-xl text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
          <Icon className="w-6 h-6" />
        </div>
      </div>
      
      {/* Decorative gradient blob */}
      <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-2xl group-hover:from-primary/20 transition-all duration-500" />
    </div>
  );
}
