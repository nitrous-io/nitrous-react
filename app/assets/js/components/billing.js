import React, { PropTypes } from 'react';
import { Button, ButtonGroup, ButtonToolbar, Panel, Table } from 'react-bootstrap';

import billingStore from 'stores/billing-store';
import subscriptionStore from 'stores/subscription-store';
import invoiceStore from 'stores/invoice-store';
import subscriptionActions from 'actions/subscription-actions';
import invoiceActions from 'actions/invoice-actions';
import SubscriptionListItem from 'components/subscription-list-item';
import InvoiceListItem from 'components/invoice-list-item';
import LoadingIndicator from 'components/loading-indicator';
import Org from 'records/org';
import Fa from 'components/fa';
import Mp from 'lib/mp';
import MpEvents from 'lib/mp-events';

export default class Billing extends React.Component {
  displayName = 'Billing';

  static contextTypes = {
    org: PropTypes.instanceOf(Org),
    router: PropTypes.func.isRequired // Router.PropTypes.router.isRequired
  };

  static willTransitionTo() {
    Mp.track(MpEvents.EventDashboardViewedBilling);
  }

  findBillingProfile = () => {
    const org = this.context.org;
    if (org) {
      return billingStore.orgBillingProfiles.get(org.id);
    }
    return billingStore.userBillingProfile;
  }

  findSubscriptions = () => {
    const org = this.context.org;
    if (org) {
      return subscriptionStore.orgSubscriptionsBySlug(org.slug);
    }
    return subscriptionStore.activeUserSubscriptions;
  }

  findInvoices = () => {
    const org = this.context.org;
    if (org) {
      return invoiceStore.orgInvoicesBySlug(org.slug);
    }
    return invoiceStore.userInvoices;
  }

  state = {
    billingProfile: this.findBillingProfile(),
    subscriptions: this.findSubscriptions(),
    invoices: this.findInvoices(),
    loadingSubscriptions: true,
    loadingInvoices: true
  };

  componentWillMount() {
    const org = this.context.org;
    if (org && !org.roleAllowsBillingProfileAdmin) {
      this.context.router.transitionTo('dashboard');
    }
  }

  componentDidMount() {
    subscriptionStore.onChange(this.subscriptionStoreDidChange);
    const { org } = this.context;
    if (org) {
      subscriptionActions.fetchAllByOrgSlug(org.slug);
    } else {
      subscriptionActions.fetchAll();
    }

    invoiceStore.onChange(this.invoiceStoreDidChange);
    if (org) {
      invoiceActions.fetchAllByOrgSlug(org.slug);
    } else {
      invoiceActions.fetchAll();
    }
  }

  componentWillUnmount() {
    subscriptionStore.offChange(this.subscriptionStoreDidChange);
    invoiceStore.offChange(this.invoiceStoreDidChange);
  }

  subscriptionStoreDidChange = () => {
    this.setState({ loadingSubscriptions: false, subscriptions: this.findSubscriptions() });
  };

  invoiceStoreDidChange = () => {
    this.setState({ loadingInvoices: false, invoices: this.findInvoices() });
  };

  renderSubscriptions = () => {
    const { subscriptions, loadingSubscriptions } = this.state,
          showSubscriptions = subscriptions && subscriptions.count();

    if (showSubscriptions) {
      return (
        <Table responsive hover>
          <tbody>
            {subscriptions.toList().map((subscription) => {
              return (
                <SubscriptionListItem key={`subscription-${subscription.slug}`} subscription={subscription} />
              );
            })}
          </tbody>
        </Table>
      );
    }

    return (loadingSubscriptions ? (
        <LoadingIndicator />
      ) : (
        <p>You don&#39;t have any subscriptions.</p>
      ));
  }

  renderInvoices = () => {
    const { invoices, loadingInvoices } = this.state,
          showInvoices = invoices && invoices.count();

    if (showInvoices) {
      return (
        <Table responsive hover>
          <thead>
            <tr>
              <th>Subscription</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {invoices.slice(0, 8).toList().map((invoice) => {
              return (
                <InvoiceListItem key={`invoice-${invoice.id}`} invoice={invoice} />
              );
            })}
          </tbody>
        </Table>
      );
    }

    return (loadingInvoices ? (
        <LoadingIndicator />
      ) : (
        <p>You don&#39;t have any invoices.</p>
      ));
  }

  render() {
    const { billingProfile } = this.state,
          { org } = this.context,
          { hasCard, cardType, expMonth, expYear, lastFour } = billingProfile,
          { makeHref } = this.context.router;

    let cardTypeCssClass = cardType ? cardType.replace(/_/g, '').toLowerCase() : '';
    if (cardType === 'AmericanExpress') {
      cardTypeCssClass = 'amex';
    }

    var href = makeHref('payment-method');
    if (org) {
      href = makeHref('org-payment-method', { orgSlug: org.slug });
    }

    return (
      <div className='billing-component'>
        <Panel header={<h4>Payment Method</h4>} className='payment-method'>
          {hasCard ? (

            <div>
              <div className='bank-card'>
                <div className='card-number'>
                  <span className='card-number-hidden'>••••</span>
                  <span className='card-number-hidden'>••••</span>
                  <span className='card-number-hidden'>••••</span>
                  <span>{lastFour}</span>
                </div>
                <div className={`card-type ${cardTypeCssClass}`}>
                  {cardType}
                </div>
                <div className='card-expiry'>
                  <span className='card-expiry-label'>Valid until</span>
                  <div className='card-expiry-date'>{expMonth}/{expYear}</div>
                </div>
              </div>

              <div>
                <ButtonToolbar>
                  <ButtonGroup>
                    <Button href={href} className='btn btn-default'><Fa icon='credit-card' /> Update Payment Method</Button>
                  </ButtonGroup>
                </ButtonToolbar>
              </div>
            </div>

          ) : (
            <div>
              <p>No payment method on file.</p>
              <p><Button href={href} className='btn btn-default'><Fa icon='credit-card' /> Add Payment Method</Button></p>
            </div>
          )}
        </Panel>

        <Panel header={<h4>Subscriptions</h4>}>
          {this.renderSubscriptions()}
        </Panel>

        <Panel header={<h4>Billing History</h4>}>
          {this.renderInvoices()}
        </Panel>
      </div>
    );
  }
}
