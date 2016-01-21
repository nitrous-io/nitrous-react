import React, { PropTypes } from 'react';
import { Button, Modal } from 'react-bootstrap';
import Time from 'react-time';

import Subscription from 'records/subscription';
import BillingProfile from 'records/billing-profile';
import subscriptionActions from 'actions/subscription-actions';
import subscriptionStore from 'stores/subscription-store';
import planStore from 'stores/plan-store';
import format from 'lib/format';

export default class SubscriptionListItem extends React.Component {
  displayName = 'SubscriptionListItem';

  static contextTypes = {
    router: PropTypes.func.isRequired
  };

  static propTypes = {
    subscription: PropTypes.instanceOf(Subscription).isRequired,
    billingProfile: PropTypes.instanceOf(BillingProfile)
  };

  state = {
    showCancelSubscriptionModal: false,
    showCancelTrialModal: false,
    showReactivateModal: false,
    canceling: subscriptionStore.getPendingState(this.props.subscription.slug) === 'canceling',
    reactivating: subscriptionStore.getPendingState(this.props.subscription.slug) === 'reactivating'
  };

  componentDidMount() {
    subscriptionStore.onChange(this.subscriptionStoreDidChange);
  }

  componentWillUnmount() {
    subscriptionStore.offChange(this.subscriptionStoreDidChange);
  }

  subscriptionStoreDidChange = () => {
    const { slug } = this.props.subscription;

    this.setState({
      canceling: subscriptionStore.getPendingState(slug) === 'canceling',
      reactivating: subscriptionStore.getPendingState(slug) === 'reactivating'
    });
  };

  handleShowCancelModal = () => {
    if (this.props.subscription.activeTrialEnd) {
      this.setState({ showCancelTrialModal: true });
    } else {
      this.setState({ showCancelSubscriptionModal: true });
    }
  };

  hideCancelSubscriptionModal = () => {
    this.setState({ showCancelSubscriptionModal: false });
  };

  handleCloseCancelSubscriptionModal = () => {
    this.hideCancelSubscriptionModal();
  };

  hideCancelTrialModal = () => {
    this.setState({ showCancelTrialModal: false });
  };

  handleCloseCancelTrialModal = () => {
    this.hideCancelTrialModal();
  };

  handleCancel = () => {
    this.setState({ canceling: true });
    subscriptionActions.cancel(this.props.subscription.slug);
    if (this.props.subscription.activeTrialEnd) {
      this.hideCancelTrialModal();
    } else {
      this.hideCancelSubscriptionModal();
    }
  };

  handleShowReactivateModal = () => {
    this.setState({ showReactivateModal: true });
  };

  hideReactivateModal = () => {
    this.setState({ showReactivateModal: false });
  };

  handleCloseReactivateModal = () => {
    this.hideReactivateModal();
  };

  handleReactivate = () => {
    this.setState({ reactivating: true });
    subscriptionActions.reactivate(this.props.subscription.slug);
    this.hideReactivateModal();
  };

  render() {
    const { subscription, billingProfile } = this.props,
          periodEndDescriptor = subscription.cancelPending ? "Cancels on" : "Renews on",
          { canceling, reactivating } = this.state,
          subscriptionPlanPrice = format.currency(subscription.plan.priceDollars),
          cancelButtonLabel = canceling ? "Canceling ..." : "Cancel",
          reactivateButtonLabel = reactivating ? "Reactivating ..." : "Reactivate",
          disableUpgrade = planStore.plansForUpgrade(subscription.plan).isEmpty(),
          { makeHref } = this.context.router,
          subscriptionsUpgradeURL = (billingProfile && billingProfile.hasCard) ?
            makeHref('payment-method') :
            makeHref('subscriptions-upgrade', { subscriptionSlug: subscription.slug }, { prev: 'billing' });

    let title = `Workstation ${subscription.hostSlug} – ${subscription.plan.name}`;
    if (subscription.multiHost) {
      title = subscription.plan.name;
    }

    return (
      <tr>
        <td>{title}</td>
        <td>
          {subscription.activeTrialEnd ? (
            <span>
              Free Trial ends on <Time value={subscription.activeTrialEnd} format="MMM DD, YYYY" />
            </span>
          ) : (
            <span> {periodEndDescriptor} <Time value={subscription.currentPeriodEnd} format="MMM DD, YYYY" /></span>
          )}
        </td>
        <td>
          {subscriptionPlanPrice}
        </td>
        <td>
          {subscription.cancelPending ? (
            <Button onClick={this.handleShowReactivateModal} disabled={reactivating} >{reactivateButtonLabel}</Button>
          ) : (
            <div>
            <Button bsStyle='danger' onClick={this.handleShowCancelModal} disabled={canceling}>{cancelButtonLabel}</Button>
            </div>
          )}

          <Modal show={this.state.showCancelSubscriptionModal} onHide={this.hideCancelSubscriptionModal}>
            <Modal.Header>
              <Modal.Title>Cancel Subscription</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>Are you sure you want to cancel the subscription for your workstation
                {subscription.hostSlug ? (
                  <strong> {subscription.hostSlug}</strong>
                ) : ''}
              ?</p>
              <p>Your subscription will end on <strong><Time value={subscription.currentPeriodEnd} format="MMM DD, YYYY" /></strong>, after which your workstation will be terminated.</p>
            </Modal.Body>
            <Modal.Footer>
              <Button onClick={this.handleCloseCancelSubscriptionModal}>Close</Button>
              <Button bsStyle='danger' onClick={this.handleCancel}>Cancel Subscription</Button>
            </Modal.Footer>
          </Modal>

          <Modal show={this.state.showCancelTrialModal} onHide={this.hideCancelTrialModal}>
            <Modal.Header>
              <Modal.Title>Cancel Trial</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>Are you sure you want to cancel your free trial for your workstation
                {subscription.hostSlug ? (
                  <strong> {subscription.hostSlug}</strong>
                ) : ''}
              ?</p>
                {subscription.activeTrialEnd ? (
                  <p>Your free trial ends on <Time value={subscription.activeTrialEnd} format="MMM DD, YYYY" />. After canceling, your workstation will be terminated <strong>immediately</strong>. This means that you will not be able to resume your free trial or be eligible for any more free trials.</p>
                ) : ''}
            </Modal.Body>
            <Modal.Footer>
              <Button onClick={this.handleCloseCancelTrialModal}>Close</Button>
              <Button bsStyle='danger' onClick={this.handleCancel}>Cancel Trial</Button>
            </Modal.Footer>
          </Modal>

          <Modal show={this.state.showReactivateModal} onHide={this.hideReactivateModal}>
            <Modal.Header>
              <Modal.Title>Reactivate Subscription</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>Proceed to reactivate subscription
                {subscription.hostSlug ? (
                  <span> for <strong> {subscription.hostSlug}</strong></span>
                ) : ''}
              ?</p>
            </Modal.Body>
            <Modal.Footer>
              <Button onClick={this.handleCloseReactivateModal}>Close</Button>
              <Button onClick={this.handleReactivate}>Reactivate</Button>
            </Modal.Footer>
          </Modal>
        </td>
        <td><Button disabled={disableUpgrade} href={subscriptionsUpgradeURL} bsStyle="primary">Upgrade</Button></td>
      </tr>
    );
  }
}
