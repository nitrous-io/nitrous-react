import React from 'react';
import { RouteHandler } from 'react-router';

import containerStore from 'stores/container-store';
import hostStore from 'stores/host-store';
import orgStore from 'stores/org-store';

export default class FirstStart extends React.Component {
  displayName = 'FirstStart';

  static willTransitionTo(transition) {
    // logic for redirects
    // 1. redirect to user hosts, if any
    // 2. redirect to org hosts, if any
    // 3. redirect to shared projects page if there are shared containers
    // 4. redirect to new org-host page if user belongs to org
    // 5. redirect to new user-host page

    const { userHosts } = hostStore,
          { orgs } = orgStore,
          { sharedContainers } = containerStore;

    if (userHosts.size > 0) {
      return transition.redirect('host', { hostSlug: userHosts.first().slug });
    }

    if (orgs.size > 0) {
      const orgHost = hostStore.orgHosts.first();
      if (orgHost) {
        return transition.redirect('host', { hostSlug: orgHost.slug });
      }
    }

    if (sharedContainers.size > 0) {
      return transition.redirect('shared-containers');
    }

    if (orgs.size > 0) {
      return transition.redirect('org', { orgSlug: orgs.first().slug });
    }

    transition.redirect('user-host');
  }

  render() {
    return (
      <RouteHandler />
    );
  }
}
