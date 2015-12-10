import React, { PropTypes } from 'react';
import { Alert, Button, Grid, Row } from 'react-bootstrap';
import classNames from 'classnames';

import Host from 'records/host';
import Org from 'records/org';
import Snapshot from 'records/snapshot';
import snapshotActions from 'actions/snapshot-actions';
import snapshotStore from 'stores/snapshot-store';
import LoadingIndicator from 'components/loading-indicator';
import TeamSnapshotListItem from 'components/team-snapshot-list-item';
import SelectableTeamSnapshot from 'components/selectable-team-snapshot';

export default class TeamSnapshotList extends React.Component {
  displayName = 'TeamSnapshotList';

  static propTypes = {
    host: PropTypes.instanceOf(Host).isRequired,
    org: PropTypes.instanceOf(Org).isRequired,
    snapshotId: PropTypes.number,
    selectMode: PropTypes.bool,
    selectedSnapshot: PropTypes.instanceOf(Snapshot),
    onSelect: PropTypes.func
  }

  state = {
    snapshots: snapshotStore.snapshotsByOrgSlug(this.props.org.slug),
    failed: false
  }

  componentDidMount() {
    snapshotStore.onChange(this.snapshotStoreDidChange);
    snapshotStore.on('fetch-all-by-org-slug-failed', this.onSnapshotStoreFetchFailed);
    snapshotActions.fetchAllByOrgSlug(this.props.org.slug);
  }

  componentWillUnmount() {
    snapshotStore.offChange(this.snapshotStoreDidChange);
    snapshotStore.off('fetch-all-by-org-slug-failed', this.onSnapshotStoreFetchFailed);
  }

  snapshotStoreDidChange = () => {
    this.setState({ snapshots: snapshotStore.snapshotsByOrgSlug(this.props.org.slug) });
  }

  onSnapshotStoreFetchFailed = () => {
    this.setState({ failed: true });
  }

  handleRetry = () => {
    snapshotActions.fetchAllByOrgSlug(this.props.org.slug);
    this.setState({ failed: false });
  }

  render() {
    const { selectMode, selectedSnapshot, onSelect } = this.props,
          { snapshots, failed } = this.state,
          loading = snapshots == null;

    if (failed) {
      return (
        <div className='snapshot-list-component team'>
          <Alert bsStyle='danger'>
            <p>There was an error loading snapshots.</p>
            <p><Button onClick={this.handleRetry}>Retry</Button></p>
          </Alert>
        </div>
      );
    }

    if (loading) {
      return (
        <div className='snapshot-list-component team'>
          <LoadingIndicator large />
        </div>
      );
    }

    if (!snapshots || snapshots.size === 0) {
      return (
        <div className='snapshot-list-component team'>
          <p>There are no snapshots.</p>
        </div>
      );
    }

    return (
      <div className={classNames('snapshot-list-component', 'team', { 'selectable': selectMode })}>
        <Grid className='ui-card-grid'>
          <Row>
            {snapshots.toList().map((snapshot) => {
              if (selectMode) {
                return (
                  <SelectableTeamSnapshot key={`snapshot-${snapshot.id}`}
                    snapshot={snapshot}
                    selected={selectedSnapshot && selectedSnapshot.id === snapshot.id}
                    onSelect={onSelect} />
                );
              } else {
                return (
                  <TeamSnapshotListItem key={`snapshot-${snapshot.id}`}
                    host={this.props.host} snapshot={snapshot}
                    focus={snapshot.id === this.props.snapshotId} />
                );
              }
            })}
          </Row>
        </Grid>
      </div>
    );
  }
}
