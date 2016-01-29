import React, { PropTypes } from 'react';
import UserNav from 'components/user-nav';
import BillingPaymentMethod from 'components/billing-payment-method';

export default class UserBilling extends React.Component {
  displayName = 'UserBilling';

  static propTypes = {
    query: PropTypes.shape({
      next: PropTypes.string,
      subscription: PropTypes.string
    })
  };

  render() {
    const { next, subscription } = this.props.query;

    return (
      <div className='user-billing-component'>
        <UserNav activeTab='billing'>
          <BillingPaymentMethod
           nextURLHint={next}
           subscriptionSlug={subscription} />
        </UserNav>
      </div>
    );
  }
}
