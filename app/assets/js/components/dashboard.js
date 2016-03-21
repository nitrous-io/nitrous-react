import React from 'react';
import { RouteHandler } from 'react-router';

import MainNav from 'components/main-nav';
import tokenStore from 'stores/token-store';
import billingStore from 'stores/billing-store';
import freeUsageActions from 'actions/free-usage-actions';
import userActions from 'actions/user-actions';
import orgActions from 'actions/org-actions';
import hostActions from 'actions/host-actions';
import planActions from 'actions/plan-actions';
import regionActions from 'actions/region-actions';
import containerActions from 'actions/container-actions';
import snackbarActions from 'actions/snackbar-actions';
import eventsSocket from 'lib/events-socket';

export default class Dashboard extends React.Component {
  displayName = 'Dashboard';

  static contextTypes = {
    router: React.PropTypes.func.isRequired // Router.PropTypes.router.isRequired
  };

  static preloaded = false;

  static willTransitionTo = (transition, params, query, callback) => {
    if (!tokenStore.token) {
      const { repo } = query;

      transition.redirect('login', {}, {
        returnTo: transition.path,
        repo
      });
      callback();
      return;
    }

    if (this.preloaded) {
      callback();
    } else {
      Promise.all([
        userActions.fetch(),
        orgActions.fetchAll(),
        hostActions.fetchAll(),
        planActions.fetchAll(),
        regionActions.fetchAll(),
        freeUsageActions.fetch()
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

    freeUsageActions.periodicallyFetch();
  }

  componentWillUnmount() {
    eventsSocket.disconnect();
    billingStore.offChange(this.billingStoreDidChange);
    this.constructor.preloaded = false;

    freeUsageActions.stopFetching();
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
