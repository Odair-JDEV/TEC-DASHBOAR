import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-background p-4">
                    <div className="glass-card max-w-md w-full p-6 text-center space-y-4 border-destructive/50">
                        <div className="mx-auto w-12 h-12 bg-destructive/20 rounded-full flex items-center justify-center">
                            <AlertCircle className="w-6 h-6 text-destructive" />
                        </div>
                        <h2 className="text-xl font-bold text-foreground">Algo deu errado</h2>
                        <p className="text-muted-foreground text-sm">
                            Ocorreu um erro ao renderizar este componente. Tente recarregar a página.
                        </p>
                        {this.state.error && (
                            <pre className="text-xs text-left bg-secondary/50 p-2 rounded overflow-auto max-h-32 text-destructive">
                                {this.state.error.message}
                            </pre>
                        )}
                        <Button
                            onClick={() => window.location.reload()}
                            className="w-full"
                        >
                            Recarregar Página
                        </Button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
