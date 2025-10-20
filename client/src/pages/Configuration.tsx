import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Users, Store, MapPin, Package, ListChecks, Shield, Bell, Link as LinkIcon, Edit, Trash, Plus, X, Database, Download, Table2, Check, XCircle, Eye, EyeOff } from 'lucide-react';
import type { User, Chain, Zone, Store as StoreType, Product, EvaluationField } from '@shared/schema';

interface AuthUser {
  user: {
    id: string;
    username: string;
    email: string;
    name: string;
    role: string;
  };
}

// User form schema
const userFormSchema = z.object({
  username: z.string().min(3, "El usuario debe tener al menos 3 caracteres"),
  email: z.string().email("Email inválido").optional().or(z.literal('')),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  role: z.enum(['admin', 'supervisor', 'analista', 'promotor']),
  active: z.boolean().default(true),
});

// Chain form schema
const chainFormSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  description: z.string().optional(),
});

// Zone form schema
const zoneFormSchema = z.object({
  chainId: z.string().min(1, "Selecciona una cadena"),
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  description: z.string().optional(),
});

// Store form schema
const storeFormSchema = z.object({
  chainId: z.string().min(1, "Selecciona una cadena"),
  zoneId: z.string().min(1, "Selecciona una zona"),
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  address: z.string().optional(),
  city: z.string().optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  geofenceRadius: z.number().optional(),
  active: z.boolean().default(true),
});

// Product form schema
const productFormSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  icon: z.string().min(1, "Selecciona un ícono"),
  color: z.string().min(1, "Selecciona un color"),
  active: z.boolean().default(true),
});

// Assignment form schema
const assignmentFormSchema = z.object({
  userId: z.string().min(1, "Selecciona un promotor"),
  storeIds: z.array(z.string()).min(1, "Selecciona al menos una tienda"),
});

// Evaluation field form schema
const evaluationFieldFormSchema = z.object({
  step: z.enum(['availability', 'quality', 'prices', 'incidents', 'custom']),
  technicalName: z.string().min(2, "El nombre técnico debe tener al menos 2 caracteres")
    .regex(/^[a-z][a-zA-Z0-9]*$/, "Debe empezar con minúscula y solo contener letras/números sin espacios"),
  label: z.string().min(2, "La etiqueta debe tener al menos 2 caracteres"),
  fieldType: z.enum(['text', 'number', 'select', 'multiselect', 'checkbox', 'textarea', 'photo']),
  options: z.string().optional(),
  required: z.boolean().default(false),
  order: z.number().int().min(0, "El orden debe ser un número positivo"),
  active: z.boolean().default(true),
});

export default function Configuration() {
  const { toast } = useToast();

  // Fetch current user
  const { data: authData } = useQuery<AuthUser>({ 
    queryKey: ['/api/auth/me'],
    retry: false,
  });
  const currentUser = authData?.user;

  // Fetch data
  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({ 
    queryKey: ['/api/users'],
  });

  const { data: chains = [], isLoading: chainsLoading } = useQuery<Chain[]>({ 
    queryKey: ['/api/chains'],
  });

  const { data: zones = [], isLoading: zonesLoading } = useQuery<Zone[]>({ 
    queryKey: ['/api/zones'],
  });

  const { data: stores = [], isLoading: storesLoading } = useQuery<StoreType[]>({ 
    queryKey: ['/api/stores'],
  });

  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({ 
    queryKey: ['/api/products'],
  });

  // Evaluation fields query
  const { data: evaluationFields = [], isLoading: fieldsLoading } = useQuery<EvaluationField[]>({ 
    queryKey: ['/api/evaluation-fields'],
  });

  // Assignments query
  const assignmentsQuery = useQuery<any[]>({ 
    queryKey: ['/api/store-assignments'],
  });

  // Backup logs query
  const backupLogsQuery = useQuery<any[]>({ 
    queryKey: ['/api/backup-logs'],
    enabled: currentUser?.role === 'admin',
  });

  // Database tables query
  const dbTablesQuery = useQuery<any[]>({ 
    queryKey: ['/api/database/tables'],
    enabled: currentUser?.role === 'admin',
  });

  // Promoters query (filtered users with promoter role)
  const promotersQuery = useQuery<User[]>({ 
    queryKey: ['/api/users'],
  });

  // Stores query for assignments
  const storesQuery = useQuery<StoreType[]>({ 
    queryKey: ['/api/stores'],
  });

  // User form
  const userForm = useForm<z.infer<typeof userFormSchema>>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      name: '',
      role: 'promotor',
      active: true,
    },
  });

  // Chain form
  const chainForm = useForm<z.infer<typeof chainFormSchema>>({
    resolver: zodResolver(chainFormSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  // Zone form
  const zoneForm = useForm<z.infer<typeof zoneFormSchema>>({
    resolver: zodResolver(zoneFormSchema),
    defaultValues: {
      chainId: '',
      name: '',
      description: '',
    },
  });

  // Store form
  const storeForm = useForm<z.infer<typeof storeFormSchema>>({
    resolver: zodResolver(storeFormSchema),
    defaultValues: {
      chainId: '',
      zoneId: '',
      name: '',
      address: '',
      city: '',
      latitude: '',
      longitude: '',
      geofenceRadius: 100,
      active: true,
    },
  });

  // Product form
  const productForm = useForm<z.infer<typeof productFormSchema>>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: '',
      icon: '',
      color: '',
      active: true,
    },
  });

  // Assignment form
  const assignmentForm = useForm<z.infer<typeof assignmentFormSchema>>({
    resolver: zodResolver(assignmentFormSchema),
    defaultValues: {
      userId: '',
      storeIds: [],
    },
  });

  // Dialog state
  const [isAssignmentDialogOpen, setIsAssignmentDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedStoreIds, setSelectedStoreIds] = useState<string[]>([]);
  
  // Database backup state
  const [isBackupPasswordDialogOpen, setIsBackupPasswordDialogOpen] = useState(false);
  const [backupPassword, setBackupPassword] = useState("");
  const [backupPasswordError, setBackupPasswordError] = useState("");
  const [tableSearchFilter, setTableSearchFilter] = useState("");

  // Edit state
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingChain, setEditingChain] = useState<Chain | null>(null);
  const [editingZone, setEditingZone] = useState<Zone | null>(null);
  const [editingStore, setEditingStore] = useState<StoreType | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingField, setEditingField] = useState<EvaluationField | null>(null);

  // Evaluation field form
  const evaluationFieldForm = useForm<z.infer<typeof evaluationFieldFormSchema>>({
    resolver: zodResolver(evaluationFieldFormSchema),
    defaultValues: {
      step: 'availability',
      technicalName: '',
      label: '',
      fieldType: 'text',
      options: '',
      required: false,
      order: 0,
      active: true,
    },
  });

  // Initialize forms when editing
  useEffect(() => {
    if (editingUser) {
      userForm.reset({
        name: editingUser.name,
        username: editingUser.username,
        email: editingUser.email || '',
        password: '', // Empty for edit - only update if filled
        role: editingUser.role as 'admin' | 'supervisor' | 'analista' | 'promotor',
        active: editingUser.active,
      });
    }
  }, [editingUser]);

  useEffect(() => {
    if (editingChain) {
      chainForm.reset({
        name: editingChain.name,
        description: editingChain.description || '',
      });
    }
  }, [editingChain]);

  useEffect(() => {
    if (editingZone) {
      zoneForm.reset({
        chainId: editingZone.chainId,
        name: editingZone.name,
        description: editingZone.description || '',
      });
    }
  }, [editingZone]);

  useEffect(() => {
    if (editingStore) {
      storeForm.reset({
        chainId: editingStore.chainId,
        zoneId: editingStore.zoneId,
        name: editingStore.name,
        address: editingStore.address || '',
        city: editingStore.city || '',
        latitude: editingStore.latitude || '',
        longitude: editingStore.longitude || '',
        geofenceRadius: editingStore.geofenceRadius || 100,
        active: editingStore.active,
      });
    }
  }, [editingStore]);

  useEffect(() => {
    if (editingProduct) {
      productForm.reset({
        name: editingProduct.name,
        icon: editingProduct.icon,
        color: editingProduct.color,
        active: editingProduct.active,
      });
    }
  }, [editingProduct]);

  useEffect(() => {
    if (editingField) {
      evaluationFieldForm.reset({
        step: editingField.step as 'availability' | 'quality' | 'prices' | 'incidents' | 'custom',
        technicalName: editingField.technicalName,
        label: editingField.label,
        fieldType: editingField.fieldType as 'text' | 'number' | 'select' | 'multiselect' | 'checkbox' | 'textarea' | 'photo',
        options: editingField.options || '',
        required: editingField.required,
        order: editingField.order,
        active: editingField.active,
      });
    }
  }, [editingField]);

  // Mutations
  const createUserMutation = useMutation({
    mutationFn: async (data: z.infer<typeof userFormSchema>) => {
      const payload = {
        ...data,
        email: data.email && data.email.trim() !== '' ? data.email : undefined,
      };
      return await apiRequest('POST', '/api/users', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      userForm.reset();
      toast({ title: "Usuario creado exitosamente" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Error al crear usuario", variant: "destructive" });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest('DELETE', `/api/users/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({ title: "Usuario eliminado" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Error al eliminar usuario", variant: "destructive" });
    },
  });

  const createChainMutation = useMutation({
    mutationFn: async (data: z.infer<typeof chainFormSchema>) => {
      return await apiRequest('POST', '/api/chains', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chains'] });
      chainForm.reset();
      toast({ title: "Cadena creada exitosamente" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Error al crear cadena", variant: "destructive" });
    },
  });

  const deleteChainMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest('DELETE', `/api/chains/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chains'] });
      toast({ title: "Cadena eliminada" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Error al eliminar cadena", variant: "destructive" });
    },
  });

  const createZoneMutation = useMutation({
    mutationFn: async (data: z.infer<typeof zoneFormSchema>) => {
      return await apiRequest('POST', '/api/zones', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/zones'] });
      zoneForm.reset();
      toast({ title: "Zona creada exitosamente" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Error al crear zona", variant: "destructive" });
    },
  });

  const deleteZoneMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest('DELETE', `/api/zones/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/zones'] });
      toast({ title: "Zona eliminada" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Error al eliminar zona", variant: "destructive" });
    },
  });

  const createStoreMutation = useMutation({
    mutationFn: async (data: z.infer<typeof storeFormSchema>) => {
      const payload = {
        ...data,
        latitude: data.latitude && data.latitude.trim() !== '' ? data.latitude : undefined,
        longitude: data.longitude && data.longitude.trim() !== '' ? data.longitude : undefined,
        address: data.address && data.address.trim() !== '' ? data.address : undefined,
        city: data.city && data.city.trim() !== '' ? data.city : undefined,
      };
      return await apiRequest('POST', '/api/stores', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/stores'] });
      storeForm.reset();
      toast({ title: "Tienda creada exitosamente" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Error al crear tienda", variant: "destructive" });
    },
  });

  const deleteStoreMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest('DELETE', `/api/stores/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/stores'] });
      toast({ title: "Tienda eliminada" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Error al eliminar tienda", variant: "destructive" });
    },
  });

  const createProductMutation = useMutation({
    mutationFn: async (data: z.infer<typeof productFormSchema>) => {
      return await apiRequest('POST', '/api/products', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      productForm.reset();
      toast({ title: "Producto creado exitosamente" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Error al crear producto", variant: "destructive" });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest('DELETE', `/api/products/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({ title: "Producto eliminado" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Error al eliminar producto", variant: "destructive" });
    },
  });

  const createEvaluationFieldMutation = useMutation({
    mutationFn: async (data: z.infer<typeof evaluationFieldFormSchema>) => {
      return await apiRequest('POST', '/api/evaluation-fields', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/evaluation-fields'] });
      evaluationFieldForm.reset();
      setEditingField(null);
      toast({ title: "Campo de evaluación creado exitosamente" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Error al crear campo", variant: "destructive" });
    },
  });

  const updateEvaluationFieldMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<z.infer<typeof evaluationFieldFormSchema>> }) => {
      return await apiRequest('PUT', `/api/evaluation-fields/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/evaluation-fields'] });
      setEditingField(null);
      toast({ title: "Campo de evaluación actualizado exitosamente" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Error al actualizar campo", variant: "destructive" });
    },
  });

  const deleteEvaluationFieldMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest('DELETE', `/api/evaluation-fields/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/evaluation-fields'] });
      toast({ title: "Campo eliminado" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Error al eliminar campo", variant: "destructive" });
    },
  });

  // Update mutations
  const updateUserMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<z.infer<typeof userFormSchema>> }) => {
      const payload: any = {
        ...data,
        email: data.email && data.email.trim() !== '' ? data.email : undefined,
      };
      // Don't send password if empty (partial update)
      if (!data.password || data.password.trim() === '') {
        delete payload.password;
      }
      return await apiRequest('PUT', `/api/users/${id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      setEditingUser(null);
      toast({ title: "Usuario actualizado exitosamente" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Error al actualizar usuario", variant: "destructive" });
    },
  });

  const updateChainMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<z.infer<typeof chainFormSchema>> }) => {
      return await apiRequest('PUT', `/api/chains/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chains'] });
      setEditingChain(null);
      toast({ title: "Cadena actualizada exitosamente" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Error al actualizar cadena", variant: "destructive" });
    },
  });

  const updateZoneMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<z.infer<typeof zoneFormSchema>> }) => {
      return await apiRequest('PUT', `/api/zones/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/zones'] });
      setEditingZone(null);
      toast({ title: "Zona actualizada exitosamente" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Error al actualizar zona", variant: "destructive" });
    },
  });

  const updateStoreMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<z.infer<typeof storeFormSchema>> }) => {
      const payload = {
        ...data,
        latitude: data.latitude && data.latitude.trim() !== '' ? data.latitude : undefined,
        longitude: data.longitude && data.longitude.trim() !== '' ? data.longitude : undefined,
        address: data.address && data.address.trim() !== '' ? data.address : undefined,
        city: data.city && data.city.trim() !== '' ? data.city : undefined,
      };
      return await apiRequest('PUT', `/api/stores/${id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/stores'] });
      setEditingStore(null);
      toast({ title: "Tienda actualizada exitosamente" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Error al actualizar tienda", variant: "destructive" });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<z.infer<typeof productFormSchema>> }) => {
      return await apiRequest('PUT', `/api/products/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setEditingProduct(null);
      toast({ title: "Producto actualizado exitosamente" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Error al actualizar producto", variant: "destructive" });
    },
  });

  // Assignment mutations
  const createAssignmentMutation = useMutation({
    mutationFn: async (data: z.infer<typeof assignmentFormSchema>) => {
      return await apiRequest('POST', '/api/store-assignments', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/store-assignments'] });
      assignmentForm.reset();
      setIsAssignmentDialogOpen(false);
      toast({ title: "Asignación creada exitosamente" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Error al crear asignación", variant: "destructive" });
    },
  });

  const deleteAssignmentMutation = useMutation({
    mutationFn: async ({ userId, storeId }: { userId: string; storeId: string }) => {
      return await apiRequest('DELETE', `/api/store-assignments/${userId}/${storeId}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/store-assignments'] });
      toast({ title: "Asignación eliminada" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Error al eliminar asignación", variant: "destructive" });
    },
  });

  // Assignment handlers
  const onAssignmentSubmit = async (data: z.infer<typeof assignmentFormSchema>) => {
    const { userId, storeIds } = data;
    
    const existingAssignments = assignmentsQuery.data?.filter(
      (a: any) => a.assignment.userId === userId
    ) || [];
    const existingStoreIds = existingAssignments.map((a: any) => a.assignment.storeId);
    
    const storesToAdd = storeIds.filter(id => !existingStoreIds.includes(id));
    const storesToRemove = existingStoreIds.filter(id => !storeIds.includes(id));
    
    try {
      for (const storeId of storesToAdd) {
        await apiRequest('POST', '/api/store-assignments', { userId, storeId });
      }
      
      for (const storeId of storesToRemove) {
        await apiRequest('DELETE', `/api/store-assignments/${userId}/${storeId}`);
      }
      
      queryClient.invalidateQueries({ queryKey: ['/api/store-assignments'] });
      assignmentForm.reset();
      setSelectedUserId("");
      setSelectedStoreIds([]);
      setIsAssignmentDialogOpen(false);
      toast({ title: "Asignaciones actualizadas exitosamente" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Error al actualizar asignaciones", variant: "destructive" });
    }
  };

  const handleRemoveAssignment = (userId: string, storeId: string) => {
    deleteAssignmentMutation.mutate({ userId, storeId });
  };

  const handleUserSelection = (userId: string) => {
    setSelectedUserId(userId);
    assignmentForm.setValue("userId", userId);
    
    const userAssignments = assignmentsQuery.data?.filter(
      (a: any) => a.assignment.userId === userId
    ) || [];
    const existingStoreIds = userAssignments.map((a: any) => a.assignment.storeId);
    setSelectedStoreIds(existingStoreIds);
    assignmentForm.setValue("storeIds", existingStoreIds);
  };

  const handleStoreToggle = (storeId: string) => {
    const newSelection = selectedStoreIds.includes(storeId)
      ? selectedStoreIds.filter(id => id !== storeId)
      : [...selectedStoreIds, storeId];
    setSelectedStoreIds(newSelection);
    assignmentForm.setValue("storeIds", newSelection);
  };

  const handleSelectAllStores = () => {
    const allStoreIds = storesQuery.data?.map(s => s.id) || [];
    setSelectedStoreIds(allStoreIds);
    assignmentForm.setValue("storeIds", allStoreIds);
  };

  const handleClearAllStores = () => {
    setSelectedStoreIds([]);
    assignmentForm.setValue("storeIds", []);
  };

  const handleAssignmentDialogClose = (open: boolean) => {
    setIsAssignmentDialogOpen(open);
    if (!open) {
      assignmentForm.reset();
      setSelectedUserId("");
      setSelectedStoreIds([]);
    }
  };

  // Backup handlers
  const handleInitiateBackup = () => {
    setBackupPassword("");
    setBackupPasswordError("");
    setIsBackupPasswordDialogOpen(true);
  };

  const handleBackupPasswordSubmit = async () => {
    const correctPassword = "Cari2230*";
    
    if (backupPassword !== correctPassword) {
      setBackupPasswordError("Contraseña incorrecta");
      return;
    }

    try {
      const response = await fetch('/api/database/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Error al generar el respaldo');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup_${new Date().toISOString().replace(/[:.]/g, '-')}.sql`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      queryClient.invalidateQueries({ queryKey: ['/api/backup-logs'] });
      setIsBackupPasswordDialogOpen(false);
      toast({ title: "Respaldo generado exitosamente" });
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.message || "Error al generar respaldo", 
        variant: "destructive" 
      });
    }
  };

  // Get chain name by ID
  const getChainName = (chainId: string) => {
    const chain = chains.find(c => c.id === chainId);
    return chain?.name || chainId;
  };

  // Get zone name by ID
  const getZoneName = (zoneId: string) => {
    const zone = zones.find(z => z.id === zoneId);
    return zone?.name || zoneId;
  };

  // Filter zones by selected chain
  const selectedChainId = zoneForm.watch('chainId');
  const filteredZones = selectedChainId ? zones.filter(z => z.chainId === selectedChainId) : [];

  // Filter zones for store form
  const storeChainId = storeForm.watch('chainId');
  const storeFilteredZones = storeChainId ? zones.filter(z => z.chainId === storeChainId) : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-1">Configuración</h1>
        <p className="text-sm text-muted-foreground">Administra usuarios, tiendas y configuraciones del sistema</p>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList className="w-full lg:w-auto flex flex-wrap">
          <TabsTrigger value="users" data-testid="tab-users"><Users className="w-4 h-4 mr-2" />Usuarios</TabsTrigger>
          <TabsTrigger value="chains" data-testid="tab-chains"><LinkIcon className="w-4 h-4 mr-2" />Cadenas</TabsTrigger>
          <TabsTrigger value="zones" data-testid="tab-zones"><MapPin className="w-4 h-4 mr-2" />Zonas</TabsTrigger>
          <TabsTrigger value="stores" data-testid="tab-stores"><Store className="w-4 h-4 mr-2" />Tiendas</TabsTrigger>
          <TabsTrigger value="assignments" data-testid="tab-assignments">Asignaciones</TabsTrigger>
          <TabsTrigger value="products" data-testid="tab-products"><Package className="w-4 h-4 mr-2" />Productos</TabsTrigger>
          <TabsTrigger value="fields" data-testid="tab-fields"><ListChecks className="w-4 h-4 mr-2" />Evaluaciones</TabsTrigger>
          <TabsTrigger value="permissions" data-testid="tab-permissions"><Shield className="w-4 h-4 mr-2" />Permisos</TabsTrigger>
          <TabsTrigger value="notifications" data-testid="tab-notifications"><Bell className="w-4 h-4 mr-2" />Notificaciones</TabsTrigger>
          {currentUser?.role === 'admin' && (
            <TabsTrigger value="database" data-testid="tab-database"><Database className="w-4 h-4 mr-2" />Data Base</TabsTrigger>
          )}
        </TabsList>

        {/* USERS TAB */}
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
              <Form {...userForm}>
                <form onSubmit={userForm.handleSubmit((data) => createUserMutation.mutate(data))} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={userForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre Completo</FormLabel>
                          <FormControl>
                            <Input placeholder="Juan Pérez" data-testid="input-user-name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={userForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Usuario</FormLabel>
                          <FormControl>
                            <Input placeholder="jperez" data-testid="input-user-username" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={userForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Correo Electrónico</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="usuario@ejemplo.com" data-testid="input-user-email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={userForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contraseña</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" data-testid="input-user-password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={userForm.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rol</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-user-role">
                                <SelectValue placeholder="Selecciona un rol" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="promotor">Promotor</SelectItem>
                              <SelectItem value="analista">Analista</SelectItem>
                              <SelectItem value="supervisor">Supervisor</SelectItem>
                              <SelectItem value="admin">Administrador</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button type="submit" disabled={createUserMutation.isPending} data-testid="button-create-user">
                    {createUserMutation.isPending ? 'Creando...' : 'Crear Usuario'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Usuarios Registrados</CardTitle>
              <CardDescription>Lista de todos los usuarios del sistema</CardDescription>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left text-sm text-muted-foreground">
                        <th className="pb-3 font-medium">Usuario</th>
                        <th className="pb-3 font-medium">Nombre</th>
                        <th className="pb-3 font-medium">Email</th>
                        <th className="pb-3 font-medium">Rol</th>
                        <th className="pb-3 font-medium">Estado</th>
                        <th className="pb-3 font-medium text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-b hover-elevate" data-testid={`row-user-${user.id}`}>
                          <td className="py-3 text-sm font-medium">{user.username}</td>
                          <td className="py-3 text-sm">{user.name}</td>
                          <td className="py-3 text-sm text-muted-foreground">{user.email}</td>
                          <td className="py-3">
                            <Badge variant="secondary" className="capitalize">{user.role}</Badge>
                          </td>
                          <td className="py-3">
                            <Badge className={user.active ? "bg-chart-2 text-white" : "bg-muted"}>
                              {user.active ? 'Activo' : 'Inactivo'}
                            </Badge>
                          </td>
                          <td className="py-3 text-right">
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              onClick={() => setEditingUser(user)}
                              data-testid={`button-edit-user-${user.id}`}
                              className="mr-1"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              onClick={() => deleteUserMutation.mutate(user.id)}
                              disabled={deleteUserMutation.isPending && deleteUserMutation.variables === user.id}
                              data-testid={`button-delete-user-${user.id}`}
                            >
                              <Trash className="w-4 h-4 text-destructive" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* CHAINS TAB */}
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
              <Form {...chainForm}>
                <form onSubmit={chainForm.handleSubmit((data) => createChainMutation.mutate(data))} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={chainForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre de la Cadena *</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej: HEB, Soriana, Walmart" data-testid="input-chain-name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={chainForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descripción</FormLabel>
                          <FormControl>
                            <Input placeholder="Descripción opcional" data-testid="input-chain-description" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button type="submit" disabled={createChainMutation.isPending} data-testid="button-create-chain">
                    {createChainMutation.isPending ? 'Creando...' : 'Crear Cadena'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Cadenas Registradas</CardTitle>
              <CardDescription>Lista de todas las cadenas de autoservicio</CardDescription>
            </CardHeader>
            <CardContent>
              {chainsLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : (
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
                          <td className="py-3 text-sm text-muted-foreground">{chain.description || '—'}</td>
                          <td className="py-3 text-sm text-muted-foreground">
                            {new Date(chain.createdAt).toLocaleDateString('es-MX')}
                          </td>
                          <td className="py-3 text-right">
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              onClick={() => setEditingChain(chain)}
                              data-testid={`button-edit-chain-${chain.id}`}
                              className="mr-1"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              onClick={() => deleteChainMutation.mutate(chain.id)}
                              disabled={deleteChainMutation.isPending && deleteChainMutation.variables === chain.id}
                              data-testid={`button-delete-chain-${chain.id}`}
                            >
                              <Trash className="w-4 h-4 text-destructive" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ZONES TAB */}
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
              <Form {...zoneForm}>
                <form onSubmit={zoneForm.handleSubmit((data) => createZoneMutation.mutate(data))} className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <FormField
                      control={zoneForm.control}
                      name="chainId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cadena *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-zone-chain">
                                <SelectValue placeholder="Selecciona una cadena" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {chains.map((chain) => (
                                <SelectItem key={chain.id} value={chain.id}>{chain.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={zoneForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre de la Zona *</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej: Zona Norte, Zona Centro" data-testid="input-zone-name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={zoneForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descripción</FormLabel>
                          <FormControl>
                            <Input placeholder="Descripción opcional" data-testid="input-zone-description" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button type="submit" disabled={createZoneMutation.isPending} data-testid="button-create-zone">
                    {createZoneMutation.isPending ? 'Creando...' : 'Crear Zona'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Zonas Registradas</CardTitle>
              <CardDescription>Lista de todas las zonas por cadena</CardDescription>
            </CardHeader>
            <CardContent>
              {zonesLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : (
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
                          <td className="py-3 text-sm">
                            <Badge variant="secondary">{getChainName(zone.chainId)}</Badge>
                          </td>
                          <td className="py-3 text-sm font-medium">{zone.name}</td>
                          <td className="py-3 text-sm text-muted-foreground">{zone.description || '—'}</td>
                          <td className="py-3 text-sm text-muted-foreground">
                            {new Date(zone.createdAt).toLocaleDateString('es-MX')}
                          </td>
                          <td className="py-3 text-right">
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              onClick={() => setEditingZone(zone)}
                              data-testid={`button-edit-zone-${zone.id}`}
                              className="mr-1"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              onClick={() => deleteZoneMutation.mutate(zone.id)}
                              disabled={deleteZoneMutation.isPending && deleteZoneMutation.variables === zone.id}
                              data-testid={`button-delete-zone-${zone.id}`}
                            >
                              <Trash className="w-4 h-4 text-destructive" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* STORES TAB */}
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
              <Form {...storeForm}>
                <form onSubmit={storeForm.handleSubmit((data) => createStoreMutation.mutate(data))} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={storeForm.control}
                      name="chainId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cadena *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-store-chain">
                                <SelectValue placeholder="Selecciona una cadena" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {chains.map((chain) => (
                                <SelectItem key={chain.id} value={chain.id}>{chain.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={storeForm.control}
                      name="zoneId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Zona *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!storeChainId}>
                            <FormControl>
                              <SelectTrigger data-testid="select-store-zone">
                                <SelectValue placeholder="Selecciona una zona" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {storeFilteredZones.map((zone) => (
                                <SelectItem key={zone.id} value={zone.id}>{zone.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={storeForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre de la Tienda *</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej: HEB Cumbres" data-testid="input-store-name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={storeForm.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ciudad</FormLabel>
                          <FormControl>
                            <Input placeholder="Monterrey, San Pedro, etc." data-testid="input-store-city" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={storeForm.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dirección</FormLabel>
                          <FormControl>
                            <Input placeholder="Dirección completa" data-testid="input-store-address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={storeForm.control}
                      name="latitude"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Latitud</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej: 19.4326" data-testid="input-store-latitude" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={storeForm.control}
                      name="longitude"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Longitud</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej: -99.1332" data-testid="input-store-longitude" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={storeForm.control}
                    name="geofenceRadius"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Radio de geovalla (metros)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="100" 
                            data-testid="input-store-geofence" 
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                        <p className="text-xs text-muted-foreground">
                          Distancia máxima permitida para validación GPS (por defecto: 100m)
                        </p>
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={createStoreMutation.isPending} data-testid="button-create-store">
                    {createStoreMutation.isPending ? 'Creando...' : 'Crear Tienda'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tiendas Registradas</CardTitle>
              <CardDescription>Lista de todas las tiendas registradas</CardDescription>
            </CardHeader>
            <CardContent>
              {storesLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left text-sm text-muted-foreground">
                        <th className="pb-3 font-medium">Cadena</th>
                        <th className="pb-3 font-medium">Zona</th>
                        <th className="pb-3 font-medium">Nombre</th>
                        <th className="pb-3 font-medium">Ciudad</th>
                        <th className="pb-3 font-medium">Estado</th>
                        <th className="pb-3 font-medium text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stores.map((store) => (
                        <tr key={store.id} className="border-b hover-elevate" data-testid={`row-store-${store.id}`}>
                          <td className="py-3 text-sm">
                            <Badge variant="secondary">{getChainName(store.chainId)}</Badge>
                          </td>
                          <td className="py-3 text-sm text-muted-foreground">{getZoneName(store.zoneId)}</td>
                          <td className="py-3 text-sm font-medium">{store.name}</td>
                          <td className="py-3 text-sm text-muted-foreground">{store.city || '—'}</td>
                          <td className="py-3">
                            <Badge className={store.active ? "bg-chart-2 text-white" : "bg-muted"}>
                              {store.active ? 'Activa' : 'Inactiva'}
                            </Badge>
                          </td>
                          <td className="py-3 text-right">
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              onClick={() => setEditingStore(store)}
                              data-testid={`button-edit-store-${store.id}`}
                              className="mr-1"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              onClick={() => deleteStoreMutation.mutate(store.id)}
                              disabled={deleteStoreMutation.isPending && deleteStoreMutation.variables === store.id}
                              data-testid={`button-delete-store-${store.id}`}
                            >
                              <Trash className="w-4 h-4 text-destructive" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* PRODUCTS TAB */}
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
              <Form {...productForm}>
                <form onSubmit={productForm.handleSubmit((data) => createProductMutation.mutate(data))} className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <FormField
                      control={productForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre del Producto *</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej: Arándano, Frambuesa" data-testid="input-product-name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={productForm.control}
                      name="icon"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ícono</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-product-icon">
                                <SelectValue placeholder="Selecciona un ícono" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="grape">🍇 Uva</SelectItem>
                              <SelectItem value="apple">🍎 Manzana</SelectItem>
                              <SelectItem value="berry">🫐 Arándano</SelectItem>
                              <SelectItem value="leaf">🌿 Hoja</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={productForm.control}
                      name="color"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Color</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-product-color">
                                <SelectValue placeholder="Selecciona un color" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="purple">Morado</SelectItem>
                              <SelectItem value="blue">Azul</SelectItem>
                              <SelectItem value="green">Verde</SelectItem>
                              <SelectItem value="red">Rojo</SelectItem>
                              <SelectItem value="pink">Rosa</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button type="submit" disabled={createProductMutation.isPending} data-testid="button-new-product">
                    {createProductMutation.isPending ? 'Creando...' : 'Crear Producto'}
                  </Button>
                </form>
              </Form>

              <div className="overflow-x-auto mt-6">
                {productsLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                  </div>
                ) : (
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
                            <Badge variant="secondary" className="capitalize">{product.color}</Badge>
                          </td>
                          <td className="py-3">
                            <Badge className={product.active ? "bg-chart-2 text-white" : "bg-muted"}>
                              {product.active ? 'Activo' : 'Inactivo'}
                            </Badge>
                          </td>
                          <td className="py-3 text-right">
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              onClick={() => setEditingProduct(product)}
                              data-testid={`button-edit-product-${product.id}`}
                              className="mr-1"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              onClick={() => deleteProductMutation.mutate(product.id)}
                              disabled={deleteProductMutation.isPending && deleteProductMutation.variables === product.id}
                              data-testid={`button-delete-product-${product.id}`}
                            >
                              <Trash className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ASSIGNMENTS TAB */}
        <TabsContent value="assignments" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-3">
              <div>
                <CardTitle>Asignaciones de Tiendas</CardTitle>
                <p className="text-sm text-muted-foreground">Asignar promotores a tiendas</p>
              </div>
              <Dialog open={isAssignmentDialogOpen} onOpenChange={handleAssignmentDialogClose}>
                <Button size="sm" onClick={() => setIsAssignmentDialogOpen(true)} data-testid="button-add-assignment">
                  <Plus className="h-4 w-4 mr-1" />
                  Asignar
                </Button>
                <DialogContent className="max-w-2xl max-h-[80vh]">
                  <DialogHeader>
                    <DialogTitle>Asignación de Tiendas</DialogTitle>
                    <DialogDescription>
                      Selecciona un promotor y asigna múltiples tiendas
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...assignmentForm}>
                    <form onSubmit={assignmentForm.handleSubmit(onAssignmentSubmit)} className="space-y-4">
                      <FormField
                        control={assignmentForm.control}
                        name="userId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Promotor</FormLabel>
                            <Select 
                              onValueChange={handleUserSelection} 
                              value={selectedUserId}
                            >
                              <FormControl>
                                <SelectTrigger data-testid="select-assignment-user">
                                  <SelectValue placeholder="Seleccionar promotor" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {promotersQuery.data?.filter(u => u.role === 'promotor').map((user) => (
                                  <SelectItem key={user.id} value={user.id.toString()}>
                                    {user.name} ({user.username})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {selectedUserId && (
                        <FormField
                          control={assignmentForm.control}
                          name="storeIds"
                          render={() => (
                            <FormItem>
                              <div className="flex items-center justify-between mb-2">
                                <FormLabel>
                                  Tiendas ({selectedStoreIds.length} seleccionadas)
                                </FormLabel>
                                <div className="flex gap-2">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleSelectAllStores}
                                    data-testid="button-select-all-stores"
                                  >
                                    Seleccionar todas
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleClearAllStores}
                                    data-testid="button-clear-all-stores"
                                  >
                                    Limpiar
                                  </Button>
                                </div>
                              </div>
                              <div className="border rounded-md p-3 max-h-[300px] overflow-y-auto">
                                {storesQuery.data && storesQuery.data.length > 0 ? (
                                  <div className="space-y-2">
                                    {storesQuery.data.map((store) => (
                                      <div
                                        key={store.id}
                                        className="flex items-center space-x-3 p-2 hover-elevate rounded"
                                        data-testid={`checkbox-store-${store.id}`}
                                      >
                                        <Checkbox
                                          checked={selectedStoreIds.includes(store.id)}
                                          onCheckedChange={() => handleStoreToggle(store.id)}
                                          id={`store-${store.id}`}
                                        />
                                        <label
                                          htmlFor={`store-${store.id}`}
                                          className="flex-1 text-sm cursor-pointer"
                                        >
                                          <div className="font-medium">{store.name}</div>
                                          <div className="text-xs text-muted-foreground">
                                            {store.city}
                                          </div>
                                        </label>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-sm text-muted-foreground text-center py-4">
                                    No hay tiendas disponibles
                                  </p>
                                )}
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      <div className="flex justify-end gap-2 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleAssignmentDialogClose(false)}
                          data-testid="button-cancel-assignment"
                        >
                          Cancelar
                        </Button>
                        <Button
                          type="submit"
                          disabled={!selectedUserId || selectedStoreIds.length === 0}
                          data-testid="button-submit-assignment"
                        >
                          Guardar Asignaciones
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {assignmentsQuery.isLoading ? (
                <div className="text-center py-8 text-muted-foreground">Cargando asignaciones...</div>
              ) : !assignmentsQuery.data || assignmentsQuery.data.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground" data-testid="text-no-assignments">
                  No hay asignaciones. Haz clic en "Asignar" para crear una.
                </div>
              ) : (
                <div className="space-y-4">
                  {promotersQuery.data?.filter(u => u.role === 'promotor').map((user) => {
                    const userAssignments = assignmentsQuery.data.filter(
                      (a: any) => a.assignment.userId === user.id
                    );
                    
                    return (
                      <div key={user.id} className="border rounded-md p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-medium" data-testid={`text-promoter-name-${user.id}`}>
                              {user.name}
                            </h4>
                            <p className="text-sm text-muted-foreground">@{user.username}</p>
                          </div>
                          <Badge variant="secondary" data-testid={`badge-assignment-count-${user.id}`}>
                            {userAssignments.length} {userAssignments.length === 1 ? 'tienda' : 'tiendas'}
                          </Badge>
                        </div>
                        {userAssignments.length > 0 ? (
                          <div className="space-y-2">
                            {userAssignments.map((assignment: any) => (
                              <div
                                key={`${assignment.assignment.userId}-${assignment.assignment.storeId}`}
                                className="flex items-center justify-between bg-muted/30 rounded px-3 py-2"
                                data-testid={`assignment-${assignment.assignment.userId}-${assignment.assignment.storeId}`}
                              >
                                <div className="flex-1">
                                  <p className="text-sm font-medium">{assignment.store.name}</p>
                                  <p className="text-xs text-muted-foreground">{assignment.store.city}</p>
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleRemoveAssignment(assignment.assignment.userId, assignment.assignment.storeId)}
                                  disabled={deleteAssignmentMutation.isPending && deleteAssignmentMutation.variables?.userId === assignment.assignment.userId && deleteAssignmentMutation.variables?.storeId === assignment.assignment.storeId}
                                  data-testid={`button-remove-assignment-${assignment.assignment.userId}-${assignment.assignment.storeId}`}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">Sin asignaciones</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* EVALUATION FIELDS TAB */}
        <TabsContent value="fields" className="space-y-4">
          {currentUser?.role === 'admin' ? (
            <Tabs defaultValue="availability" className="space-y-4">
              <TabsList className="w-full lg:w-auto flex flex-wrap">
                <TabsTrigger value="availability" data-testid="subtab-availability">Disponibilidad</TabsTrigger>
                <TabsTrigger value="quality" data-testid="subtab-quality">Calidad</TabsTrigger>
                <TabsTrigger value="prices" data-testid="subtab-prices">Precios</TabsTrigger>
                <TabsTrigger value="incidents" data-testid="subtab-incidents">Incidentes</TabsTrigger>
                <TabsTrigger value="custom" data-testid="subtab-custom">Campos Personalizados</TabsTrigger>
              </TabsList>

              {(['availability', 'quality', 'prices', 'incidents', 'custom'] as const).map((step) => {
                const stepFields = evaluationFields.filter(f => f.step === step);
                const stepLabels = {
                  availability: 'Disponibilidad',
                  quality: 'Calidad',
                  prices: 'Precios',
                  incidents: 'Incidentes',
                  custom: 'Campos Personalizados'
                };

                return (
                  <TabsContent key={step} value={step} className="space-y-4">
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-base">Campos de {stepLabels[step]}</CardTitle>
                            <CardDescription>Configura los campos que se mostrarán en el paso de {stepLabels[step].toLowerCase()}</CardDescription>
                          </div>
                          <Button 
                            size="sm" 
                            onClick={() => {
                              setEditingField(null);
                              evaluationFieldForm.reset({
                                step,
                                technicalName: '',
                                label: '',
                                fieldType: 'text',
                                options: '',
                                required: false,
                                order: stepFields.length,
                                active: true,
                              });
                            }}
                            data-testid={`button-add-field-${step}`}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Agregar Campo
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {fieldsLoading ? (
                          <div className="space-y-2">
                            {[1, 2, 3].map((i) => (
                              <Skeleton key={i} className="h-16 w-full" />
                            ))}
                          </div>
                        ) : stepFields.length > 0 ? (
                          <div className="space-y-2">
                            {stepFields.map((field) => (
                              <div
                                key={field.id}
                                className="flex items-center justify-between p-3 border rounded-md hover-elevate"
                                data-testid={`field-item-${field.technicalName}`}
                              >
                                <div className="flex-1 space-y-1">
                                  <div className="flex items-center gap-2">
                                    <code className="text-sm font-mono bg-muted px-2 py-0.5 rounded">
                                      {field.technicalName}
                                    </code>
                                    <Badge variant={field.active ? "default" : "secondary"} className="text-xs">
                                      {field.active ? (
                                        <><Eye className="w-3 h-3 mr-1" />Activo</>
                                      ) : (
                                        <><EyeOff className="w-3 h-3 mr-1" />Inactivo</>
                                      )}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                      {field.fieldType}
                                    </Badge>
                                    {field.required && (
                                      <Badge variant="outline" className="text-xs text-red-600">
                                        Requerido
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-foreground">{field.label}</p>
                                  {field.options && (
                                    <p className="text-xs text-muted-foreground">
                                      Opciones: {field.options}
                                    </p>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-muted-foreground">Orden: {field.order}</span>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setEditingField(field)}
                                    data-testid={`button-edit-field-${field.technicalName}`}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                      if (confirm(`¿Eliminar el campo "${field.label}"?`)) {
                                        deleteEvaluationFieldMutation.mutate(field.id);
                                      }
                                    }}
                                    disabled={deleteEvaluationFieldMutation.isPending}
                                    data-testid={`button-delete-field-${field.technicalName}`}
                                  >
                                    <Trash className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant={field.active ? "secondary" : "default"}
                                    onClick={() => {
                                      updateEvaluationFieldMutation.mutate({
                                        id: field.id,
                                        data: { active: !field.active }
                                      });
                                    }}
                                    disabled={updateEvaluationFieldMutation.isPending}
                                    data-testid={`button-toggle-field-${field.technicalName}`}
                                  >
                                    {field.active ? <XCircle className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground text-center py-8">
                            No hay campos configurados para este paso. Haz clic en "Agregar Campo" para crear uno.
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                );
              })}
            </Tabs>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">Solo los administradores pueden configurar campos de evaluación</p>
              </CardContent>
            </Card>
          )}

          {/* Field Edit/Create Dialog */}
          <Dialog open={editingField !== null || evaluationFieldForm.formState.isDirty} onOpenChange={(open) => {
            if (!open) {
              setEditingField(null);
              evaluationFieldForm.reset();
            }
          }}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingField ? 'Editar Campo' : 'Crear Nuevo Campo'}</DialogTitle>
                <DialogDescription>
                  {editingField ? 'Modifica los detalles del campo' : 'Configura un nuevo campo de evaluación'}
                </DialogDescription>
              </DialogHeader>
              <Form {...evaluationFieldForm}>
                <form onSubmit={evaluationFieldForm.handleSubmit((data) => {
                  if (editingField) {
                    updateEvaluationFieldMutation.mutate({ id: editingField.id, data });
                  } else {
                    createEvaluationFieldMutation.mutate(data);
                  }
                })} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={evaluationFieldForm.control}
                      name="step"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Paso</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value} disabled={!!editingField}>
                            <FormControl>
                              <SelectTrigger data-testid="select-field-step">
                                <SelectValue placeholder="Selecciona paso" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="availability">Disponibilidad</SelectItem>
                              <SelectItem value="quality">Calidad</SelectItem>
                              <SelectItem value="prices">Precios</SelectItem>
                              <SelectItem value="incidents">Incidentes</SelectItem>
                              <SelectItem value="custom">Campos Personalizados</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={evaluationFieldForm.control}
                      name="fieldType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de Campo</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-field-type">
                                <SelectValue placeholder="Selecciona tipo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="text">Texto</SelectItem>
                              <SelectItem value="number">Número</SelectItem>
                              <SelectItem value="select">Selección</SelectItem>
                              <SelectItem value="multiselect">Selección Múltiple</SelectItem>
                              <SelectItem value="checkbox">Checkbox</SelectItem>
                              <SelectItem value="textarea">Área de Texto</SelectItem>
                              <SelectItem value="photo">Foto</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={evaluationFieldForm.control}
                    name="technicalName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre Técnico</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="ej: hasPriceTag" 
                            data-testid="input-field-technical-name" 
                            disabled={!!editingField}
                            {...field} 
                          />
                        </FormControl>
                        <p className="text-xs text-muted-foreground">
                          Debe empezar con minúscula y solo contener letras/números sin espacios (camelCase)
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={evaluationFieldForm.control}
                    name="label"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Etiqueta</FormLabel>
                        <FormControl>
                          <Input placeholder="ej: ¿Tiene etiqueta de precio?" data-testid="input-field-label" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={evaluationFieldForm.control}
                    name="options"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Opciones (para select/multiselect)</FormLabel>
                        <FormControl>
                          <Input placeholder="ej: Sí,No,Parcial" data-testid="input-field-options" {...field} />
                        </FormControl>
                        <p className="text-xs text-muted-foreground">
                          Separar opciones con comas. Solo necesario para campos tipo select/multiselect
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={evaluationFieldForm.control}
                      name="order"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Orden</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="0" 
                              data-testid="input-field-order" 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="space-y-4">
                      <FormField
                        control={evaluationFieldForm.control}
                        name="required"
                        render={({ field }) => (
                          <FormItem className="flex items-center gap-2 space-y-0">
                            <FormControl>
                              <Checkbox 
                                checked={field.value} 
                                onCheckedChange={field.onChange}
                                data-testid="checkbox-field-required"
                              />
                            </FormControl>
                            <FormLabel className="!mt-0">Campo Requerido</FormLabel>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={evaluationFieldForm.control}
                        name="active"
                        render={({ field }) => (
                          <FormItem className="flex items-center gap-2 space-y-0">
                            <FormControl>
                              <Checkbox 
                                checked={field.value} 
                                onCheckedChange={field.onChange}
                                data-testid="checkbox-field-active"
                              />
                            </FormControl>
                            <FormLabel className="!mt-0">Campo Activo</FormLabel>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setEditingField(null);
                        evaluationFieldForm.reset();
                      }}
                      data-testid="button-cancel-field"
                    >
                      Cancelar
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createEvaluationFieldMutation.isPending || updateEvaluationFieldMutation.isPending}
                      data-testid="button-save-field"
                    >
                      {(createEvaluationFieldMutation.isPending || updateEvaluationFieldMutation.isPending) 
                        ? 'Guardando...' 
                        : editingField ? 'Actualizar' : 'Crear'}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* PERMISSIONS TAB - Placeholder */}
        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Permisos - Módulo en desarrollo</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* NOTIFICATIONS TAB - Placeholder */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Notificaciones - Módulo en desarrollo</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* DATABASE TAB */}
        {(currentUser?.role === 'admin' || currentUser?.role === 'supervisor') && (
          <TabsContent value="database" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Database className="w-5 h-5 text-primary" />
                      Respaldo de Base de Datos
                    </CardTitle>
                    <CardDescription>Genera un respaldo de la estructura de la base de datos</CardDescription>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={handleInitiateBackup}
                    data-testid="button-create-backup"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Crear Respaldo
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    <p>El respaldo incluye únicamente la estructura de la base de datos (tablas, columnas, índices).</p>
                    <p className="mt-1">No incluye datos de usuarios ni información confidencial.</p>
                  </div>

                  {backupLogsQuery.isLoading ? (
                    <div className="text-center py-8">
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  ) : (
                    <div>
                      <h3 className="font-medium text-sm mb-2">Historial de Respaldos</h3>
                      {backupLogsQuery.data && backupLogsQuery.data.length > 0 ? (
                        <div className="border rounded-md">
                          <table className="w-full">
                            <thead className="bg-muted/50">
                              <tr>
                                <th className="text-left p-2 text-sm font-medium">Archivo</th>
                                <th className="text-left p-2 text-sm font-medium">Usuario</th>
                                <th className="text-left p-2 text-sm font-medium">Fecha</th>
                              </tr>
                            </thead>
                            <tbody>
                              {backupLogsQuery.data.map((log: any, index: number) => (
                                <tr key={log.id} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/20'}>
                                  <td className="p-2 text-sm" data-testid={`text-backup-filename-${log.id}`}>
                                    {log.filename}
                                  </td>
                                  <td className="p-2 text-sm" data-testid={`text-backup-user-${log.id}`}>
                                    {log.adminName}
                                  </td>
                                  <td className="p-2 text-sm" data-testid={`text-backup-date-${log.id}`}>
                                    {new Date(log.createdAt).toLocaleString('es-MX')}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No hay respaldos registrados
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Table2 className="w-5 h-5 text-primary" />
                  Tablas de la Base de Datos
                </CardTitle>
                <CardDescription>Listado de todas las tablas en el esquema público</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Buscar tabla..."
                      value={tableSearchFilter}
                      onChange={(e) => setTableSearchFilter(e.target.value)}
                      className="max-w-sm"
                      data-testid="input-search-table"
                    />
                  </div>

                  {dbTablesQuery.isLoading ? (
                    <div className="text-center py-8">
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  ) : (
                    <div>
                      {dbTablesQuery.data && dbTablesQuery.data.length > 0 ? (
                        <div className="border rounded-md">
                          <table className="w-full">
                            <thead className="bg-muted/50">
                              <tr>
                                <th className="text-left p-2 text-sm font-medium">🗂️ Tabla</th>
                                <th className="text-left p-2 text-sm font-medium">Esquema</th>
                                <th className="text-left p-2 text-sm font-medium">Propietario</th>
                              </tr>
                            </thead>
                            <tbody>
                              {dbTablesQuery.data
                                .filter((table: any) => 
                                  !tableSearchFilter || 
                                  table.name.toLowerCase().includes(tableSearchFilter.toLowerCase())
                                )
                                .map((table: any, index: number) => (
                                  <tr key={table.name} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/20'}>
                                    <td className="p-2 text-sm font-mono" data-testid={`text-table-name-${table.name}`}>
                                      {table.name}
                                    </td>
                                    <td className="p-2 text-sm text-muted-foreground" data-testid={`text-table-schema-${table.name}`}>
                                      {table.schema}
                                    </td>
                                    <td className="p-2 text-sm text-muted-foreground" data-testid={`text-table-owner-${table.name}`}>
                                      {table.owner}
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                          {tableSearchFilter && dbTablesQuery.data.filter((table: any) => 
                            table.name.toLowerCase().includes(tableSearchFilter.toLowerCase())
                          ).length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-4">
                              No se encontraron tablas que coincidan con "{tableSearchFilter}"
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No hay tablas en el esquema público
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Edit User Dialog */}
      {editingUser && (
        <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Editar Usuario</DialogTitle>
              <DialogDescription>Modifica la información del usuario</DialogDescription>
            </DialogHeader>
            <Form {...userForm}>
              <form onSubmit={userForm.handleSubmit((data) => updateUserMutation.mutate({ id: editingUser.id, data }))} className="space-y-4">
                <FormField
                  control={userForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre Completo</FormLabel>
                      <FormControl>
                        <Input {...field} defaultValue={editingUser.name} data-testid="input-edit-user-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={userForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Usuario</FormLabel>
                      <FormControl>
                        <Input {...field} defaultValue={editingUser.username} data-testid="input-edit-user-username" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={userForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email (opcional)</FormLabel>
                      <FormControl>
                        <Input {...field} defaultValue={editingUser.email || ''} data-testid="input-edit-user-email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={userForm.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rol</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={editingUser.role}>
                        <FormControl>
                          <SelectTrigger data-testid="select-edit-user-role">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="admin">Administrador</SelectItem>
                          <SelectItem value="supervisor">Supervisor</SelectItem>
                          <SelectItem value="analista">Analista</SelectItem>
                          <SelectItem value="promotor">Promotor</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={userForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nueva Contraseña (dejar vacío para no cambiar)</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} placeholder="••••••" data-testid="input-edit-user-password" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setEditingUser(null)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={updateUserMutation.isPending} data-testid="button-save-user">
                    {updateUserMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Chain Dialog */}
      {editingChain && (
        <Dialog open={!!editingChain} onOpenChange={() => setEditingChain(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Editar Cadena</DialogTitle>
              <DialogDescription>Modifica la información de la cadena</DialogDescription>
            </DialogHeader>
            <Form {...chainForm}>
              <form onSubmit={chainForm.handleSubmit((data) => updateChainMutation.mutate({ id: editingChain.id, data }))} className="space-y-4">
                <FormField
                  control={chainForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre de la Cadena</FormLabel>
                      <FormControl>
                        <Input {...field} defaultValue={editingChain.name} data-testid="input-edit-chain-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={chainForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción</FormLabel>
                      <FormControl>
                        <Input {...field} defaultValue={editingChain.description || ''} data-testid="input-edit-chain-description" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setEditingChain(null)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={updateChainMutation.isPending} data-testid="button-save-chain">
                    {updateChainMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Zone Dialog */}
      {editingZone && (
        <Dialog open={!!editingZone} onOpenChange={() => setEditingZone(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Editar Zona</DialogTitle>
              <DialogDescription>Modifica la información de la zona</DialogDescription>
            </DialogHeader>
            <Form {...zoneForm}>
              <form onSubmit={zoneForm.handleSubmit((data) => updateZoneMutation.mutate({ id: editingZone.id, data }))} className="space-y-4">
                <FormField
                  control={zoneForm.control}
                  name="chainId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cadena</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={editingZone.chainId}>
                        <FormControl>
                          <SelectTrigger data-testid="select-edit-zone-chain">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {chains.map((chain) => (
                            <SelectItem key={chain.id} value={chain.id}>{chain.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={zoneForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre de la Zona</FormLabel>
                      <FormControl>
                        <Input {...field} defaultValue={editingZone.name} data-testid="input-edit-zone-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={zoneForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción</FormLabel>
                      <FormControl>
                        <Input {...field} defaultValue={editingZone.description || ''} data-testid="input-edit-zone-description" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setEditingZone(null)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={updateZoneMutation.isPending} data-testid="button-save-zone">
                    {updateZoneMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Store Dialog */}
      {editingStore && (
        <Dialog open={!!editingStore} onOpenChange={() => setEditingStore(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Editar Tienda</DialogTitle>
              <DialogDescription>Modifica la información de la tienda</DialogDescription>
            </DialogHeader>
            <Form {...storeForm}>
              <form onSubmit={storeForm.handleSubmit((data) => updateStoreMutation.mutate({ id: editingStore.id, data }))} className="space-y-4">
                <FormField
                  control={storeForm.control}
                  name="chainId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cadena</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={editingStore.chainId}>
                        <FormControl>
                          <SelectTrigger data-testid="select-edit-store-chain">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {chains.map((chain) => (
                            <SelectItem key={chain.id} value={chain.id}>{chain.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={storeForm.control}
                  name="zoneId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Zona</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={editingStore.zoneId}>
                        <FormControl>
                          <SelectTrigger data-testid="select-edit-store-zone">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {zones.filter(z => z.chainId === storeForm.watch('chainId')).map((zone) => (
                            <SelectItem key={zone.id} value={zone.id}>{zone.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={storeForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre de la Tienda</FormLabel>
                      <FormControl>
                        <Input {...field} defaultValue={editingStore.name} data-testid="input-edit-store-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={storeForm.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ciudad</FormLabel>
                      <FormControl>
                        <Input {...field} defaultValue={editingStore.city || ''} data-testid="input-edit-store-city" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={storeForm.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dirección</FormLabel>
                      <FormControl>
                        <Input {...field} defaultValue={editingStore.address || ''} data-testid="input-edit-store-address" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={storeForm.control}
                    name="latitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Latitud</FormLabel>
                        <FormControl>
                          <Input {...field} defaultValue={editingStore.latitude || ''} placeholder="19.4326" data-testid="input-edit-store-latitude" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={storeForm.control}
                    name="longitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Longitud</FormLabel>
                        <FormControl>
                          <Input {...field} defaultValue={editingStore.longitude || ''} placeholder="-99.1332" data-testid="input-edit-store-longitude" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={storeForm.control}
                  name="geofenceRadius"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Radio de geovalla (metros)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="100"
                          data-testid="input-edit-store-geofence"
                          {...field}
                          defaultValue={editingStore.geofenceRadius || 100}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-muted-foreground">
                        Distancia máxima permitida para validación GPS (por defecto: 100m)
                      </p>
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setEditingStore(null)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={updateStoreMutation.isPending} data-testid="button-save-store">
                    {updateStoreMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Product Dialog */}
      {editingProduct && (
        <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Editar Producto</DialogTitle>
              <DialogDescription>Modifica la información del producto</DialogDescription>
            </DialogHeader>
            <Form {...productForm}>
              <form onSubmit={productForm.handleSubmit((data) => updateProductMutation.mutate({ id: editingProduct.id, data }))} className="space-y-4">
                <FormField
                  control={productForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre del Producto</FormLabel>
                      <FormControl>
                        <Input {...field} defaultValue={editingProduct.name} data-testid="input-edit-product-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={productForm.control}
                  name="icon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ícono</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={editingProduct.icon}>
                        <FormControl>
                          <SelectTrigger data-testid="select-edit-product-icon">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="grape">🍇 Uva</SelectItem>
                          <SelectItem value="strawberry">🍓 Fresa</SelectItem>
                          <SelectItem value="blueberry">🫐 Arándano</SelectItem>
                          <SelectItem value="raspberry">🍒 Frambuesa</SelectItem>
                          <SelectItem value="blackberry">⚫ Mora</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={productForm.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Color</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={editingProduct.color}>
                        <FormControl>
                          <SelectTrigger data-testid="select-edit-product-color">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="purple">Morado</SelectItem>
                          <SelectItem value="red">Rojo</SelectItem>
                          <SelectItem value="blue">Azul</SelectItem>
                          <SelectItem value="green">Verde</SelectItem>
                          <SelectItem value="orange">Naranja</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setEditingProduct(null)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={updateProductMutation.isPending} data-testid="button-save-product">
                    {updateProductMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      )}

      {/* Backup Password Dialog */}
      <Dialog open={isBackupPasswordDialogOpen} onOpenChange={setIsBackupPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contraseña de Respaldo</DialogTitle>
            <DialogDescription>
              Ingresa la contraseña para generar el respaldo de la base de datos
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="backup-password">Contraseña</Label>
              <Input
                id="backup-password"
                type="password"
                value={backupPassword}
                onChange={(e) => {
                  setBackupPassword(e.target.value);
                  setBackupPasswordError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleBackupPasswordSubmit();
                  }
                }}
                placeholder="Ingrese la contraseña"
                data-testid="input-backup-password"
              />
              {backupPasswordError && (
                <p className="text-sm text-destructive" data-testid="text-password-error">
                  {backupPasswordError}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsBackupPasswordDialogOpen(false)}
              data-testid="button-cancel-backup"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleBackupPasswordSubmit}
              data-testid="button-confirm-backup"
            >
              Generar Respaldo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
