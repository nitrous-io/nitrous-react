import React from 'react';
import { RouteHandler } from 'react-router';
import hostStore from 'stores/host-store';

export default class UserHost extends React.Component {
  displayName = 'UserHost';

  static willTransitionTo(transition) {
    const userHosts = hostStore.userHosts;

    if (userHosts.size > 0) {
      transition.redirect('host', { hostSlug: userHosts.first().slug });
    }
  }

  render() {
    return (
      <RouteHandler />
    );
  }
}
