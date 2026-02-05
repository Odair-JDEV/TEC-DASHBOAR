import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { ServiceBox as ServiceBoxType, ServiceType } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TeamSelector } from './TeamSelector';
import { ServiceBadge } from './ServiceBadge';
import { Box, Plus, X, Tag, GripVertical, Pencil } from 'lucide-react';
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

interface ServiceBoxProps {
  box: ServiceBoxType;
  scheduleId: string;
}



const ServiceBoxCard = ({ box, scheduleId }: ServiceBoxProps) => {
  const [osNumber, setOsNumber] = useState('');
  // Use first category as default if available, or empty string
  const { serviceTypes, addService, removeService, updateBoxStatus, removeBox, moveService, updateServiceType, updateBoxNumber } = useAppStore();
  const [serviceType, setServiceType] = useState<ServiceType>(serviceTypes[0]?.name || '');

  const [status, setStatus] = useState(box.status || '');
  const [showStatusInput, setShowStatusInput] = useState(!!box.status);
  const [isDragOver, setIsDragOver] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);

  const [isEditingNumber, setIsEditingNumber] = useState(false);
  const [numberInputValue, setNumberInputValue] = useState(String(box.number));

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
  // ...
  return (
    <div
// ...
// ...
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
// ...
// ...
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
// ...
