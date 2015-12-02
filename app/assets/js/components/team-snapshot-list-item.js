import React, { PropTypes } from 'react';

import Host from 'records/host';
import Snapshot from 'records/snapshot';

export default class TeamSnapshotListItem extends React.Component {
  displayName = 'TeamSnapshotListItem';

  static propTypes = {
    host: PropTypes.instanceOf(Host).isRequired,
    snapshot: PropTypes.instanceOf(Snapshot).isRequired
  }

  render() {
    return (
      <div className='team-snapshot-list-item-component snapshot-list-item'>
        {this.props.snapshot.name}
      </div>
    );
  }
}
