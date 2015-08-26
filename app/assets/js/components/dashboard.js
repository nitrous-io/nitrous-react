import React from 'react';
import TopNav from 'components/top-nav';
import { RouteHandler } from 'react-router';
import tokenStore from 'stores/token-store';
import userActions from 'actions/user-actions';
import orgActions from 'actions/org-actions';
import hostActions from 'actions/host-actions';

export default class Dashboard extends React.Component {
  displayName: 'Dashboard'

  static contextTypes = {
    router: React.PropTypes.func.isRequired // Router.PropTypes.router.isRequired
  };

  static preloaded = false;

  static willTransitionTo(transition, params, query, callback) {
    if (!tokenStore.token) {
      transition.redirect('login');
    }

    if (this.preloaded) {
      callback();
    } else {
      Promise.all([
        userActions.fetch(),
        orgActions.fetchAll(),
        hostActions.fetchAll()
      ]).then(() => {
        this.preloaded = true;
        callback();
      });
    }
  }

  render() {
    return (
      <div className='dashboard-component'>
        <TopNav />
        <RouteHandler />
      </div>
    );
  }
}
