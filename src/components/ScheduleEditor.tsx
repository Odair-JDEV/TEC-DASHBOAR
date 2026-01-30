import { useAppStore } from '@/lib/store';
import { ServiceBoxCard } from './ServiceBox';
import { Button } from '@/components/ui/button';
import { formatScheduleText, copyToClipboard } from '@/lib/formatSchedule';
import { Plus, Copy, FileText, Check } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState } from 'react';
import { toast } from 'sonner';

export const ScheduleEditor = () => {
  const { currentSchedule, addBox } = useAppStore();
  const [copied, setCopied] = useState(false);

  if (!currentSchedule) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">
            Selecione ou crie uma agenda para começar
          </p>
        </div>
      </div>
    );
  }

  const handleCopy = async () => {
    const text = formatScheduleText(currentSchedule);
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      toast.success('Agenda copiada para a área de transferência!');
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error('Erro ao copiar agenda');
    }
  };

  const dateFormatted = format(parseISO(currentSchedule.date), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR });

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-border/50 bg-card/50">
        <div>
          <h2 className="text-lg font-bold text-foreground capitalize">
            {dateFormatted}
          </h2>
          <p className="text-sm text-muted-foreground">
            Turno: <span className="text-primary font-medium">{currentSchedule.shift}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => addBox(currentSchedule.id)}
            className="bg-secondary/50 border-border/50 hover:bg-secondary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Caixa
          </Button>
          <Button onClick={handleCopy} className="glow-primary">
            {copied ? (
              <Check className="w-4 h-4 mr-2" />
            ) : (
              <Copy className="w-4 h-4 mr-2" />
            )}
            {copied ? 'Copiado!' : 'Copiar Agenda'}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {currentSchedule.boxes.map((box) => (
            <ServiceBoxCard 
              key={box.id} 
              box={box} 
              scheduleId={currentSchedule.id} 
            />
          ))}
        </div>
      </div>
    </div>
  );
};
