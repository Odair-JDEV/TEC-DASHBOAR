import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Edit3, Eye } from 'lucide-react';

export const ModeToggle = () => {
  const { mode, setMode } = useAppStore();

  return (
    <div className="flex items-center gap-1 p-1 bg-secondary/50 rounded-lg border border-border/50">
      <Button
        variant={mode === 'edit' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setMode('edit')}
        className={mode === 'edit' ? 'glow-primary' : ''}
      >
        <Edit3 className="w-4 h-4 mr-2" />
        Edição
      </Button>
      <Button
        variant={mode === 'view' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setMode('view')}
        className={mode === 'view' ? 'glow-primary' : ''}
      >
        <Eye className="w-4 h-4 mr-2" />
        Visualização
      </Button>
    </div>
  );
};
