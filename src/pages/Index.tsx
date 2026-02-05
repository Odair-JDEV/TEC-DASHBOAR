import { Header } from '@/components/Header';
import { TechnicianManager } from '@/components/TechnicianManager';
import { ScheduleSelector } from '@/components/ScheduleSelector';
import { ScheduleEditor } from '@/components/ScheduleEditor';
import { ScheduleViewer } from '@/components/ScheduleViewer';
import { PreviewModal } from '@/components/PreviewModal';
import { ServiceTypeManager } from '@/components/ServiceTypeManager';
import { useAppStore } from '@/lib/store';
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const Index = () => {
  const { currentSchedule, mode, fetchState } = useAppStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(mode === 'edit');

  useEffect(() => {
    setIsSidebarOpen(mode === 'edit');
  }, [mode]);

  useEffect(() => {
    fetchState();
    const interval = setInterval(() => {
      fetchState();
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchState]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar */}
        <aside
          className={cn(
            "border-r border-border/50 bg-card/30 space-y-4 overflow-y-auto transition-all duration-300 ease-in-out relative",
            isSidebarOpen ? "w-80 p-4 opacity-100" : "w-0 p-0 opacity-0 border-none overflow-hidden"
          )}
        >


          <div className={cn("transition-all duration-300", isSidebarOpen ? "opacity-100 delay-150" : "opacity-0 invisible")}>
            {mode === 'edit' && (
              <div className="space-y-4">
                <TechnicianManager />
                <ServiceTypeManager />
              </div>
            )}
            <ScheduleSelector />
            {currentSchedule && mode === 'edit' && <PreviewModal />}
          </div>
        </aside>

        {/* Toggle Button */}
        <div className={cn(
          "absolute z-20 top-1/2 -translate-y-1/2 transition-all duration-300 ease-in-out",
          isSidebarOpen ? "left-[19rem]" : "left-4"
        )}>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="h-8 w-8 rounded-full bg-background border-border shadow-sm hover:bg-accent"
          >
            {isSidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden transition-all duration-300">
          {mode === 'edit' ? <ScheduleEditor /> : <ScheduleViewer />}
        </main>
      </div>
      <footer className="w-full py-1 text-center text-xs text-muted-foreground/50 border-t border-border/10">
        Desenvolvido por: ODAIR-JDEV
      </footer>
    </div>
  );
};

export default Index;
