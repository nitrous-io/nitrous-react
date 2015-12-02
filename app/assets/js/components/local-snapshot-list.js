import React, { PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { Grid, Row } from 'react-bootstrap';

import Host from 'records/host';
import Image from 'records/image';
import imageActions from 'actions/image-actions';
import imageStore from 'stores/image-store';
import LoadingIndicator from 'components/loading-indicator';
import LocalSnapshotListItem from 'components/local-snapshot-list-item';

export default class LocalSnapshotList extends React.Component {
  displayName = 'LocalSnapshotList';

  static propTypes = {
    host: PropTypes.instanceOf(Host).isRequired,
    snapshots: ImmutablePropTypes.mapOf(PropTypes.instanceOf(Image))
  }

  state = {
    snapshots: imageStore.snapshotsByHostSlug(this.props.host.slug)
  }

  componentDidMount() {
    imageStore.onChange(this.imageStoreDidChange);
    imageActions.fetchAllByHostSlug(this.props.host.slug);
  }

  componentWillUnmount() {
    imageStore.offChange(this.imageStoreDidChange);
  }

  imageStoreDidChange = () => {
    this.setState({ snapshots: imageStore.snapshotsByHostSlug(this.props.host.slug) });
  };

  render() {
    const { snapshots } = this.state,
          loading = snapshots == null;

    if (loading) {
      return (
        <div className='local-snapshot-list-component'>
          <LoadingIndicator large />
        </div>
      );
    }

    if (!snapshots || snapshots.size === 0) {
      return (
        <div className='local-snapshot-list-component'>
          <p>There are no snapshots.</p>
        </div>
      );
    }

    return (
      <div className='local-snapshot-list-component'>
        <Grid className='ui-card-grid'>
          <Row>
            {snapshots.toList().map((snapshot) => {
              return (
                <LocalSnapshotListItem key={`snapshot-${snapshot.id}`}
                  host={this.props.host} snapshot={snapshot} />
              );
            })}
          </Row>
        </Grid>
      </div>
    );
  }
}
