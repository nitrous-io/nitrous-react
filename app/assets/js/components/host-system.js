import React, { PropTypes } from 'react';
import { Button, Table } from 'react-bootstrap';
import TimeAgo from 'react-timeago';
import prettyBytes from 'pretty-bytes';
import numbro from 'numbro';

import Host from 'records/host';
import hostStore from 'stores/host-store';
import hostStatsStore from 'stores/host-stats-store';
import planStore from 'stores/plan-store';
import regionStore from 'stores/region-store';
import hostActions from 'actions/host-actions';
import snackbarActions from 'actions/snackbar-actions';
import ContextSwitcher from 'components/context-switcher';
import LoadingIndicator from 'components/loading-indicator';
import HostNav from 'components/host-nav';
import Mp from 'lib/mp';
import MpEvents from 'lib/mp-events';

export default class HostSystem extends React.Component {
  displayName = 'HostSystem';

  static contextTypes = {
    router: PropTypes.func.isRequired,
    host: PropTypes.instanceOf(Host).isRequired
  };

  static willTransitionTo() {
    Mp.track(MpEvents.EventDashboardViewedHostSystem);
  }

  state = {
    stats: null,
    plan: planStore.planById(this.context.host.planId),
    region: regionStore.regionById(this.context.host.regionId),
    hostTroubleshooting: false
  };

  componentDidMount() {
    hostStatsStore.onChange(this.hostStatsStoreDidChange);
    hostStore.on('started', this.onHostStarted);
    planStore.onChange(this.planStoreDidChange);
    regionStore.onChange(this.regionStoreDidChange);

    hostStore.on('soft-restart-failed', this.onHostSoftRestartFailed);
    hostStore.on('soft-restarted', this.onHostSoftRestarted);

    if (!this.context.host.isResuming) {
      hostActions.fetchStats(this.context.host.slug);
    }
  }

  componentWillReceiveProps(nextProps, nextContext) {
    if (this.context.host !== nextContext.host) {
      this.setState({
        plan: planStore.planById(nextContext.host.planId),
        region: regionStore.regionById(nextContext.host.regionId)
      });
    }
  }

  componentWillUnmount() {
    hostStatsStore.offChange(this.hostStatsStoreDidChange);
    hostStore.off('started', this.onHostStarted);
    planStore.offChange(this.planStoreDidChange);
    regionStore.offChange(this.regionStoreDidChange);

    hostStore.off('soft-restart-failed', this.onHostSoftRestartFailed);
    hostStore.off('soft-restarted', this.onHostSoftRestarted);
  }

  hostStatsStoreDidChange = () => {
    const stats = hostStatsStore.hostStatsByHostSlug(this.context.host.slug);
    this.setState({ stats });
  }

  onHostStarted = (data) => {
    const { host } = data;
    if (this.context.host.slug === host.slug) {
      snackbarActions.clear();
      hostActions.fetchStats(this.context.host.slug);
    }
  }

  onHostSoftRestartFailed = (data) => {
    const { hostSlug } = data;
    if (this.context.host.slug === hostSlug) {
      snackbarActions.post(`Failed to troubleshoot ${hostSlug}!`);
      this.setState({ hostTroubleshooting: false });
    }
  }

  onHostSoftRestarted = (data) => {
    const { host } = data;
    if (this.context.host.slug === host.slug) {
      snackbarActions.post(`Troubleshooting of ${host.slug} is complete. Please try to access your workstation now.`);
      this.setState({ hostTroubleshooting: false });
    }
  }

  planStoreDidChange = () => {
    this.setState({ plan: planStore.planById(this.context.host.planId) });
  }

  regionStoreDidChange = () => {
    this.setState({ region: regionStore.regionById(this.context.host.regionId) });
  }

  handleTroubleshootHost = () => {
    this.setState({ hostTroubleshooting: true });
    hostActions.softRestart(this.context.host.slug);
  };

  render() {
    const { stats, plan, region, hostTroubleshooting } = this.state,
          { host } = this.context,
          loading = host.isResuming;

    if (loading) {
      return (
        <div className='host-system-component container'>
          <ContextSwitcher selectedHost={host} />
          <LoadingIndicator large />
        </div>
      );
    }

    return (
      <div className='host-system-component container'>
        <ContextSwitcher selectedHost={host} />
        <HostNav host={host} activeTab='system' />
        <div className='inner-container'>
          <Table responsive striped bordered condensed hover id='host-system-info'>
            <colgroup>
              <col className='col-lg-2 col-md-2 col-sm-4 col-xs-1' />
              <col className='col-lg-10 col-md-10 col-sm-8 col-xs-11' />
            </colgroup>
            <tr>
              <th>Slug</th>
              <td>{host.slug}</td>
            </tr>
            <tr>
              <th>State</th>
              <td>{host.displayState}</td>
            </tr>
            {region ? (
              <tr>
                <th>Region</th>
                <td>{region.name}</td>
              </tr>
            ) : ''}
            {plan ? (
              <tr>
                <th>Plan</th>
                <td>{plan.name}</td>
              </tr>
            ) : ''}
            <tr>
              <th>Hostname</th>
              <td>{host.hostname}</td>
            </tr>
            <tr>
              <th>Created</th>
              <td><TimeAgo date={host.createdAt} /></td>
            </tr>
            <tr>
              <th>Diagnostics</th>
              <td>
                <Button bsStyle='primary'
                  disabled={hostTroubleshooting}
                  onClick={this.handleTroubleshootHost}>
                  {hostTroubleshooting ? 'Troubleshooting...' : 'Troubleshoot Workstation'}
                </Button>
              </td>
            </tr>
          </Table>

          <Table responsive striped bordered condensed hover id='host-system-stats'>
            <colgroup>
              <col className='col-lg-2 col-md-2 col-sm-4 col-xs-1' />
              <col className='col-lg-10 col-md-10 col-sm-8 col-xs-11' />
            </colgroup>
          {stats ? (
            <tbody>
              <tr>
                <th>Uptime</th>
                <td>Up since <TimeAgo date={Date.now() - stats.uptime * 1000} /></td>
              </tr>
              <tr>
                <th>CPU Usage</th>
                <td>{stats.perCPUUsage.map((usage, idx) => {
                  return `CPU ${idx+1}: ${usage.toFixed(1)}%`;
                }).join(', ')}</td>
              </tr>
              <tr>
                <th>Memory Used</th>
                <td>{prettyBytes(stats.memoryUsage)} of {prettyBytes(stats.memoryTotal)}</td>
              </tr>
              <tr>
                <th>Storage Used</th>
                <td>{prettyBytes(stats.storageUsage)} of {prettyBytes(stats.storageTotal)}</td>
              </tr>
              <tr>
                <th>Inodes Used</th>
                {stats.inodeUsage ? (
                  <td>{numbro(stats.inodeUsage).format("0,0")} of {numbro(stats.inodeTotal).format("0,0")}</td>
                ) : (
                  <td>Coming soon</td>
                )}
              </tr>
            </tbody>
          ) : (
            <tbody>
              <tr>
                <th>Uptime</th>
                <td><LoadingIndicator /></td>
              </tr>
              <tr>
                <th>CPU Usage</th>
                <td><LoadingIndicator /></td>
              </tr>
              <tr>
                <th>Memory Used</th>
                <td><LoadingIndicator /></td>
              </tr>
              <tr>
                <th>Storage Used</th>
                <td><LoadingIndicator /></td>
              </tr>
              <tr>
                <th>Inodes Used</th>
                <td><LoadingIndicator /></td>
              </tr>
            </tbody>
          )}
          </Table>
        </div>
      </div>
    );
  }
}
