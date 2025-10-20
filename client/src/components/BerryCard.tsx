import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface BerryCardProps {
  name: string;
  icon: LucideIcon;
  color: string;
  selected?: boolean;
  onClick?: () => void;
}

export default function BerryCard({ name, icon: Icon, color, selected = false, onClick }: BerryCardProps) {
  return (
    <Card 
      className={`p-6 cursor-pointer transition-all hover-elevate active-elevate-2 ${
        selected ? 'ring-2 ring-primary' : ''
      }`}
      style={{ backgroundColor: color }}
      onClick={onClick}
      data-testid={`card-berry-${name.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="flex flex-col items-center gap-3">
        <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm">
          <Icon className="w-8 h-8 text-white" />
        </div>
        <p className="text-sm font-semibold text-white text-center">{name}</p>
      </div>
    </Card>
  );
}
