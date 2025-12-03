import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search, MoreHorizontal, Loader2, Pencil, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api, Visit } from '@/lib/mockApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function VisitsList() {
  const { t } = useTranslation();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.visits.list();
        setVisits(data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'done': return <Badge className="bg-green-500">{t('visits.status_done')}</Badge>;
      case 'cancelled': return <Badge variant="destructive">{t('visits.status_cancelled')}</Badge>;
      default: return <Badge variant="secondary">{t('visits.status_planned')}</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('visits.title')}</h1>
        </div>
        <Button asChild>
          <Link to="/visits/new">
            <Plus className="mr-2 h-4 w-4" />
            {t('visits.new_visit')}
          </Link>
        </Button>
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('common.search')}
              className="pl-9 max-w-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>{t('visits.visit_date')}</TableHead>
                  <TableHead>{t('visits.school')}</TableHead>
                  <TableHead>{t('common.user')}</TableHead>
                  <TableHead>{t('common.status')}</TableHead>
                  <TableHead>{t('visits.notes')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={5} className="text-center h-24"><Loader2 className="animate-spin mx-auto" /></TableCell></TableRow>
                ) : (
                  visits.map((visit) => (
                    <TableRow key={visit.id}>
                      <TableCell>{new Date(visit.visit_date).toLocaleDateString()}</TableCell>
                      <TableCell className="font-medium">{visit.school_name}</TableCell>
                      <TableCell>{visit.user_name}</TableCell>
                      <TableCell>{getStatusBadge(visit.status)}</TableCell>
                      <TableCell className="truncate max-w-[200px]">{visit.notes}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
