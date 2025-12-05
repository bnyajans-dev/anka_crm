import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Loader2, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api, Offer } from '@/lib/mockApi';
import { Button } from '@/components/ui/button';
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
import { useAuth } from '@/lib/auth';

export default function OffersList() {
  const { t } = useTranslation();
  const { user } = useAuth();
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

  const isLocked = (offer: Offer) => {
      if (!user) return false;
      const isOwner = offer.user_id === user.id;
      const isPast = offer.valid_until ? new Date(offer.valid_until) < new Date() : false;
      const isStatusLocked = ['accepted', 'rejected'].includes(offer.status);

      if (user.role === 'sales') {
          if (!isOwner || isPast || isStatusLocked) return true;
      }
      return false;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('offers.title')}</h1>
          <p className="text-muted-foreground">
            {t('offers.form_subtitle')}
          </p>
        </div>
        <Button asChild className="bg-primary hover:bg-primary/90">
          <Link to="/offers/new">
            <Plus className="mr-2 h-4 w-4" /> {t('offers.new_offer')}
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
                <TableHead>{t('offers.total_price')}</TableHead>
                <TableHead>{t('common.status')}</TableHead>
                <TableHead className="text-right">{t('common.actions')}</TableHead>
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
                    <TableCell>{offer.total_price} {offer.currency}</TableCell>
                    <TableCell>
                      <Badge variant={offer.status === 'accepted' ? 'default' : 'secondary'} className={offer.status === 'accepted' ? 'bg-green-500' : ''}>
                        {t(`offers.status_${offer.status}`)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild className="relative">
                        <Link to={`/offers/${offer.id}/edit`}>
                            {isLocked(offer) && <Lock className="h-3 w-3 mr-1 text-muted-foreground absolute -left-4" />}
                            {t('common.edit')}
                        </Link>
                      </Button>
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
