import React, { PropTypes } from 'react';
import UserNav from 'components/user-nav';
import Billing from 'components/billing';

export default class UserBilling extends React.Component {
  displayName = 'UserBilling';

  static propTypes = {
    query: PropTypes.shape({
      fromStripe: PropTypes.string
    })
  };

  render() {
    return (
      <div className='user-billing-component'>
        <UserNav activeTab='billing'>
          <Billing fromStripe={this.props.query.fromStripe === 'true'}/>
        </UserNav>
      </div>
    );
  }
}
