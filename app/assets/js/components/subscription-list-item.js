import React, { PropTypes } from 'react';
import { Grid, Row, Col, Button, Modal } from 'react-bootstrap';
import Time from 'react-time';

import Subscription from 'records/subscription';
import subscriptionActions from 'actions/subscription-actions';
import Currency from 'components/currency';

export default class SubscriptionListItem extends React.Component {
  displayName = 'SubscriptionListItem';

  static propTypes = {
    subscription: PropTypes.instanceOf(Subscription).isRequired
  };

  state = {
    showCancelSubscriptionModal: false,
    showCancelTrialModal: false,
    showReactivateModal: false
  }

  handleShowCancelModal = () => {
    if (this.props.subscription.activeTrialEnd) {
      this.setState({ showCancelTrialModal: true });
    } else {
      this.setState({ showCancelSubscriptionModal: true });
    }
  }

  hideCancelSubscriptionModal = () => {
    this.setState({ showCancelSubscriptionModal: false });
  }

  handleCloseCancelSubscriptionModal = () => {
    this.hideCancelSubscriptionModal();
  }

  hideCancelTrialModal = () => {
    this.setState({ showCancelTrialModal: false });
  }

  handleCloseCancelTrialModal = () => {
    this.hideCancelTrialModal();
  }

  handleCancel = () => {
    subscriptionActions.cancel(this.props.subscription.slug);
    if (this.props.subscription.activeTrialEnd) {
      this.hideCancelTrialModal();
    } else {
      this.hideCancelSubscriptionModal();
    }
  }

  handleShowReactivateModal = () => {
    this.setState({ showReactivateModal: true });
  }

  hideReactivateModal = () => {
    this.setState({ showReactivateModal: false });
  }

  handleCloseReactivateModal = () => {
    this.hideReactivateModal();
  }

  handleReactivate = () => {
    subscriptionActions.reactivate(this.props.subscription.slug);
    this.hideReactivateModal();
  }

  render() {
    const subscription = this.props.subscription,
          periodEndDescriptor = subscription.cancelPending ? "Cancels on" : "Renews on";

    return (
      <div className='subscription-list-item-component'>
        <Grid>
          <Row>
            <Col lg={5} md={5} sm={6} xs={12}>Workspace {subscription.hostSlug} - {subscription.plan.name}</Col>
            <Col lg={3} md={3} sm={6} xs={12}>
              {subscription.activeTrialEnd ? (
                <span>Trial ends on <Time value={subscription.activeTrialEnd} format="MMM DD, YYYY" /></span>
              ) : (
                <span>{periodEndDescriptor} <Time value={subscription.currentPeriodEnd} format="MMM DD, YYYY" /></span>
              )}
            </Col>

            <Col lg={2} md={2} sm={3} xs={12}>
              {subscription.cancelPending ? (
                <Button onClick={this.handleShowReactivateModal}>Reactivate</Button>
              ) : (
                <Button bsStyle='danger' onClick={this.handleShowCancelModal}>Cancel</Button>
              )}
            </Col>

            <Col lg={2} md={2} sm={3} xs={12}><Currency value={subscription.plan.priceDollars} /></Col>
          </Row>
        </Grid>

        <Modal show={this.state.showCancelSubscriptionModal} onHide={this.hideCancelSubscriptionModal}>
          <Modal.Header>
            <Modal.Title>Cancel Subscription</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Are you sure you want to cancel the subscription for your workspace
              {subscription.hostSlug ? (
                <strong> {subscription.hostSlug}</strong>
              ) : ''}
            ?</p>
            <p>Your subscription will end on <Time value={subscription.currentPeriodEnd} format="MMM DD, YYYY" />, after which your workspace
              {subscription.hostSlug ? (
                  <strong> {subscription.hostSlug} </strong>
                ) : ' '}
             will be terminated.</p>
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
            <p>Are you sure you want to cancel your free trial for your workspace
              {subscription.hostSlug ? (
                <strong> {subscription.hostSlug}</strong>
              ) : ''}
            ?</p>
              {subscription.activeTrialEnd ? (
                <p>Your free trial ends on <Time value={subscription.activeTrialEnd} format="MMM DD, YYYY" />. After cancelling, your workspace will be terminated <strong>immediately</strong>. This means that you will not be able to resume your free trial or be eligible for any more free trials.</p>
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
                <span>for <strong> {subscription.hostSlug}</strong></span>
              ) : ''}
            ?</p>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.handleCloseReactivateModal}>Close</Button>
            <Button onClick={this.handleReactivate}>Reactivate</Button>
          </Modal.Footer>
        </Modal>

      </div>
    );
  }
}
