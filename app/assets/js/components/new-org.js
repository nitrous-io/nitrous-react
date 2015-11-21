import React, { PropTypes } from 'react';
import { Grid, Row, Col, Alert, Button, Input, Panel, Table } from 'react-bootstrap';
import slug from 'slug';

import orgStore from 'stores/org-store';
import orgActions from 'actions/org-actions';
import paymentActions from 'actions/payment-actions';
import Fa from 'components/fa';
import PaymentMethod from 'components/payment-method';
import NewOrgSteps from 'components/new-org-steps';
import Mp from 'lib/mp';
import MpEvents from 'lib/mp-events';
import planStore from 'stores/plan-store';
import planActions from 'actions/plan-actions';
import subscriptionStore from 'stores/subscription-store';
import subscriptionActions from 'actions/subscription-actions';
import OrgPlanListItem from 'components/org-plan-list-item';

export default class NewOrg extends React.Component {
  displayName = 'NewOrg';

  static propTypes = {
    query: PropTypes.shape({
      beta: PropTypes.string
    })
  };

  static contextTypes = {
    router: PropTypes.func.isRequired
  };

  static willTransitionTo() {
    Mp.track(MpEvents.EventViewedNewOrg);
  }

  state = {
    orgName: null,
    orgNameValid: false,
    orgEmail: null,
    orgEmailValid: false,
    orgSlug: null,
    createdOrg: null,
    processing: false,
    paymentFailed: false,
    plans: planStore.orgBetaPlans,
    selectedPlan: null
  };

  componentDidMount() {
    planStore.onChange(this.planStoreDidChange);
    orgStore.onChange(this.orgStoreDidChange);
    orgStore.on('create-failed', this.onOrgCreateFailed);
    subscriptionStore.on('subscribed-org-plan', this.onSubscribedOrgPlan);
    subscriptionStore.on('subscribe-org-plan-failed', this.onSubscribeOrgPlanFailed);

    this.refs.orgNameField.getInputDOMNode().focus();
    planActions.fetchAll();
  }

  componentWillUnmount() {
    orgStore.offChange(this.orgStoreDidChange);
    planStore.offChange(this.planStoreDidChange);
    orgStore.off('create-failed', this.onOrgCreateFailed);
    subscriptionStore.off('subscribed-org-plan', this.onSubscribedOrgPlan);
    subscriptionStore.off('subscribe-org-plan-failed', this.onSubscribeOrgPlanFailed);
  }

  orgStoreDidChange = () => {
    const { orgSlug } = this.state;
    if (!orgSlug) {
      return;
    }

    const org = orgStore.orgByOrgSlug(orgSlug);
    if (!org) {
      return;
    }

    if (this.state.processing) {
      this.setState({ createdOrg: org });

      // If the org store contains the org, it means it was successfully created,
      // so we proceed to save the payment method.
      paymentActions.requestSubmit();
    }
  }

  planStoreDidChange = () => {
    const plans = planStore.orgBetaPlans;

    this.setState({
      plans,
      selectedPlan: plans.first()
    });
  };

  onOrgCreateFailed = (data) => {
    const { slug } = data;
    if (slug === this.state.orgSlug) {
      this.setState({ processing: false });
      this.refs.orgNameField.getInputDOMNode().focus();
    }
  }

  // To simulate form submission using Enter, since we do not use a real <form>.
  handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      this.handleClickCreateBtn();
    }
  }

  handleOrgNameChanged = (event) => {
    const orgName = event.target.value,
          orgSlug = slug(orgName, { lower: true });

    this.setState({ orgName, orgSlug, orgNameValid: (orgName && orgSlug) });

    // TODO In future, when the API supports it, we can check whether the org
    // name is still available and display early feedback.
  }

  handleOrgEmailChanged = (event) => {
    const orgEmail = event.target.value;
    this.setState({ orgEmail, orgEmailValid: !!orgEmail.trim() });
  }

  handleClickCreateBtn = () => {
    if (this.submitDisabled()) {
      return;
    }

    this.setState({ processing: true });

    const { createdOrg, orgName, orgEmail, orgSlug } = this.state;

    // If org has already been created, it means that org creation succeeded,
    // but there was an error in the PaymentMethod form, so don't try to create
    // the org again.
    if (createdOrg) {
      this.setState({ paymentFailed: false });
      paymentActions.requestSubmit();
      return;
    }

    orgActions.create({ name: orgName, email: orgEmail, slug: orgSlug });
  }

  handlePaymentSuccess = () => {
    const { createdOrg, selectedPlan } = this.state,
          { beta } = this.props.query;

    if (beta === 'true' && selectedPlan) {
      subscriptionActions.subscribeOrgPlan(createdOrg.slug, selectedPlan.slug);
      return;
    }

    this.transitionToInviteMembers();
  }

  onSubscribedOrgPlan = (data) => {
    const { orgSlug } = data,
          { createdOrg } = this.state;

    if (createdOrg.slug === orgSlug) {
      orgActions.fetch(orgSlug);
      this.transitionToInviteMembers();
    }
  }

  transitionToInviteMembers = () => {
    const { createdOrg } = this.state;
    this.context.router.transitionTo('org-invite-members', { orgSlug: createdOrg.slug });
  }

  handlePaymentFailure = () => {
    this.setState({ processing: false, paymentFailed: true });
  }

  onSubscribeOrgPlanFailed = (data) => {
    const { orgSlug } = data,
          { createdOrg } = this.state;

    if (createdOrg.slug === orgSlug) {
      this.setState({ processing: false, paymentFailed: true });
    }
  }

  handlePlanSelection = (plan) => {
    this.setState({ selectedPlan: plan });
  };

  submitDisabled = () => {
    const { processing, orgNameValid, orgEmail } = this.state;
    return processing || !orgNameValid || !orgEmail;
  }

  renderPlanSelection() {
    const { beta } = this.props.query,
          { plans, selectedPlan } = this.state,
          selectedPlanSlug = selectedPlan && selectedPlan.slug;

    if (beta !== 'true' || !plans) {
      return;
    }

    return (
      <Panel header={<h4>Choose a Plan</h4>}>
        <Table responsive hover>
          <thead>
            <tr>
              <th>Plan</th>
              <th>Cost</th>
              <th>Workstations</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {plans.toList().map((plan) => {
              return (
                <OrgPlanListItem key={`plan-${plan.slug}`} plan={plan}
                  selected={selectedPlanSlug === plan.slug} // compare slug because plans may have been reloaded
                  onSelect={this.handlePlanSelection}
                />
              );
            })}
          </tbody>
        </Table>
      </Panel>
    );
  }

  render() {
    const { orgName, orgNameValid, orgEmail, orgEmailValid,
            orgSlug, createdOrg, processing, paymentFailed } = this.state;

    return (
      <div className='new-org-component container'>
        <h2>New Organization</h2>
        <NewOrgSteps />
        <Grid className='ui-card-grid'>
          <Row>
            <Col lg={8} md={8} sm={8} xs={12}>
              <Panel header={<h4>Organization Info</h4>}>
                <Input type='text' required placeholder='Planet Express Shipping'
                  ref='orgNameField'
                  id='org-name'
                  label='Organization Name'
                  bsStyle={orgName && !orgNameValid ? 'error' : null}
                  value={orgName}
                  help={orgSlug ? (
                    <span className='help-block'>
                      Your organization slug will be <strong>{orgSlug}</strong>
                    </span>
                  ): null}
                  disabled={createdOrg || processing}
                  onChange={this.handleOrgNameChanged}
                  onKeyDown={this.handleKeyDown} />

                <Input type='email' required placeholder='bender@planetexpress.com'
                  ref='orgEmailField'
                  id='org-email'
                  label='Billing Email'
                  bsStyle={orgEmail && !orgEmailValid ? 'error' : null}
                  value={orgEmail}
                  help='Receipts will be sent here'
                  disabled={createdOrg || processing}
                  onChange={this.handleOrgEmailChanged}
                  onKeyDown={this.handleKeyDown} />
              </Panel>

              {this.renderPlanSelection()}

              <Panel header={<h4>Payment Method</h4>}>
                {paymentFailed ? (
                  <Alert bsStyle='danger'><p>There is an error with your payment details below.</p></Alert>
                ) : ''}

                <PaymentMethod standalone={false} org={createdOrg}
                  onSuccess={this.handlePaymentSuccess}
                  onFailure={this.handlePaymentFailure} />

              </Panel>

              <Button type='submit' bsStyle='primary'
                disabled={this.submitDisabled()}
                onClick={this.handleClickCreateBtn}>
                {processing ? 'Creating Organization...' : 'Create Organization'}
              </Button>
            </Col>

            <Col lg={4} md={4} sm={4} xs={12}>
              <Panel header={<h4>Organizations</h4>}>
                <h5>Organization Plans</h5>
                <ul className='checklist'>
                  <li><Fa icon='check' /> Centralized billing</li>
                  <li><Fa icon='check' /> Permissions management</li>
                  <li><Fa icon='check' /> Shared snapshots</li>
                </ul>
                <p>The credit card and plan you select on this screen will be billed to the organization billing profile, not your individual user account.</p>

                <hr />

                <h5>Org Ownership</h5>
                <p>You’ll be able to invite other owners to this organization in the next step. Organization owners have the highest privileges for org management and can edit and view billing information as well as invite and manage organization members.</p>
              </Panel>
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}
