import React, { PropTypes } from 'react';
import { Grid, Row, Col, Panel } from 'react-bootstrap';
import { Link } from 'react-router';

import Org from 'records/org';
import Fa from 'components/fa';
import OrgMembers from 'components/org-members';

export default class OrgInviteMembers extends React.Component {
  displayName = 'OrgInviteMembers';

  static contextTypes = {
    router: PropTypes.func.isRequired,
    org: PropTypes.instanceOf(Org).isRequired
  };

  render() {
    const { org } = this.context;

    return (
      <div className='org-invite-members-component container'>
        <Grid>
          <Row>
            <Col lg={8} lgOffset={2} md={10} mdOffset={1} sm={10} smOffset={1} xs={12}>
              <h1>Invite Organization Members</h1>
              <ol>
                <li><Fa icon='check' /> Completed: Create personal account</li>
                <li><Fa icon='check' /> Completed: Add organization info</li>
                <li className='active'>Step 3: Invite organization members</li>
              </ol>
            </Col>
          </Row>

          <Row>
            <Col lg={5} lgOffset={2} md={5} mdOffset={1} sm={12} xs={12}>
              <OrgMembers org={org} />
              <Link to='new-org-host' params={{ orgSlug: org.slug }} className='btn btn-success'>Finish</Link>
            </Col>

            <Col lg={3} md={4} sm={12} xs={12} className='sidebar'>
              <Panel header='Organization Members'>
                <ul className='checklist'>
                  <li><Fa icon='check' /> Create workstations</li>
                  <li><Fa icon='check' /> Play blackjack</li>
                  <li><Fa icon='check' /> We really should</li>
                  <li><Fa icon='check' /> state some real benefits</li>
                </ul>

                <hr />

                <p>As an organization <strong>owner</strong>, you'll have complete access to all of the organization's workstations. You also have control of what members have access to using fine-grained permissions.</p>
              </Panel>
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}
