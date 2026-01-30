import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { ServiceBox as ServiceBoxType, ServiceType } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TeamSelector } from './TeamSelector';
import { ServiceBadge } from './ServiceBadge';
import { Box, Plus, X, Tag } from 'lucide-react';

interface ServiceBoxProps {
  box: ServiceBoxType;
  scheduleId: string;
}

const SERVICE_TYPES: ServiceType[] = [
  'LOSS',
  'LINK LOSS',
  'LENTIDÃO',
  'ATIVAÇÃO',
  'UPGRADE',
  'T.ENDEREÇO',
  'TROCA DE ENDEREÇO',
  'T.EQUIPAMENTO',
  'TROCA DE COMODO',
  'SEM CONEXÃO',
  'OFF',
  'REALOCAR ONU',
  'SUPORTE',
  'UPGRADE + REPETIDOR',
  'UPGRADE/T.ENDEREÇO',
];

export const ServiceBoxCard = ({ box, scheduleId }: ServiceBoxProps) => {
  const [osNumber, setOsNumber] = useState('');
  const [serviceType, setServiceType] = useState<ServiceType>('LOSS');
  const [status, setStatus] = useState(box.status || '');
  const [showStatusInput, setShowStatusInput] = useState(!!box.status);

  const { addService, removeService, updateBoxStatus, removeBox } = useAppStore();

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

  return (
    <div className="glass-card p-4 animate-fade-in">
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
              className="flex items-center justify-between p-2 bg-secondary/30 rounded group hover:bg-secondary/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-medium text-foreground">
                  {service.osNumber}
                </span>
                <ServiceBadge type={service.type} />
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
