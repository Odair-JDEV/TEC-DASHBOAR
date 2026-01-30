import { useAppStore } from '@/lib/store';
import { ViewModeBox } from './ViewModeBox';
import { FileText, Copy, Check } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const formatTeamName = (box: { team: { members: { name: string }[] } | null }): string => {
  if (!box.team || box.team.members.length === 0) {
    return '';
  }
  
  const names = box.team.members.map(m => m.name);
  if (names.length === 1) {
    return names[0];
  }
  if (names.length === 2) {
    return `${names[0]} E ${names[1]}`;
  }
  if (names.length === 3) {
    return `${names[0]}, ${names[1]} E ${names[2]}`;
  }
  return names.join(', ');
};

const formatStatusText = (status?: string, completedAt?: string): string => {
  if (!status || status === 'pendente') return '';
  return ` - ${status} às ${completedAt || ''}`;
};

export const ScheduleViewer = () => {
  const { currentSchedule } = useAppStore();
  const [copied, setCopied] = useState(false);

  if (!currentSchedule) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">
            Selecione uma agenda para visualizar
          </p>
        </div>
      </div>
    );
  }

  const handleCopyWithStatus = async () => {
    const dateFormatted = format(parseISO(currentSchedule.date), 'dd/MM/yyyy', { locale: ptBR });
    
    let output = `Serviços da Agenda: ${dateFormatted} - TURNO: ${currentSchedule.shift}\n`;
    output += '-'.repeat(57) + '\n';
    
    for (const box of currentSchedule.boxes) {
      const teamName = formatTeamName(box);
      const boxLabel = `(CAIXA - ${String(box.number).padStart(2, '0')})`;
      const status = box.status ? ` ${box.status}` : '';
      
      if (teamName) {
        output += `${teamName}: ${boxLabel}${status}\n`;
      } else {
        output += `${boxLabel}${status}\n`;
      }
      
      if (box.services.length === 0) {
        output += '- VAZIA\n';
      } else {
        for (const service of box.services) {
          const statusText = formatStatusText(service.status, service.completedAt);
          output += `- ${service.osNumber} (${service.type})${statusText}\n`;
        }
      }
      
      output += '-'.repeat(57) + '\n';
    }

    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      toast.success('Agenda com status copiada!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Erro ao copiar');
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
            <span className="ml-2 text-accent">• Modo Visualização</span>
          </p>
        </div>
        <Button onClick={handleCopyWithStatus} className="glow-primary">
          {copied ? (
            <Check className="w-4 h-4 mr-2" />
          ) : (
            <Copy className="w-4 h-4 mr-2" />
          )}
          {copied ? 'Copiado!' : 'Copiar com Status'}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {currentSchedule.boxes.map((box) => (
            <ViewModeBox
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
