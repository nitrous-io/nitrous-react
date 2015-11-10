import React from 'react';
import UserNav from 'components/user-nav';
import BillingPaymentMethod from 'components/billing-payment-method';

export default class UserBilling extends React.Component {
  displayName = 'UserBilling';

  render() {
    return (
      <div className='user-billing-component'>
        <UserNav activeTab='billing'>
          <BillingPaymentMethod />
        </UserNav>
      </div>
    );
  }
}
