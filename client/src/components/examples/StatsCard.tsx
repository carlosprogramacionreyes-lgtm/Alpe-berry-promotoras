import StatsCard from '../StatsCard';

export default function StatsCardExample() {
  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard 
          label="Total Evaluaciones" 
          value={1} 
          subtitle="Completadas"
          trend="up"
          trendValue="100%"
        />
        <StatsCard 
          label="Frescura Promedio" 
          value="3.0/5" 
          subtitle="Buena"
        />
        <StatsCard 
          label="Stock Promedio" 
          value={980} 
          subtitle="Alta prioridad"
        />
      </div>
    </div>
  );
}
