import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatsCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down';
  trendValue?: string;
}

export default function StatsCard({ label, value, subtitle, trend, trendValue }: StatsCardProps) {
  return (
    <Card className="p-4" data-testid={`card-stats-${label.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-bold text-foreground" data-testid={`text-value-${label.toLowerCase().replace(/\s+/g, '-')}`}>{value}</p>
          {trend && trendValue && (
            <div className={`flex items-center gap-1 text-xs ${
              trend === 'up' ? 'text-chart-2' : 'text-destructive'
            }`}>
              {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
    </Card>
  );
}
