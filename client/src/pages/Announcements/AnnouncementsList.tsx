import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api, Announcement } from '@/lib/mockApi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Megaphone, Trash, Plus, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

export default function AnnouncementsList() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    message: '',
    type: 'info',
    audience_type: 'all',
    expires_at: ''
  });

  const isAdmin = user?.role === 'admin' || user?.role === 'system_admin';

  const load = async () => {
    const data = await api.announcements.list();
    setAnnouncements(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: number) => {
    if (confirm('Bu duyuruyu silmek istediğinize emin misiniz?')) {
      await api.announcements.delete(id);
      load();
    }
  };

  const handleCreate = async () => {
    await api.announcements.create({
      ...newAnnouncement,
      created_at: new Date().toISOString()
    });
    setOpen(false);
    toast({ title: "Duyuru oluşturuldu" });
    load();
  };

  if (loading) return <div className="p-8"><Loader2 className="animate-spin mx-auto" /></div>;

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">{t('common.announcements')}</h1>
        {isAdmin && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" /> Yeni Duyuru</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Yeni Duyuru Oluştur</DialogTitle>
                <DialogDescription>Tüm personele veya belirli rollere duyuru gönderin.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Başlık</label>
                  <Input value={newAnnouncement.title} onChange={e => setNewAnnouncement({...newAnnouncement, title: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Mesaj</label>
                  <Textarea value={newAnnouncement.message} onChange={e => setNewAnnouncement({...newAnnouncement, message: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tip</label>
                    <Select value={newAnnouncement.type} onValueChange={v => setNewAnnouncement({...newAnnouncement, type: v})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="info">Bilgi</SelectItem>
                        <SelectItem value="warning">Uyarı</SelectItem>
                        <SelectItem value="success">Başarı</SelectItem>
                        <SelectItem value="campaign">Kampanya</SelectItem>
                        <SelectItem value="target_info">Hedef Bilgisi</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Hedef Kitle</label>
                    <Select value={newAnnouncement.audience_type} onValueChange={v => setNewAnnouncement({...newAnnouncement, audience_type: v})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Herkes</SelectItem>
                        <SelectItem value="sales">Satış Ekibi</SelectItem>
                        <SelectItem value="manager">Yöneticiler</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                 <div className="space-y-2">
                  <label className="text-sm font-medium">Son Geçerlilik (Opsiyonel)</label>
                  <Input type="date" value={newAnnouncement.expires_at} onChange={e => setNewAnnouncement({...newAnnouncement, expires_at: e.target.value})} />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreate}>Yayınla</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-4">
        {announcements.map((ann) => (
          <Card key={ann.id} className={`border-l-4 ${
            ann.type === 'warning' ? 'border-l-yellow-500' : 
            ann.type === 'success' ? 'border-l-green-500' : 
            ann.type === 'campaign' ? 'border-l-purple-500' : 'border-l-blue-500'
          }`}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {ann.type === 'campaign' && <Megaphone className="h-4 w-4 text-purple-500" />}
                    {ann.title}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <span>{new Date(ann.created_at).toLocaleDateString('tr-TR')}</span>
                    {ann.expires_at && (
                        <span className="text-xs bg-muted px-1.5 py-0.5 rounded flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> Bitiş: {new Date(ann.expires_at).toLocaleDateString('tr-TR')}
                        </span>
                    )}
                  </CardDescription>
                </div>
                {isAdmin && (
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(ann.id)}>
                    <Trash className="h-4 w-4 text-red-500" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{ann.message}</p>
              <div className="mt-4">
                <Badge variant="outline" className="capitalize">{ann.type}</Badge>
                <Badge variant="secondary" className="ml-2 capitalize">{ann.audience_type === 'all' ? 'Tüm Personel' : ann.audience_type}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
