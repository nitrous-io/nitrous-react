import React, { PropTypes } from 'react';
import { Alert, Grid, Row, Col, Button } from 'react-bootstrap';

import Org from 'records/org';
import billingStore from 'stores/billing-store';
import hostStore from 'stores/host-store';
import planStore from 'stores/plan-store';
import regionStore from 'stores/region-store';
import userStore from 'stores/user-store';
import subscriptionStore from 'stores/subscription-store';
import tokenStore from 'stores/token-store';
import hostActions from 'actions/host-actions';
import paymentActions from 'actions/payment-actions';
import planActions from 'actions/plan-actions';
import promocodeActions from 'actions/promocode-actions';
import snackbarActions from 'actions/snackbar-actions';
import subscriptionActions from 'actions/subscription-actions';
import userActions from 'actions/user-actions';
import regionActions from 'actions/region-actions';
import ContextSwitcher from 'components/context-switcher';
import PlanListItem from 'components/plan-list-item';
import RegionListItem from 'components/region-list-item';
import PaymentMethod from 'components/payment-method';
import Fa from 'components/fa';
import Mp from 'lib/mp';
import MpEvents from 'lib/mp-events';

export default class NewHost extends React.Component {
  displayName = 'NewHost';

  static contextTypes = {
    router: PropTypes.func.isRequired, // Router.PropTypes.router.isRequired
    org: PropTypes.instanceOf(Org)
  };

  static willTransitionTo(transition) {
    if (transition.path && transition.path.includes("/orgs")) {
      Mp.track(MpEvents.EventDashboardViewedNewOrgHost);
    } else {
      Mp.track(MpEvents.EventDashboardViewedNewHost);
    }
  }

  findBillingProfile = () => {
    const org = this.context.org;
    if (org) {
      return billingStore.orgBillingProfiles.get(org.id);
    }
    return billingStore.userBillingProfile;
  }

  constructor(props, context) {
    super(props, context);

    this.state = {
      user: userStore.user,
      token: tokenStore.token,
      subscription: this.findSubscription(),
      billingProfile: this.findBillingProfile(),
      plans: this.context.org ? planStore.orgPlans : planStore.personalPlans,
      regions: regionStore.regions,
      selectedPlan: this.context.org ? planStore.orgPlans.first() : planStore.personalPlans.first(),
      selectedRegion: regionStore.regions.first(),
      creating: false,
      paymentFailed: false,
      resendingConfirmation: false,
      confirmationResent: false
    };
  }

  componentDidMount() {
    planStore.onChange(this.planStoreDidChange);
    regionStore.onChange(this.regionStoreDidChange);
    subscriptionStore.onChange(this.subscriptionStoreDidChange);
    this.fetchObjects();

    hostStore.on('create-initiated', this.onHostCreateInitiated);
    hostStore.on('create-failed', this.onHostCreateFailed);
  }

  componentWillReceiveProps(nextProps, nextContext) {
    if (this.context.org !== nextContext.org) {
      this.setBillingProfile(nextContext);
      this.setPlans(nextContext);
    }
  }

  componentWillUnmount() {
    planStore.offChange(this.planStoreDidChange);
    regionStore.offChange(this.regionStoreDidChange);
    subscriptionStore.offChange(this.subscriptionStoreDidChange);

    hostStore.off('create-initiated', this.onHostCreateInitiated);
    hostStore.off('create-failed', this.onHostCreateFailed);
  }

  fetchObjects = (context=this.context) => {
    planActions.fetchAll();
    regionActions.fetchAll();
    promocodeActions.fetchAll();

    const { org } = context;
    if (org && this.isOrgOwner()) {
      subscriptionActions.fetchAllByOrgSlug(org.slug);
    }
  }

  onHostCreateInitiated = (data) => {
    const { host } = data;
    this.context.router.transitionTo('host-creating', {}, { hostSlug: host.slug });
  };

  onHostCreateFailed = () => {
    this.setState({ creating: false });
  };

  setBillingProfile(context=this.context) {
    const billingProfile = context.org ?
      billingStore.orgBillingProfiles.get(context.org.id) :
      billingStore.userBillingProfile;
    this.setState({ billingProfile });
  }

  setPlans(context=this.context) {
    const plans = context.org ? planStore.orgPlans : planStore.personalPlans,
          noPlan = context.org && context.org.multiHost;

    this.setState({
      plans,
      selectedPlan: noPlan ? null : (this.state.selectedPlan || plans.first())
    });
  }

  userStoreDidChange = () => {
    this.setState({ user: userStore.user });
  };

  subscriptionStoreDidChange = () => {
    const subscription = this.findSubscription();
    this.setState({ subscription });
  };

  findSubscription() {
    const { org } = this.context,
          orgSub = org ? subscriptionStore.orgSubscriptionsBySlug(org.slug) : null;
    if (orgSub) {
      return orgSub.first();
    }
    return null;
  }

  planStoreDidChange = () => {
    this.setPlans();
  };

  regionStoreDidChange = () => {
    const regions = regionStore.regions;
    this.setState({
      regions,
      selectedRegion: this.state.selectedRegion || regions.first()
    });
  };

  handleResendConfirmation = () => {
    this.setState({ resendingConfirmation: true });
    userActions.resendConfirmation({ appToken: this.state.token }).then(() => {
      this.setState({ resendingConfirmation: false, confirmationResent: true });
    }).catch(() => {
      this.setState({ resendingConfirmation: false });
      snackbarActions.post('Unable to resend confirmation email, please contact support.');
    });
  }

  handlePlanSelection = (plan) => {
    this.setState({ selectedPlan: plan });
  };

  handleRegionSelection = (region) => {
    this.setState({ selectedRegion: region });
  };

  handleClickCreateBtn = () => {
    const { org } = this.context;
    this.setState({ creating: true });

    // If payment is required, we have to wait for payment to be successful
    // before proceeding to create the host.
    if ((!org || (org && !org.multiHost)) && this.requiresPayment()) {
      if (!this.canAddPayment()) {
        snackbarActions.post('Please ask your owner to add a card to your Org.');
        this.setState({ creating: false });
        return;
      }
      paymentActions.requestSubmit();
      return;
    }

    this.createHost();
  };

  handlePaymentSuccess = () => {
    this.createHost();
  };

  handlePaymentFailure = () => {
    this.setState({ creating: false, paymentFailed: true });
  };

  createHost = () => {
    const { user, selectedPlan, selectedRegion } = this.state,
          { org } = this.context,
          name = user.username; // use username for name of host
    hostActions.create({ name, org, plan: selectedPlan, region: selectedRegion });
  };

  // Whether user is allowed to add a payment method.
  // Individual context: allowed if user has confirmed their email address.
  // Org context: only owners are allowed to add a payment method.
  canAddPayment = () => {
    const { org } = this.context;
    if (org) {
      return org.roleAllowsBillingProfileAdmin;
    }
    return true;
  };

  requiresPayment() {
    const { billingProfile } = this.state;
    return billingProfile && !billingProfile.hasCard;
  }

  hostsLimitReached() {
    const { org } = this.context;
    if (org) {
      return org.usedHosts >= org.validMaxHosts;
    }
    return false;
  }

  isOrgOwner() {
    const { org } = this.context;
    if (org && org.role) {
      return org.role === 'owner';
    }
    return false;
  }

  canUpgrade() {
    const { org } = this.context;
    if (org) {
      return !planStore.plansForUpgrade(org.plan).isEmpty();
    }
    return false;
  }

  submitDisabled() {
    const { creating, user } = this.state;
    return (user && !user.confirmed)
      || creating
      || this.hostsLimitReached();
  }

  renderPlanSelection() {
    const org = this.context.org,
          { plans } = this.state,
          selectedPlanSlug = this.state.selectedPlan ? this.state.selectedPlan.slug : null,
          multiHost = org && org.multiHost,
          orgPlan = org && org.plan;

    let trialEligible = false;
    if (this.state.billingProfile) {
      trialEligible = this.state.billingProfile.trialEligible;
    }

    if (!multiHost) {
      return (
        <div>
          <p className='hint'>All plans are standard with solid state drives (SSD)</p>
          <Grid className='ui-card-grid'>
            <Row>
              {plans.toList().map((plan) => {
                return (
                  <PlanListItem key={`plan-${plan.slug}`} plan={plan}
                    selected={selectedPlanSlug === plan.slug} // compare slug because plans may have been reloaded
                    onSelect={this.handlePlanSelection}
                    trialEligible={trialEligible}
                  />
                );
              })}
            </Row>
          </Grid>
        </div>
      );
    }

    if (!orgPlan) {
      return (<p>This org supports multi-host, no plan selection is required.</p>);
    }

    return (
      <div>
        <h3>{`Your organization's plan`}</h3>
        <Grid className='ui-card-grid'>
          <Row>
            <PlanListItem key={`plan-${orgPlan.slug}`} plan={orgPlan}
              selected={selectedPlanSlug === orgPlan.slug} // compare slug because plans may have been reloaded
              onSelect={this.handlePlanSelection}
              trialEligible={false}
              disabled
            />
          </Row>
        </Grid>
      </div>
    );
  }

  render() {
    const org = this.context.org,
          { user, subscription, regions, creating, paymentFailed,
            resendingConfirmation, confirmationResent } = this.state,
          selectedRegionSlug = (this.state.selectedRegion && !this.hostsLimitReached()) ? this.state.selectedRegion.slug : null,
          emailOwnerLink = (org && org.email) ? 'mailto:' + org.email + '?subject=Workstation Limit Reached' : null,
          { makeHref } = this.context.router,
          subscriptionsUpgradeURL = (subscription && org) ? makeHref('org-subscriptions-upgrade', { subscriptionSlug: subscription.slug, orgSlug: org.slug }, { prev: 'new-org-host'}) : null;

    return (
      <div className='new-host-component'>
        <div className='container'>
          <ContextSwitcher selectedOrg={org} />

          {!user.confirmed ? (
            <Alert bsStyle='danger' className='unconfirmed-email clearfix'>
              <p>
                Your email address <strong>{user.unverifiedEmail}</strong> is
                unconfirmed. Please check your inbox for our confirmation
                email.
              </p>
              {confirmationResent ? (
                <Button bsStyle='default' disabled>
                  <Fa icon='paper-plane' /> Sent!
                </Button>
              ) : (
                <Button bsStyle='default'
                  disabled={resendingConfirmation}
                  onClick={this.handleResendConfirmation}>
                  <Fa icon='paper-plane' />
                  {resendingConfirmation ? 'Sending...' : 'Re-send Confirmation Email'}
                </Button>
              )}
            </Alert>
          ) : ''}

          {this.hostsLimitReached() ? (
            <Alert bsStyle="info">
              <Fa icon='exclamation-circle' /> You have reached the maximum number of workstations allowed for your organization
              {this.isOrgOwner() && this.canUpgrade() && subscriptionsUpgradeURL ? <span> - <a href={subscriptionsUpgradeURL}> Upgrade plan</a></span> : ''}
              {!this.isOrgOwner() && this.canUpgrade() && emailOwnerLink ? <span> - <a href={emailOwnerLink}> Notify owner</a></span> : ''}
            </Alert>
          ) : ''}

          <h2>New Workstation</h2>

          {this.renderPlanSelection()}

          <h3>Select a Region</h3>
          <p className='hint'>Select the region closest to you for best performance</p>
          <Grid className='ui-card-grid'>
            <Row>
              {regions.toList().map((region) => {
                return (
                  <RegionListItem key={`region-${region.slug}`} region={region}
                    selected={selectedRegionSlug === region.slug}
                    disabled={this.hostsLimitReached()}
                    onSelect={this.handleRegionSelection} />
                );
              })}
            </Row>
          </Grid>

          {this.canAddPayment() && this.requiresPayment() ? (
            <Grid className='ui-card-grid'>
              <Row>
                <Col lg={6} md={6} sm={6} xs={12}>
                  <h3>Enter your Payment Method</h3>
                  {paymentFailed ? (
                    <Alert bsStyle='danger'>
                      <p>There is an error with your payment details below.</p>
                    </Alert>
                  ) : ''}
                  <PaymentMethod standalone={false}
                    onSuccess={this.handlePaymentSuccess}
                    onFailure={this.handlePaymentFailure} />
                </Col>
              </Row>
            </Grid>
          ) : ''}

          <Button bsStyle='primary' className='create-btn'
            disabled={this.submitDisabled()}
            onClick={this.handleClickCreateBtn}>
            {creating ? 'Creating Workstation...' : 'Create Workstation'}
          </Button>
        </div>
      </div>
    );
  }
}
