import React, { PropTypes } from 'react';
import { Grid, Row, Col, ListGroup, ListGroupItem, Button, ButtonToolbar, Label, Panel } from 'react-bootstrap';

import orgActions from 'actions/org-actions';
import orgStore from 'stores/org-store';
import Fa from 'components/fa';
import Breadcrumb from 'components/bootstrap-backports/breadcrumb';
import BreadcrumbItem from 'components/bootstrap-backports/breadcrumb-item';

export default class Orgs extends React.Component {
  displayName = 'Orgs';

  static contextTypes = {
    router: PropTypes.func.isRequired
  };

  state = {
    orgs: orgStore.orgs
  };

  componentDidMount() {
    orgStore.onChange(this.orgStoreDidChange);
    orgActions.fetchAll();
  }

  componentWillUnmount() {
    orgStore.offChange(this.orgStoreDidChange);
  }

  orgStoreDidChange = () => {
    this.setState({ orgs: orgStore.orgs });
  }

  render() {
    const { orgs } = this.state,
          { makeHref } = this.context.router;

    return (
      <div className='orgs-component container'>
        <Breadcrumb>
          <BreadcrumbItem href={makeHref('dashboard')}>Dashboard</BreadcrumbItem>
          <BreadcrumbItem active>Orgs</BreadcrumbItem>
        </Breadcrumb>

        <Panel header={<h4>Organizations</h4>}>
          <div className="ui-card-grid">
            <ListGroup>
              {orgs.toList().map((org) => {
                return (
                  <ListGroupItem key={`org-${org.slug}`}>
                    <Grid>
                      <Row>
                        <Col lg={1} md={1} sm={1} xs={2} className='user-avatar'>
                          <img className='gravatar' src={org.gravatar(72)} />
                        </Col>
                        <Col lg={8} md={8} sm={8} xs={8} className='collaborator-name'>
                          <strong>{org.displayName}</strong>
                          <Label>{org.role}</Label>
                        </Col>
                        <Col lg={3} md={3} sm={3} xs={12} className='actions'>
                          <ButtonToolbar className='pull-right'>
                            {org.roleAllowsBillingProfileAdmin ? (
                              <Button href={makeHref('org-billing', { orgSlug: org.slug })}>
                                <Fa icon='credit-card' /> Billing
                              </Button>
                            ) : ''}

                            {org.roleAllowsMemberAdmin ? (
                              <Button href={makeHref('org-manage-members', { orgSlug: org.slug })}>
                                <Fa icon='users' /> Members
                              </Button>
                            ) : ''}
                          </ButtonToolbar>
                        </Col>
                      </Row>
                    </Grid>

                  </ListGroupItem>
                );
              })}
            </ListGroup>
          </div>
        </Panel>
      </div>
    );
  }
}
