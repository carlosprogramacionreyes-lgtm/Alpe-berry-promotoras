import MetricCard from '@/components/MetricCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Users, Store, CheckCircle, Clock, AlertTriangle, TrendingUp, Plus, BarChart3, Settings } from 'lucide-react';

export default function Dashboard() {
  const recentActivity = [
    { id: 1, text: 'comer nor test', detail: 'Visita completada - Espinaca Baby', time: '14:54' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">Bienvenido, superadmin</h1>
          <p className="text-sm text-muted-foreground">admin</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Hoy</p>
          <p className="text-sm font-medium text-foreground">dom 19 de oct</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
          title="Tiendas Registradas" 
          value={2} 
          subtitle="Tiendas activas"
          icon={Store}
          iconColor="text-primary"
        />
        <MetricCard 
          title="Visitas (Mes)" 
          value={1} 
          subtitle="Mes actual"
          icon={MapPin}
          iconColor="text-chart-3"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard 
          title="Pendientes" 
          value={0} 
          subtitle="Requieren atención"
          icon={Clock}
          iconColor="text-muted-foreground"
        />
        <MetricCard 
          title="Evaluaciones (Mes)" 
          value={1} 
          subtitle="6 productos"
          icon={CheckCircle}
          iconColor="text-chart-2"
          gradient
        />
        <MetricCard 
          title="Incidencias Pendientes" 
          value={0} 
          subtitle="0 Alta prioridad"
          icon={AlertTriangle}
          iconColor="text-destructive"
        />
        <MetricCard 
          title="Calidad Promedio" 
          value="3.0/5" 
          subtitle="Buena"
          icon={TrendingUp}
          iconColor="text-chart-2"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Acciones Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <Button className="w-full justify-start gap-2 h-auto py-4" data-testid="button-new-visit">
              <Plus className="w-5 h-5" />
              <div className="text-left">
                <div className="font-semibold">Nueva Visita</div>
                <div className="text-xs opacity-90">Iniciar inspección en tienda</div>
              </div>
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2 h-auto py-4" data-testid="button-my-visits">
              <MapPin className="w-5 h-5" />
              <div className="text-left">
                <div className="font-semibold">Mis Visitas</div>
                <div className="text-xs text-muted-foreground">Ver historial y pendientes</div>
              </div>
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2 h-auto py-4" data-testid="button-reports">
              <BarChart3 className="w-5 h-5" />
              <div className="text-left">
                <div className="font-semibold">Reportes</div>
                <div className="text-xs text-muted-foreground">Consultar estadísticas</div>
              </div>
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2 h-auto py-4" data-testid="button-management">
              <Settings className="w-5 h-5" />
              <div className="text-left">
                <div className="font-semibold">Gestión</div>
                <div className="text-xs text-muted-foreground">Administrar sistema</div>
              </div>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Actividad Reciente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover-elevate">
                  <div className="w-2 h-2 rounded-full bg-chart-2 mt-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{activity.text}</p>
                    <p className="text-xs text-muted-foreground">{activity.detail}</p>
                  </div>
                  <Badge variant="secondary" className="text-xs flex-shrink-0">
                    {activity.time}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
