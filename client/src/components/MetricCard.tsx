import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: string;
  gradient?: boolean;
}

export default function MetricCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  iconColor = "text-primary",
  gradient = false 
}: MetricCardProps) {
  return (
    <Card 
      className={`p-4 ${gradient ? 'bg-gradient-to-br from-[hsl(250,84%,54%)] to-primary text-white border-0' : ''}`}
      data-testid={`card-metric-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium mb-1 ${gradient ? 'text-white/90' : 'text-muted-foreground'}`}>
            {title}
          </p>
          <p className={`text-2xl font-bold mb-1 ${gradient ? 'text-white' : 'text-foreground'}`} data-testid={`text-value-${title.toLowerCase().replace(/\s+/g, '-')}`}>
            {value}
          </p>
          {subtitle && (
            <p className={`text-xs ${gradient ? 'text-white/80' : 'text-muted-foreground'}`}>
              {subtitle}
            </p>
          )}
        </div>
        <div className={`p-2 rounded-lg ${gradient ? 'bg-white/20' : 'bg-primary/10'}`}>
          <Icon className={`w-5 h-5 ${gradient ? 'text-white' : iconColor}`} />
        </div>
      </div>
    </Card>
  );
}
