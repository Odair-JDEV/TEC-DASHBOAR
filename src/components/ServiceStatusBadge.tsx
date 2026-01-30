import { ServiceStatus } from '@/types';
import { Check, X, Clock, Minus } from 'lucide-react';

interface ServiceStatusBadgeProps {
  status?: ServiceStatus;
  completedAt?: string;
}

const statusConfig: Record<ServiceStatus, { label: string; className: string; icon: React.ReactNode }> = {
  pendente: {
    label: 'Pendente',
    className: 'bg-muted text-muted-foreground',
    icon: <Minus className="w-3 h-3" />,
  },
  concluido: {
    label: 'Concluído',
    className: 'bg-green-500/20 text-green-400 border-green-500/30',
    icon: <Check className="w-3 h-3" />,
  },
  cancelado: {
    label: 'Cancelado',
    className: 'bg-destructive/20 text-destructive border-destructive/30',
    icon: <X className="w-3 h-3" />,
  },
  reagendado: {
    label: 'Reagendado',
    className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    icon: <Clock className="w-3 h-3" />,
  },
};

export const ServiceStatusBadge = ({ status = 'pendente', completedAt }: ServiceStatusBadgeProps) => {
  const config = statusConfig[status];

  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${config.className}`}>
      {config.icon}
      <span>{config.label}</span>
      {completedAt && <span className="opacity-75">às {completedAt}</span>}
    </div>
  );
};
