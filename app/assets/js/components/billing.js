import React, { PropTypes } from 'react';
import { Panel } from 'react-bootstrap';

import billingStore from 'stores/billing-store';
import invoiceStore from 'stores/invoice-store';
import invoiceActions from 'actions/invoice-actions';
import InvoiceListItem from 'components/invoice-list-item';
import { Grid, Row, Col } from 'react-bootstrap';
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
    invoices: invoiceStore.invoices
  };

  componentDidMount() {
    invoiceStore.onChange(this.invoiceStoreDidChange);
    invoiceActions.fetchAll();
  }

  componentWillUnmount() {
    invoiceStore.offChange(this.invoiceStoreDidChange);
  }

  invoiceStoreDidChange = () => {
    this.setState({ invoices: invoiceStore.invoices });
  };

  render() {
    const { billingProfile, invoices } = this.state,
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

          <Panel header='Billing History' className='billing-history'>
            {invoices ? (
              <div>
                <Grid>
                  <Row>
                    <Col lg={3} md={3} sm={3} xs={3}><strong>Subscription</strong></Col>
                    <Col lg={3} md={3} sm={3} xs={3}><strong>Date</strong></Col>
                    <Col lg={3} md={3} sm={3} xs={3}><strong>Amount</strong></Col>
                    <Col lg={3} md={3} sm={3} xs={3}><strong>Details</strong></Col>
                  </Row>
                </Grid>
                {invoices.slice(0, 8).toList().map((invoice) => {
                  return (
                    <InvoiceListItem key={`invoice-${invoice.id}`} invoice={invoice} />
                  );
                })}
              </div>
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
