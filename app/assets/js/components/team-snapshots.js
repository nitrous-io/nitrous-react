import React, { PropTypes } from 'react';

import Host from 'records/host';
import orgActions from 'actions/org-actions';
import orgStore from 'stores/org-store';
import ContextSwitcher from 'components/context-switcher';
import HostNav from 'components/host-nav';
import LoadingIndicator from 'components/loading-indicator';
import TeamSnapshotList from 'components/team-snapshot-list';
import Mp from 'lib/mp';
import MpEvents from 'lib/mp-events';

export default class TeamSnapshots extends React.Component {
  displayName = 'TeamSnapshots';

  static contextTypes = {
    host: PropTypes.instanceOf(Host).isRequired
  };

  static willTransitionTo() {
    Mp.track(MpEvents.EventDashboardViewedTeamSnapshots);
  }

  state = {
    org: orgStore.orgByOrgId(this.context.host.orgId)
  };

  componentDidMount() {
    orgStore.onChange(this.onOrgStoreChanged);
    orgActions.fetchAll();
  }

  componentWillUnmount() {
    orgStore.offChange(this.onOrgStoreChanged);
  }

  onOrgStoreChanged = () => {
    this.setState({ org: orgStore.orgByOrgId(this.context.host.orgId) });
  }

  render() {
    const { host } = this.context,
          { org } = this.state,
          loading = host.isResuming || !org;

    if (loading) {
      return (
        <div className='team-snapshots-component container'>
          <ContextSwitcher selectedHost={host} />
          <LoadingIndicator large />
        </div>
      );
    }

    return (
      <div className='team-snapshots-component container'>
        <ContextSwitcher selectedHost={host} />
        <HostNav host={host} activeTab='team-snapshots' />
        <div className='inner-container'>
          <TeamSnapshotList host={host} org={org} />
        </div>
      </div>
    );
  }
}
