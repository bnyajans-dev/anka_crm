import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
          <div className="max-w-md text-center space-y-4">
            <div className="bg-destructive/10 p-4 rounded-full inline-block">
              <AlertTriangle className="h-12 w-12 text-destructive" />
            </div>
            <h1 className="text-2xl font-bold">Bir hata oluştu</h1>
            <p className="text-muted-foreground">
              Uygulamada beklenmeyen bir sorun meydana geldi. Lütfen sayfayı yenileyin.
            </p>
            <div className="bg-muted p-2 rounded text-xs font-mono text-left overflow-auto max-h-32">
               {this.state.error?.message}
            </div>
            <Button onClick={() => window.location.reload()}>
              Sayfayı Yenile
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
