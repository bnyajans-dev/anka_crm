import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/lib/auth';
import { api, User, Visit, Offer, Sale } from '@/lib/mockApi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Activity, 
  Users, 
  School as SchoolIcon, 
  MapPin, 
  FileText, 
  Briefcase, 
  Plus, 
  Edit, 
  Trash2,
  Clock,
  Filter,
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDistanceToNow, format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface ActivityLogItem {
  id: number;
  action: 'create' | 'update' | 'delete';
  entity_type: 'school' | 'visit' | 'offer' | 'sale';
  entity_id: number;
  entity_name?: string;
  user_id: number;
  user_name: string;
  created_at: string;
  details?: string;
}

const getActionIcon = (action: string) => {
  switch (action) {
    case 'create': return <Plus className="h-4 w-4 text-green-500" />;
    case 'update': return <Edit className="h-4 w-4 text-blue-500" />;
    case 'delete': return <Trash2 className="h-4 w-4 text-red-500" />;
    default: return <Activity className="h-4 w-4 text-muted-foreground" />;
  }
};

const getEntityIcon = (entityType: string) => {
  switch (entityType) {
    case 'school': return <SchoolIcon className="h-4 w-4" />;
    case 'visit': return <MapPin className="h-4 w-4" />;
    case 'offer': return <FileText className="h-4 w-4" />;
    case 'sale': return <Briefcase className="h-4 w-4" />;
    default: return <Activity className="h-4 w-4" />;
  }
};

const getActionLabel = (action: string, entityType: string): string => {
  const entityLabels: Record<string, string> = {
    school: 'okul',
    visit: 'ziyaret',
    offer: 'teklif',
    sale: 'satış'
  };
  const entity = entityLabels[entityType] || entityType;
  
  switch (action) {
    case 'create': return `Yeni ${entity} oluşturuldu`;
    case 'update': return `${entity.charAt(0).toUpperCase() + entity.slice(1)} güncellendi`;
    case 'delete': return `${entity.charAt(0).toUpperCase() + entity.slice(1)} silindi`;
    default: return 'İşlem yapıldı';
  }
};

const getActionBadgeColor = (action: string) => {
  switch (action) {
    case 'create': return 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-200';
    case 'update': return 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200';
    case 'delete': return 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-200';
    default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200';
  }
};

export default function ActivityPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  
  const [activities, setActivities] = useState<ActivityLogItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterUser, setFilterUser] = useState<string>('all');

  const isManager = user?.role === 'manager' || user?.role === 'admin' || user?.role === 'system_admin';

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [usersData, schoolsData, visitsData, offersData, salesData] = await Promise.all([
        api.users.list(),
        api.schools.list(),
        api.visits.list(),
        api.offers.list(),
        api.sales.list()
      ]);
      
      setUsers(usersData);
      
      const mockActivities: ActivityLogItem[] = [];
      let id = 1;
      
      schoolsData.forEach(school => {
        mockActivities.push({
          id: id++,
          action: 'create',
          entity_type: 'school',
          entity_id: school.id,
          entity_name: school.name,
          user_id: 1,
          user_name: usersData.find(u => u.id === 1)?.name || 'Sistem',
          created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        });
      });
      
      visitsData.forEach(visit => {
        const visitUser = usersData.find(u => u.id === visit.user_id);
        const school = schoolsData.find(s => s.id === visit.school_id);
        mockActivities.push({
          id: id++,
          action: 'create',
          entity_type: 'visit',
          entity_id: visit.id,
          entity_name: school?.name,
          user_id: visit.user_id,
          user_name: visitUser?.name || 'Bilinmeyen',
          created_at: visit.visit_date,
          details: visit.notes
        });
      });
      
      offersData.forEach(offer => {
        const offerUser = usersData.find(u => u.id === offer.user_id);
        const school = schoolsData.find(s => s.id === offer.school_id);
        mockActivities.push({
          id: id++,
          action: 'create',
          entity_type: 'offer',
          entity_id: offer.id,
          entity_name: `${school?.name} - ${offer.tour_name}`,
          user_id: offer.user_id,
          user_name: offerUser?.name || 'Bilinmeyen',
          created_at: new Date(Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000).toISOString(),
        });
        
        if (offer.status === 'accepted') {
          mockActivities.push({
            id: id++,
            action: 'update',
            entity_type: 'offer',
            entity_id: offer.id,
            entity_name: `${school?.name} - ${offer.tour_name}`,
            user_id: offer.user_id,
            user_name: offerUser?.name || 'Bilinmeyen',
            created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
            details: 'Teklif kabul edildi'
          });
        }
      });
      
      salesData.forEach(sale => {
        const saleUser = usersData.find(u => u.id === sale.closed_by_user_id);
        const offer = offersData.find(o => o.id === sale.offer_id);
        mockActivities.push({
          id: id++,
          action: 'create',
          entity_type: 'sale',
          entity_id: sale.id,
          entity_name: `${sale.school_name || 'Okul'} - ${offer?.tour_name || sale.offer_tour_name || 'Tur'}`,
          user_id: sale.closed_by_user_id,
          user_name: saleUser?.name || sale.user_name || 'Bilinmeyen',
          created_at: sale.closed_date,
          details: `${sale.final_revenue_amount.toLocaleString('tr-TR')} ₺`
        });
      });
      
      mockActivities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      setActivities(mockActivities);
      setLoading(false);
    };
    load();
  }, []);

  const filteredActivities = activities.filter(activity => {
    if (filterType !== 'all' && activity.entity_type !== filterType) return false;
    if (filterUser !== 'all' && activity.user_id.toString() !== filterUser) return false;
    if (!isManager && user && activity.user_id !== user.id) return false;
    return true;
  });

  const formatTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return formatDistanceToNow(date, { addSuffix: true, locale: tr });
    } catch {
      return dateStr;
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'd MMM yyyy, HH:mm', { locale: tr });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Activity className="h-8 w-8 text-primary" />
            Aktivite Geçmişi
          </h1>
          <p className="text-muted-foreground mt-1">
            Sistemdeki tüm işlemleri ve değişiklikleri takip edin
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[130px]" data-testid="select-type">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tümü</SelectItem>
              <SelectItem value="school">Okullar</SelectItem>
              <SelectItem value="visit">Ziyaretler</SelectItem>
              <SelectItem value="offer">Teklifler</SelectItem>
              <SelectItem value="sale">Satışlar</SelectItem>
            </SelectContent>
          </Select>

          {isManager && (
            <Select value={filterUser} onValueChange={setFilterUser}>
              <SelectTrigger className="w-[160px]" data-testid="select-user">
                <Users className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Kullanıcı" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Kullanıcılar</SelectItem>
                {users.map(u => (
                  <SelectItem key={u.id} value={u.id.toString()}>{u.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Son Aktiviteler
          </CardTitle>
          <CardDescription>
            {filteredActivities.length} aktivite bulundu
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[600px]">
            <div className="divide-y">
              {filteredActivities.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Activity className="h-12 w-12 text-muted-foreground/30 mb-3" />
                  <p className="text-muted-foreground">Henüz aktivite bulunamadı</p>
                </div>
              ) : (
                filteredActivities.map((activity, idx) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="flex gap-4 p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="relative">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        {getEntityIcon(activity.entity_type)}
                      </div>
                      <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-background flex items-center justify-center shadow-sm border">
                        {getActionIcon(activity.action)}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-medium text-sm">{activity.user_name}</span>
                        <Badge className={`text-[10px] ${getActionBadgeColor(activity.action)}`}>
                          {getActionLabel(activity.action, activity.entity_type)}
                        </Badge>
                      </div>
                      
                      {activity.entity_name && (
                        <p className="text-sm text-foreground truncate">
                          {activity.entity_name}
                        </p>
                      )}
                      
                      {activity.details && (
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          {activity.details}
                        </p>
                      )}
                      
                      <p className="text-xs text-muted-foreground mt-1" title={formatDate(activity.created_at)}>
                        {formatTime(activity.created_at)}
                      </p>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </motion.div>
  );
}
