import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, Filter, Eye, Receipt } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { api, Sale } from '@/lib/mockApi';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function SalesList() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sales, setSales] = useState<Sale[]>([]);
  const [filteredSales, setFilteredSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [sourceFilter, setSourceFilter] = useState('all');
  
  const canManageExpenses = user?.role === 'system_admin' || user?.role === 'admin' || user?.can_manage_expenses;

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.sales.list();
        setSales(data);
        setFilteredSales(data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (sourceFilter === 'all') {
        setFilteredSales(sales);
    } else if (sourceFilter === 'offer') {
        setFilteredSales(sales.filter(s => s.created_from_offer));
    } else if (sourceFilter === 'manual') {
        setFilteredSales(sales.filter(s => !s.created_from_offer));
    }
  }, [sourceFilter, sales]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('sales.title')}</h1>
        </div>
        <div className="flex items-center gap-2">
             <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className="w-[180px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Filter Source" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Sources</SelectItem>
                    <SelectItem value="offer">From Offers</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                </SelectContent>
             </Select>
        </div>
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
                <TableHead>Kaynak</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} className="text-center h-24"><Loader2 className="animate-spin mx-auto" /></TableCell></TableRow>
              ) : filteredSales.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center h-24 text-muted-foreground">Satış kaydı bulunamadı.</TableCell></TableRow>
              ) : (
                filteredSales.map((sale) => (
                  <TableRow 
                    key={sale.id} 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate(`/sales/${sale.id}`)}
                    data-testid={`row-sale-${sale.id}`}
                  >
                    <TableCell className="font-medium">{sale.school_name}</TableCell>
                    <TableCell>{sale.offer_tour_name}</TableCell>
                    <TableCell>{sale.closed_date}</TableCell>
                    <TableCell className="font-semibold">{sale.final_revenue_amount.toLocaleString('tr-TR')} {sale.currency}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={sale.payment_status === 'paid' ? 'default' : sale.payment_status === 'cancelled' ? 'destructive' : 'secondary'}
                        data-testid={`status-payment-${sale.id}`}
                      >
                        {sale.payment_status === 'paid' ? 'Ödendi' : 
                         sale.payment_status === 'cancelled' ? 'İptal' : 
                         sale.payment_status === 'partial' ? 'Kısmi' : 'Beklemede'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                        {sale.created_from_offer ? (
                            <Badge variant="secondary" className="text-[10px]">Teklif</Badge>
                        ) : (
                            <Badge variant="outline" className="text-[10px]">Manuel</Badge>
                        )}
                    </TableCell>
                    <TableCell className="text-right">
                      <TooltipProvider>
                        <div className="flex justify-end gap-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={(e) => { e.stopPropagation(); navigate(`/sales/${sale.id}`); }}
                                data-testid={`button-view-${sale.id}`}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Detayları Gör</TooltipContent>
                          </Tooltip>
                          {canManageExpenses && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={(e) => { e.stopPropagation(); navigate(`/sales/${sale.id}?tab=expenses`); }}
                                  data-testid={`button-expenses-${sale.id}`}
                                >
                                  <Receipt className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Giderleri Yönet</TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </TooltipProvider>
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
