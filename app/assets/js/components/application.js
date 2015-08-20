import React from 'react';
import { RouteHandler } from 'react-router';
import token from 'models/token';

export default class Application extends React.Component {
  displayName: 'Application'

  static contextTypes = {
    router: React.PropTypes.func.isRequired // Router.PropTypes.router.isRequired
  };

  componentDidMount() {
    if (!token.isPresent()) {
      this.context.router.transitionTo('login');
    }
  }

  render() {
    return (
      <div>
        <RouteHandler />
      </div>
    );
  }
}

