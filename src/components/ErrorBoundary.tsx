import React from "react";

interface State {
    hasError: boolean;
}

export default class ErrorBoundary extends React.Component<React.PropsWithChildren, State> {
    state: State = { hasError: false };

    static getDerivedStateFromError(): State {
        return { hasError: true };
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        console.error("Uncaught render error:", error, info);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="d-flex flex-column align-items-center justify-content-center vh-100 text-center px-4">
                    <h2 className="fw-bold text-dark mb-2">Something went wrong</h2>
                    <p className="text-muted mb-4">An unexpected error occurred. Please refresh the page.</p>
                    <button
                        className="btn btn-primary"
                        onClick={() => window.location.reload()}
                    >
                        Refresh page
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}
