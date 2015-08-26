import React, { PropTypes } from 'react';
import hostStore from 'stores/host-store';
import orgStore from 'stores/org-store';
import ContextSwitcher from 'components/context-switcher';

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
      const orgHosts = hostStore.hostsByOrgId(org.id);

      if (orgHosts.size > 0) {
        transition.redirect('workspace', { hostSlug: orgHosts.first().slug });
        return;
      }
    } else {
      transition.redirect('user-workspace');
    }
  }

  render() {
    const selectedOrg = orgStore.orgs.get(this.props.params.orgSlug);

    return (
      <div className='org-workspace-component workspace-component'>
        <div className='container'>
          <ContextSwitcher selectedOrg={selectedOrg} />
          <p>no workspace created</p>
        </div>
      </div>
    );
  }
}
