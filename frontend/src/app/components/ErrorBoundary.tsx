import { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from './ui/button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>

            <h1 className="text-3xl font-bold text-slate-900 text-center mb-4">
              Oops! Có lỗi xảy ra
            </h1>

            <p className="text-slate-600 text-center mb-8">
              Ứng dụng gặp lỗi không mong muốn. Vui lòng thử lại hoặc quay về trang chủ.
            </p>

            {this.state.error && (
              <div className="bg-slate-50 rounded-lg p-4 mb-6 border border-slate-200">
                <p className="text-sm font-mono text-red-600 mb-2">
                  {this.state.error.toString()}
                </p>
                {this.state.errorInfo && (
                  <details className="text-xs text-slate-600">
                    <summary className="cursor-pointer hover:text-slate-900 mb-2">
                      Chi tiết lỗi
                    </summary>
                    <pre className="whitespace-pre-wrap overflow-auto max-h-64 bg-white p-3 rounded border">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            <div className="flex gap-4 justify-center">
              <Button onClick={this.handleReset} size="lg">
                <RefreshCw className="w-5 h-5 mr-2" />
                Tải lại trang
              </Button>
              <Button onClick={this.handleGoHome} variant="outline" size="lg">
                <Home className="w-5 h-5 mr-2" />
                Về trang chủ
              </Button>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-200 text-center">
              <p className="text-sm text-slate-500">
                Nếu lỗi vẫn tiếp tục, vui lòng liên hệ bộ phận hỗ trợ
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
