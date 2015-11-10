import React, { PropTypes } from 'react';
import Org from 'records/org';
import OrgNav from 'components/org-nav';
import BillingPaymentMethod from 'components/billing-payment-method';

export default class OrgBilling extends React.Component {
  displayName = 'OrgBillingPaymentMethod';

  static contextTypes = {
    org: PropTypes.instanceOf(Org).isRequired
  };

  render() {
    const { org } = this.context;

    return (
      <div className='org-billing-payment-method-component'>
        <OrgNav org={org} activeTab='billing'>
          <BillingPaymentMethod />
        </OrgNav>
      </div>
    );
  }
}
