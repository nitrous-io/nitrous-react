import React, { PropTypes } from 'react';
import { Panel } from 'react-bootstrap';
import Org from 'records/org';
import OrgNav from 'components/org-nav';
import OrgMemberList from 'components/org-member-list';

export default class OrgMembers extends React.Component {
  displayName = 'OrgMembers';

  static contextTypes = {
    org: PropTypes.instanceOf(Org).isRequired
  };

  render() {
    const { org } = this.context;

    return (
      <div className='org-members-component'>
        <OrgNav org={org} activeTab='members'>
          <Panel header={<h4>Manage Members</h4>}>
            <OrgMemberList org={org} />
          </Panel>
        </OrgNav>
      </div>
    );
  }
}
