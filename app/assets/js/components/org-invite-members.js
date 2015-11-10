import React, { PropTypes } from 'react';
import { Button, Grid, Row, Col, Panel } from 'react-bootstrap';

import Org from 'records/org';
import Fa from 'components/fa';
import OrgMemberList from 'components/org-member-list';
import NewOrgSteps from 'components/new-org-steps';

export default class OrgInviteMembers extends React.Component {
  displayName = 'OrgInviteMembers';

  static contextTypes = {
    router: PropTypes.func.isRequired,
    org: PropTypes.instanceOf(Org).isRequired
  };

  render() {
    const { org, router } = this.context,
          { makeHref } = router;

    return (
      <div className='org-invite-members-component container'>
        <h2>New Organization</h2>
        <NewOrgSteps step={3} />
        <Grid className='ui-card-grid'>
          <Row>
            <Col lg={8} md={8} sm={8} xs={12}>
              <Panel header={<h4>Invite Members to Organization</h4>}>
                <OrgMemberList org={org} />
              </Panel>
              <Button href={makeHref('new-org-host', { orgSlug: org.slug })} bsStyle='primary'>Finish</Button>
            </Col>

            <Col lg={4} md={4} sm={4} xs={12}>
              <Panel header={<h4>Organization Members</h4>}>
                <p>All organization members can:</p>

                <ul className='checklist'>
                  <li><Fa icon='check' /> Create workstations</li>
                  <li><Fa icon='check' /> Create and share projects</li>
                  <li><Fa icon='check' /> Create and share snapshots</li>
                  <li><Fa icon='check' /> Code collaboratively in real-time</li>
                </ul>
              </Panel>
              <Panel header={<h4>Organization Roles</h4>}>
                <p>In addition to the above, organization owners and administrators can do the following:</p>
                <h5>Owners</h5>
                <ul className='checklist'>
                  <li><Fa icon='check' /> Manage billing profile</li>
                  <li><Fa icon='check' /> Add &amp; remove owners, admins and members</li>
                </ul>
                <h5>Admins</h5>
                <ul className='checklist'>
                  <li><Fa icon='check' /> Add &amp; remove admins and members</li>
                </ul>
              </Panel>
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}
