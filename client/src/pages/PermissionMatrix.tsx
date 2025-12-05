import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Shield, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const roles = [
  { id: 'system_admin', label: 'Sistem Yönetici', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
  { id: 'admin', label: 'Yönetici', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
  { id: 'manager', label: 'Ekip Lideri', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  { id: 'sales', label: 'Satış Temsilcisi', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
];

const modules = [
  { id: 'dashboard', label: 'Dashboard', description: 'Ana sayfa ve genel istatistikler' },
  { id: 'schools', label: 'Okullar', description: 'Okul kayıtları yönetimi' },
  { id: 'visits', label: 'Ziyaretler', description: 'Okul ziyaretleri takibi' },
  { id: 'offers', label: 'Teklifler', description: 'Teklif oluşturma ve yönetimi' },
  { id: 'sales', label: 'Satışlar', description: 'Satış kayıtları' },
  { id: 'expenses', label: 'Giderler', description: 'Satış giderleri yönetimi' },
  { id: 'targets', label: 'Hedefler', description: 'Satış hedefleri' },
  { id: 'reports', label: 'Raporlar', description: 'Detaylı raporlar ve analizler' },
  { id: 'users', label: 'Kullanıcılar', description: 'Kullanıcı hesapları yönetimi' },
  { id: 'teams', label: 'Ekipler', description: 'Ekip yapılandırması' },
  { id: 'settings', label: 'Ayarlar', description: 'Sistem ayarları' },
  { id: 'activity', label: 'Aktivite', description: 'Aktivite geçmişi' },
  { id: 'permissions', label: 'Yetkiler', description: 'Bu sayfa - Yetki matrisi' },
];

type Permission = 'view' | 'create' | 'edit' | 'delete';

const permissionMatrix: Record<string, Record<string, Permission[]>> = {
  system_admin: {
    dashboard: ['view'],
    schools: ['view', 'create', 'edit', 'delete'],
    visits: ['view', 'create', 'edit', 'delete'],
    offers: ['view', 'create', 'edit', 'delete'],
    sales: ['view', 'create', 'edit', 'delete'],
    expenses: ['view', 'create', 'edit', 'delete'],
    targets: ['view', 'create', 'edit', 'delete'],
    reports: ['view'],
    users: ['view', 'create', 'edit', 'delete'],
    teams: ['view', 'create', 'edit', 'delete'],
    settings: ['view', 'edit'],
    activity: ['view'],
    permissions: ['view', 'edit'],
  },
  admin: {
    dashboard: ['view'],
    schools: ['view', 'create', 'edit', 'delete'],
    visits: ['view', 'create', 'edit', 'delete'],
    offers: ['view', 'create', 'edit', 'delete'],
    sales: ['view', 'create', 'edit', 'delete'],
    expenses: ['view', 'create', 'edit', 'delete'],
    targets: ['view', 'create', 'edit', 'delete'],
    reports: ['view'],
    users: ['view', 'create', 'edit', 'delete'],
    teams: ['view', 'create', 'edit'],
    settings: ['view', 'edit'],
    activity: ['view'],
    permissions: ['view'],
  },
  manager: {
    dashboard: ['view'],
    schools: ['view', 'create', 'edit'],
    visits: ['view', 'create', 'edit'],
    offers: ['view', 'create', 'edit'],
    sales: ['view', 'create', 'edit'],
    expenses: ['view'],
    targets: ['view', 'create', 'edit'],
    reports: ['view'],
    users: ['view'],
    teams: ['view'],
    settings: [],
    activity: ['view'],
    permissions: [],
  },
  sales: {
    dashboard: ['view'],
    schools: ['view', 'create'],
    visits: ['view', 'create', 'edit'],
    offers: ['view', 'create', 'edit'],
    sales: ['view'],
    expenses: [],
    targets: ['view'],
    reports: [],
    users: [],
    teams: [],
    settings: [],
    activity: [],
    permissions: [],
  },
};

const permissionLabels: Record<Permission, string> = {
  view: 'Görüntüle',
  create: 'Oluştur',
  edit: 'Düzenle',
  delete: 'Sil',
};

const permissionColors: Record<Permission, string> = {
  view: 'bg-blue-500',
  create: 'bg-green-500',
  edit: 'bg-yellow-500',
  delete: 'bg-red-500',
};

export default function PermissionMatrix() {
  const { t } = useTranslation();

  const hasPermission = (role: string, module: string, permission: Permission): boolean => {
    return permissionMatrix[role]?.[module]?.includes(permission) || false;
  };

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Shield className="h-8 w-8 text-primary" />
          Yetki Matrisi
        </h1>
        <p className="text-muted-foreground mt-1">
          Rol bazlı erişim kontrol matrisini görüntüleyin
        </p>
      </div>

      {/* Legend */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Info className="h-4 w-4" />
            Açıklama
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {Object.entries(permissionLabels).map(([key, label]) => (
              <div key={key} className="flex items-center gap-2">
                <div className={`h-3 w-3 rounded-sm ${permissionColors[key as Permission]}`} />
                <span className="text-sm text-muted-foreground">{label}</span>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-sm bg-muted border" />
              <span className="text-sm text-muted-foreground">Yetki Yok</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Permission Matrix Table */}
      <Card>
        <CardHeader>
          <CardTitle>Modül Yetkileri</CardTitle>
          <CardDescription>
            Her rol için modül bazlı yetki tanımlamaları
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <TooltipProvider>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px] sticky left-0 bg-background z-10">Modül</TableHead>
                    {roles.map(role => (
                      <TableHead key={role.id} className="text-center min-w-[180px]">
                        <Badge className={role.color}>{role.label}</Badge>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {modules.map((module, idx) => (
                    <motion.tr
                      key={module.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="hover:bg-muted/50"
                    >
                      <TableCell className="font-medium sticky left-0 bg-background z-10">
                        <Tooltip>
                          <TooltipTrigger className="flex items-center gap-2 cursor-help">
                            {module.label}
                            <Info className="h-3 w-3 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{module.description}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                      {roles.map(role => (
                        <TableCell key={role.id} className="text-center">
                          <div className="flex justify-center gap-1">
                            {(['view', 'create', 'edit', 'delete'] as Permission[]).map(perm => (
                              <Tooltip key={perm}>
                                <TooltipTrigger>
                                  <div 
                                    className={`h-6 w-6 rounded flex items-center justify-center ${
                                      hasPermission(role.id, module.id, perm) 
                                        ? permissionColors[perm] 
                                        : 'bg-muted'
                                    }`}
                                  >
                                    {hasPermission(role.id, module.id, perm) && (
                                      <span className="text-white text-[10px] font-bold">
                                        {perm.charAt(0).toUpperCase()}
                                      </span>
                                    )}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                  <p>
                                    {permissionLabels[perm]}: {hasPermission(role.id, module.id, perm) ? 'Var' : 'Yok'}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            ))}
                          </div>
                        </TableCell>
                      ))}
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </TooltipProvider>
          </div>
        </CardContent>
      </Card>

      {/* Role Descriptions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {roles.map((role, idx) => (
          <motion.div
            key={role.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Badge className={role.color}>{role.label}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  {role.id === 'system_admin' && 'Tüm sistem üzerinde tam yetki. Yetki matrisi düzenleme dahil.'}
                  {role.id === 'admin' && 'Şirket genelinde yönetici yetkileri. Kullanıcı ve ekip yönetimi.'}
                  {role.id === 'manager' && 'Ekip bazlı yetki. Hedef belirleme ve performans takibi.'}
                  {role.id === 'sales' && 'Bireysel satış işlemleri. Ziyaret, teklif ve okul yönetimi.'}
                </p>
                <div className="mt-3 pt-2 border-t">
                  <p className="text-xs text-muted-foreground">
                    Erişilen modül: {Object.values(permissionMatrix[role.id]).filter(p => p.length > 0).length} / {modules.length}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
