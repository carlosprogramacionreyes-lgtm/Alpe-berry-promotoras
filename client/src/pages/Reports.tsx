import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import StatsCard from '@/components/StatsCard';
import { BarChart3, Download, CheckCircle, Star, AlertTriangle, DollarSign, Package, PieChart, TrendingUp, Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RePieChart, Pie, Cell, LineChart, Line } from 'recharts';

export default function Reports() {
  const [dateRange] = useState('01/10/25 - 31/10/25');

  const productData = [
    { name: 'Espinaca Baby', value: 1, color: 'hsl(142, 71%, 45%)' }
  ];

  const displayConditionData = [
    { name: 'Excelente', value: 100, color: 'hsl(142, 71%, 45%)' }
  ];

  const incidentData = [
    { type: 'Producto vencido', count: 1, color: 'hsl(250, 84%, 54%)' },
    { type: 'Precio incorrecto', count: 1, color: 'hsl(142, 71%, 45%)' }
  ];

  const qualityTrendData = [
    { date: '10/13', quality: 3.0 }
  ];

  const storeData = [
    { store: 'comer nor test', evaluations: 1, color: 'hsl(217, 91%, 60%)' }
  ];

  const userData = [
    { name: 'carlos', completed: 1, completionRate: 100, avgQuality: '3.0/5', incidents: 2 }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">Reportes y Análisis</h1>
          <p className="text-sm text-muted-foreground">Análisis detallado de evaluaciones y tendencias</p>
        </div>
        <Button className="gap-2" data-testid="button-export">
          <Download className="w-4 h-4" />
          Exportar CSV
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Rango de Fechas</Label>
              <Input value={dateRange} readOnly data-testid="input-date-range" />
            </div>
            <div className="space-y-2">
              <Label>Tienda</Label>
              <Select defaultValue="all">
                <SelectTrigger data-testid="select-store">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las tiendas</SelectItem>
                  <SelectItem value="store1">comer nor test</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Producto</Label>
              <Select defaultValue="all">
                <SelectTrigger data-testid="select-product">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los productos</SelectItem>
                  <SelectItem value="espinaca">Espinaca Baby</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-4">
            <Button data-testid="button-apply-filters">Aplicar Filtros</Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6 lg:w-auto">
          <TabsTrigger value="general" data-testid="tab-general">General</TabsTrigger>
          <TabsTrigger value="quality" data-testid="tab-quality">Calidad</TabsTrigger>
          <TabsTrigger value="products" data-testid="tab-products">Productos</TabsTrigger>
          <TabsTrigger value="stores" data-testid="tab-stores">Tiendas</TabsTrigger>
          <TabsTrigger value="incidents" data-testid="tab-incidents">Incidencias</TabsTrigger>
          <TabsTrigger value="users" data-testid="tab-users">Usuarios</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <StatsCard label="Total Evaluaciones" value={1} />
            <StatsCard label="Completadas" value={1} subtitle="100.0%" />
            <StatsCard label="Frescura Promedio" value="3.0/5" />
            <StatsCard label="Incidencias Total" value={2} />
            <StatsCard label="Precio Promedio" value="$90.00" subtitle="Var: $20.00" />
            <StatsCard label="Stock Promedio" value={980} />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Evaluaciones por Producto</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={productData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <Tooltip />
                    <Bar dataKey="value" fill="hsl(250, 84%, 54%)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Estado de Displays</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <RePieChart>
                    <Pie
                      data={displayConditionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {displayConditionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RePieChart>
                </ResponsiveContainer>
                <div className="mt-4 flex justify-center">
                  <Badge variant="secondary" className="text-xs">Excelente: 100%</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="quality" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tendencia de Calidad (Frescura)</CardTitle>
              <p className="text-xs text-muted-foreground">Promedio diario de calificación de frescura</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={qualityTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis domain={[0, 5]} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="quality" stroke="hsl(142, 71%, 45%)" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                Espinaca Baby
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <Badge className="bg-primary text-white">1 evaluaciones</Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Frescura Promedio</p>
                  <p className="text-xl font-bold">3.0/5</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Precio Promedio</p>
                  <p className="text-xl font-bold">$90.00</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Stock Total</p>
                  <p className="text-xl font-bold">980</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Incidencias</p>
                  <p className="text-xl font-bold">2</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stores" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Evaluaciones por Tienda</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={storeData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis dataKey="store" type="category" tick={{ fill: 'hsl(var(--muted-foreground))' }} width={120} />
                  <Tooltip />
                  <Bar dataKey="evaluations" fill="hsl(217, 91%, 60%)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="incidents" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Incidencias por Tipo</CardTitle>
                <p className="text-xs text-muted-foreground">1 evaluaciones con incidencias (100.0%)</p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <RePieChart>
                    <Pie
                      data={incidentData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="count"
                      label
                    >
                      {incidentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RePieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Detalle de Incidencias</CardTitle>
                <p className="text-xs text-muted-foreground">Top incidencias más frecuentes</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {incidentData.map((incident, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-destructive" />
                        <span className="text-sm font-medium">{incident.type}</span>
                      </div>
                      <Badge variant="destructive">{incident.count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <StatsCard label="Incidencias Críticas" value={0} subtitle="Requieren atención inmediata" />
            <StatsCard label="Tasa de Incidencias" value="100.0%" subtitle="Del total de evaluaciones" />
            <StatsCard label="Promedio por Eval" value="2.0" subtitle="Incidencias por evaluación" />
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Rendimiento por Usuario</CardTitle>
              <p className="text-xs text-muted-foreground">Métricas de desempeño de cada usuario</p>
            </CardHeader>
            <CardContent>
              {userData.map((user, index) => (
                <div key={index} className="p-4 border rounded-lg mb-3">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{user.name}</p>
                      <Badge className="bg-primary text-white text-xs mt-1">{user.completed} evaluaciones</Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Completadas</p>
                      <p className="text-lg font-bold">{user.completed}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Tasa Completado</p>
                      <p className="text-lg font-bold">{user.completionRate}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Frescura Prom.</p>
                      <p className="text-lg font-bold">{user.avgQuality}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Comparativa de Usuarios</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={[{ name: 'carlos', Total: 1, Completadas: 1, Incidencias: 2 }]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip />
                  <Bar dataKey="Total" fill="hsl(250, 84%, 54%)" />
                  <Bar dataKey="Completadas" fill="hsl(142, 71%, 45%)" />
                  <Bar dataKey="Incidencias" fill="hsl(0, 84%, 60%)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
