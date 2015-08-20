import React from 'react';
import { RouteHandler } from 'react-router';
import token from 'models/token';

export default class Application extends React.Component {
  displayName: 'Application'

  static contextTypes = {
    router: React.PropTypes.func.isRequired // Router.PropTypes.router.isRequired
  };

  componentDidMount() {
    this.context.router.transitionTo(token.isPresent() ? 'dashboard' : 'login');
  }

  render() {
    return (
      <div className='application-component'>
        <RouteHandler />
      </div>
    );
  }
}

