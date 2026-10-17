import { Component } from 'react';

class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error(`${this.props.title || 'App'} failed to render`, error, info.componentStack);
  }

  render() {
    if (!this.state.error) {
      return this.props.children;
    }

    return (
      <div className="app-error-fallback" role="alert">
        <strong>{this.props.title || 'This app'} could not start.</strong>
        <span>
          {this.props.hint || 'Something went wrong while loading it. The rest of the site still works.'}
        </span>
        <button type="button" onClick={() => this.setState({ error: null })}>
          Try again
        </button>
      </div>
    );
  }
}

export default AppErrorBoundary;
