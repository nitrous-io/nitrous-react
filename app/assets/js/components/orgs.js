import React, { PropTypes } from 'react';
import { Grid, Row, Col, ListGroup, ListGroupItem, Button, ButtonToolbar, Label, Panel } from 'react-bootstrap';

import orgActions from 'actions/org-actions';
import orgStore from 'stores/org-store';
import userStore from 'stores/user-store';
import Fa from 'components/fa';
import Breadcrumb from 'components/bootstrap-backports/breadcrumb';
import BreadcrumbItem from 'components/bootstrap-backports/breadcrumb-item';
import PromptModal from 'components/prompt-modal';
import SelectableText from 'components/selectable-text';

export default class Orgs extends React.Component {
  displayName = 'Orgs';

  static contextTypes = {
    router: PropTypes.func.isRequired
  };

  state = {
    orgs: orgStore.orgs,
    orgToLeave: null,
    orgLeaveConfirmation: null
  };

  componentDidMount() {
    orgStore.onChange(this.orgStoreDidChange);
    orgActions.fetchAll();
    orgStore.on('refresh-required', this.onOrgStoreRefreshRequired);
  }

  componentWillUnmount() {
    orgStore.offChange(this.orgStoreDidChange);
    orgStore.off('refresh-required', this.onOrgStoreRefreshRequired);
  }

  orgStoreDidChange = () => {
    this.setState({ orgs: orgStore.orgs, orgToLeave: null, orgLeaveConfirmation: null });
  }

  onOrgStoreRefreshRequired = () => {
    orgActions.fetchAll();
  }

  handleShowLeaveOrg = (org) => {
    this.setState({ orgToLeave: org, orgLeaveConfirmation: null }, () => {
      this.refs.leaveModal.show();
    });
  }

  handleLeaveModalTextInput = (text) => {
    this.setState({ orgLeaveConfirmation: text });
  }

  handleLeaveModalOK = () => {
    const { orgToLeave } = this.state;
    orgActions.leave(orgToLeave.slug, userStore.user.username);
  }

  render() {
    const { orgs, orgToLeave } = this.state,
          { makeHref } = this.context.router;

    return (
      <div className='orgs-component container'>
        <Breadcrumb>
          <BreadcrumbItem href={makeHref('dashboard')}>Dashboard</BreadcrumbItem>
          <BreadcrumbItem active>Organizations</BreadcrumbItem>
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
                        <Col lg={8} md={8} sm={6} xs={8} className='collaborator-name'>
                          <strong>{org.displayName}</strong>
                          <Label>{org.role}</Label>
                        </Col>
                        <Col lg={3} md={3} sm={5} xs={12} className='actions'>
                          <ButtonToolbar className='pull-right'>
                            {org.roleAllowsMemberView ? (
                              <Button href={makeHref('org-members', { orgSlug: org.slug })}>
                                <Fa icon='users' /> Members
                              </Button>
                            ) : ''}

                            {org.roleAllowsBillingProfileAdmin ? (
                              <Button href={makeHref('org-billing', { orgSlug: org.slug })}>
                                <Fa icon='credit-card' /> Billing
                              </Button>
                            ) : ''}

                            {org.canLeave ? (
                              <Button onClick={this.handleShowLeaveOrg.bind(this, org)}>
                                <Fa icon='sign-out' /> Leave
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

        {orgToLeave ? (
          <PromptModal ref='leaveModal' okButtonLabel='Leave' okButtonStyle='danger'
            okButtonDisabled={this.state.orgLeaveConfirmation !== orgToLeave.slug} placeholder={orgToLeave.slug}
            onOK={this.handleLeaveModalOK} onTextInput={this.handleLeaveModalTextInput}>
            <p>This action <strong>CANNOT</strong> be undone!</p>
            <p>This will remove you from the organization and you will no longer be able to access your workspaces.</p>
            <p>
              Please type in the slug of the organization
              (<SelectableText><strong>{orgToLeave.slug}</strong></SelectableText>)
              to confirm:
            </p>
          </PromptModal>
        ) : ''}
      </div>
    );
  }
}
