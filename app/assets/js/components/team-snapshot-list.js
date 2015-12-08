import React, { PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { Grid, Row } from 'react-bootstrap';

import Host from 'records/host';
import Org from 'records/org';
import Snapshot from 'records/snapshot';
import snapshotActions from 'actions/snapshot-actions';
import snapshotStore from 'stores/snapshot-store';
import LoadingIndicator from 'components/loading-indicator';
import TeamSnapshotListItem from 'components/team-snapshot-list-item';

export default class TeamSnapshotList extends React.Component {
  displayName = 'TeamSnapshotList';

  static propTypes = {
    host: PropTypes.instanceOf(Host).isRequired,
    org: PropTypes.instanceOf(Org).isRequired,
    snapshotId: PropTypes.number,
    snapshots: ImmutablePropTypes.mapOf(PropTypes.instanceOf(Snapshot))
  }

  state = {
    snapshots: snapshotStore.snapshotsByOrgSlug(this.props.org.slug)
  }

  componentDidMount() {
    snapshotStore.onChange(this.snapshotStoreDidChange);
    snapshotActions.fetchAllByOrgSlug(this.props.org.slug);
  }

  componentWillUnmount() {
    snapshotStore.offChange(this.snapshotStoreDidChange);
  }

  snapshotStoreDidChange = () => {
    this.setState({ snapshots: snapshotStore.snapshotsByOrgSlug(this.props.org.slug) });
  };

  render() {
    const { snapshots } = this.state,
          loading = snapshots == null;

    if (loading) {
      return (
        <div className='team-snapshot-list-component'>
          <LoadingIndicator large />
        </div>
      );
    }

    if (!snapshots || snapshots.size === 0) {
      return (
        <div className='team-snapshot-list-component'>
          <p>There are no snapshots.</p>
        </div>
      );
    }

    return (
      <div className='team-snapshot-list-component'>
        <Grid className='ui-card-grid'>
          <Row>
            {snapshots.toList().map((snapshot) => {
              return (
                <TeamSnapshotListItem key={`snapshot-${snapshot.id}`}
                  host={this.props.host} snapshot={snapshot}
                  focus={snapshot.id === this.props.snapshotId} />
              );
            })}
          </Row>
        </Grid>
      </div>
    );
  }
}
