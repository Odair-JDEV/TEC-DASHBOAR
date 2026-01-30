import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { ServiceBox as ServiceBoxType, ServiceStatus } from '@/types';
import { ServiceBadge } from './ServiceBadge';
import { ServiceStatusBadge } from './ServiceStatusBadge';
import { Box, Check, X, Clock, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';

interface ViewModeBoxProps {
  box: ServiceBoxType;
  scheduleId: string;
}

const formatTeamName = (box: ServiceBoxType): string => {
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

export const ViewModeBox = ({ box, scheduleId }: ViewModeBoxProps) => {
  const { updateServiceStatus } = useAppStore();
  const [editingTimeId, setEditingTimeId] = useState<string | null>(null);
  const [editedTime, setEditedTime] = useState('');
  const teamName = formatTeamName(box);

  const handleStatusChange = (serviceId: string, status: ServiceStatus) => {
    const now = format(new Date(), 'HH:mm');
    updateServiceStatus(scheduleId, box.id, serviceId, status, now);
  };

  const handleEditTime = (serviceId: string, currentTime: string) => {
    setEditingTimeId(serviceId);
    setEditedTime(currentTime);
  };

  const handleSaveTime = (serviceId: string, currentStatus: ServiceStatus) => {
    if (editedTime.match(/^\d{2}:\d{2}$/)) {
      updateServiceStatus(scheduleId, box.id, serviceId, currentStatus, editedTime);
    }
    setEditingTimeId(null);
    setEditedTime('');
  };

  return (
    <div className="glass-card p-4 animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent/20">
          <Box className="w-4 h-4 text-accent" />
        </div>
        <div>
          <h3 className="font-bold text-foreground">
            {teamName ? `${teamName}: ` : ''}(CAIXA {String(box.number).padStart(2, '0')})
          </h3>
          <div className="flex items-center gap-2">
            {box.departureTime && (
              <span className="text-[10px] text-accent font-bold bg-accent/10 px-1.5 py-0.5 rounded border border-accent/20">
                SAÍDA: {box.departureTime}
              </span>
            )}
            {box.status && (
              <span className="text-xs text-accent font-semibold">{box.status}</span>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {box.services.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-3 bg-secondary/20 rounded">
            VAZIA
          </p>
        ) : (
          box.services.map((service) => (
            <div
              key={service.id}
              className="p-3 bg-secondary/30 rounded-lg space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-medium text-foreground">
                    {service.osNumber}
                  </span>
                  <ServiceBadge type={service.type} />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-7 px-2">
                      Marcar
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleStatusChange(service.id, 'concluido')}>
                      <Check className="w-4 h-4 mr-2 text-green-400" />
                      Concluído
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange(service.id, 'cancelado')}>
                      <X className="w-4 h-4 mr-2 text-destructive" />
                      Cancelado
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange(service.id, 'reagendado')}>
                      <Clock className="w-4 h-4 mr-2 text-yellow-400" />
                      Reagendado
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="flex items-center gap-2">
                <ServiceStatusBadge status={service.status} completedAt={service.completedAt} />
                {service.status && service.status !== 'pendente' && service.completedAt && (
                  editingTimeId === service.id ? (
                    <div className="flex items-center gap-1">
                      <Input
                        type="time"
                        value={editedTime}
                        onChange={(e) => setEditedTime(e.target.value)}
                        className="h-6 w-24 text-xs bg-secondary/50 border-border/50"
                        autoFocus
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 px-2"
                        onClick={() => handleSaveTime(service.id, service.status!)}
                      >
                        <Check className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 px-2"
                        onClick={() => setEditingTimeId(null)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 px-1.5 text-muted-foreground hover:text-foreground"
                      onClick={() => handleEditTime(service.id, service.completedAt!)}
                      title="Editar horário"
                    >
                      <Pencil className="w-3 h-3" />
                    </Button>
                  )
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
