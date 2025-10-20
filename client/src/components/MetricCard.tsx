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
  const iconBgColor = iconColor.replace('text-', 'bg-').replace(']', '/10]');
  
  return (
    <Card 
      className={`p-4 hover-elevate ${gradient ? 'bg-gradient-to-br from-[hsl(265,85%,57%)] via-[hsl(217,91%,60%)] to-[hsl(142,76%,45%)] text-white border-0 shadow-lg' : 'shadow-sm'}`}
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
        <div className={`p-2.5 rounded-xl ${gradient ? 'bg-white/20' : iconBgColor}`}>
          <Icon className={`w-5 h-5 ${gradient ? 'text-white' : iconColor}`} />
        </div>
      </div>
    </Card>
  );
}
