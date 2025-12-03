import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Plus, Search, User as UserIcon } from 'lucide-react';
import { api, SalesTarget, User } from '@/lib/mockApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

const targetSchema = z.object({
  user_id: z.string(),
  period_type: z.enum(['month', 'year']),
  period_year: z.coerce.number().min(2023),
  period_month: z.coerce.number().min(1).max(12).optional(),
  visit_target: z.coerce.number().min(0),
  offer_target: z.coerce.number().min(0),
  deal_target: z.coerce.number().min(0),
  revenue_target: z.coerce.number().min(0),
});

export default function TargetsList() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [targets, setTargets] = useState<SalesTarget[]>([]);
  const [loading, setLoading] = useState(true);

  const form = useForm<z.infer<typeof targetSchema>>({
    resolver: zodResolver(targetSchema),
    defaultValues: {
      user_id: '',
      period_type: 'month',
      period_year: new Date().getFullYear(),
      period_month: new Date().getMonth() + 1,
      visit_target: 0,
      offer_target: 0,
      deal_target: 0,
      revenue_target: 0,
    },
  });

  useEffect(() => {
    const load = async () => {
      const uData = await api.users.list();
      setUsers(uData.filter(u => u.role === 'sales')); // Only show sales users
      setLoading(false);
    };
    load();
  }, []);

  const loadUserTargets = async (userId: number) => {
      const tData = await api.targets.list(userId);
      setTargets(tData);
  };

  const handleUserSelect = (user: User) => {
      setSelectedUser(user);
      form.setValue('user_id', user.id.toString());
      loadUserTargets(user.id);
  };

  const onSubmit = async (values: z.infer<typeof targetSchema>) => {
    try {
      await api.targets.create({ ...values, user_id: parseInt(values.user_id) });
      toast({ title: "Hedef kaydedildi" });
      if (selectedUser) loadUserTargets(selectedUser.id);
    } catch (error) {
      toast({ title: "Hata", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in h-[calc(100vh-100px)] flex flex-col">
      <h1 className="text-3xl font-bold tracking-tight">Hedef Yönetimi</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Left Column: User List */}
        <Card className="md:col-span-1 flex flex-col overflow-hidden">
            <CardHeader className="pb-3 border-b"><CardTitle className="text-base">Satış Personeli</CardTitle></CardHeader>
            <div className="p-2">
                <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Ara..." className="pl-8" />
                </div>
            </div>
            <CardContent className="p-0 overflow-auto flex-1">
                <div className="flex flex-col">
                    {users.map(user => (
                        <button
                            key={user.id}
                            onClick={() => handleUserSelect(user)}
                            className={`flex items-center gap-3 p-3 text-left hover:bg-accent transition-colors border-b last:border-0 ${selectedUser?.id === user.id ? 'bg-accent' : ''}`}
                        >
                            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                <UserIcon className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <div className="font-medium truncate">{user.name}</div>
                                <div className="text-xs text-muted-foreground flex items-center gap-2">
                                    <Badge variant="outline" className="text-[10px] h-5 px-1">{user.role}</Badge>
                                    {user.team_name && <span className="truncate">{user.team_name}</span>}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </CardContent>
        </Card>

        {/* Right Column: Target Form & History */}
        <div className="md:col-span-2 space-y-6 overflow-auto">
            {selectedUser ? (
                <>
                    <Card>
                        <CardHeader><CardTitle>{selectedUser.name} - Yeni Hedef Ekle</CardTitle></CardHeader>
                        <CardContent>
                            <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <input type="hidden" {...form.register('user_id')} />
                                
                                <div className="grid grid-cols-3 gap-4">
                                    <FormField control={form.control} name="period_type" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Dönem</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                        <SelectContent><SelectItem value="month">Aylık</SelectItem><SelectItem value="year">Yıllık</SelectItem></SelectContent>
                                        </Select>
                                    </FormItem>
                                    )} />
                                    <FormField control={form.control} name="period_year" render={({ field }) => (
                                    <FormItem><FormLabel>Yıl</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>
                                    )} />
                                    <FormField control={form.control} name="period_month" render={({ field }) => (
                                    <FormItem><FormLabel>Ay</FormLabel><FormControl><Input type="number" min={1} max={12} {...field} /></FormControl></FormItem>
                                    )} />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField control={form.control} name="visit_target" render={({ field }) => (
                                        <FormItem><FormLabel>Ziyaret Hedefi</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>
                                    )} />
                                    <FormField control={form.control} name="offer_target" render={({ field }) => (
                                        <FormItem><FormLabel>Teklif Hedefi</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>
                                    )} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField control={form.control} name="deal_target" render={({ field }) => (
                                        <FormItem><FormLabel>Satış Hedefi (Adet)</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>
                                    )} />
                                    <FormField control={form.control} name="revenue_target" render={({ field }) => (
                                        <FormItem><FormLabel>Ciro Hedefi (Tutar)</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>
                                    )} />
                                </div>

                                <Button type="submit" className="w-full">Kaydet</Button>
                            </form>
                            </Form>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>Hedef Geçmişi</CardTitle></CardHeader>
                        <CardContent>
                            {targets.length === 0 ? <p className="text-muted-foreground">Kayıtlı hedef bulunamadı.</p> : (
                                <div className="space-y-2">
                                    {targets.map(t => (
                                        <div key={t.id} className="flex items-center justify-between p-3 border rounded bg-muted/20">
                                            <div className="font-medium">
                                                {t.period_year} / {t.period_type === 'month' ? t.period_month : 'Tüm Yıl'}
                                            </div>
                                            <div className="text-sm flex gap-4">
                                                <span>Ciro: <b>{t.revenue_target.toLocaleString()}</b></span>
                                                <span>Satış: <b>{t.deal_target}</b></span>
                                                <span>Ziyaret: <b>{t.visit_target}</b></span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </>
            ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
                    Soldan bir personel seçiniz.
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
