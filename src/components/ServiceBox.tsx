import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { ServiceBox as ServiceBoxType, ServiceType } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TeamSelector } from './TeamSelector';
import { ServiceBadge } from './ServiceBadge';
import { Box, Plus, X, Tag, GripVertical } from 'lucide-react';

interface ServiceBoxProps {
  box: ServiceBoxType;
  scheduleId: string;
}

const SERVICE_TYPES: ServiceType[] = [
  'LINK LOSS',
  'LENTIDÃO',
  'ATIVAÇÃO',
  'UPGRADE',
  'T.ENDEREÇO',
  'T.EQUIPAMENTO',
  'T.COMODO',
  'SEM CONEXÃO',
  'SUPORTE',
  'UPGRADE + REPETIDOR',
  'UPGRADE/T.ENDEREÇO',
  'UPGRADE/T.COMODO',
];

export const ServiceBoxCard = ({ box, scheduleId }: ServiceBoxProps) => {
  const [osNumber, setOsNumber] = useState('');
  const [serviceType, setServiceType] = useState<ServiceType>('LOSS');
  const [status, setStatus] = useState(box.status || '');
  const [showStatusInput, setShowStatusInput] = useState(!!box.status);
  const [isDragOver, setIsDragOver] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);

  const { addService, removeService, updateBoxStatus, removeBox, moveService, updateServiceType } = useAppStore();

  const handleAddService = () => {
    if (osNumber.trim()) {
      addService(scheduleId, box.id, { osNumber: osNumber.trim(), type: serviceType });
      setOsNumber('');
    }
  };

  const handleStatusBlur = () => {
    updateBoxStatus(scheduleId, box.id, status.toUpperCase());
    if (!status) setShowStatusInput(false);
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
      className={`glass-card p-4 animate-fade-in transition-all ${isDragOver ? 'ring-2 ring-primary bg-primary/10' : ''
        }`}
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
            <h3 className="font-bold text-foreground">
              CAIXA {String(box.number).padStart(2, '0')}
            </h3>
            {box.status && (
              <span className="text-xs text-accent font-semibold">{box.status}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">

          {!showStatusInput ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowStatusInput(true)}
              className="h-8 w-8 text-muted-foreground hover:text-accent"
              title="Adicionar status"
            >
              <Tag className="w-4 h-4" />
            </Button>
          ) : (
            <Input
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              onBlur={handleStatusBlur}
              placeholder="Status..."
              className="w-24 h-8 text-xs bg-secondary/50 border-border/50"
              autoFocus
            />
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => removeBox(scheduleId, box.id)}
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="mb-4">
        <TeamSelector scheduleId={scheduleId} boxId={box.id} currentTeam={box.team} />
      </div>

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
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            {SERVICE_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
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
                      {SERVICE_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
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
