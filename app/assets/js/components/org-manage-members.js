import React, { PropTypes } from 'react';

import Org from 'records/org';
import OrgMembers from 'components/org-members';
import Breadcrumb from 'components/bootstrap-backports/breadcrumb';
import BreadcrumbItem from 'components/bootstrap-backports/breadcrumb-item';

export default class OrgManageMembers extends React.Component {
  displayName = 'OrgManageMembers';

  static contextTypes = {
    router: PropTypes.func.isRequired,
    org: PropTypes.instanceOf(Org).isRequired
  };

  render() {
    const { org } = this.context,
          { makeHref } = this.context.router;

    return (
      <div className='org-manage-members-component container'>
        <Breadcrumb>
          <BreadcrumbItem href={makeHref('orgs')}>Orgs</BreadcrumbItem>
          <BreadcrumbItem active>Members</BreadcrumbItem>
        </Breadcrumb>

        <h2>{org.displayName} &mdash; Members</h2>
        <OrgMembers org={org} />
      </div>
    );
  }
}
