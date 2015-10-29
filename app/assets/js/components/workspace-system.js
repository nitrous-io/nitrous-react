import React, { PropTypes } from 'react';
import Host from 'records/host';
import hostStatsStore from 'stores/host-stats-store';
import planStore from 'stores/plan-store';
import regionStore from 'stores/region-store';
import hostActions from 'actions/host-actions';
import { Table } from 'react-bootstrap';
import TimeAgo from 'react-timeago';
import LoadingIndicator from 'components/loading-indicator';
import WorkspaceNav from 'components/workspace-nav';
import prettyBytes from 'pretty-bytes';

export default class WorkspaceSystem extends React.Component {
  displayName = 'WorkspaceSystem';

  static contextTypes = {
    router: PropTypes.func.isRequired,
    host: PropTypes.instanceOf(Host).isRequired
  };

  state = {
    stats: null,
    plan: planStore.planById(this.context.host.planId),
    region: regionStore.regionById(this.context.host.regionId)
  };

  componentDidMount() {
    hostStatsStore.onChange(this.hostStatsStoreDidChange);
    planStore.onChange(this.planStoreDidChange);
    regionStore.onChange(this.regionStoreDidChange);
    hostActions.fetchStats(this.context.host.slug);
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
    planStore.offChange(this.planStoreDidChange);
    regionStore.offChange(this.regionStoreDidChange);
  }

  hostStatsStoreDidChange = () => {
    const stats = hostStatsStore.hostStatsByHostSlug(this.context.host.slug);
    this.setState({ stats });
  }

  planStoreDidChange = () => {
    this.setState({ plan: planStore.planById(this.context.host.planId) });
  }

  regionStoreDidChange = () => {
    this.setState({ region: regionStore.regionById(this.context.host.regionId) });
  }

  render() {
    const { stats, plan, region } = this.state,
          { host } = this.context;

    return (
      <div className='workspace-system-component container'>
        <WorkspaceNav host={host} activeTab='system' />
        <div className='container'>
          <Table responsive striped bordered condensed hover id='workspace-system-info'>
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
          </Table>

          <Table responsive striped bordered condensed hover id='workspace-system-stats'>
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
            </tbody>
          )}
          </Table>
        </div>
      </div>
    );
  }
}
