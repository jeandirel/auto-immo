import React from 'react'

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props)
        this.state = { hasError: false, error: null, errorInfo: null }
    }

    static getDerivedStateFromError(error) {
        return { hasError: true }
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ error, errorInfo })
        console.error("Uncaught error:", error, errorInfo)
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '2rem', fontFamily: 'sans-serif', backgroundColor: '#FEF2F2', minHeight: '100vh', color: '#991B1B' }}>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>⚠️ Une erreur est survenue</h1>
                    <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
                        <h2 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Erreur :</h2>
                        <pre style={{ color: '#DC2626', whiteSpace: 'pre-wrap', marginBottom: '1rem' }}>
                            {this.state.error && this.state.error.toString()}
                        </pre>
                        <h2 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Détails techniques :</h2>
                        <pre style={{ fontSize: '0.875rem', overflowX: 'auto', backgroundColor: '#F3F4F6', padding: '1rem', borderRadius: '0.25rem' }}>
                            {this.state.errorInfo && this.state.errorInfo.componentStack}
                        </pre>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        style={{ marginTop: '2rem', padding: '0.5rem 1rem', backgroundColor: '#DC2626', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }}
                    >
                        Rafraîchir la page
                    </button>
                </div>
            )
        }

        return this.props.children
    }
}

export default ErrorBoundary
