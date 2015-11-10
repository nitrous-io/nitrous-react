import React, { PropTypes } from 'react';
import { Panel } from 'react-bootstrap';
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
          <BreadcrumbItem href={makeHref('dashboard')}>Dashboard</BreadcrumbItem>
          <BreadcrumbItem href={makeHref('orgs')}>Orgs</BreadcrumbItem>
          <BreadcrumbItem active>{org.displayName}</BreadcrumbItem>
        </Breadcrumb>

        <Panel header={<h4>Manage Members</h4>}>
          <OrgMembers org={org} />
        </Panel>
      </div>
    );
  }
}
