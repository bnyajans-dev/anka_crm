import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Save } from 'lucide-react';
import { api, User } from '@/lib/mockApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const teamSchema = z.object({
  name: z.string().min(2),
  manager_id: z.string().optional(),
});

export default function TeamFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);

  const form = useForm<z.infer<typeof teamSchema>>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      name: '',
      manager_id: '',
    },
  });

  useEffect(() => {
    const load = async () => {
      const usersData = await api.users.list();
      setUsers(usersData);

      if (id) {
        const team = await api.teams.getById(parseInt(id));
        if (team) {
          form.reset({
            name: team.name,
            manager_id: team.manager_id?.toString() || '',
          });
        }
      }
      setLoading(false);
    };
    load();
  }, [id]);

  const onSubmit = async (values: z.infer<typeof teamSchema>) => {
    try {
      const data = {
        ...values,
        manager_id: values.manager_id ? parseInt(values.manager_id) : undefined,
      };

      if (id) {
        await api.teams.update(parseInt(id), data);
        toast({ title: "Takım güncellendi" });
      } else {
        await api.teams.create(data);
        toast({ title: "Takım oluşturuldu" });
      }
      navigate('/system/teams');
    } catch (error) {
      toast({ title: "Hata oluştu", variant: "destructive" });
    }
  };

  if (loading) return <div className="p-8"><Loader2 className="animate-spin mx-auto" /></div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in">
      <h1 className="text-3xl font-bold tracking-tight">{id ? 'Takım Düzenle' : 'Yeni Takım'}</h1>
      
      <Card>
        <CardHeader><CardTitle>Takım Bilgileri</CardTitle></CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Takım Adı</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              
              <FormField control={form.control} name="manager_id" render={({ field }) => (
                <FormItem>
                  <FormLabel>Yönetici (Opsiyonel)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Yönetici Seçiniz" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {users.map(u => <SelectItem key={u.id} value={u.id.toString()}>{u.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <Button type="submit" disabled={form.formState.isSubmitting} className="w-full">
                {form.formState.isSubmitting ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2 h-4 w-4" />}
                Kaydet
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
