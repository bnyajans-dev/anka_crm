import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { File, Upload, Loader2, Trash2, Eye } from 'lucide-react';
import { api, Attachment } from '@/lib/mockApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface AttachmentsPanelProps {
  relatedType: 'school' | 'visit' | 'offer' | 'sale';
  relatedId: number;
}

export default function AttachmentsPanel({ relatedType, relatedId }: AttachmentsPanelProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const loadAttachments = async () => {
    try {
      const data = await api.attachments.list(relatedType, relatedId);
      setAttachments(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttachments();
  }, [relatedType, relatedId]);

  const handleUpload = async () => {
    setUploading(true);
    try {
      // Simulate file selection
      const fakeFile = {
        file_name: `Document-${Date.now()}.pdf`,
        type: 'document',
        related_type: relatedType,
        related_id: relatedId
      };
      await api.attachments.upload(fakeFile);
      toast({ title: "File uploaded successfully" });
      loadAttachments();
    } catch (error) {
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">{t('attachments.title')}</CardTitle>
        <Button size="sm" variant="outline" onClick={handleUpload} disabled={uploading}>
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
          {t('attachments.upload')}
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
        ) : attachments.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground py-4">{t('attachments.no_files')}</div>
        ) : (
          <div className="space-y-2">
            {attachments.map((file) => (
              <div key={file.id} className="flex items-center justify-between p-2 rounded-md border border-border/50 bg-muted/20">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center text-primary">
                    <File className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col truncate">
                    <span className="text-sm font-medium truncate">{file.file_name}</span>
                    <span className="text-xs text-muted-foreground">{new Date(file.uploaded_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" asChild>
                    <a href={file.file_url} target="_blank" rel="noopener noreferrer"><Eye className="h-4 w-4" /></a>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
