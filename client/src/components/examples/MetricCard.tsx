import MetricCard from '../MetricCard';
import { MapPin, Users, CheckCircle } from 'lucide-react';

export default function MetricCardExample() {
  return (
    <div className="p-6 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard 
          title="Visitas Hoy" 
          value={0} 
          subtitle="Evaluaciones de hoy"
          icon={MapPin}
          iconColor="text-primary"
        />
        <MetricCard 
          title="Promotores Activos" 
          value={2} 
          subtitle="Total de promotores"
          icon={Users}
          iconColor="text-chart-2"
        />
        <MetricCard 
          title="Evaluaciones (Mes)" 
          value={1} 
          subtitle="6 productos"
          icon={CheckCircle}
          iconColor="text-chart-2"
          gradient
        />
      </div>
    </div>
  );
}
