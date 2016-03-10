import React, { PropTypes } from 'react';
import UserNav from 'components/user-nav';
import EarnBonusesList from 'components/earn-bonuses-list';

export default class EarnBonuses extends React.Component {
  displayName = 'EarnBonuses';

  static propTypes = {
    query: PropTypes.shape({
      connected_twitter: PropTypes.string,
      connected_github: PropTypes.string
    })
  };

  render() {
    const connectedTwitter = (this.props.query.connected_twitter === 'true'),
          connectedGithub = (this.props.query.connected_github === 'true');

    return (
      <div className='bonus-component'>
        <UserNav activeTab='earn-bonuses'>
          <EarnBonusesList
            connectedTwitter={connectedTwitter}
            connectedGithub={connectedGithub}
          />
        </UserNav>
      </div>
    );
  }
}
