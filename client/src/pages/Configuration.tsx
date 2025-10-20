import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Users, Store, MapPin, Package, ListChecks, Shield, Bell, Link as LinkIcon, Edit, Trash } from 'lucide-react';

export default function Configuration() {
  const [users] = useState([
    { id: 1, name: 'superadmin', email: 'admin@admin.com', role: 'Administrador', date: '13/10/2025' },
    { id: 2, name: 'carlos', email: 'admin@test.com', role: 'Administrador', date: '13/10/2025' },
    { id: 3, name: 'lucio', email: 'lucio@gmail.com.mx', role: 'Promotor', date: '13/10/2025' }
  ]);

  const [chains] = useState([
    { id: 1, name: 'HEB', description: 'H-E-B Supermercados', date: '13/10/2025' },
    { id: 2, name: 'La Comer', description: '—', date: '13/10/2025' }
  ]);

  const [zones] = useState([
    { id: 1, chain: 'La Comer', name: 'Norte', description: '—', date: '13/10/2025' }
  ]);

  const [stores] = useState([
    { id: 1, chain: 'La Comer', zone: 'Norte', name: 'comer nor test', city: 'Monterrey', status: 'Activa', date: '13/10/2025' },
    { id: 2, chain: 'La Comer', zone: 'Norte', name: 'La comer Nor', city: 'Monterrey', status: 'Activa', date: '13/10/2025' }
  ]);

  const [products] = useState([
    { id: 1, name: 'Arándano', icon: 'Uva', color: 'Azul', status: 'Activo' },
    { id: 2, name: 'Espinaca Baby', icon: 'Hoja', color: 'Verde', status: 'Activo' },
    { id: 3, name: 'Frambuesa', icon: 'Manzana', color: 'Rosa', status: 'Activo' }
  ]);

  const evaluationFields = [
    { category: 'Disponibilidad', fields: [
      { name: 'Stock: Cantidad disponible', type: 'number', required: true, order: 1, active: true },
      { name: 'Ubicación', type: 'select', required: true, order: 2, active: true },
      { name: 'Estado del display', type: 'select', required: true, order: 3, active: true },
      { name: 'Foto del área', type: 'photo', required: true, order: 4, active: true }
    ]},
    { category: 'Evaluación de Calidad', fields: [
      { name: 'Frescura (1-5)', type: 'number', required: true, order: 1, active: true },
      { name: 'Apariencia', type: 'select', required: true, order: 2, active: true },
      { name: 'Estado del empaque', type: 'select', required: true, order: 3, active: true }
    ]},
    { category: 'Precios y Promociones', fields: [
      { name: 'Precio actual', type: 'number', required: true, order: 1, active: true },
      { name: 'Precio sugerido/competencia', type: 'number', required: false, order: 2, active: true },
      { name: 'Promociones activas', type: 'multiselect', required: false, order: 3, active: true }
    ]},
    { category: 'Incidencias', fields: [
      { name: 'Tipo de incidencia', type: 'multiselect', required: false, order: 1, active: true },
      { name: 'Nivel de severidad', type: 'select', required: false, order: 2, active: true },
      { name: 'Acción requerida', type: 'textarea', required: false, order: 3, active: true }
    ]}
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-1">Configuración</h1>
        <p className="text-sm text-muted-foreground">Administra usuarios, tiendas y configuraciones del sistema</p>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList className="grid w-full grid-cols-8 lg:w-auto">
          <TabsTrigger value="users" data-testid="tab-users"><Users className="w-4 h-4 mr-2" />Usuarios</TabsTrigger>
          <TabsTrigger value="chains" data-testid="tab-chains"><LinkIcon className="w-4 h-4 mr-2" />Cadenas</TabsTrigger>
          <TabsTrigger value="zones" data-testid="tab-zones"><MapPin className="w-4 h-4 mr-2" />Zonas</TabsTrigger>
          <TabsTrigger value="stores" data-testid="tab-stores"><Store className="w-4 h-4 mr-2" />Tiendas</TabsTrigger>
          <TabsTrigger value="assignments" data-testid="tab-assignments">Asignaciones</TabsTrigger>
          <TabsTrigger value="products" data-testid="tab-products"><Package className="w-4 h-4 mr-2" />Productos</TabsTrigger>
          <TabsTrigger value="fields" data-testid="tab-fields"><ListChecks className="w-4 h-4 mr-2" />Evaluaciones</TabsTrigger>
          <TabsTrigger value="permissions" data-testid="tab-permissions"><Shield className="w-4 h-4 mr-2" />Permisos</TabsTrigger>
          <TabsTrigger value="notifications" data-testid="tab-notifications"><Bell className="w-4 h-4 mr-2" />Notificaciones</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Crear Nuevo Usuario
              </CardTitle>
              <CardDescription>Agrega nuevos usuarios al sistema con sus roles correspondientes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nombre Completo</Label>
                  <Input placeholder="Juan Pérez" data-testid="input-user-name" />
                </div>
                <div className="space-y-2">
                  <Label>Correo Electrónico</Label>
                  <Input type="email" placeholder="usuario@ejemplo.com" data-testid="input-user-email" />
                </div>
                <div className="space-y-2">
                  <Label>Contraseña</Label>
                  <Input type="password" placeholder="••••••••" data-testid="input-user-password" />
                </div>
                <div className="space-y-2">
                  <Label>Rol</Label>
                  <Select defaultValue="promotor">
                    <SelectTrigger data-testid="select-user-role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="promotor">Promotor</SelectItem>
                      <SelectItem value="supervisor">Supervisor</SelectItem>
                      <SelectItem value="analista">Analista</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button className="mt-4" data-testid="button-create-user">Crear Usuario</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Usuarios Registrados</CardTitle>
              <CardDescription>Lista de todos los usuarios del sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left text-sm text-muted-foreground">
                      <th className="pb-3 font-medium">Nombre</th>
                      <th className="pb-3 font-medium">Email</th>
                      <th className="pb-3 font-medium">Rol</th>
                      <th className="pb-3 font-medium">Fecha de Creación</th>
                      <th className="pb-3 font-medium text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b hover-elevate" data-testid={`row-user-${user.id}`}>
                        <td className="py-3 text-sm font-medium">{user.name}</td>
                        <td className="py-3 text-sm text-muted-foreground">{user.email}</td>
                        <td className="py-3">
                          <Badge variant={user.role === 'Administrador' ? 'default' : 'secondary'}>
                            {user.role}
                          </Badge>
                        </td>
                        <td className="py-3 text-sm text-muted-foreground">{user.date}</td>
                        <td className="py-3 text-right">
                          <div className="flex gap-2 justify-end">
                            <Button size="icon" variant="ghost" data-testid={`button-edit-user-${user.id}`}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="icon" variant="ghost" data-testid={`button-delete-user-${user.id}`}>
                              <Trash className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chains" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <LinkIcon className="w-5 h-5 text-primary" />
                Crear Nueva Cadena
              </CardTitle>
              <CardDescription>Registra una nueva cadena de autoservicio</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nombre de la Cadena *</Label>
                  <Input placeholder="Ej: HEB, Soriana, Walmart" data-testid="input-chain-name" />
                </div>
                <div className="space-y-2">
                  <Label>Descripción</Label>
                  <Input placeholder="Descripción opcional" data-testid="input-chain-description" />
                </div>
              </div>
              <Button className="mt-4" data-testid="button-create-chain">Crear Cadena</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Cadenas Registradas</CardTitle>
              <CardDescription>Lista de todas las cadenas de autoservicio</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left text-sm text-muted-foreground">
                      <th className="pb-3 font-medium">Nombre</th>
                      <th className="pb-3 font-medium">Descripción</th>
                      <th className="pb-3 font-medium">Fecha de Creación</th>
                      <th className="pb-3 font-medium text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chains.map((chain) => (
                      <tr key={chain.id} className="border-b hover-elevate" data-testid={`row-chain-${chain.id}`}>
                        <td className="py-3 text-sm font-medium">
                          <Badge className="bg-primary text-white">{chain.name}</Badge>
                        </td>
                        <td className="py-3 text-sm text-muted-foreground">{chain.description}</td>
                        <td className="py-3 text-sm text-muted-foreground">{chain.date}</td>
                        <td className="py-3 text-right">
                          <div className="flex gap-2 justify-end">
                            <Button size="icon" variant="ghost" data-testid={`button-delete-chain-${chain.id}`}>
                              <Trash className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="zones" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Crear Nueva Zona
              </CardTitle>
              <CardDescription>Registra una nueva zona dentro de una cadena</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Cadena *</Label>
                  <Select>
                    <SelectTrigger data-testid="select-zone-chain">
                      <SelectValue placeholder="Selecciona una cadena" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="heb">HEB</SelectItem>
                      <SelectItem value="lacomer">La Comer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Nombre de la Zona *</Label>
                  <Input placeholder="Ej: Zona Norte, Zona Centro" data-testid="input-zone-name" />
                </div>
                <div className="space-y-2">
                  <Label>Descripción</Label>
                  <Input placeholder="Descripción opcional" data-testid="input-zone-description" />
                </div>
              </div>
              <Button className="mt-4" data-testid="button-create-zone">Crear Zona</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Zonas Registradas</CardTitle>
              <CardDescription>Lista de todas las zonas por cadena</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left text-sm text-muted-foreground">
                      <th className="pb-3 font-medium">Cadena</th>
                      <th className="pb-3 font-medium">Nombre</th>
                      <th className="pb-3 font-medium">Descripción</th>
                      <th className="pb-3 font-medium">Fecha de Creación</th>
                      <th className="pb-3 font-medium text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {zones.map((zone) => (
                      <tr key={zone.id} className="border-b hover-elevate" data-testid={`row-zone-${zone.id}`}>
                        <td className="py-3">
                          <Badge className="bg-primary text-white">{zone.chain}</Badge>
                        </td>
                        <td className="py-3 text-sm font-medium">{zone.name}</td>
                        <td className="py-3 text-sm text-muted-foreground">{zone.description}</td>
                        <td className="py-3 text-sm text-muted-foreground">{zone.date}</td>
                        <td className="py-3 text-right">
                          <div className="flex gap-2 justify-end">
                            <Button size="icon" variant="ghost" data-testid={`button-delete-zone-${zone.id}`}>
                              <Trash className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stores" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Store className="w-5 h-5 text-primary" />
                Crear Nueva Tienda
              </CardTitle>
              <CardDescription>Registra una nueva tienda dentro de una zona</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cadena *</Label>
                  <Select>
                    <SelectTrigger data-testid="select-store-chain">
                      <SelectValue placeholder="Selecciona una cadena" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="heb">HEB</SelectItem>
                      <SelectItem value="lacomer">La Comer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Zona *</Label>
                  <Select>
                    <SelectTrigger data-testid="select-store-zone">
                      <SelectValue placeholder="Selecciona una zona" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="norte">Norte</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Nombre de la Tienda *</Label>
                  <Input placeholder="Ej: HEB Cumbres" data-testid="input-store-name" />
                </div>
                <div className="space-y-2">
                  <Label>Dirección</Label>
                  <Input placeholder="Dirección completa" data-testid="input-store-address" />
                </div>
                <div className="space-y-2">
                  <Label>Ciudad</Label>
                  <Input placeholder="Monterrey, San Pedro, etc." data-testid="input-store-city" />
                </div>
                <div className="space-y-2">
                  <Label>Latitud</Label>
                  <Input placeholder="25.6866" data-testid="input-store-latitude" />
                </div>
                <div className="space-y-2">
                  <Label>Longitud</Label>
                  <Input placeholder="-100.3161" data-testid="input-store-longitude" />
                </div>
                <div className="space-y-2">
                  <Label>Radio Geovalla (m)</Label>
                  <Input placeholder="100" defaultValue="100" data-testid="input-store-geofence" />
                </div>
                <div className="space-y-2 flex items-center gap-2 pt-6">
                  <Switch id="store-active" defaultChecked data-testid="switch-store-active" />
                  <Label htmlFor="store-active">Activa</Label>
                </div>
              </div>
              <Button className="mt-4" data-testid="button-create-store">Crear Tienda</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tiendas Registradas</CardTitle>
              <CardDescription>Lista de todas las tiendas por zona</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left text-sm text-muted-foreground">
                      <th className="pb-3 font-medium">Cadena</th>
                      <th className="pb-3 font-medium">Zona</th>
                      <th className="pb-3 font-medium">Nombre</th>
                      <th className="pb-3 font-medium">Ciudad</th>
                      <th className="pb-3 font-medium">Estado</th>
                      <th className="pb-3 font-medium">Fecha</th>
                      <th className="pb-3 font-medium text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stores.map((store) => (
                      <tr key={store.id} className="border-b hover-elevate" data-testid={`row-store-${store.id}`}>
                        <td className="py-3">
                          <Badge className="bg-primary text-white">{store.chain}</Badge>
                        </td>
                        <td className="py-3 text-sm">{store.zone}</td>
                        <td className="py-3 text-sm font-medium">{store.name}</td>
                        <td className="py-3 text-sm text-muted-foreground">{store.city}</td>
                        <td className="py-3">
                          <Badge variant="secondary" className="bg-chart-2 text-white">{store.status}</Badge>
                        </td>
                        <td className="py-3 text-sm text-muted-foreground">{store.date}</td>
                        <td className="py-3 text-right">
                          <div className="flex gap-2 justify-end">
                            <Button size="icon" variant="ghost" data-testid={`button-delete-store-${store.id}`}>
                              <Trash className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Asignaciones de Tiendas</CardTitle>
              <CardDescription>Gestiona qué usuarios están asignados a qué tiendas</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Funcionalidad de asignación de tiendas a usuarios</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                Gestión de Productos
              </CardTitle>
              <CardDescription>Administra los productos que se inspeccionan en las evaluaciones</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="mb-4" data-testid="button-new-product">Nuevo Producto</Button>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left text-sm text-muted-foreground">
                      <th className="pb-3 font-medium">Nombre</th>
                      <th className="pb-3 font-medium">Ícono</th>
                      <th className="pb-3 font-medium">Color</th>
                      <th className="pb-3 font-medium">Estado</th>
                      <th className="pb-3 font-medium text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id} className="border-b hover-elevate" data-testid={`row-product-${product.id}`}>
                        <td className="py-3 text-sm font-medium">{product.name}</td>
                        <td className="py-3 text-sm">{product.icon}</td>
                        <td className="py-3 text-sm">
                          <Badge variant="secondary">{product.color}</Badge>
                        </td>
                        <td className="py-3">
                          <Badge className="bg-chart-2 text-white">{product.status}</Badge>
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex gap-2 justify-end">
                            <Button size="icon" variant="ghost" data-testid={`button-edit-product-${product.id}`}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="icon" variant="ghost" data-testid={`button-delete-product-${product.id}`}>
                              <Trash className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fields" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ListChecks className="w-5 h-5 text-primary" />
                Configuración de Campos de Evaluación
              </CardTitle>
              <CardDescription>Gestiona los campos personalizados de cada paso del flujo de evaluación</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="mb-4" data-testid="button-add-field">Agregar Campo</Button>
              <Tabs defaultValue="disponibilidad" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="disponibilidad">Disponibilidad</TabsTrigger>
                  <TabsTrigger value="calidad">Evaluación de Calidad</TabsTrigger>
                  <TabsTrigger value="precios">Precios y Promociones</TabsTrigger>
                  <TabsTrigger value="incidencias">Incidencias</TabsTrigger>
                </TabsList>
                
                {evaluationFields.map((category, idx) => (
                  <TabsContent key={idx} value={category.category.toLowerCase().replace(/\s+/g, '')}>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b text-left text-sm text-muted-foreground">
                            <th className="pb-3 font-medium">Campo</th>
                            <th className="pb-3 font-medium">Tipo</th>
                            <th className="pb-3 font-medium">Requerido</th>
                            <th className="pb-3 font-medium">Orden</th>
                            <th className="pb-3 font-medium">Estado</th>
                            <th className="pb-3 font-medium text-right">Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {category.fields.map((field, fieldIdx) => (
                            <tr key={fieldIdx} className="border-b hover-elevate">
                              <td className="py-3 text-sm font-medium">{field.name}</td>
                              <td className="py-3 text-sm">{field.type}</td>
                              <td className="py-3">
                                <Badge variant={field.required ? 'destructive' : 'secondary'}>
                                  {field.required ? 'Sí' : 'No'}
                                </Badge>
                              </td>
                              <td className="py-3 text-sm">{field.order}</td>
                              <td className="py-3">
                                <Badge variant={field.active ? 'default' : 'secondary'} className={field.active ? 'bg-chart-2 text-white' : ''}>
                                  {field.active ? 'Activo' : 'Inactivo'}
                                </Badge>
                              </td>
                              <td className="py-3 text-right">
                                <div className="flex gap-2 justify-end">
                                  <Button size="icon" variant="ghost">
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button size="icon" variant="ghost">
                                    <Trash className="w-4 h-4 text-destructive" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Gestión de Permisos
              </CardTitle>
              <CardDescription>Configura permisos y acceso por rol</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-12">
                <div className="text-center space-y-3">
                  <Shield className="w-12 h-12 text-muted-foreground mx-auto" />
                  <p className="text-sm text-muted-foreground">Módulo en desarrollo</p>
                  <p className="text-xs text-muted-foreground">Permisos granulares: Admin, Supervisor, Analista, Promotor</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                Configuración de Notificaciones
              </CardTitle>
              <CardDescription>Administra alertas y notificaciones del sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-12">
                <div className="text-center space-y-3">
                  <Bell className="w-12 h-12 text-muted-foreground mx-auto" />
                  <p className="text-sm text-muted-foreground">Módulo en desarrollo</p>
                  <p className="text-xs text-muted-foreground">Configuración de alertas por email, push, SMS</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
