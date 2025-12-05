import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, Check, FileText, Users, Target, MapPin, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { api, Announcement } from '@/lib/mockApi';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

interface NotificationItem {
  id: number;
  type: string;
  title: string;
  message: string;
  created_at: string;
  is_read: boolean;
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'offer_created':
    case 'offer_accepted':
      return <FileText className="h-4 w-4 text-blue-500" />;
    case 'sale_created':
      return <Briefcase className="h-4 w-4 text-green-500" />;
    case 'target_assigned':
      return <Target className="h-4 w-4 text-purple-500" />;
    case 'visit_created':
      return <MapPin className="h-4 w-4 text-orange-500" />;
    default:
      return <Bell className="h-4 w-4 text-muted-foreground" />;
  }
};

const getTypeLabel = (type: string): string => {
  switch (type) {
    case 'offer_created': return 'Yeni Teklif';
    case 'offer_accepted': return 'Teklif Kabul Edildi';
    case 'sale_created': return 'Yeni Satış';
    case 'target_assigned': return 'Hedef Atandı';
    case 'visit_created': return 'Yeni Ziyaret';
    case 'info': return 'Bilgi';
    case 'warning': return 'Uyarı';
    case 'success': return 'Başarı';
    case 'announcement': return 'Duyuru';
    default: return 'Bildirim';
  }
};

export default function NotificationsPopover() {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    api.announcements.list().then(data => {
      const mapped: NotificationItem[] = data.map(a => ({
        id: a.id,
        type: a.type,
        title: a.title,
        message: a.message,
        created_at: a.created_at,
        is_read: false
      }));
      setNotifications(mapped);
      setUnreadCount(mapped.length);
    });
  }, []);

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  const formatTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return formatDistanceToNow(date, { addSuffix: true, locale: tr });
    } catch {
      return dateStr;
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative h-9 w-9 rounded-full"
          data-testid="button-notifications"
        >
          <Bell className="h-4 w-4 text-muted-foreground" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white text-[10px] animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0" sideOffset={8}>
        <div className="flex items-center justify-between p-3 border-b">
          <span className="font-semibold">Bildirimler</span>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 text-xs text-muted-foreground hover:text-foreground"
              onClick={handleMarkAllRead}
            >
              <Check className="h-3 w-3 mr-1" />
              Tümünü Okundu İşaretle
            </Button>
          )}
        </div>
        
        <ScrollArea className="h-[320px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-8 text-center">
              <Bell className="h-10 w-10 text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">Henüz bildirim yok</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map(notification => (
                <div 
                  key={notification.id} 
                  className={`p-3 hover:bg-muted/50 transition-colors cursor-pointer ${
                    !notification.is_read ? 'bg-primary/5' : ''
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-primary">
                          {getTypeLabel(notification.type)}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {formatTime(notification.created_at)}
                        </span>
                      </div>
                      <p className="text-sm font-medium leading-tight mb-0.5 truncate">
                        {notification.title}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {notification.message}
                      </p>
                    </div>
                    {!notification.is_read && (
                      <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        
        <div className="p-2 border-t">
          <Button 
            variant="ghost" 
            className="w-full text-sm h-8"
            onClick={() => setIsOpen(false)}
          >
            Tüm Bildirimleri Gör
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
