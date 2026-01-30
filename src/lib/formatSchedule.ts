import { Schedule, ServiceBox } from '@/types';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const formatTeamName = (box: ServiceBox): string => {
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

const formatBoxHeader = (box: ServiceBox): string => {
  const teamName = formatTeamName(box);
  const boxLabel = `(CAIXA - ${String(box.number).padStart(2, '0')})`;
  const status = box.status ? ` ${box.status}` : '';
  
  if (teamName) {
    return `${teamName}: ${boxLabel}${status}`;
  }
  return `${boxLabel}${status}`;
};

export const formatScheduleText = (schedule: Schedule): string => {
  const dateFormatted = format(parseISO(schedule.date), 'dd/MM/yyyy', { locale: ptBR });
  
  let output = `Serviços da Agenda: ${dateFormatted} - TURNO: ${schedule.shift}\n`;
  output += '-'.repeat(57) + '\n';
  
  for (const box of schedule.boxes) {
    output += formatBoxHeader(box) + '\n';
    
    if (box.services.length === 0) {
      output += '* VAZIA\n';
    } else {
      for (const service of box.services) {
        output += `* ${service.osNumber} ${service.type}\n`;
      }
    }
    
    output += '-'.repeat(57) + '\n';
  }
  
  return output;
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
};
