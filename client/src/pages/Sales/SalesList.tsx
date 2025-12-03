import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api, Sale } from '@/lib/mockApi';
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

export default function SalesList() {
  const { t } = useTranslation();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.sales.list();
        setSales(data);
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
          <h1 className="text-3xl font-bold tracking-tight">{t('sales.title')}</h1>
        </div>
        {/* Typically sales are created from accepted offers, but for CRUD completeness we might have a button */}
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('visits.school')}</TableHead>
                <TableHead>{t('offers.tour_name')}</TableHead>
                <TableHead>{t('common.date')}</TableHead>
                <TableHead>{t('sales.revenue')}</TableHead>
                <TableHead>{t('sales.payment_status')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center h-24"><Loader2 className="animate-spin mx-auto" /></TableCell></TableRow>
              ) : (
                sales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="font-medium">{sale.school_name}</TableCell>
                    <TableCell>{sale.offer_tour_name}</TableCell>
                    <TableCell>{sale.closed_date}</TableCell>
                    <TableCell>{sale.final_revenue_amount} {sale.currency}</TableCell>
                    <TableCell>
                      <Badge className={sale.payment_status === 'paid' ? 'bg-green-500' : 'bg-yellow-500'}>
                        {sale.payment_status}
                      </Badge>
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
