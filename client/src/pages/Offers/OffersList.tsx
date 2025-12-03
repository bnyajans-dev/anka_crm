import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api, Offer } from '@/lib/mockApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

export default function OffersList() {
  const { t } = useTranslation();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.offers.list();
        setOffers(data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('offers.title')}</h1>
        </div>
        <Button asChild>
          <Link to="/offers/new">
            <Plus className="mr-2 h-4 w-4" />
            {t('offers.new_offer')}
          </Link>
        </Button>
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('visits.school')}</TableHead>
                <TableHead>{t('offers.tour_name')}</TableHead>
                <TableHead>{t('offers.student_count')}</TableHead>
                <TableHead>{t('offers.total_price')}</TableHead>
                <TableHead>{t('common.status')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center h-24"><Loader2 className="animate-spin mx-auto" /></TableCell></TableRow>
              ) : (
                offers.map((offer) => (
                  <TableRow key={offer.id}>
                    <TableCell className="font-medium">{offer.school_name}</TableCell>
                    <TableCell>{offer.tour_name}</TableCell>
                    <TableCell>{offer.student_count}</TableCell>
                    <TableCell>{offer.total_price} {offer.currency}</TableCell>
                    <TableCell><Badge variant="outline">{offer.status}</Badge></TableCell>
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
