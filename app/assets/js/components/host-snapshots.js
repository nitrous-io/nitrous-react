import React, { PropTypes } from 'react';

import Host from 'records/host';
import ContextSwitcher from 'components/context-switcher';
import HostNav from 'components/host-nav';
import LoadingIndicator from 'components/loading-indicator';
import LocalSnapshotList from 'components/local-snapshot-list';
import Mp from 'lib/mp';
import MpEvents from 'lib/mp-events';

export default class HostSnapshots extends React.Component {
  displayName = 'HostSnapshots';

  static contextTypes = {
    host: PropTypes.instanceOf(Host).isRequired
  };

  static willTransitionTo() {
    Mp.track(MpEvents.EventDashboardViewedHostSnapshots);
  }

  render() {
    const { host } = this.context,
          loading = host.isResuming;

    if (loading) {
      return (
        <div className='host-snapshots-component container'>
          <ContextSwitcher selectedHost={host} />
          <LoadingIndicator large />
        </div>
      );
    }

    return (
      <div className='host-snapshots-component container'>
        <ContextSwitcher selectedHost={host} />
        <HostNav host={host} activeTab='local-snapshots' />
        <div className='inner-container'>
          <LocalSnapshotList host={host} />
        </div>
      </div>
    );
  }
}
