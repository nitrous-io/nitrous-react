import React, { PropTypes } from 'react';
import { Grid, Row, Button, Modal, Panel, ButtonGroup, ButtonToolbar } from 'react-bootstrap';

import PlanListItem from 'components/plan-list-item';
import LoadingIndicator from 'components/loading-indicator';
import Fa from 'components/fa';
import UserNav from 'components/user-nav';
import PaymentMethod from 'components/payment-method';
import BankCard from 'components/bank-card';
import subscriptionStore from 'stores/subscription-store';
import billingStore from 'stores/billing-store';
import planStore from 'stores/plan-store';
import hostStore from 'stores/host-store';
import subscriptionActions from 'actions/subscription-actions';
import planActions from 'actions/plan-actions';
import taskActions from 'actions/task-actions';
import hostActions from 'actions/host-actions';
import paymentActions from 'actions/payment-actions';
import snackbarActions from 'actions/snackbar-actions';
import Org from 'records/org';
import format from 'lib/format';
import promocodeActions from 'actions/promocode-actions';

export default class SubscriptionsUpgrade extends React.Component {
  displayName = 'SubscriptionsUpgrade';

  static contextTypes = {
    org: PropTypes.instanceOf(Org),
    router: PropTypes.func.isRequired // Router.PropTypes.router.isRequired
  };

  static propTypes = {
    params: PropTypes.shape({
      subscriptionSlug: PropTypes.string.isRequired
    }),

    query: PropTypes.shape({
      prev: PropTypes.string.isRequired
    })
  };

  state = {
    subscription: this.findSubscription(),
    billingProfile: this.findBillingProfile(),
    plansForUpgrade: this.findPlansForUpgrade(),
    selectedPlan: this.findPlansForUpgrade() ? this.findPlansForUpgrade().first() : null,
    showUpgradeSubscriptionModal: false,
    upgrading: subscriptionStore.isUpgrading(this.props.params.subscriptionSlug),
    upgradeEstimate: null,
    numberUsedHosts: null
  };

  componentWillReceiveProps(nextProps, nextContext) {
    this.fetchObjects(nextContext);
  }

  componentWillMount() {
    const org = this.context.org;
    if (org && !org.roleAllowsBillingProfileAdmin) {
      this.context.router.transitionTo('dashboard');
    }
  }

  componentDidMount() {
    subscriptionStore.onChange(this.subscriptionStoreDidChange);
    planStore.onChange(this.planStoreDidChange);

    hostStore.on('fetched-sub-hosts', this.setUsedHosts);

    subscriptionStore.on('upgrade-estimate', this.onSubscriptionUpgradeEstimate);
    subscriptionStore.on('upgraded', this.onSubscriptionUpgraded);

    this.fetchObjects();
  }

  componentWillUnmount() {
    subscriptionStore.offChange(this.subscriptionStoreDidChange);
    planStore.offChange(this.planStoreDidChange);

    hostStore.off('fetched-sub-hosts', this.setUsedHosts);

    subscriptionStore.off('upgrade-estimate', this.onSubscriptionUpgradeEstimate);
    subscriptionStore.off('upgraded', this.onSubscriptionUpgraded);
  }

  fetchObjects = (context=this.context) => {
    planActions.fetchAll();
    promocodeActions.fetchAll();

    const { org } = context;
    if (org) {
      subscriptionActions.fetchAllByOrgSlug(org.slug);
    } else {
      subscriptionActions.fetchAll();
    }

    this.setUsedHosts();
  }

  subscriptionStoreDidChange = () => {
    const subscription = this.findSubscription(),
          plansForUpgrade = this.findPlansForUpgrade(),
          selectedPlan = plansForUpgrade ?  plansForUpgrade.first() : null;

    if (!subscription) {
      return;
    }

    if (subscription.multiHost) {
      hostActions.fetchSubscriptionHosts(subscription.slug);
    }

    this.setState({
      subscription,
      upgrading: subscriptionStore.isUpgrading(subscription.slug),
      plansForUpgrade,
      selectedPlan
    });
    if (selectedPlan) {
      subscriptionActions.fetchUpgradeEstimate(subscription.slug, selectedPlan.id);
    }
  }

  planStoreDidChange = () => {
    const plansForUpgrade = this.findPlansForUpgrade(),
          selectedPlan = plansForUpgrade ? plansForUpgrade.first() : null;
    this.setState({
      selectedPlan,
      plansForUpgrade
    });
  };

  onSubscriptionUpgradeEstimate = (data) => {
    const { upgradeEstimate, planId } = data;
    if (planId !== this.state.selectedPlan.id) {
      return;
    }
    this.setState({ upgradeEstimate });
  }

  onSubscriptionUpgraded = (data) => {
    this.hideUpgradeSubscriptionModal();
    const { org } = this.context;

    if (org) {
      return this.context.router.transitionTo('org-billing', { orgSlug: org.slug });
    }

    const { hostSlug } = data;
    if (hostSlug !== this.findSubscription().hostSlug) {
      return;
    }
    hostActions.respec(hostSlug);
    taskActions.update(`host-respec-${hostSlug}`, `Beginning workstation ${hostSlug} upgrading...`);
    this.context.router.transitionTo('host', { hostSlug });
  }

  setUsedHosts = () => {
    const { subscription } = this.state,
          { org } = this.context;

    if (!org || !subscription || !subscription.multiHost) {
      this.setState({ numberUsedHosts: null });
    }
    const hosts = subscription ? hostStore.hostsBySubSlug(subscription.slug): null,
          len = hosts ? hosts.size : null;

    this.setState({ numberUsedHosts: len });
  }

  findSubscription() {
    const { org } = this.context,
          { subscriptionSlug } = this.props.params;
    if (org) {
      return subscriptionStore.findOrgSubscriptionBySlug(org.slug, subscriptionSlug);
    }

    return subscriptionStore.findBySlug(subscriptionSlug);
  }

  findBillingProfile() {
    const org = this.context.org;
    if (org) {
      return billingStore.orgBillingProfiles.get(org.id);
    }
    return billingStore.userBillingProfile;
  }

  findPlansForUpgrade() {
    const subscription = this.findSubscription();
    if (subscription) {
      return planStore.plansForUpgrade(subscription.plan);
    } else {
      return planStore.personalPlans;
    }
  }

  handlePlanSelection = (plan) => {
    subscriptionActions.fetchUpgradeEstimate(this.findSubscription().slug, plan.id);
    this.setState({ selectedPlan: plan });
  };

  handleShowUpgradeSubscriptionModal = () => {
    this.setState({ showUpgradeSubscriptionModal: true });
  };

  handleUpgradeSubscription = () => {
    this.setState({ upgrading: true });
    const { selectedPlan, billingProfile } = this.state,
          { hasCard } = billingProfile;
    if (hasCard) {
      subscriptionActions.upgrade(this.props.params.subscriptionSlug, selectedPlan);
    } else {
      paymentActions.requestSubmit();
    }
  };

  handlePaymentSuccess = () => {
    const { selectedPlan } = this.state;
    subscriptionActions.upgrade(this.props.params.subscriptionSlug, selectedPlan);
  };

  handlePaymentFailure = () => {
    this.setState({ upgrading: false });
    snackbarActions.post('Failed to submit payment.', 'error');
  };

  hideUpgradeSubscriptionModal = () => {
    this.setState({ showUpgradeSubscriptionModal: false });
  };

  handleCloseModal = () => {
    this.hideUpgradeSubscriptionModal();
  };

  render() {
    const { subscription } = this.state;

    if (!subscription) {
      return (
        <div className='subscriptions-upgrade-component'>
          <div className='container'>
            <h2>Upgrade Your Subscription</h2>
            <LoadingIndicator />
          </div>
        </div>
      );
    }

    const { upgrading, upgradeEstimate, plansForUpgrade, selectedPlan, numberUsedHosts, billingProfile } = this.state,
          { org, router } = this.context,
          selectedPlanSlug = selectedPlan ? selectedPlan.slug : '',
          selectedPlanPrice = selectedPlan ? format.currency(selectedPlan.priceDollars) : null,
          selectedPlanTitle = selectedPlan ? selectedPlan.name : '',
          prorataCharge = upgradeEstimate ? `of ${format.currency(upgradeEstimate)}` : '',
          upgradeBtnLabel = upgrading ? 'Upgrading...' : 'Upgrade',
          availablePlansText = plansForUpgrade.isEmpty() ? 'There are no available plans to upgrade to for this subscription.' : 'Select one of these plans to upgrade your subscription to',
          onTrial = subscription ? subscription.activeTrialEnd : false,
          { makeHref } = router,
          { hasCard, cardType, expMonth, expYear, lastFour } = billingProfile;


    let href = makeHref('payment-method');
    if (org) {
      href = makeHref('org-payment-method', { orgSlug: org.slug });
    }

    return (
      <div className='subscriptions-upgrade-component'>
        <UserNav activeTab='billing'>
          <h4>Upgrade Your Subscription</h4>
          <Panel header="Current Plan" eventKey="current-plan">
            <p className='hint'>You will have a chance to review your changes before upgrading</p>
            <Grid className='ui-card-grid'>
              <Row>
                {subscription ? (
                  <PlanListItem key={`plan-${subscription.plan.slug}`} plan={subscription.plan}
                    selected={false}
                    onSelect={this.handlePlanSelection}
                    trialEligible={false}
                    activeTrialEnd={subscription.activeTrialEnd}
                    numberUsedHosts={numberUsedHosts}
                    showHosts
                    currentPlan
                    disabled
                  />
                ) : ''}
              </Row>
            </Grid>
          </Panel>

          <Panel header="Available Plan(s)" eventKey="available-plans">
            <p className='hint'>{availablePlansText}</p>
            <Grid className='ui-card-grid'>
              <Row>
                {plansForUpgrade.toList().map((plan) => {
                  return (
                    <PlanListItem key={`plan-${plan.slug}`} plan={plan}
                      selected={selectedPlanSlug === plan.slug}
                      onSelect={this.handlePlanSelection}
                      trialEligible={false}
                      showHosts
                    />
                  );
                })}
              </Row>
            </Grid>
          </Panel>

          <Panel header="Credit Card" eventKey="credit-card">
            <Grid className='ui-card-grid'>
              <Row>
                {hasCard ? (
                  <div>
                    <BankCard cardType={cardType} lastFour={lastFour}
                      expMonth={expMonth} expYear={expYear} />

                    <ButtonToolbar>
                      <ButtonGroup>
                        <Button href={href} className='btn btn-default'><Fa icon='credit-card' /> Update Card</Button>
                      </ButtonGroup>
                    </ButtonToolbar>
                  </div>
                ) : (
                  <PaymentMethod subscriptionSlug={subscription.slug}
                    onSuccess={this.handlePaymentSuccess}
                    onFailure={this.handlePaymentFailure} />
                )}
              </Row>
            </Grid>
          </Panel>

          {!plansForUpgrade.isEmpty() ? (
            <Button className='upgrade-btn pull-left' bsStyle='primary' onClick={this.handleShowUpgradeSubscriptionModal}>Upgrade To {selectedPlanTitle}</Button>
          ) : ''}

          <Modal show={this.state.showUpgradeSubscriptionModal} onHide={this.hideUpgradeSubscriptionModal} backdrop='static'>
            <Modal.Header>
              <Modal.Title>Begin Upgrade</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {onTrial ? (
                <p>To perform the upgrade you will be immediately charged {selectedPlanPrice} for the month.</p>
              ) : (
                <p>To perform the upgrade you will be immediately charged a prorated amount {prorataCharge} and then {selectedPlanPrice} each month.</p>
              )}
              <p>After your subscription has been successfully upgraded, your workstation will be upgraded and restarted to perform the upgrade. This system upgrade can take up to <strong>2 hours</strong> to perform so we recommend doing at the end of your workday. <strong>Please ensure you have saved your work.</strong></p>
            </Modal.Body>
            <Modal.Footer>
              {!upgrading ? (
                <Button onClick={this.handleCloseModal}>Close</Button>
              ) : ''}
              <Button disabled={upgrading} onClick={this.handleUpgradeSubscription} bsStyle='primary'>{upgradeBtnLabel}</Button>
            </Modal.Footer>
          </Modal>
        </UserNav>
      </div>
    );
  }
}
