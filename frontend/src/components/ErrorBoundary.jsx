import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    console.error('App crashed:', error, info);
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 40, maxWidth: 600 }}>
          <h2 style={{ color: '#d13a3a' }}>Something went wrong on this page</h2>
          <p style={{ color: '#666', marginTop: 8 }}>
            {this.state.error.message || 'Unknown error'}
          </p>
          <button className="btn" style={{ marginTop: 16 }} onClick={() => this.setState({ error: null })}>
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}