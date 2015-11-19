import React, { PropTypes } from 'react';
import { Alert, Grid, Row, Button, Panel } from 'react-bootstrap';

import Org from 'records/org';
import billingStore from 'stores/billing-store';
import hostStore from 'stores/host-store';
import planStore from 'stores/plan-store';
import regionStore from 'stores/region-store';
import userStore from 'stores/user-store';
import hostActions from 'actions/host-actions';
import paymentActions from 'actions/payment-actions';
import planActions from 'actions/plan-actions';
import regionActions from 'actions/region-actions';
import ContextSwitcher from 'components/context-switcher';
import PlanListItem from 'components/plan-list-item';
import RegionListItem from 'components/region-list-item';
import PaymentMethod from 'components/payment-method';
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

  state = {
    user: userStore.user,
    billingProfile: this.findBillingProfile(),
    plans: this.context.org ? planStore.orgPlans : planStore.personalPlans,
    regions: regionStore.regions,
    selectedPlan: this.context.org ? planStore.orgPlans.first() : planStore.personalPlans.first(),
    selectedRegion: regionStore.regions.first(),
    creating: false,
    paymentFailed: false
  };

  componentDidMount() {
    planStore.onChange(this.planStoreDidChange);
    regionStore.onChange(this.regionStoreDidChange);
    planActions.fetchAll();
    regionActions.fetchAll();

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

    hostStore.off('create-initiated', this.onHostCreateInitiated);
    hostStore.off('create-failed', this.onHostCreateFailed);
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

  handlePlanSelection = (plan) => {
    this.setState({ selectedPlan: plan });
  };

  handleRegionSelection = (region) => {
    this.setState({ selectedRegion: region });
  };

  handleClickCreateBtn = () => {
    this.setState({ creating: true });

    // If payment is required, we have to wait for payment to be successful
    // before proceeding to create the host.
    if (this.requiresPayment()) {
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
  // Individual context: always allowed.
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

  render() {
    const org = this.context.org,
          { plans, regions, creating, paymentFailed } = this.state,
          selectedPlanSlug = this.state.selectedPlan ? this.state.selectedPlan.slug : null,
          selectedRegionSlug = this.state.selectedRegion ? this.state.selectedRegion.slug : null,
          multiHost = org && org.multiHost;

    let trialEligible = false;
    if (this.state.billingProfile) {
      trialEligible = this.state.billingProfile.trialEligible;
    }

    return (
      <div className='new-host-component'>
        <div className='container'>
          <ContextSwitcher selectedOrg={org} />
          <h2>New Workstation</h2>
          <p className='hint'>All plans are standard with solid state drives (SSD)</p>
          {multiHost ? (
            <p>This org supports multi-host, no plan selection is required.</p>
          ) : (
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
          )}
          <h3>Select Region</h3>
          <p className='hint'>Select the region closest to you for best performance</p>
          <Grid className='ui-card-grid'>
            <Row>
              {regions.toList().map((region) => {
                return (
                  <RegionListItem key={`region-${region.slug}`} region={region}
                    selected={selectedRegionSlug === region.slug}
                    onSelect={this.handleRegionSelection} />
                );
              })}
            </Row>
          </Grid>

          {this.canAddPayment() && this.requiresPayment() ? (
            <Panel header={<h4>Payment Method</h4>} className='payment-method'>
              {paymentFailed ? (
                <Alert bsStyle='danger'><p>There is an error with your payment details below.</p></Alert>
              ) : ''}
              <PaymentMethod standalone={false}
                onSuccess={this.handlePaymentSuccess}
                onFailure={this.handlePaymentFailure} />
            </Panel>
          ) : ''}

          <Button disabled={creating} className='create-btn' bsStyle='primary' onClick={this.handleClickCreateBtn}>{creating ? 'Creating Workstation...' : 'Create Workstation'}</Button>
        </div>
      </div>
    );
  }
}
