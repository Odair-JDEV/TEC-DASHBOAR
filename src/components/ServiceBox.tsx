import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { ServiceBox as ServiceBoxType, ServiceType } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TeamSelector } from './TeamSelector';
import { ServiceBadge } from './ServiceBadge';
import { Box, Plus, X, GripVertical, Pencil, CheckCircle2, Ban, Clock, AlertTriangle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from '@/lib/utils';

interface ServiceBoxProps {
  box: ServiceBoxType;
  scheduleId: string;
}

export const ServiceBoxCard = ({ box, scheduleId }: ServiceBoxProps) => {
  const [osNumber, setOsNumber] = useState('');
  // Use first category as default if available, or empty string
  const { serviceTypes, addService, removeService, updateBoxStatus, removeBox, moveService, updateServiceType, updateBoxNumber, updateBoxAlert } = useAppStore();
  const [serviceType, setServiceType] = useState<ServiceType>(serviceTypes[0]?.name || '');

  const [status, setStatus] = useState(box.status || '');
  const [showStatusInput, setShowStatusInput] = useState(!!box.status);
  const [isDragOver, setIsDragOver] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);

  const [isEditingNumber, setIsEditingNumber] = useState(false);
  const [numberInputValue, setNumberInputValue] = useState(String(box.number));

  // Alert State
  const [alertText, setAlertText] = useState(box.alert || '');

  const handleSaveNumber = () => {
    const newNumber = parseInt(numberInputValue);
    if (!isNaN(newNumber) && newNumber > 0) {
      updateBoxNumber(scheduleId, box.id, newNumber);
    } else {
      setNumberInputValue(String(box.number));
    }
    setIsEditingNumber(false);
  };

  const handleAddService = () => {
    // If no type selected but types exist, try to pick first
    const typeToAdd = serviceType || serviceTypes[0]?.name || 'N/A';

    if (osNumber.trim()) {
      addService(scheduleId, box.id, { osNumber: osNumber.trim(), type: typeToAdd });
      setOsNumber('');
    }
  };

  const handleStatusBlur = () => {
    updateBoxStatus(scheduleId, box.id, status.toUpperCase());
    if (!status) setShowStatusInput(false);
  };

  const handleSaveAlert = () => {
    updateBoxAlert(scheduleId, box.id, alertText);
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

  return (
    <div
      className={cn(
        "glass-card p-4 animate-fade-in transition-all",
        isDragOver ? 'ring-2 ring-primary bg-primary/10' : '',
        box.alert ? 'ring-2 ring-yellow-500/50 bg-yellow-500/5 shadow-[0_0_15px_rgba(234,179,8,0.2)] animate-pulse' : ''
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent/20">
            <Box className="w-4 h-4 text-accent" />
          </div>
          <div>
            {isEditingNumber ? (
              <div className="flex items-center gap-1">
                <span className="font-bold text-foreground">CAIXA</span>
                <Input
                  type="number"
                  value={numberInputValue}
                  onChange={(e) => setNumberInputValue(e.target.value)}
                  onBlur={handleSaveNumber}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveNumber();
                    if (e.key === 'Escape') {
                      setIsEditingNumber(false);
                      setNumberInputValue(String(box.number));
                    }
                  }}
                  className="w-16 h-8 text-center font-bold"
                  autoFocus
                />
              </div>
            ) : (
              <h3
                className="font-bold text-foreground cursor-pointer hover:text-primary transition-colors flex items-center gap-2 group"
                onClick={() => setIsEditingNumber(true)}
                title="Clique para editar o número"
              >
                CAIXA {String(box.number).padStart(2, '0')}
                <Pencil className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
              </h3>
            )}
            {box.status && (
              <span className="text-xs text-accent font-semibold">{box.status}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8 hover:text-yellow-500 hover:bg-yellow-500/10",
                  box.alert ? "text-yellow-500 animate-pulse" : "text-muted-foreground"
                )}
                title="Alerta da equipe"
              >
                <AlertTriangle className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-3">
              <div className="space-y-2">
                <h4 className="font-medium text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  Alerta da Equipe
                </h4>
                <Textarea
                  placeholder="Ex: Equipe sem ajudante..."
                  value={alertText}
                  onChange={(e) => setAlertText(e.target.value)}
                  className="min-h-[80px]"
                />
                <Button size="sm" onClick={handleSaveAlert} className="w-full">
                  Salvar Alerta
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
              >
                <X className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir Caixa?</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir a Caixa {box.number}? Todos os serviços vinculados a ela também serão removidos.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => removeBox(scheduleId, box.id)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="mb-4">
        <TeamSelector scheduleId={scheduleId} boxId={box.id} currentTeam={box.team} />
      </div>

      {box.alert && (
        <div className="mb-4 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded text-yellow-200 text-xs font-medium flex items-start gap-2">
          <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
          {box.alert}
        </div>
      )}

      <div className="flex gap-2 mb-4">
        <Input
          placeholder="Nº OS..."
          value={osNumber}
          onChange={(e) => setOsNumber(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAddService()}
          className="bg-secondary/50 border-border/50 font-mono"
        />
        <Select value={serviceType} onValueChange={(v) => setServiceType(v as ServiceType)}>
          <SelectTrigger className="w-40 bg-secondary/50 border-border/50">
            <SelectValue placeholder="Tipo..." />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            {serviceTypes.map((type) => (
              <SelectItem key={type.id} value={type.name}>
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={handleAddService} size="icon" className="shrink-0">
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-2">
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
              className="flex items-center justify-between p-2 bg-secondary/30 rounded group hover:bg-secondary/50 transition-colors cursor-move"
            >
              <div className="flex items-center gap-3">
                <GripVertical className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="font-mono text-sm font-medium text-foreground">
                  {service.osNumber}
                </span>
                {editingServiceId === service.id ? (
                  <Select
                    defaultValue={service.type}
                    onValueChange={(value) => {
                      updateServiceType(scheduleId, box.id, service.id, value);
                      setEditingServiceId(null);
                    }}
                  >
                    <SelectTrigger className="h-6 w-32 text-xs bg-secondary/50 border-border/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceTypes.map((type) => (
                        <SelectItem key={type.id} value={type.name}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div onClick={() => setEditingServiceId(service.id)} className="cursor-pointer hover:opacity-80 transition-opacity" title="Clique para alterar o tipo">
                    <ServiceBadge type={service.type} />
                  </div>
                )}
              </div>
              <button
                onClick={() => removeService(scheduleId, box.id, service.id)}
                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
