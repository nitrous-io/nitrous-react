import React from 'react';
import { RouteHandler } from 'react-router';
import hostStore from 'stores/host-store';

export default class UserWorkspace extends React.Component {
  displayName = 'UserWorkspace';

  static willTransitionTo(transition) {
    const userHosts = hostStore.userHosts;

    if (userHosts.size > 0) {
      transition.redirect('workspace', { hostSlug: userHosts.first().slug });
    }
  }

  render() {
    return (
      <RouteHandler />
    );
  }
}
