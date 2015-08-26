import React, { PropTypes } from 'react';
import hostStore from 'stores/host-store';
import orgStore from 'stores/org-store';

export default class OrgWorkspace extends React.Component {
  displayName: 'OrgWorkspace'

  static propTypes = {
    params: PropTypes.shape({
      orgSlug: PropTypes.string.isRequired
    })
  };

  static willTransitionTo(transition, params) {
    const org = orgStore.orgs.get(params.orgSlug);

    if (org) {
      const orgHosts = hostStore.hostsWithOrgId(org.id);

      if (orgHosts.size > 0) {
        transition.redirect('workspace', { hostSlug: orgHosts.first().slug });
        return;
      }
    }
  }
}
