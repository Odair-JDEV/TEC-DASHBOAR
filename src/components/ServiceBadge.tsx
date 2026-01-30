import { ServiceType } from '@/types';

interface ServiceBadgeProps {
  type: ServiceType;
}

const getServiceClass = (type: ServiceType): string => {
  const lowerType = type.toLowerCase();
  
  if (lowerType.includes('loss') || lowerType === 'off') {
    return 'service-loss';
  }
  if (lowerType.includes('ativação') || lowerType.includes('ativacao')) {
    return 'service-ativacao';
  }
  if (lowerType.includes('upgrade')) {
    return 'service-upgrade';
  }
  if (lowerType.includes('lentidão') || lowerType.includes('lentidao')) {
    return 'service-lentidao';
  }
  if (lowerType.includes('endereço') || lowerType.includes('endereco') || 
      lowerType.includes('comodo') || lowerType.includes('cômodo') ||
      lowerType.includes('equipamento') || lowerType.includes('realocar')) {
    return 'service-troca';
  }
  
  return 'service-outros';
};

export const ServiceBadge = ({ type }: ServiceBadgeProps) => {
  return (
    <span className={`service-badge ${getServiceClass(type)}`}>
      {type}
    </span>
  );
};
