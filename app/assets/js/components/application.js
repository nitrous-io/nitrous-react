import React from 'react';
import { RouteHandler } from 'react-router';
import Tasks from 'components/tasks';
import Snackbar from 'components/snackbar';
import appSettingsActions from 'actions/app-settings-actions';

export default class Application extends React.Component {
  displayName = 'Application';

  static preloaded = false;

  static willTransitionTo(transition, params, query, callback) {
    if (this.preloaded) {
      callback();
    } else {
      Promise.all([
        appSettingsActions.fetch()
      ]).then(() => {
        this.preloaded = true;
        callback();
      });
    }
  }

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
