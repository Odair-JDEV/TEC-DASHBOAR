import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { ServiceBox as ServiceBoxType, ServiceStatus } from '@/types';
import { ServiceBadge } from './ServiceBadge';
import { ServiceStatusBadge } from './ServiceStatusBadge';
import { Box, Check, X, Clock, Pencil, GripVertical, AlertTriangle, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

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
  const { updateServiceStatus, updateBoxDepartureTime, moveService, updateBoxReturnTime } = useAppStore();
  const [editingTimeId, setEditingTimeId] = useState<string | null>(null);
  const [editedTime, setEditedTime] = useState('');
  const [editingDeparture, setEditingDeparture] = useState(false);
  const [departureTime, setDepartureTime] = useState(box.departureTime || '');
  const [editingReturn, setEditingReturn] = useState(false);
  const [returnTime, setReturnTime] = useState(box.returnTime || '');
  const [isDragOver, setIsDragOver] = useState(false);
  const [unmarkTarget, setUnmarkTarget] = useState<{ serviceId: string; status: ServiceStatus } | null>(null);
  const teamName = formatTeamName(box);

  const statusLabels: Record<string, string> = {
    concluido: 'concluído',
    cancelado: 'cancelado',
    reagendado: 'reagendado',
  };

  const handleDragStart = (e: React.DragEvent, serviceId: string) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('serviceId', serviceId);
    e.dataTransfer.setData('fromBoxId', box.id);
    e.dataTransfer.setData('scheduleId', scheduleId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const serviceId = e.dataTransfer.getData('serviceId');
    const fromBoxId = e.dataTransfer.getData('fromBoxId');
    const dragScheduleId = e.dataTransfer.getData('scheduleId');

    if (dragScheduleId === scheduleId && fromBoxId !== box.id) {
      moveService(scheduleId, fromBoxId, box.id, serviceId);
    }
  };

  const handleStatusChange = (serviceId: string, status: ServiceStatus) => {
    const service = box.services.find((s) => s.id === serviceId);

    // Se clicar no mesmo status já marcado, pede confirmação para desmarcar
    if (service && service.status === status) {
      setUnmarkTarget({ serviceId, status });
      return;
    }

    const now = format(new Date(), 'HH:mm');
    updateServiceStatus(scheduleId, box.id, serviceId, status, now);
  };

  const handleConfirmUnmark = () => {
    if (!unmarkTarget) return;
    updateServiceStatus(scheduleId, box.id, unmarkTarget.serviceId, 'pendente', '');
    setUnmarkTarget(null);
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

  const handleSaveDeparture = () => {
    if (departureTime.match(/^\d{2}:\d{2}$/)) {
      updateBoxDepartureTime(scheduleId, box.id, departureTime);
    }
    setEditingDeparture(false);
  };

  return (
    <div
      className={cn(
        "glass-card p-4 animate-fade-in transition-all",
        isDragOver ? 'ring-2 ring-primary bg-primary/10' : '',
        box.alert ? 'ring-2 ring-yellow-500/50 bg-yellow-500/5 stroke-yellow-500 animate-pulse-border' : ''
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent/20">
          <Box className="w-4 h-4 text-accent" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-foreground">
              {teamName ? `${teamName}: ` : ''}(CAIXA {String(box.number).padStart(2, '0')})
            </h3>
            {box.alert && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-yellow-500 hover:text-yellow-600 animate-pulse"
                  >
                    <AlertTriangle className="w-4 h-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2 text-sm bg-yellow-950 border-yellow-500/30 text-yellow-100">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    <span>{box.alert}</span>
                  </div>
                </PopoverContent>
              </Popover>
            )}
            {box.city && (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase">
                <MapPin className="w-3 h-3" />
                {box.city}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {editingDeparture ? (
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-accent font-bold">SAÍDA:</span>
                <Input
                  type="time"
                  value={departureTime}
                  onChange={(e) => setDepartureTime(e.target.value)}
                  className="h-6 w-24 text-xs bg-secondary/50 border-border/50"
                  autoFocus
                />
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 px-2"
                  onClick={handleSaveDeparture}
                >
                  <Check className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 px-2"
                  onClick={() => setEditingDeparture(false)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setDepartureTime(box.departureTime || '');
                  setEditingDeparture(true);
                }}
                className="text-[10px] text-accent font-bold bg-accent/10 px-1.5 py-0.5 rounded border border-accent/20 hover:bg-accent/20 transition-colors cursor-pointer"
              >
                SAÍDA: {box.departureTime || '-- : --'}
              </button>
            )}
            {box.status && (
              <span className="text-xs text-accent font-semibold">{box.status}</span>
            )}

            {/* Return Time (GALPÃO) */}
            {editingReturn ? (
              <div className="flex items-center gap-1 ml-2">
                <span className="text-[10px] text-accent font-bold">GALPÃO:</span>
                <Input
                  type="time"
                  value={returnTime}
                  onChange={(e) => setReturnTime(e.target.value)}
                  className="h-6 w-24 text-xs bg-secondary/50 border-border/50"
                  autoFocus
                />
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 px-2"
                  onClick={() => {
                    if (returnTime.match(/^\d{2}:\d{2}$/)) {
                      updateBoxReturnTime(scheduleId, box.id, returnTime);
                    }
                    setEditingReturn(false);
                  }}
                >
                  <Check className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 px-2"
                  onClick={() => setEditingReturn(false)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setReturnTime(box.returnTime || '');
                  setEditingReturn(true);
                }}
                className="ml-2 text-[10px] text-accent font-bold bg-accent/10 px-1.5 py-0.5 rounded border border-accent/20 hover:bg-accent/20 transition-colors cursor-pointer"
              >
                GALPÃO: {box.returnTime || '-- : --'}
              </button>
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
              draggable
              onDragStart={(e) => handleDragStart(e, service.id)}
              className="p-3 bg-secondary/30 rounded-lg space-y-2 cursor-move group hover:bg-secondary/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <GripVertical className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="font-mono text-sm font-medium text-foreground">
                    {service.osNumber}
                  </span>
                  <ServiceBadge type={service.type} />
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleStatusChange(service.id, 'concluido')}
                    className={`h-7 w-7 text-green-500 hover:bg-green-500/10 hover:text-green-600 ${service.status === 'concluido' ? 'bg-green-500/10 ring-1 ring-green-500/20' : 'opacity-70 hover:opacity-100'}`}
                    title="Concluído"
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleStatusChange(service.id, 'cancelado')}
                    className={`h-7 w-7 text-red-500 hover:bg-red-500/10 hover:text-red-600 ${service.status === 'cancelado' ? 'bg-red-500/10 ring-1 ring-red-500/20' : 'opacity-70 hover:opacity-100'}`}
                    title="Cancelado"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleStatusChange(service.id, 'reagendado')}
                    className={`h-7 w-7 text-yellow-500 hover:bg-yellow-500/10 hover:text-yellow-600 ${service.status === 'reagendado' ? 'bg-yellow-500/10 ring-1 ring-yellow-500/20' : 'opacity-70 hover:opacity-100'}`}
                    title="Reagendado"
                  >
                    <Clock className="w-4 h-4" />
                  </Button>
                </div>
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

      <AlertDialog open={unmarkTarget !== null} onOpenChange={(open) => !open && setUnmarkTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desmarcar serviço</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja desmarcar que foi {unmarkTarget ? statusLabels[unmarkTarget.status] : ''}? A
              hora registrada será removida e o serviço voltará para pendente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmUnmark}>Desmarcar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
