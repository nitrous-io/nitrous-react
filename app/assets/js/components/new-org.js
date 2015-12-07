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
import promocodeActions from 'actions/promocode-actions';
import promocodeStore from 'stores/promocode-store';

export default class NewOrg extends React.Component {
  displayName = 'NewOrg';

  static propTypes = {
    query: PropTypes.shape({
      edu: PropTypes.string,
      promo: PropTypes.string
    })
  };

  static contextTypes = {
    router: PropTypes.func.isRequired
  };

  static willTransitionTo() {
    Mp.track(MpEvents.EventViewedNewOrg);
  }

  constructor(props, context) {
    super(props, context);

    this.state = {
      orgName: null,
      orgNameValid: false,
      orgEmail: null,
      orgEmailValid: false,
      orgSlug: null,
      createdOrg: null,
      processing: false,
      paymentFailed: false,
      paymentValid: false,
      plans: this.plansForScope(props),
      promocode: null,
      selectedPlan: this.plansForScope(props).first(),
      emailNotWhitelisted: false
    };
  }

  plansForScope = (props=this.props) => {
    const { edu } = props.query;
    if (edu) {
      return planStore.eduPlans;
    }

    return planStore.orgMultiHostPlans;
  }

  componentWillReceiveProps(nextProps) {
    this.loadPromoCode(nextProps);

    this.setPlans(nextProps);
    planActions.fetchAll();
  }

  componentDidMount() {
    planStore.onChange(this.setPlans);
    orgStore.onChange(this.orgStoreDidChange);
    promocodeStore.onChange(this.promocodeStoreDidChange);
    orgStore.on('create-failed', this.onOrgCreateFailed);
    subscriptionStore.on('subscribed-org-plan', this.onSubscribedOrgPlan);
    subscriptionStore.on('subscribe-org-plan-failed', this.onSubscribeOrgPlanFailed);

    this.refs.orgNameField.getInputDOMNode().focus();

    this.loadPromoCode();
    planActions.fetchAll();
  }

  componentWillUnmount() {
    orgStore.offChange(this.orgStoreDidChange);
    planStore.offChange(this.setPlans);
    promocodeStore.offChange(this.promocodeStoreDidChange);
    orgStore.off('create-failed', this.onOrgCreateFailed);
    subscriptionStore.off('subscribed-org-plan', this.onSubscribedOrgPlan);
    subscriptionStore.off('subscribe-org-plan-failed', this.onSubscribeOrgPlanFailed);
  }

  loadPromoCode = (props=this.props) => {
    const { promo } = props.query;
    if (promo) {
      promocodeActions.fetchBySlug(promo);
    } else {
      this.setState({ promocode: null });
    }
    promocodeActions.fetchAll();
  }

  promocodeStoreDidChange = () => {
    const { promo } = this.props.query;
    if (!promo) {
      this.setState({ promocode: null });
    }
    const promocode = promocodeStore.promocodeBySlug(promo, true);
    this.setState({ promocode });
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

  setPlans = (props=this.props) => {
    const plans = this.plansForScope(props);

    this.setState({
      plans,
      selectedPlan: plans.first()
    });
  };

  onOrgCreateFailed = (data) => {
    const { slug, jqxhr } = data,
          { responseJSON } = jqxhr;
    if (slug === this.state.orgSlug) {
      this.setState({ processing: false });
      this.refs.orgNameField.getInputDOMNode().focus();

      if (responseJSON && responseJSON.error === 'not_edu_whitelisted') {
        this.setState({ emailNotWhitelisted: true });
      }
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
    this.setState({ orgEmail, orgEmailValid: !!orgEmail.trim(), emailNotWhitelisted: false });
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

    const { edu } = this.props.query,
          intent = edu ? "edu" : null;

    orgActions.create({ name: orgName, email: orgEmail, slug: orgSlug, intent });
  }

  handlePaymentSuccess = () => {
    const { createdOrg, selectedPlan, promocode } = this.state,
          promocodeSlug = promocode && promocode.slug;

    if (selectedPlan) {
      subscriptionActions.subscribeOrgPlan(createdOrg.slug, selectedPlan.slug, promocodeSlug);
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

  handlePaymentChange = () => {
    const pm = this.refs.paymentMethod;
    if (pm) {
      this.setState({ paymentValid: !pm.fieldsInvalid() });
    } else {
      this.setState({ paymentValid: false });
    }
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
    const { processing, orgNameValid, orgEmail, selectedPlan, paymentValid } = this.state;
    return processing || !orgNameValid || !orgEmail || !selectedPlan || !paymentValid;
  }

  renderPlanSelection() {
    const { plans, selectedPlan, promocode } = this.state,
          selectedPlanSlug = selectedPlan && selectedPlan.slug;

    if (!plans) {
      return;
    }

    return (
      <Panel header={<h4>Choose a Plan</h4>}>
        <Table className='no-border selectable'>
          <tbody>
            {plans.toList().map((plan) => {
              return (
                <OrgPlanListItem key={`plan-${plan.slug}`} plan={plan}
                  selected={selectedPlanSlug === plan.slug}
                  onSelect={this.handlePlanSelection}
                  providedPromocode={promocode}
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
            orgSlug, createdOrg, processing, paymentFailed, emailNotWhitelisted } = this.state,
          emailHelpText = emailNotWhitelisted ? 'This email has not been whitelisted for Edu plans' : 'Receipts will be sent here',
          emailError = emailNotWhitelisted || (orgEmail && !orgEmailValid);

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
                  bsStyle={emailError ? 'error' : null}
                  value={orgEmail}
                  help={emailHelpText}
                  disabled={createdOrg || processing}
                  onChange={this.handleOrgEmailChanged}
                  onKeyDown={this.handleKeyDown} />
              </Panel>

              {this.renderPlanSelection()}

              <Panel header={<h4>Payment Method</h4>}>
                {paymentFailed ? (
                  <Alert bsStyle='danger'><p>There is an error with your payment details below.</p></Alert>
                ) : ''}

                <PaymentMethod ref='paymentMethod' standalone={false} org={createdOrg}
                  onSuccess={this.handlePaymentSuccess}
                  onFailure={this.handlePaymentFailure}
                  onChange={this.handlePaymentChange} />

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
