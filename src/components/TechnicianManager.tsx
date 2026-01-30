import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserPlus, X, Users } from 'lucide-react';

export const TechnicianManager = () => {
  const [newName, setNewName] = useState('');
  const { technicians, addTechnician, removeTechnician } = useAppStore();

  const handleAdd = () => {
    if (newName.trim()) {
      addTechnician(newName.trim());
      setNewName('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAdd();
    }
  };

  return (
    <div className="glass-card p-4 animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-primary" />
        <h2 className="font-semibold text-foreground">Técnicos</h2>
        <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
          {technicians.length}
        </span>
      </div>

      <div className="flex gap-2 mb-4">
        <Input
          placeholder="Nome do técnico..."
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyPress={handleKeyPress}
          className="bg-secondary/50 border-border/50 text-foreground placeholder:text-muted-foreground"
        />
        <Button onClick={handleAdd} size="icon" className="shrink-0">
          <UserPlus className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
        {technicians.map((tech) => (
          <div
            key={tech.id}
            className="flex items-center gap-1 bg-secondary/50 text-secondary-foreground px-2 py-1 rounded-md text-sm group hover:bg-secondary transition-colors"
          >
            <span className="font-mono">{tech.name}</span>
            <button
              onClick={() => removeTechnician(tech.id)}
              className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
