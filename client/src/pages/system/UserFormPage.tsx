import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Save } from 'lucide-react';
import { api, User } from '@/lib/mockApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const userSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  role: z.enum(['system_admin', 'admin', 'manager', 'sales']),
  team_id: z.string().optional(),
  region: z.string().optional(),
  is_active: z.boolean().default(true),
});

export default function UserFormPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState<any[]>([]);

  const form = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: '',
      email: '',
      role: 'sales',
      team_id: '',
      region: '',
      is_active: true,
    },
  });
  
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);

  // Flattened list of districts for simple selection
  const allDistricts = [
    // Istanbul
    'Fatih', 'Kadıköy', 'Üsküdar', 'Kartal', 'Pendik', 'Beşiktaş', 'Bakırköy', 'Zeytinburnu',
    // Ankara
    'Çankaya', 'Keçiören', 'Yenimahalle',
    // Izmir
    'Konak', 'Bornova', 'Karşıyaka'
  ];

  const toggleDistrict = (district: string) => {
      if (selectedDistricts.includes(district)) {
          setSelectedDistricts(selectedDistricts.filter(d => d !== district));
      } else {
          setSelectedDistricts([...selectedDistricts, district]);
      }
  };

  useEffect(() => {
    const load = async () => {
      const teamsData = await api.teams.list();
      setTeams(teamsData);

      if (id) {
        const user = await api.users.getById(parseInt(id));
        if (user) {
          form.reset({
            name: user.name,
            email: user.email,
            role: user.role,
            team_id: user.team_id?.toString() || '',
            region: user.region || '',
            is_active: user.is_active,
          });
          if (user.districts) setSelectedDistricts(user.districts);
        }
      }
      setLoading(false);
    };
    load();
  }, [id]);

  const onSubmit = async (values: z.infer<typeof userSchema>) => {
    try {
      const data = {
        ...values,
        team_id: values.team_id ? parseInt(values.team_id) : undefined,
        districts: selectedDistricts
      };

      if (id) {
        await api.users.update(parseInt(id), data);
        toast({ title: t('users.success_update') });
      } else {
        await api.users.create(data);
        toast({ title: t('users.success_add') });
      }
      navigate('/system/users');
    } catch (error) {
      toast({ title: t('common.error'), variant: "destructive" });
    }
  };

  if (loading) return <div className="p-8"><Loader2 className="animate-spin mx-auto" /></div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in">
      <h1 className="text-3xl font-bold tracking-tight">{id ? t('users.edit_user') : t('users.new_user')}</h1>
      
      <Card>
        <CardHeader><CardTitle>{t('users.form_title')}</CardTitle></CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>{t('users.full_name')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem><FormLabel>{t('common.email')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="role" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('common.role')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="sales">{t('users.role_sales')}</SelectItem>
                        <SelectItem value="manager">{t('users.role_manager')}</SelectItem>
                        <SelectItem value="admin">{t('users.role_admin')}</SelectItem>
                        <SelectItem value="system_admin">{t('users.role_system_admin')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="team_id" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('common.team')} ({t('common.optional')})</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder={t('users.select_team')} /></SelectTrigger></FormControl>
                      <SelectContent>
                        {teams.map(tm => <SelectItem key={tm.id} value={tm.id.toString()}>{tm.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="region" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('common.region')} ({t('common.optional')})</FormLabel>
                  <FormControl><Input {...field} placeholder={t('users.region_placeholder')} /></FormControl>
                  <FormDescription>{t('users.region_description')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />

              <FormItem>
                  <FormLabel>{t('users.assigned_districts')}</FormLabel>
                  <div className="grid grid-cols-3 gap-2 border p-4 rounded-md max-h-[200px] overflow-y-auto">
                      {allDistricts.map(district => (
                          <div key={district} className="flex items-center space-x-2">
                              <Checkbox 
                                  id={`district-${district}`} 
                                  checked={selectedDistricts.includes(district)}
                                  onCheckedChange={() => toggleDistrict(district)}
                              />
                              <label htmlFor={`district-${district}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                                  {district}
                              </label>
                          </div>
                      ))}
                  </div>
                  <FormDescription>{t('users.districts_description')}</FormDescription>
              </FormItem>

              <FormField control={form.control} name="is_active" render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>{t('users.active_user')}</FormLabel>
                    <FormDescription>{t('users.active_user_description')}</FormDescription>
                  </div>
                </FormItem>
              )} />

              <Button type="submit" disabled={form.formState.isSubmitting} className="w-full">
                {form.formState.isSubmitting ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2 h-4 w-4" />}
                {t('common.save')}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
