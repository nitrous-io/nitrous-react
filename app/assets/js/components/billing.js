import React, { PropTypes } from 'react';
import { Panel, Table } from 'react-bootstrap';

import billingStore from 'stores/billing-store';
import subscriptionStore from 'stores/subscription-store';
import invoiceStore from 'stores/invoice-store';
import subscriptionActions from 'actions/subscription-actions';
import invoiceActions from 'actions/invoice-actions';
import SubscriptionListItem from 'components/subscription-list-item';
import InvoiceListItem from 'components/invoice-list-item';
import Org from 'records/org';
import Fa from 'components/fa';

export default class Billing extends React.Component {
  displayName = 'Billing';

  static contextTypes = {
    org: PropTypes.instanceOf(Org),
    router: PropTypes.func.isRequired // Router.PropTypes.router.isRequired
  };

  findBillingProfile = () => {
    const org = this.context.org;
    if (org) {
      return billingStore.orgBillingProfiles.get(org.id);
    }
    return billingStore.userBillingProfile;
  }

  state = {
    billingProfile: this.findBillingProfile(),
    subscriptions: subscriptionStore.subscriptions,
    invoices: invoiceStore.invoices
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
    invoiceActions.fetchAll();
  }

  componentWillUnmount() {
    subscriptionStore.offChange(this.subscriptionStoreDidChange);
    invoiceStore.offChange(this.invoiceStoreDidChange);
  }

  subscriptionStoreDidChange = () => {
    this.setState({ subscriptions: subscriptionStore.subscriptions });
  };

  invoiceStoreDidChange = () => {
    this.setState({ invoices: invoiceStore.invoices });
  };

  render() {
    const { billingProfile, subscriptions, invoices } = this.state,
          { hasCard, cardType, expMonth, expYear, lastFour } = billingProfile,
          { makeHref } = this.context.router;

    var href = makeHref('payment-method');

    const { org } = this.context;
    if (org) {
      href = makeHref('org-payment-method', { orgSlug: org.slug });
    }

    return (
      <div className='billing-component'>
        <div className='container'>
          <Panel header={<h4>Payment Method</h4>} className='payment-method'>
            {hasCard ? (
              <div>
                <p>
                  <b>{cardType}</b> - {lastFour}
                </p>
                <p>
                  Expires {expMonth}/{expYear}
                </p>
                <p><a href={href} className='btn btn-default'><Fa icon='credit-card' /> Update Payment Method</a></p>
              </div>
            ) : (
              <div>
                <p>No payment method on file.</p>
                <p><a href={href} className='btn btn-default'><Fa icon='credit-card' /> Add Payment Method</a></p>
              </div>
            )}
          </Panel>

          <Panel header={<h4>Subscriptions</h4>}>
            {subscriptions ? (
              <Table responsive hover>
                <tbody>
                  {subscriptions.toList().map((subscription) => {
                    return (
                      <SubscriptionListItem key={`subscription-${subscription.slug}`} subscription={subscription} />
                    );
                  })}
                </tbody>
              </Table>
            ) : (
              <p>You don&#39;t have any subscriptions.</p>
            )}
          </Panel>

          <Panel header={<h4>Billing History</h4>}>
            {invoices ? (
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
