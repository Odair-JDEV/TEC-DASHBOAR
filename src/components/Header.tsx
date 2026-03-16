import { Wrench, Calendar, Database } from 'lucide-react';
import { ModeToggle } from './ModeToggle';
import { useAppStore } from '@/lib/store';
import { useEffect } from 'react';

export const Header = () => {
  const { dbStatus, checkDbStatus } = useAppStore();

  useEffect(() => {
    checkDbStatus();
    const interval = setInterval(checkDbStatus, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, [checkDbStatus]);

  return (
    <header className="glass-card border-b border-border/50 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/20 glow-primary">
            <Wrench className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              TEC-DASHBOARD
            </h1>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Gerenciamento de Serviços em Campo
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border/50" title={`Banco de Dados: ${dbStatus === 'connected' ? 'Conectado' : 'Desconectado'}`}>
            <div className={`relative flex items-center justify-center w-2 h-2 rounded-full ${dbStatus === 'connected' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]'}`}>
              <div className={`absolute w-full h-full rounded-full animate-ping opacity-75 ${dbStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'}`}></div>
            </div>
            <Database className={`w-4 h-4 ${dbStatus === 'connected' ? 'text-green-500' : 'text-red-500'}`} />
            <span className={`text-xs font-medium ${dbStatus === 'connected' ? 'text-green-500' : 'text-red-500'}`}>
              {dbStatus === 'checking' ? 'Verificando...' : dbStatus === 'connected' ? 'Supabase' : 'Offline'}
            </span>
          </div>
          <ModeToggle />
        </div>
      </div>
    </header>
  );
};
