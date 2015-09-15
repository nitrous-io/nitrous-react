import React from 'react';
import { RouteHandler } from 'react-router';
import Snackbar from 'components/snackbar';

export default class Application extends React.Component {
  displayName = 'Application';

  render() {
    return (
      <div className='application-component'>
        <RouteHandler />
        <Snackbar />
      </div>
    );
  }
}
