import { Wrench, Calendar } from 'lucide-react';
import { ModeToggle } from './ModeToggle';

export const Header = () => {
  return (
    <header className="glass-card border-b border-border/50 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/20 glow-primary">
            <Wrench className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              Field Service Manager
            </h1>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Gerenciamento de Serviços em Campo
            </p>
          </div>
        </div>
        <ModeToggle />
      </div>
    </header>
  );
};
