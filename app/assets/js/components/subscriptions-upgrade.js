import React, { PropTypes } from 'react';
import { Grid, Row, Button, Modal } from 'react-bootstrap';
import stringUtil from 'lib/string-util';

import PlanListItem from 'components/plan-list-item';
import subscriptionStore from 'stores/subscription-store';
import planStore from 'stores/plan-store';
import hostStore from 'stores/host-store';
import subscriptionActions from 'actions/subscription-actions';
import planActions from 'actions/plan-actions';
import hostActions from 'actions/host-actions';
import taskActions from 'actions/task-actions';
import snackbarActions from 'actions/snackbar-actions';

export default class SubscriptionsUpgrade extends React.Component {
  displayName = 'SubscriptionsUpgrade';

  static contextTypes = {
    router: PropTypes.func.isRequired // Router.PropTypes.router.isRequired
  };

  static propTypes = {
    params: PropTypes.shape({
      subscriptionSlug: PropTypes.string.isRequired
    })
  };

  state = {
    subscription: this.findSubscription(),
    userPlansForUpgrade: this.findUserPlansForUpgrade(),
    selectedPlan: this.findUserPlansForUpgrade() ? this.findUserPlansForUpgrade().first() : null,
    showUpgradeSubscriptionModal: false,
    upgrading: subscriptionStore.isUpgrading(this.props.params.subscriptionSlug),
    upgradeEstimate: null
  };

  componentDidMount() {
    subscriptionStore.onChange(this.subscriptionStoreDidChange);
    subscriptionActions.fetchAll();

    planStore.onChange(this.planStoreDidChange);
    planActions.fetchAll();

    subscriptionStore.on('upgrade-estimate', this.onSubscriptionUpgradeEstimate);
    subscriptionStore.on('upgraded', this.onSubscriptionUpgraded);
    hostStore.on('respeccing', this.onHostRespeccing);
    hostStore.on('respecced', this.onHostRespecced);
    hostStore.on('respec_failed', this.onHostRespecFailed);
  }

  componentWillUnmount() {
    subscriptionStore.offChange(this.subscriptionStoreDidChange);
    planStore.offChange(this.planStoreDidChange);

    subscriptionStore.off('upgrade-estimate', this.onSubscriptionUpgradeEstimate);
    subscriptionStore.off('upgraded', this.onSubscriptionUpgraded);
    hostStore.off('respeccing', this.onHostRespeccing);
    hostStore.off('respecced', this.onHostRespecced);
    hostStore.off('respeccing', this.onHostRespecFailed);
  }

  subscriptionStoreDidChange = () => {
    const subscription = this.findSubscription(),
          userPlansForUpgrade = this.findUserPlansForUpgrade(),
          selectedPlan = userPlansForUpgrade ?  userPlansForUpgrade.first() : null;
    this.setState({
      subscription,
      upgrading: subscriptionStore.isUpgrading(subscription.slug),
      userPlansForUpgrade,
      selectedPlan
    });
    if (selectedPlan) {
      subscriptionActions.fetchUpgradeEstimate(subscription.slug, selectedPlan.id);
    }
  }

  planStoreDidChange = () => {
    const userPlansForUpgrade = this.findUserPlansForUpgrade(),
          selectedPlan = userPlansForUpgrade ? userPlansForUpgrade.first() : null;
    this.setState({
      selectedPlan,
      userPlansForUpgrade
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
    const { hostSlug } = data;
    if (hostSlug !== this.findSubscription().hostSlug) {
      return;
    }
    hostActions.respec(hostSlug);
    taskActions.update(`host-respec-${hostSlug}`, `Beginning workstation ${hostSlug} resizing...`);
  }

  onHostRespeccing = (data) => {
    const { hostSlug } = data;
    if (hostSlug !== this.findSubscription().hostSlug) {
      return;
    }
    taskActions.update(`host-respec-${hostSlug}`, `Workstation${hostSlug} resizing...`);
  }

  onHostRespecFailed = (data) => {
    const { hostSlug } = data;
    if (hostSlug !== this.findSubscription().hostSlug) {
      return;
    }
    taskActions.fail(`host-respec-${hostSlug}`);
  }

  onHostRespecced = (data) => {
    const { hostSlug } = data;
    if (hostSlug !== this.findSubscription().hostSlug) {
      return;
    }
    snackbarActions.post(`Workstation ${hostSlug} has been upgraded!`);
    taskActions.done(`host-respec-${hostSlug}`);
  }

  findSubscription() {
    return subscriptionStore.findBySlug(this.props.params.subscriptionSlug);
  }

  findUserPlansForUpgrade() {
    const subscription = this.findSubscription();
    if (subscription) {
      return planStore.userPlansForUpgrade(subscription.plan.price);
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
    this.hideUpgradeSubscriptionModal();
    this.setState({ upgrading: true });
    const { selectedPlan } = this.state;
    subscriptionActions.upgrade(this.props.params.subscriptionSlug, selectedPlan);
  };

  hideUpgradeSubscriptionModal = () => {
    this.setState({ showUpgradeSubscriptionModal: false });
  };

  handleCloseModal = () => {
    this.hideUpgradeSubscriptionModal();
  };

  render() {
    const { subscription, upgrading, upgradeEstimate, userPlansForUpgrade, selectedPlan } = this.state,
          selectedPlanSlug = selectedPlan ? selectedPlan.slug : "",
          selectedPlanPrice = selectedPlan ? selectedPlan.priceDollars.toFixed(2) : null,
          selectedPlanTitle = selectedPlanSlug ? stringUtil.titleize(selectedPlanSlug) : "",
          prorataCharge = upgradeEstimate ? `of $${upgradeEstimate.toFixed(2)}` : "",
          upgradeBtnLabel = upgrading ? "Upgrading..." : "Upgrade To " + selectedPlanTitle,
          availablePlansText = userPlansForUpgrade.isEmpty() ? "There are no available plans to upgrade to for this subscription." : "Select one of these plans to upgrade your subscription to",
          trialEligible = false,
          selected = false,
          onTrial = subscription ? subscription.activeTrialEnd : false,
          disableUpgrade = true,
          { makeHref } = this.context.router,
          billingURL = makeHref('billing');
    
    return (
      <div className='subscriptions-upgrade-component'>
        <div className='container'>
          <h2>Upgrade Your Subscription</h2>
          <p className='hint'>You will have a chance to review your changes before upgrading</p>
          <h3>Current Plan</h3>
          <Grid className='ui-card-grid'>
            <Row>
              {subscription ? (
                <PlanListItem key={`plan-${subscription.plan.slug}`} plan={subscription.plan}
                  selected={selected}
                  onSelect={this.handlePlanSelection}
                  trialEligible={trialEligible}
                  activeTrialEnd={subscription.activeTrialEnd}
                  disabled={disableUpgrade}
                />
              ) : ''}
            </Row>
          </Grid>
          <h3>Available Plan(s)</h3>
          <p className='hint'>{availablePlansText}</p>
          <Grid className='ui-card-grid'>
            <Row>
              {userPlansForUpgrade.toList().map((plan) => {
                return (
                  <PlanListItem key={`plan-${plan.slug}`} plan={plan}
                    selected={selectedPlanSlug === plan.slug}
                    onSelect={this.handlePlanSelection}
                    trialEligible={trialEligible}
                  />
                );
              })}
            </Row>
          </Grid>

          <Row>
            <Button disabled={upgrading} className='back-btn pull-left' bsStyle='default' href={billingURL}>Back</Button>

            {!userPlansForUpgrade.isEmpty() ? (
              <div>
                <Button disabled={upgrading} className='upgrade-btn pull-left' bsStyle='primary' onClick={this.handleShowUpgradeSubscriptionModal}>{upgradeBtnLabel}</Button>

                <Modal show={this.state.showUpgradeSubscriptionModal} onHide={this.hideUpgradeSubscriptionModal}>
                  <Modal.Header>
                    <Modal.Title>Begin Upgrade</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    {onTrial ? (
                      <p>To perform the upgrade you will be immediately charged ${selectedPlanPrice} for the month.</p>
                    ) : (
                      <p>To perform the upgrade you will be immediately charged a prorated amount {prorataCharge} and then ${selectedPlanPrice} each month.</p>
                    )}
                    <p>After your subscription has been successfully upgraded, your workstation will be resized and restarted to perform the upgrade. <strong>Please ensure you have saved your work.</strong></p>
                  </Modal.Body>
                  <Modal.Footer>
                    <Button onClick={this.handleCloseModal}>Close</Button>
                    <Button onClick={this.handleUpgradeSubscription} bsStyle='primary'>Upgrade</Button>
                  </Modal.Footer>
                </Modal>
              </div>
            ) : ''}
          </Row>
        </div>
      </div>
    );
  }
}
