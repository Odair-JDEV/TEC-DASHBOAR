export interface Technician {
  id: string;
  name: string;
}

export interface ServiceTypeCategory {
  id: string;
  name: string;
}

export interface Team {
  id: string;
  members: Technician[];
  type: 'solo' | 'dupla' | 'trio' | 'equipe';
}

export interface ServiceBox {
  id: string;
  number: number;
  team: Team | null;
  status?: string; // ex: "TOKYO"
  departureTime?: string; // HH:mm format
  returnTime?: string; // HH:mm format
  alert?: string;
  services: Service[];
}

export type ServiceStatus = 'pendente' | 'concluido' | 'cancelado' | 'reagendado';

export interface Service {
  id: string;
  osNumber: string;
  type: ServiceType;
  status?: ServiceStatus;
  completedAt?: string; // HH:mm format
}

export type ServiceType = string;

export type Shift = 'MANHÃ' | 'TARDE';

export interface Schedule {
  id: string;
  date: string;
  shift: Shift;
  notes?: string;
  boxes: ServiceBox[];
}
