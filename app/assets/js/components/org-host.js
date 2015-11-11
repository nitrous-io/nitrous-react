import React, { PropTypes } from 'react';
import { RouteHandler } from 'react-router';
import hostStore from 'stores/host-store';
import Org from 'records/org';

export default class OrgHost extends React.Component {
  displayName = 'OrgHost';

  static contextTypes = {
    org: PropTypes.instanceOf(Org).isRequired,
    router: PropTypes.func.isRequired
  };

  componentWillMount() {
    const { router, org } = this.context;

    if (!org) {
      router.transitionTo('user-host');
      return;
    }

    const orgHosts = hostStore.hostsByOrgId(org.id);
    if (orgHosts.size > 0) {
      router.transitionTo('host', { hostSlug: orgHosts.first().slug });
      return;
    }

    router.transitionTo('new-org-host', { orgSlug: org.slug });
  }

  render() {
    return (
      <RouteHandler />
    );
  }
}
