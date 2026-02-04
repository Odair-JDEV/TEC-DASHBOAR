import { useState, useEffect, useMemo } from 'react';
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
  const { technicians, updateBoxTeam, schedules } = useAppStore();
  const [selectedIds, setSelectedIds] = useState<string[]>(
    currentTeam?.members.map(m => m.id) || []
  );
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setSelectedIds(currentTeam?.members.map(m => m.id) || []);
  }, [currentTeam]);

  const unavailableids = useMemo(() => {
    const schedule = schedules.find(s => s.id === scheduleId);
    if (!schedule) return [];

    const ids: string[] = [];
    schedule.boxes.forEach(box => {
      if (box.id !== boxId && box.team) {
        box.team.members.forEach(m => ids.push(m.id));
      }
    });
    return ids;
  }, [schedules, scheduleId, boxId]);

  const toggleTechnician = (id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(x => x !== id);
      }
      if (prev.length >= 5) {
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

      const type = members.length === 1 ? 'solo' : members.length === 2 ? 'dupla' : members.length === 3 ? 'trio' : 'equipe';

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
    const last = names.pop();
    return `${names.join(', ')} E ${last}`;
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
            Selecionar até 5 técnicos
          </p>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {technicians.map((tech) => {
              const isUnavailable = unavailableids.includes(tech.id);
              const isSelected = selectedIds.includes(tech.id);

              return (
                <label
                  key={tech.id}
                  className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${isSelected
                      ? 'bg-primary/20'
                      : isUnavailable
                        ? 'opacity-50 cursor-not-allowed bg-secondary/30'
                        : 'hover:bg-secondary/50'
                    }`}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => !isUnavailable && toggleTechnician(tech.id)}
                    disabled={(!isSelected && selectedIds.length >= 5) || isUnavailable}
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-mono">{tech.name}</span>
                    {isUnavailable && (
                      <span className="text-[10px] text-destructive font-medium">Ocupado</span>
                    )}
                  </div>
                </label>
              );
            })}
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
