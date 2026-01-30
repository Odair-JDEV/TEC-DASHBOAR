import { useAppStore } from '@/lib/store';
import { formatScheduleText, copyToClipboard } from '@/lib/formatSchedule';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Eye, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export const PreviewModal = () => {
  const { currentSchedule } = useAppStore();
  const [copied, setCopied] = useState(false);

  if (!currentSchedule) return null;

  const previewText = formatScheduleText(currentSchedule);

  const handleCopy = async () => {
    const success = await copyToClipboard(previewText);
    if (success) {
      setCopied(true);
      toast.success('Agenda copiada!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-secondary/50 border-border/50">
          <Eye className="w-4 h-4 mr-2" />
          Preview
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Preview da Agenda</span>
            <Button onClick={handleCopy} size="sm" variant="outline">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </DialogTitle>
        </DialogHeader>
        <pre className="bg-background p-4 rounded-lg font-mono text-sm whitespace-pre-wrap text-foreground overflow-auto max-h-96">
          {previewText}
        </pre>
      </DialogContent>
    </Dialog>
  );
};
