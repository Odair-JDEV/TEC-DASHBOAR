import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarPlus, Trash2, Sun, Moon } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Shift } from '@/types';

export const ScheduleSelector = () => {
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [shift, setShift] = useState<Shift>('MANHÃ');
  
  const { schedules, currentSchedule, createSchedule, setCurrentSchedule, deleteSchedule } = useAppStore();

  const handleCreate = () => {
    createSchedule(date, shift);
  };

  return (
    <div className="glass-card p-4 animate-fade-in">
      <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
        <CalendarPlus className="w-5 h-5 text-primary" />
        Agendas
      </h2>

      <div className="flex gap-2 mb-4">
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="bg-secondary/50 border-border/50 text-foreground"
        />
        <Select value={shift} onValueChange={(v) => setShift(v as Shift)}>
          <SelectTrigger className="w-32 bg-secondary/50 border-border/50">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="MANHÃ">
              <span className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-accent" /> Manhã
              </span>
            </SelectItem>
            <SelectItem value="TARDE">
              <span className="flex items-center gap-2">
                <Moon className="w-4 h-4 text-primary" /> Tarde
              </span>
            </SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={handleCreate} size="icon" className="shrink-0">
          <CalendarPlus className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto">
        {schedules.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhuma agenda criada
          </p>
        )}
        {schedules.map((schedule) => (
          <div
            key={schedule.id}
            onClick={() => setCurrentSchedule(schedule)}
            className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
              currentSchedule?.id === schedule.id
                ? 'bg-primary/20 border border-primary/50 glow-primary'
                : 'bg-secondary/30 hover:bg-secondary/50 border border-transparent'
            }`}
          >
            <div className="flex items-center gap-3">
              {schedule.shift === 'MANHÃ' ? (
                <Sun className="w-4 h-4 text-accent" />
              ) : (
                <Moon className="w-4 h-4 text-primary" />
              )}
              <div>
                <p className="font-mono text-sm font-medium">
                  {format(parseISO(schedule.date), 'dd/MM/yyyy', { locale: ptBR })}
                </p>
                <p className="text-xs text-muted-foreground">{schedule.shift}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                deleteSchedule(schedule.id);
              }}
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
