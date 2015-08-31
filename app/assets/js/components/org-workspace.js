import React, { PropTypes } from 'react';
import { RouteHandler } from 'react-router';
import Org from 'records/org';
import hostStore from 'stores/host-store';
import orgStore from 'stores/org-store';

export default class OrgWorkspace extends React.Component {
  displayName: 'OrgWorkspace'

  static childContextTypes = {
    org: PropTypes.instanceOf(Org).isRequired
  };

  static propTypes = {
    params: PropTypes.shape({
      orgSlug: PropTypes.string.isRequired
    })
  };

  static willTransitionTo(transition, params) {
    const orgSlug = params.orgSlug;
    const org = orgStore.orgs.get(orgSlug);

    if (org) {
      const orgHosts = hostStore.hostsByOrgId(org.id);

      if (orgHosts.size > 0) {
        transition.redirect('workspace', { hostSlug: orgHosts.first().slug });
      }
    } else {
      transition.redirect('user-workspace');
    }
  }

  getChildContext() {
    return { org: orgStore.orgs.get(this.props.params.orgSlug) };
  }

  render() {
    return (
      <RouteHandler />
    );
  }
}
