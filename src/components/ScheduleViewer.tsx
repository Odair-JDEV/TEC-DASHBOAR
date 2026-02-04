import { useAppStore } from '@/lib/store';
import { ViewModeBox } from './ViewModeBox';
import { FileText, Copy, Check, Sun, Moon } from 'lucide-react';

import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
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
  const { currentSchedule, schedules, setCurrentSchedule } = useAppStore();
  const [copied, setCopied] = useState(false);

  const handleToggleShift = () => {
    if (!currentSchedule) return;

    const targetShift = currentSchedule.shift === 'MANHÃ' ? 'TARDE' : 'MANHÃ';

    // Ensure we compare dates safely (ignoring potential time components if any)
    const currentDateStr = currentSchedule.date.split('T')[0];

    const foundSchedule = schedules.find(
      s => s.date.split('T')[0] === currentDateStr && s.shift === targetShift
    );

    if (foundSchedule) {
      setCurrentSchedule(foundSchedule);
      // Removed success toast to make transition smoother/faster
    } else {
      toast.info(`Não foi encontrada uma agenda de ${targetShift} para esta data.`);
    }
  };

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
    output += '---------------------------------------------------------\n';

    // Sort boxes by number to ensure they appear in order 1, 2, 3...
    const sortedBoxes = [...currentSchedule.boxes].sort((a, b) => a.number - b.number);

    for (const box of sortedBoxes) {
      const teamName = formatTeamName(box);
      const boxNumber = String(box.number).padStart(2, '0');
      const boxStatus = box.status ? ` ${box.status}` : '';

      // Determine the header line format
      // Example: BOÂO, FELIPE E PEDRO: (CAIXA - 01) TOKIO
      let headerLine = '';
      if (teamName) {
        headerLine = `${teamName}: (CAIXA - ${boxNumber})${boxStatus}`;
      } else {
        headerLine = `(CAIXA - ${boxNumber})${boxStatus}`;
      }

      output += `${headerLine}\n`;

      // Departure time
      // Example: Saida:08:35
      if (box.departureTime) {
        output += `Saida:${box.departureTime}\n`;
      } else {
        output += `Saida: --:--\n`;
      }

      output += '\n'; // Empty line between header/departure and services

      if (box.services.length === 0) {
        output += '- VAZIA\n';
      } else {
        for (const service of box.services) {
          // Service format: - [OS] ([TYPE]) - [status] às [time]
          // Example: - 6394789 (UPGRADE) - cancelado às 10:37

          let serviceLine = `- ${service.osNumber} (${service.type})`;

          if (service.status && service.status !== 'pendente') {
            // Ensure status is lowercase if needed, though type is usually formatted
            // The user example shows lowercase "cancelado", "concluido"
            // Our status types are lowercase in code usually? Let's check.
            // Types are 'pendente' | 'concluido' | 'cancelado' | 'reagendado'

            const timeStr = service.completedAt ? ` às ${service.completedAt}` : '';
            serviceLine += ` - ${service.status}${timeStr}`;
          }

          output += `${serviceLine}\n`;
        }
      }

      output += '\n'; // Empty line before Galpão

      // Return time
      // Example: Galpão:12:35
      if (box.returnTime) {
        output += `Galpão:${box.returnTime}\n`;
      } else {
        output += `Galpão: --:--\n`;
      }

      output += '---------------------------------------------------------\n';
    }

    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      toast.success('Agenda copiada com sucesso!');
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
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-muted-foreground">Turno:</span>
            <div className="flex items-center gap-2 bg-secondary/30 p-1 rounded-lg border border-border/50">
              <Sun className={`w-4 h-4 ${currentSchedule.shift === 'MANHÃ' ? 'text-accent' : 'text-muted-foreground'}`} />
              <Switch
                checked={currentSchedule.shift === 'TARDE'}
                onCheckedChange={handleToggleShift}
                className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-accent"
              />
              <Moon className={`w-4 h-4 ${currentSchedule.shift === 'TARDE' ? 'text-primary' : 'text-muted-foreground'}`} />
            </div>
            <span className={`text-sm font-medium ${currentSchedule.shift === 'MANHÃ' ? 'text-accent' : 'text-primary'}`}>
              {currentSchedule.shift}
            </span>
          </div>
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
        <div
          key={currentSchedule.id}
          className={`grid gap-4 md:grid-cols-2 xl:grid-cols-3 animate-in fade-in zoom-in-95 duration-300 ${currentSchedule.shift === 'MANHÃ' ? 'slide-in-from-left-4' : 'slide-in-from-right-4'
            }`}
        >
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
