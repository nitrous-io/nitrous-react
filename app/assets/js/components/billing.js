import React, { PropTypes } from 'react';
import { Button, ButtonGroup, ButtonToolbar, Panel, Table } from 'react-bootstrap';

import billingStore from 'stores/billing-store';
import subscriptionStore from 'stores/subscription-store';
import invoiceStore from 'stores/invoice-store';
import subscriptionActions from 'actions/subscription-actions';
import invoiceActions from 'actions/invoice-actions';
import SubscriptionListItem from 'components/subscription-list-item';
import InvoiceListItem from 'components/invoice-list-item';
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

  findInvoices = () => {
    const org = this.context.org;
    if (org) {
      return invoiceStore.orgInvoicesBySlug(org.slug);
    }
    return invoiceStore.userInvoices;
  }

  state = {
    billingProfile: this.findBillingProfile(),
    activeSubscriptions: subscriptionStore.activeSubscriptions,
    invoices: this.findInvoices()
  };

  componentWillMount() {
    const org = this.context.org;
    if (org && !org.roleAllowsBillingProfileAdmin) {
      this.context.router.transitionTo('dashboard');
    }
  }

  componentDidMount() {
    subscriptionStore.onChange(this.subscriptionStoreDidChange);
    subscriptionActions.fetchAll();

    invoiceStore.onChange(this.invoiceStoreDidChange);
    const { org } = this.context;
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
    this.setState({ activeSubscriptions: subscriptionStore.activeSubscriptions });
  };

  invoiceStoreDidChange = () => {
    this.setState({ invoices: this.findInvoices() });
  };

  render() {
    const { billingProfile, activeSubscriptions, invoices } = this.state,
          { org } = this.context,
          { hasCard, cardType, expMonth, expYear, lastFour } = billingProfile,
          { makeHref } = this.context.router,
          showActiveSubscriptions = activeSubscriptions && activeSubscriptions.count(),
          showInvoices = invoices && invoices.count();

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
        <div className='container'>
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
            {showActiveSubscriptions ? (
              <Table responsive hover>
                <tbody>
                  {activeSubscriptions.toList().map((subscription) => {
                    return (
                      <SubscriptionListItem key={`subscription-${subscription.slug}`} subscription={subscription} />
                    );
                  })}
                </tbody>
              </Table>
            ) : (
              <p>You don&#39;t have any active subscriptions.</p>
            )}
          </Panel>

          <Panel header={<h4>Billing History</h4>}>
            {showInvoices ? (
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
            ) : (
              <div>
                <p>You don&#39;t have any invoices available.</p>
              </div>
            )}
          </Panel>

        </div>
      </div>
    );
  }
}
