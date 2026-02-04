import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarPlus, Trash2, Sun, Moon, FileText, Pencil } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Shift } from '@/types';

export const ScheduleSelector = () => {
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [shift, setShift] = useState<Shift>('MANHÃ');

  const { schedules, currentSchedule, createSchedule, setCurrentSchedule, deleteSchedule, updateScheduleNotes, mode } = useAppStore();

  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterOS, setFilterOS] = useState('');

  const filteredSchedules = schedules.filter(s => {
    const matchesDate = !filterDate || s.date === filterDate;
    const matchesOS = !filterOS || s.boxes.some(b =>
      b.services.some(srv => srv.osNumber.includes(filterOS))
    );
    return matchesDate && matchesOS;
  });


  const handleCreate = () => {
    createSchedule(date, shift);
  };

  useEffect(() => {
    if (mode === 'view') {
      const now = new Date();
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();
      const totalMinutes = currentHours * 60 + currentMinutes;
      const today = format(now, 'yyyy-MM-dd');

      let targetShift: Shift | null = null;

      // MANHÃ: 08:00 (480) - 13:00 (780)
      if (totalMinutes >= 480 && totalMinutes <= 780) {
        targetShift = 'MANHÃ';
      }
      // TARDE: 13:30 (810) - 20:00 (1200)
      else if (totalMinutes >= 810 && totalMinutes <= 1200) {
        targetShift = 'TARDE';
      }

      if (targetShift) {
        const foundSchedule = schedules.find(s => s.date === today && s.shift === targetShift);
        if (foundSchedule && currentSchedule?.id !== foundSchedule.id) {
          setCurrentSchedule(foundSchedule);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, schedules, setCurrentSchedule]);

  return (
    <div className="glass-card p-4 animate-fade-in">
      <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
        <CalendarPlus className="w-5 h-5 text-primary" />
        Agendas
      </h2>

      <div className="space-y-2 mb-4">
        <div className="flex gap-1">
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="flex-1 min-w-0 px-2 bg-secondary/50 border-border/50 text-foreground text-sm"
          />
          <Select value={shift} onValueChange={(v) => setShift(v as Shift)}>
            <SelectTrigger className="w-24 px-2 bg-secondary/50 border-border/50 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MANHÃ">
                <span className="flex items-center gap-1">
                  <Sun className="w-3 h-3 text-accent" /> Manhã
                </span>
              </SelectItem>
              <SelectItem value="TARDE">
                <span className="flex items-center gap-1">
                  <Moon className="w-3 h-3 text-primary" /> Tarde
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleCreate} className="w-full">
          <CalendarPlus className="w-4 h-4 mr-2" />
          Criar Agenda
        </Button>
      </div>

      <div className="space-y-2 mb-4 p-3 bg-secondary/20 rounded-lg border border-border/50">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Filtros</h3>
        <div className="grid gap-2">
          <Input
            type="date"
            placeholder="Filtrar por data"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="bg-background/50 border-border/50 h-8 text-sm"
          />
          <Input
            type="text"
            placeholder="Buscar OS..."
            value={filterOS}
            onChange={(e) => setFilterOS(e.target.value)}
            className="bg-background/50 border-border/50 h-8 text-sm"
          />
          {(filterDate || filterOS) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setFilterDate('');
                setFilterOS('');
              }}
              className="h-8 w-full text-xs"
            >
              Limpar Filtros
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto">
        {filteredSchedules.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            {(filterDate || filterOS) ? 'Nenhuma agenda encontrada' : 'Nenhuma agenda criada'}
          </p>
        )}
        {filteredSchedules.map((schedule) => (
          <div
            key={schedule.id}
            onClick={() => setCurrentSchedule(schedule)}
            className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${currentSchedule?.id === schedule.id
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
                {filterOS && (
                  <p className="text-[10px] font-bold text-primary mt-1">
                    Equipe: {schedule.boxes
                      .filter(b => b.services.some(s => s.osNumber.includes(filterOS)))
                      .map(b => {
                        if (!b.team || b.team.members.length === 0) return `Caixa ${b.number}`;
                        const names = b.team.members.map(m => m.name);
                        if (names.length === 1) return names[0];
                        return names.join(' E ');
                      })
                      .join(', ')}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      setNotes(schedule.notes || '');
                      setEditingScheduleId(schedule.id);
                    }}
                    className="h-8 w-8 text-muted-foreground hover:text-primary"
                  >
                    {schedule.notes ? (
                      <FileText className="w-4 h-4 text-primary" />
                    ) : (
                      <Pencil className="w-4 h-4" />
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Anotações da Agenda</DialogTitle>
                  </DialogHeader>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Digite suas observações aqui..."
                    className="h-32"
                  />
                  <DialogFooter>
                    <Button onClick={() => {
                      if (editingScheduleId) {
                        updateScheduleNotes(editingScheduleId, notes);
                      }
                    }}>Salvar</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              {mode === 'edit' && (
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
              )}
            </div>
          </div>
        ))}
      </div>
    </div >
  );
};
