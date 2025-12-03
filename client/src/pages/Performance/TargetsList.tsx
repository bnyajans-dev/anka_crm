import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Save, Plus, Search } from 'lucide-react';
import { api, SalesTarget, User } from '@/lib/mockApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

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
  const { t } = useTranslation();
  const { toast } = useToast();
  const [targets, setTargets] = useState<SalesTarget[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editingTarget, setEditingTarget] = useState<SalesTarget | null>(null);

  const form = useForm<z.infer<typeof targetSchema>>({
    resolver: zodResolver(targetSchema),
    defaultValues: {
      period_type: 'month',
      period_year: new Date().getFullYear(),
      visit_target: 0,
      offer_target: 0,
      deal_target: 0,
      revenue_target: 0,
    },
  });

  useEffect(() => {
    const load = async () => {
      const [tData, uData] = await Promise.all([
        api.targets.list(),
        api.users.list()
      ]);
      setTargets(tData);
      setUsers(uData);
      setLoading(false);
    };
    load();
  }, []);

  const onSubmit = async (values: z.infer<typeof targetSchema>) => {
    try {
      if (editingTarget) {
        await api.targets.update(editingTarget.id, { ...values, user_id: parseInt(values.user_id) });
        toast({ title: "Target updated" });
      } else {
        await api.targets.create({ ...values, user_id: parseInt(values.user_id) });
        toast({ title: "Target created" });
      }
      setIsOpen(false);
      setEditingTarget(null);
      form.reset();
      const tData = await api.targets.list();
      setTargets(tData);
    } catch (error) {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  const openEdit = (target: SalesTarget) => {
    setEditingTarget(target);
    form.reset({
      user_id: target.user_id.toString(),
      period_type: target.period_type,
      period_year: target.period_year,
      period_month: target.period_month,
      visit_target: target.visit_target,
      offer_target: target.offer_target,
      deal_target: target.deal_target,
      revenue_target: target.revenue_target,
    });
    setIsOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Hedef Yönetimi</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingTarget(null); form.reset(); }}>
              <Plus className="mr-2 h-4 w-4" /> Yeni Hedef
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingTarget ? 'Hedefi Düzenle' : 'Yeni Hedef Ekle'}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="user_id" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kullanıcı</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Seçiniz" /></SelectTrigger></FormControl>
                      <SelectContent>{users.map(u => <SelectItem key={u.id} value={u.id.toString()}>{u.name}</SelectItem>)}</SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                
                <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="period_type" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Dönem Tipi</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent><SelectItem value="month">Aylık</SelectItem><SelectItem value="year">Yıllık</SelectItem></SelectContent>
                        </Select>
                    </FormItem>
                    )} />
                    <FormField control={form.control} name="period_month" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Ay</FormLabel>
                        <FormControl><Input type="number" min={1} max={12} {...field} /></FormControl>
                    </FormItem>
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
                        <FormItem><FormLabel>Satış Hedefi</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name="revenue_target" render={({ field }) => (
                        <FormItem><FormLabel>Ciro Hedefi</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>
                    )} />
                </div>

                <Button type="submit" className="w-full">Kaydet</Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kullanıcı</TableHead>
                <TableHead>Dönem</TableHead>
                <TableHead>Ziyaret</TableHead>
                <TableHead>Teklif</TableHead>
                <TableHead>Satış</TableHead>
                <TableHead>Ciro</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} className="text-center"><Loader2 className="animate-spin mx-auto" /></TableCell></TableRow>
              ) : (
                targets.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>{t.user_name}</TableCell>
                    <TableCell>{t.period_year} / {t.period_month || 'Tüm Yıl'}</TableCell>
                    <TableCell>{t.visit_target}</TableCell>
                    <TableCell>{t.offer_target}</TableCell>
                    <TableCell>{t.deal_target}</TableCell>
                    <TableCell>{t.revenue_target}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => openEdit(t)}>Düzenle</Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
