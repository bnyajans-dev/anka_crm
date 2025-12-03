import { useEffect, useState } from 'react';
import { api, AuditLog } from '@/lib/mockApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    api.auditLogs.list().then(data => {
        // Sort by date desc
        const sorted = data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setLogs(sorted);
        setFilteredLogs(sorted);
    });
  }, []);

  useEffect(() => {
      if (searchTerm) {
          setFilteredLogs(logs.filter(l => 
            l.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
            l.entity_type.toLowerCase().includes(searchTerm.toLowerCase())
          ));
      } else {
          setFilteredLogs(logs);
      }
  }, [searchTerm, logs]);

  return (
    <div className="space-y-6 animate-in fade-in">
      <h1 className="text-3xl font-bold tracking-tight">Denetim Günlüğü (Audit Logs)</h1>

      <div className="flex items-center space-x-2 max-w-md">
        <Search className="w-4 h-4 text-muted-foreground" />
        <Input 
            placeholder="Kullanıcı, işlem veya kayıt ara..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tarih</TableHead>
                <TableHead>Kullanıcı</TableHead>
                <TableHead>İşlem</TableHead>
                <TableHead>Kayıt Türü</TableHead>
                <TableHead>Kayıt ID</TableHead>
                <TableHead>Detaylar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{new Date(log.created_at).toLocaleString()}</TableCell>
                  <TableCell className="font-medium">{log.user_name}</TableCell>
                  <TableCell><Badge variant="outline">{log.action}</Badge></TableCell>
                  <TableCell className="capitalize">{log.entity_type}</TableCell>
                  <TableCell className="font-mono text-xs">{log.entity_id}</TableCell>
                  <TableCell className="text-xs max-w-[300px] truncate" title={log.changes}>{log.changes || '-'}</TableCell>
                </TableRow>
              ))}
              {filteredLogs.length === 0 && (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Kayıt bulunamadı.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
