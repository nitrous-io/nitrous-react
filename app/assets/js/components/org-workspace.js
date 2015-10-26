import React, { PropTypes } from 'react';
import { RouteHandler } from 'react-router';
import hostStore from 'stores/host-store';
import Org from 'records/org';

export default class OrgWorkspace extends React.Component {
  displayName = 'OrgWorkspace';

  static contextTypes = {
    org: PropTypes.instanceOf(Org).isRequired,
    router: PropTypes.func.isRequired
  };

  componentWillMount() {
    const { router, org } = this.context;

    if (org) {
      const orgHosts = hostStore.hostsByOrgId(org.id);

      if (orgHosts.size > 0) {
        router.transitionTo('workspace', { hostSlug: orgHosts.first().slug });
      }
    } else {
      router.transitionTo('user-workspace');
    }
  }

  render() {
    return (
      <RouteHandler />
    );
  }
}
