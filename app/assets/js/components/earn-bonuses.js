import React from 'react';
import UserNav from 'components/user-nav';
import EarnBonusesList from 'components/earn-bonuses-list';

export default class EarnBonuses extends React.Component {
  displayName = 'EarnBonuses';

  render() {
    return (
      <div className='bonus-component'>
        <UserNav activeTab='earn-bonuses'>
          <EarnBonusesList />
        </UserNav>
      </div>
    );
  }
}
