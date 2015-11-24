import React from 'react';
import { RouteHandler } from 'react-router';

import hostStore from 'stores/host-store';
import orgStore from 'stores/org-store';

export default class FirstStart extends React.Component {
  displayName = 'FirstStart';

  static willTransitionTo(transition) {
    const userHosts = hostStore.userHosts,
          orgs = orgStore.orgs;

    if (userHosts.size === 0 && orgs.size > 0) {
      return transition.redirect('org', { orgSlug: orgs.first().slug });
    }

    if (userHosts.size > 0) {
      return transition.redirect('host', { hostSlug: userHosts.first().slug });
    }

    transition.redirect('user-host');
  }

  render() {
    return (
      <RouteHandler />
    );
  }
}
