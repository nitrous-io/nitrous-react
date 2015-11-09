import React, { PropTypes } from 'react';
import { Grid, Row, Col, Alert, Button, Input, Panel, Table } from 'react-bootstrap';
import slug from 'slug';

import orgStore from 'stores/org-store';
import planStore from 'stores/plan-store';
import orgActions from 'actions/org-actions';
import paymentActions from 'actions/payment-actions';
import planActions from 'actions/plan-actions';
import Fa from 'components/fa';
import PaymentMethod from 'components/payment-method';

export default class NewOrg extends React.Component {
  displayName = 'NewOrg';

  static contextTypes = {
    router: PropTypes.func.isRequired
  };

  state = {
    plans: planStore.orgPlans,
    selectedPlan: planStore.orgPlans.first(),
    orgName: null,
    orgNameValid: false,
    orgEmail: null,
    orgEmailValid: false,
    orgSlug: null,
    createdOrg: null,
    processing: false,
    paymentFailed: false
  };

  componentDidMount() {
    planStore.onChange(this.planStoreDidChange);
    planActions.fetchAll();

    orgStore.onChange(this.orgStoreDidChange);
    orgStore.on('create-failed', this.onOrgCreateFailed);

    this.refs.orgNameField.getInputDOMNode().focus();
  }

  componentWillUnmount() {
    planStore.offChange(this.planStoreDidChange);

    orgStore.offChange(this.orgStoreDidChange);
    orgStore.off('create-failed', this.onOrgCreateFailed);
  }

  planStoreDidChange = () => {
    const plans = planStore.orgPlans,
          selectedPlan = this.state.selectedPlan || plans.first();
    this.setState({ plans, selectedPlan });
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

  handlePlanSelected = (plan) => {
    this.setState({ selectedPlan: plan });
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
    const org = this.state.createdOrg;
    this.context.router.transitionTo('org-invite-members', { orgSlug: org.slug });
  }

  handlePaymentFailure = () => {
    this.setState({ processing: false, paymentFailed: true });
  }

  submitDisabled = () => {
    const { processing, orgNameValid, orgEmail, selectedPlan } = this.state;
    return processing || !orgNameValid || !orgEmail || !selectedPlan;
  }

  render() {
    const { plans, selectedPlan, orgName, orgNameValid, orgEmail, orgEmailValid,
            orgSlug, createdOrg, processing, paymentFailed } = this.state;

    return (
      <div className='new-org-component container'>
        <Grid>
          <Row>
            <Col lg={8} lgOffset={2} md={10} mdOffset={1} sm={10} smOffset={1} xs={12}>
              <h1>Create an Organization</h1>
              <ol>
                <li className='active'><Fa icon='check' /> Completed: Create personal account</li>
                <li>Step 2: Add organization info</li>
                <li>Step 3: Invite organization members</li>
              </ol>
            </Col>
          </Row>
          <Row>
            <Col lg={5} lgOffset={2} md={5} mdOffset={1} sm={5} smOffset={1} xs={12}>
              <h3>Organization Info</h3>

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

              <hr />

              <h3>Choose a Plan</h3>

              <Table responsive striped>
                <colgroup>
                  <col className='col-lg-4 col-md-4 col-sm-4 col-xs-3' />
                  <col className='col-lg-3 col-md-3 col-sm-3 col-xs-3' />
                  <col className='col-lg-3 col-md-3 col-sm-3 col-xs-3' />
                  <col className='col-lg-2 col-md-2 col-sm-2 col-xs-3' />
                </colgroup>
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
                    const price = (plan.price / 100).toFixed(2),
                          selected = (selectedPlan && selectedPlan.slug === plan.slug);

                    return (
                      <tr key={`plan-${plan.slug}`}>
                        <td><strong>{plan.name}</strong></td>
                        <td>{price}/mo</td>
                        <td><Fa icon='frown-o' /> FIXME</td>
                        <td>
                          <Button
                            bsStyle={selected ? 'primary' : 'default'}
                            onClick={this.handlePlanSelected.bind(this, plan)}>
                            {selected? 'Selected' : 'Select'}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>

              <hr />

              <h3>Payment Method</h3>

              {paymentFailed ? (
                <Alert bsStyle='danger'><p>There is an error with your payment details below.</p></Alert>
              ) : ''}

              <PaymentMethod standalone={false} org={createdOrg}
                onSuccess={this.handlePaymentSuccess}
                onFailure={this.handlePaymentFailure} />

              <Button type='submit' bsStyle='success'
                disabled={this.submitDisabled()}
                onClick={this.handleClickCreateBtn}>
                {processing ? 'Creating Organization...' : 'Create Organization'}
              </Button>
            </Col>

            <Col lg={3} lgOffset={0} md={4} mdOffset={1} sm={4} smOffset={1} xs={12}>
              <Panel header='Organizations'>
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
