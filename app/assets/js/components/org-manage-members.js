import React, { PropTypes } from 'react';

import Org from 'records/org';
import OrgMembers from 'components/org-members';

export default class OrgManageMembers extends React.Component {
  displayName = 'OrgManageMembers';

  static contextTypes = {
    router: PropTypes.func.isRequired,
    org: PropTypes.instanceOf(Org).isRequired
  };

  render() {
    const { org } = this.context;

    return (
      <div className='org-manage-members-component container'>
        <h1>{org.displayName} &mdash; Members</h1>
        <OrgMembers org={org} />
      </div>
    );
  }
}
