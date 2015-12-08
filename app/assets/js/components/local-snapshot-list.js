import React, { PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { Grid, Row } from 'react-bootstrap';
import classNames from 'classnames';

import Host from 'records/host';
import Image from 'records/image';
import imageActions from 'actions/image-actions';
import orgActions from 'actions/org-actions';
import imageStore from 'stores/image-store';
import orgStore from 'stores/org-store';
import LoadingIndicator from 'components/loading-indicator';
import LocalSnapshotListItem from 'components/local-snapshot-list-item';
import SelectableLocalSnapshot from 'components/selectable-local-snapshot';

export default class LocalSnapshotList extends React.Component {
  displayName = 'LocalSnapshotList';

  static propTypes = {
    host: PropTypes.instanceOf(Host).isRequired,
    snapshots: ImmutablePropTypes.mapOf(PropTypes.instanceOf(Image)),
    selectMode: PropTypes.bool,
    selectedSnapshotRepo: PropTypes.string,
    onSelect: PropTypes.func
  }

  constructor(props, context) {
    super(props, context);

    let org = null;
    if (this.props.host.orgId) {
      org = orgStore.orgByOrgId(this.props.host.orgId);
    }

    this.state = {
      org,
      snapshots: imageStore.snapshotsByHostSlug(this.props.host.slug)
    };
  }

  componentDidMount() {
    if (this.props.host.orgId) {
      orgStore.onChange(this.orgStoreDidChange);
      orgActions.fetchAll();
    }

    imageStore.onChange(this.imageStoreDidChange);
    imageActions.fetchAllByHostSlug(this.props.host.slug);
  }

  componentWillUnmount() {
    if (this.props.host.orgId) {
      orgStore.offChange(this.orgStoreDidChange);
    }
    imageStore.offChange(this.imageStoreDidChange);
  }

  orgStoreDidChange = () => {
    if (!this.props.host.orgId) {
      return;
    }
    const org = orgStore.orgByOrgId(this.props.host.orgId);
    this.setState({ org });
  }

  imageStoreDidChange = () => {
    this.setState({ snapshots: imageStore.snapshotsByHostSlug(this.props.host.slug) });
  };

  render() {
    const { selectMode, selectedSnapshotRepo, onSelect } = this.props,
          { org, snapshots } = this.state,
          loading = snapshots == null;

    if (loading) {
      return (
        <div className='snapshot-list-component local'>
          <LoadingIndicator large />
        </div>
      );
    }

    if (!snapshots || snapshots.size === 0) {
      return (
        <div className='snapshot-list-component local'>
          <p>There are no snapshots.</p>
        </div>
      );
    }

    return (
      <div className={classNames('snapshot-list-component', 'local', { 'selectable': selectMode })}>
        <Grid className='ui-card-grid'>
          <Row>
            {snapshots.toList().map((snapshot) => {
              if (selectMode) {
                return (
                  <SelectableLocalSnapshot key={`snapshot-${snapshot.id}`}
                    host={this.props.host} snapshot={snapshot}
                    selected={selectedSnapshotRepo === snapshot.repo}
                    onSelect={onSelect} />
                );
              } else {
                return (
                  <LocalSnapshotListItem key={`snapshot-${snapshot.id}`}
                    host={this.props.host} org={org} snapshot={snapshot} />
                );
              }
            })}
          </Row>
        </Grid>
      </div>
    );
  }
}
