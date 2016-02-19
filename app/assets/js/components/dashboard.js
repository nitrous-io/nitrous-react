import React from 'react';
import { RouteHandler } from 'react-router';

import MainNav from 'components/main-nav';
import tokenStore from 'stores/token-store';
import billingStore from 'stores/billing-store';
import userActions from 'actions/user-actions';
import orgActions from 'actions/org-actions';
import hostActions from 'actions/host-actions';
import planActions from 'actions/plan-actions';
import regionActions from 'actions/region-actions';
import containerActions from 'actions/container-actions';
import eventsSocket from 'lib/events-socket';
import snackbarActions from 'actions/snackbar-actions';

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
    billingStore.onChange(this.billingStoreDidChange);
  }

  componentWillUnmount() {
    eventsSocket.disconnect();
    billingStore.offChange(this.billingStoreDidChange);
    this.constructor.preloaded = false;
  }

  billingStoreDidChange = () => {
    if (billingStore.isDelinquent) {
      snackbarActions.post('you have outstanding invoices', 'error');
      this.context.router.transitionTo('billing');
    }
  }

  render() {
    return (
      <div className='dashboard-component'>
        <MainNav />
        <div className='main-content-wrapper'>
          <RouteHandler />
        </div>
      </div>
    );
  }
}
