import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { api, Announcement } from '@/lib/mockApi';
import { Badge } from '@/components/ui/badge';

export default function NotificationsPopover() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    api.announcements.list().then(data => {
      setAnnouncements(data);
      setUnreadCount(data.length); // Mock all as unread for now
    });
  }, []);

  const handleMarkRead = () => {
    setUnreadCount(0);
  };

  return (
    <Popover onOpenChange={(open) => open && handleMarkRead()}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full">
          <Bell className="h-4 w-4 text-muted-foreground" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center bg-red-500 text-[10px]">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="p-3 border-b font-medium">Notifications</div>
        <div className="max-h-[300px] overflow-y-auto">
          {announcements.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">No new notifications</div>
          ) : (
            announcements.map(a => (
              <div key={a.id} className="p-3 border-b last:border-0 hover:bg-muted/50">
                <div className="flex justify-between mb-1">
                  <span className="text-xs font-semibold text-primary capitalize">{a.type.replace('_', ' ')}</span>
                  <span className="text-[10px] text-muted-foreground">{a.created_at}</span>
                </div>
                <p className="text-sm font-medium">{a.title}</p>
                <p className="text-xs text-muted-foreground line-clamp-2">{a.message}</p>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
