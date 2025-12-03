import { useEffect, useState } from 'react';
import { api, Commission } from '@/lib/mockApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default function CommissionsPage() {
  const [commissions, setCommissions] = useState<Commission[]>([]);

  useEffect(() => {
    api.commissions.list().then(setCommissions);
  }, []);

  const totalCommission = commissions.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex justify-between items-end">
        <h1 className="text-3xl font-bold tracking-tight">Commissions</h1>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4 py-2">
            <span className="text-xs text-green-600 font-medium uppercase">Total Earnings</span>
            <div className="text-2xl font-bold text-green-700">{totalCommission.toLocaleString()} ₺</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {commissions.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>{c.date}</TableCell>
                  <TableCell><Badge variant="outline" className="capitalize">{c.source_type}</Badge></TableCell>
                  <TableCell>{c.description}</TableCell>
                  <TableCell className="text-right font-medium text-green-600">+{c.amount} {c.currency}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
