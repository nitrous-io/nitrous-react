import React from 'react';
import { RouteHandler } from 'react-router';

export default class Application extends React.Component {
  displayName: 'Application'

  render() {
    return (
      <div className='application-component'>
        <RouteHandler />
      </div>
    );
  }
}

