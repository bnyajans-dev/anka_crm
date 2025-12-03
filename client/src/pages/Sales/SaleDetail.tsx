import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { ArrowLeft, Plus, Edit2, Trash2, Receipt, TrendingUp, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth';
import { api, type Expense, type ExpenseCategory, type ExpensePaymentStatus, type SaleWithProfitability } from '@/lib/mockApi';

const EXPENSE_CATEGORIES: { value: ExpenseCategory; label: string }[] = [
  { value: 'accommodation', label: 'Konaklama' },
  { value: 'transportation', label: 'Ulaşım' },
  { value: 'meals', label: 'Yemek' },
  { value: 'guide_fees', label: 'Rehber Ücreti' },
  { value: 'entrance_fees', label: 'Giriş Ücretleri' },
  { value: 'insurance', label: 'Sigorta' },
  { value: 'marketing', label: 'Pazarlama' },
  { value: 'other', label: 'Diğer' },
];

const PAYMENT_STATUSES: { value: ExpensePaymentStatus; label: string; variant: 'default' | 'secondary' | 'destructive' }[] = [
  { value: 'pending', label: 'Beklemede', variant: 'secondary' },
  { value: 'paid', label: 'Ödendi', variant: 'default' },
  { value: 'cancelled', label: 'İptal', variant: 'destructive' },
];

export default function SaleDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deleteExpenseId, setDeleteExpenseId] = useState<number | null>(null);
  
  const [expenseForm, setExpenseForm] = useState({
    category: 'other' as ExpenseCategory,
    description: '',
    amount: '',
    currency: 'TRY',
    date: format(new Date(), 'yyyy-MM-dd'),
    payment_status: 'pending' as ExpensePaymentStatus,
  });

  const canManageExpenses = user?.role === 'system_admin' || user?.role === 'admin' || user?.can_manage_expenses;

  const { data: saleData, isLoading, error } = useQuery({
    queryKey: ['sale-profitability', id],
    queryFn: () => api.expenses.getSaleWithProfitability(Number(id)),
    enabled: !!id,
  });

  const createExpenseMutation = useMutation({
    mutationFn: async (data: typeof expenseForm) => {
      return api.expenses.create({
        sale_id: Number(id),
        category: data.category,
        description: data.description,
        amount: parseFloat(data.amount),
        currency: data.currency,
        date: data.date,
        payment_status: data.payment_status,
        created_by_user_id: user?.id || 1,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sale-profitability', id] });
      setIsExpenseDialogOpen(false);
      resetExpenseForm();
      toast({ title: 'Gider başarıyla eklendi' });
    },
    onError: () => {
      toast({ title: 'Hata', description: 'Gider eklenirken bir hata oluştu', variant: 'destructive' });
    },
  });

  const updateExpenseMutation = useMutation({
    mutationFn: async (data: { id: number; updates: Partial<Expense> }) => {
      return api.expenses.update(data.id, data.updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sale-profitability', id] });
      setIsExpenseDialogOpen(false);
      setEditingExpense(null);
      resetExpenseForm();
      toast({ title: 'Gider başarıyla güncellendi' });
    },
    onError: () => {
      toast({ title: 'Hata', description: 'Gider güncellenirken bir hata oluştu', variant: 'destructive' });
    },
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: async (expenseId: number) => {
      return api.expenses.delete(expenseId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sale-profitability', id] });
      setDeleteExpenseId(null);
      toast({ title: 'Gider başarıyla silindi' });
    },
    onError: () => {
      toast({ title: 'Hata', description: 'Gider silinirken bir hata oluştu', variant: 'destructive' });
    },
  });

  const resetExpenseForm = () => {
    setExpenseForm({
      category: 'other',
      description: '',
      amount: '',
      currency: 'TRY',
      date: format(new Date(), 'yyyy-MM-dd'),
      payment_status: 'pending',
    });
  };

  const handleOpenExpenseDialog = (expense?: Expense) => {
    if (expense) {
      setEditingExpense(expense);
      setExpenseForm({
        category: expense.category,
        description: expense.description,
        amount: String(expense.amount),
        currency: expense.currency,
        date: expense.date.split('T')[0],
        payment_status: expense.payment_status,
      });
    } else {
      setEditingExpense(null);
      resetExpenseForm();
    }
    setIsExpenseDialogOpen(true);
  };

  const handleSubmitExpense = () => {
    if (!expenseForm.description || !expenseForm.amount) {
      toast({ title: 'Hata', description: 'Lütfen gerekli alanları doldurun', variant: 'destructive' });
      return;
    }

    if (editingExpense) {
      updateExpenseMutation.mutate({
        id: editingExpense.id,
        updates: {
          category: expenseForm.category,
          description: expenseForm.description,
          amount: parseFloat(expenseForm.amount),
          currency: expenseForm.currency,
          date: expenseForm.date,
          payment_status: expenseForm.payment_status,
        },
      });
    } else {
      createExpenseMutation.mutate(expenseForm);
    }
  };

  const getCategoryLabel = (category: ExpenseCategory) => {
    return EXPENSE_CATEGORIES.find(c => c.value === category)?.label || category;
  };

  const getPaymentStatusBadge = (status: ExpensePaymentStatus) => {
    const statusInfo = PAYMENT_STATUSES.find(s => s.value === status);
    return (
      <Badge variant={statusInfo?.variant || 'secondary'} data-testid={`status-badge-${status}`}>
        {statusInfo?.label || status}
      </Badge>
    );
  };

  const formatCurrency = (amount: number, currency: string = 'TRY') => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !saleData) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Satış bulunamadı veya yüklenirken bir hata oluştu.</AlertDescription>
        </Alert>
        <Button variant="ghost" onClick={() => navigate('/sales')} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Satışlara Dön
        </Button>
      </div>
    );
  }

  const sale = saleData;

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/sales')} data-testid="button-back">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-sale-title">
            {sale.offer_tour_name || 'Satış'} - {sale.school_name}
          </h1>
          <p className="text-muted-foreground" data-testid="text-sale-date">
            Kapanış: {format(new Date(sale.closed_date), 'dd MMMM yyyy', { locale: tr })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Toplam Gelir</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600" data-testid="text-total-revenue">
              {formatCurrency(sale.final_revenue_amount, sale.currency)}
            </div>
          </CardContent>
        </Card>

        {canManageExpenses && (
          <>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Toplam Gider</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600" data-testid="text-total-expenses">
                  {formatCurrency(sale.total_expenses, sale.currency)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Kâr</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${sale.profit >= 0 ? 'text-green-600' : 'text-red-600'}`} data-testid="text-profit">
                  {formatCurrency(sale.profit, sale.currency)}
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                  <TrendingUp className="h-4 w-4" />
                  <span data-testid="text-profit-margin">Kâr Marjı: %{sale.profit_margin.toFixed(1)}</span>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <Tabs defaultValue="details" className="w-full">
        <TabsList>
          <TabsTrigger value="details" data-testid="tab-details">Detaylar</TabsTrigger>
          {canManageExpenses && (
            <TabsTrigger value="expenses" data-testid="tab-expenses">
              <Receipt className="h-4 w-4 mr-2" />
              Giderler ({sale.expenses.length})
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="details" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Satış Bilgileri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Okul</Label>
                  <p className="font-medium" data-testid="text-school-name">{sale.school_name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Tur</Label>
                  <p className="font-medium" data-testid="text-tour-name">{sale.offer_tour_name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Satışı Kapatan</Label>
                  <p className="font-medium" data-testid="text-closed-by">{sale.user_name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Ödeme Durumu</Label>
                  <div className="mt-1">
                    <Badge 
                      variant={sale.payment_status === 'paid' ? 'default' : sale.payment_status === 'cancelled' ? 'destructive' : 'secondary'}
                      data-testid="status-payment"
                    >
                      {sale.payment_status === 'paid' ? 'Ödendi' : 
                       sale.payment_status === 'cancelled' ? 'İptal' : 
                       sale.payment_status === 'partial' ? 'Kısmi Ödeme' : 'Beklemede'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {canManageExpenses && (
          <TabsContent value="expenses" className="mt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Giderler</CardTitle>
                  <CardDescription>Bu satışa ait tüm giderleri yönetin</CardDescription>
                </div>
                <Button onClick={() => handleOpenExpenseDialog()} data-testid="button-add-expense">
                  <Plus className="h-4 w-4 mr-2" /> Gider Ekle
                </Button>
              </CardHeader>
              <CardContent>
                {sale.expenses.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Henüz gider kaydı bulunmamaktadır.</p>
                    <Button variant="outline" className="mt-4" onClick={() => handleOpenExpenseDialog()}>
                      <Plus className="h-4 w-4 mr-2" /> İlk Gideri Ekle
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Kategori</TableHead>
                        <TableHead>Açıklama</TableHead>
                        <TableHead>Tarih</TableHead>
                        <TableHead>Tutar</TableHead>
                        <TableHead>Durum</TableHead>
                        <TableHead className="text-right">İşlemler</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sale.expenses.map((expense) => (
                        <TableRow key={expense.id} data-testid={`row-expense-${expense.id}`}>
                          <TableCell>{getCategoryLabel(expense.category)}</TableCell>
                          <TableCell>{expense.description}</TableCell>
                          <TableCell>{format(new Date(expense.date), 'dd.MM.yyyy')}</TableCell>
                          <TableCell className="font-medium">{formatCurrency(expense.amount, expense.currency)}</TableCell>
                          <TableCell>{getPaymentStatusBadge(expense.payment_status)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleOpenExpenseDialog(expense)}
                                data-testid={`button-edit-expense-${expense.id}`}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="text-destructive hover:text-destructive"
                                onClick={() => setDeleteExpenseId(expense.id)}
                                data-testid={`button-delete-expense-${expense.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingExpense ? 'Gideri Düzenle' : 'Yeni Gider Ekle'}</DialogTitle>
            <DialogDescription>
              Satış ile ilgili gider bilgilerini girin.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Kategori</Label>
                <Select
                  value={expenseForm.category}
                  onValueChange={(value: ExpenseCategory) => setExpenseForm({ ...expenseForm, category: value })}
                >
                  <SelectTrigger id="category" data-testid="select-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPENSE_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment_status">Ödeme Durumu</Label>
                <Select
                  value={expenseForm.payment_status}
                  onValueChange={(value: ExpensePaymentStatus) => setExpenseForm({ ...expenseForm, payment_status: value })}
                >
                  <SelectTrigger id="payment_status" data-testid="select-payment-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_STATUSES.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Açıklama</Label>
              <Textarea
                id="description"
                value={expenseForm.description}
                onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                placeholder="Gider açıklaması..."
                data-testid="input-description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Tutar</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                  placeholder="0.00"
                  data-testid="input-amount"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Tarih</Label>
                <Input
                  id="date"
                  type="date"
                  value={expenseForm.date}
                  onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                  data-testid="input-date"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsExpenseDialogOpen(false)} data-testid="button-cancel">
              İptal
            </Button>
            <Button 
              onClick={handleSubmitExpense} 
              disabled={createExpenseMutation.isPending || updateExpenseMutation.isPending}
              data-testid="button-save-expense"
            >
              {(createExpenseMutation.isPending || updateExpenseMutation.isPending) ? 'Kaydediliyor...' : 'Kaydet'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteExpenseId !== null} onOpenChange={() => setDeleteExpenseId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gideri Sil</DialogTitle>
            <DialogDescription>
              Bu gideri silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteExpenseId(null)} data-testid="button-cancel-delete">
              İptal
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => deleteExpenseId && deleteExpenseMutation.mutate(deleteExpenseId)}
              disabled={deleteExpenseMutation.isPending}
              data-testid="button-confirm-delete"
            >
              {deleteExpenseMutation.isPending ? 'Siliniyor...' : 'Sil'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
