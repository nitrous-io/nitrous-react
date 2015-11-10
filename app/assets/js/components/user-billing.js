import React from 'react';
import UserNav from 'components/user-nav';
import Billing from 'components/billing';

export default class UserBilling extends React.Component {
  displayName = 'UserBilling';

  render() {
    return (
      <div className='user-billing-component'>
        <UserNav activeTab='billing'>
          <Billing />
        </UserNav>
      </div>
    );
  }
}
