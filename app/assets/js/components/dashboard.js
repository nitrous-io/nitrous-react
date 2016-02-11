import React from 'react';
import { RouteHandler } from 'react-router';

import TopNav from 'components/top-nav';
import tokenStore from 'stores/token-store';
import userActions from 'actions/user-actions';
import orgActions from 'actions/org-actions';
import hostActions from 'actions/host-actions';
import planActions from 'actions/plan-actions';
import regionActions from 'actions/region-actions';
import containerActions from 'actions/container-actions';
import eventsSocket from 'lib/events-socket';

export default class Dashboard extends React.Component {
  displayName = 'Dashboard';

  static contextTypes = {
    router: React.PropTypes.func.isRequired // Router.PropTypes.router.isRequired
  };

  static preloaded = false;

  static willTransitionTo = (transition, params, query, callback) => {
    if (!tokenStore.token) {
      transition.redirect('login');
      callback();
      return;
    }

    if (this.preloaded) {
      callback();
    } else {
      Promise.all([
        userActions.fetch(),
        userActions.periodicallyFetch(),
        orgActions.fetchAll(),
        hostActions.fetchAll(),
        planActions.fetchAll(),
        regionActions.fetchAll()
      ]).then(() => {
        this.preloaded = true;
        callback();
        // does not have to be fetched synchronously
        containerActions.fetchAllShared();
      }).catch(() => {
        this.preloaded = false;
      });
    }
  }

  componentDidMount() {
    eventsSocket.connect(tokenStore.token);
  }

  componentWillUnmount() {
    eventsSocket.disconnect();
    this.constructor.preloaded = false;
  }

  render() {
    return (
      <div className='dashboard-component'>
        <TopNav />
        <div className='main-content-wrapper'>
          <RouteHandler />
        </div>
      </div>
    );
  }
}
