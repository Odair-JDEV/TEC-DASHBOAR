import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Users, Check } from 'lucide-react';
import { Technician, Team } from '@/types';

interface TeamSelectorProps {
  scheduleId: string;
  boxId: string;
  currentTeam: Team | null;
}

export const TeamSelector = ({ scheduleId, boxId, currentTeam }: TeamSelectorProps) => {
  const { technicians, updateBoxTeam } = useAppStore();
  const [selectedIds, setSelectedIds] = useState<string[]>(
    currentTeam?.members.map(m => m.id) || []
  );
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setSelectedIds(currentTeam?.members.map(m => m.id) || []);
  }, [currentTeam]);

  const toggleTechnician = (id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(x => x !== id);
      }
      if (prev.length >= 3) {
        return prev;
      }
      return [...prev, id];
    });
  };

  const handleConfirm = () => {
    if (selectedIds.length === 0) {
      updateBoxTeam(scheduleId, boxId, null);
    } else {
      const members = selectedIds
        .map(id => technicians.find(t => t.id === id))
        .filter((t): t is Technician => t !== undefined);
      
      const type = members.length === 1 ? 'solo' : members.length === 2 ? 'dupla' : 'trio';
      
      updateBoxTeam(scheduleId, boxId, {
        id: `team-${boxId}`,
        members,
        type,
      });
    }
    setOpen(false);
  };

  const getTeamLabel = () => {
    if (!currentTeam || currentTeam.members.length === 0) {
      return 'Selecionar equipe';
    }
    const names = currentTeam.members.map(m => m.name);
    if (names.length === 1) return names[0];
    if (names.length === 2) return `${names[0]} E ${names[1]}`;
    return `${names[0]}, ${names[1]} E ${names[2]}`;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className="justify-start gap-2 bg-secondary/50 border-border/50 hover:bg-secondary text-left truncate max-w-full"
        >
          <Users className="w-4 h-4 text-primary shrink-0" />
          <span className="truncate">{getTeamLabel()}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 bg-card border-border">
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground mb-3">
            Selecionar até 3 técnicos
          </p>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {technicians.map((tech) => (
              <label
                key={tech.id}
                className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                  selectedIds.includes(tech.id)
                    ? 'bg-primary/20'
                    : 'hover:bg-secondary/50'
                }`}
              >
                <Checkbox
                  checked={selectedIds.includes(tech.id)}
                  onCheckedChange={() => toggleTechnician(tech.id)}
                  disabled={!selectedIds.includes(tech.id) && selectedIds.length >= 3}
                />
                <span className="text-sm font-mono">{tech.name}</span>
              </label>
            ))}
          </div>
          <Button onClick={handleConfirm} className="w-full mt-3" size="sm">
            <Check className="w-4 h-4 mr-2" />
            Confirmar
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
