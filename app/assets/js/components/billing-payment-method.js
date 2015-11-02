import React, { PropTypes } from 'react';

import Org from 'records/org';
import billingStore from 'stores/billing-store';
import PaymentMethod from 'components/payment-method';

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
    const { billingProfile } = this.state,
          { org } = this.context;

    return (
      <div className='billing-payment-method-component'>
        <div className='container'>
          {billingProfile.hasCard ? (
            <h2>{org ? `Update Payment Method for ${org.name}` : 'Update Payment Method'}</h2>
          ) : (
            <h2>{org ? `Add Payment Method for ${org.name}` : 'Add Payment Method'}</h2>
          )}
          <PaymentMethod />
        </div>
      </div>
    );
  }
}
