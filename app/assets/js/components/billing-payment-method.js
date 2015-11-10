import React, { PropTypes } from 'react';

import Org from 'records/org';
import billingStore from 'stores/billing-store';
import PaymentMethod from 'components/payment-method';
import Breadcrumb from 'components/bootstrap-backports/breadcrumb';
import BreadcrumbItem from 'components/bootstrap-backports/breadcrumb-item';

export default class BillingPaymentMethod extends React.Component {
  displayName = 'BillingPaymentMethod';

  static contextTypes = {
    org: PropTypes.instanceOf(Org),
    router: PropTypes.func.isRequired
  }

  findBillingProfile = () => {
    const org = this.context.org;
    if (org) {
      return billingStore.orgBillingProfiles.get(org.id);
    }
    return billingStore.userBillingProfile;
  }

  state = {
    billingProfile: this.findBillingProfile()
  }

  render() {
    const { makeHref } = this.context.router,
          { billingProfile } = this.state,
          { org } = this.context;

    return (
      <div className='billing-payment-method-component'>
        <div className='container'>

          <Breadcrumb>
            <BreadcrumbItem href={makeHref('billing')}>Billing</BreadcrumbItem>
            <BreadcrumbItem active>Payment Method</BreadcrumbItem>
          </Breadcrumb>

          <h2>
            {billingProfile.hasCard ? (
              org ? `Update Payment Method for ${org.name}` : 'Update Payment Method'
            ) : (
              org ? `Add Payment Method for ${org.name}` : 'Add Payment Method'
            )}
          </h2>
          <PaymentMethod standalone />
        </div>
      </div>
    );
  }
}
