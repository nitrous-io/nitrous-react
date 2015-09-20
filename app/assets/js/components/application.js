import React from 'react';
import { RouteHandler } from 'react-router';
import Tasks from 'components/tasks';
import Snackbar from 'components/snackbar';

export default class Application extends React.Component {
  displayName = 'Application';

  render() {
    return (
      <div className='application-component'>
        <RouteHandler />
        <Tasks />
        <Snackbar />
      </div>
    );
  }
}
