import React from 'react';
import UserNav from 'components/user-nav';
import BonusList from 'components/bonus-list';

export default class Bonus extends React.Component {
  displayName = 'Bonus';

  render() {
    return (
      <div className='user-billing-component'>
        <UserNav activeTab='bonus'>
          <BonusList />
        </UserNav>
      </div>
    );
  }
}
