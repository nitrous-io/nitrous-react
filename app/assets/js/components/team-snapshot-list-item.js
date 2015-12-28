import React, { PropTypes } from 'react';
import { Button, ButtonToolbar, Col, DropdownButton, MenuItem, Modal, OverlayTrigger, Tooltip } from 'react-bootstrap';
import TimeAgo from 'react-timeago';
import prettyBytes from 'pretty-bytes';
import classNames from 'classnames';

import Host from 'records/host';
import Org from 'records/org';
import Snapshot from 'records/snapshot';
import snackbarActions from 'actions/snackbar-actions';
import snapshotActions from 'actions/snapshot-actions';
import snapshotStore from 'stores/snapshot-store';
import userStore from 'stores/user-store';
import Fa from 'components/fa';

export default class TeamSnapshotListItem extends React.Component {
  displayName = 'TeamSnapshotListItem';

  static contextTypes = {
    router: PropTypes.func.isRequired
  };

  static propTypes = {
    host: PropTypes.instanceOf(Host).isRequired,
    org: PropTypes.instanceOf(Org).isRequired,
    snapshot: PropTypes.instanceOf(Snapshot).isRequired
  }

  state = {
    user: userStore.user,
    showDeleteModal: false,
    processing: false
  };

  componentDidMount() {
    userStore.onChange(this.userStoreDidChange);
    snapshotStore.on('deleted', this.onSnapshotStoreDeleted);
    snapshotStore.on('delete-failed', this.onSnapshotStoreDeleteFailed);
  }

  componentWillUnmount() {
    userStore.offChange(this.userStoreDidChange);
    snapshotStore.off('deleted', this.onSnapshotStoreDeleted);
    snapshotStore.off('delete-failed', this.onSnapshotStoreDeleteFailed);
  }

  userStoreDidChange = () => {
    this.setState({ user: userStore.user });
  }

  onSnapshotStoreDeleted = (data) => {
    const { orgSlug, snapshotId } = data;
    if (this.props.org.slug === orgSlug && this.props.snapshot.id === snapshotId) {
      this.hideDeleteModal();
      this.setState({ processing: false });
    }
  }

  onSnapshotStoreDeleteFailed = (data) => {
    const { orgSlug, snapshotId } = data;
    if (this.props.org.slug === orgSlug && this.props.snapshot.id === snapshotId) {
      this.setState({ processing: false });
      snackbarActions.post(`Failed to delete snapshot “${this.props.snapshot.displayName}”!`);
    }
  }

  handleRestore = () => {
    this.context.router.transitionTo('new-container',
      { hostSlug: this.props.host.slug },
      { tab: 'team-snapshots', snapshotId: this.props.snapshot.id });
  }

  handleDelete = () => {
    this.setState({ showDeleteModal: true });
  }

  hideDeleteModal = () => {
    this.setState({ showDeleteModal: false });
  }

  handleDeleteModalCancel = () => {
    this.hideDeleteModal();
  }

  handleDeleteModalOK = () => {
    this.setState({ processing: true });
    snapshotActions.delete(this.props.org.slug, this.props.snapshot.id);
  }

  render() {
    const { snapshot, org } = this.props,
          { user, processing } = this.state,
          isOwner = snapshot.ownerUsername === user.username,
          deleteAllowed = isOwner || org.roleAllowsSnapshotDelete;

    return (
      <Col lg={3} md={4} sm={6} xs={12}
        className={classNames('team-snapshot-list-item-component', 'snapshot-list-item')}>
        <div className='ui-card'>
          <div className='ui-card-body'>
            <div className='snapshot-header'>
              <div className='stack-icon' style={{ backgroundImage: `url(${Snapshot.defaultStackIconUrl})` }}>
                <div style={{ backgroundImage: `url(${snapshot.stackIconUrl})` }}></div>
              </div>

              <div className='info'>
                <h4>{snapshot.displayName}</h4>
                <span>created <TimeAgo date={snapshot.createdAt} /></span>
              </div>
            </div>

            <div className='owner'>
              <OverlayTrigger placement='top'
                overlay={<Tooltip id={`snapshot-${snapshot.id}-owner-tooltip`}>
                  Created by {isOwner ? 'you' : snapshot.ownerDisplayName}</Tooltip>}>
                <img className='gravatar' src={snapshot.ownerGravatar(40)} />
              </OverlayTrigger>
            </div>

            <div className='aux-info'>
              {snapshot.filesize ? (
                <span className='size'>{prettyBytes(snapshot.filesize)}</span>
              ) : ''}
              <Button bsStyle='default' onClick={this.handleRestore}>Restore</Button>
            </div>

            {deleteAllowed ? (
              <ButtonToolbar className='buttons'>
                <DropdownButton noCaret className='borderless' id={`snapshot-actions-${snapshot.id}`}
                  title={<Fa icon='ellipsis-v' />}>
                  <MenuItem onSelect={this.handleDelete}>
                    <Fa icon='trash' /> Delete
                  </MenuItem>
                </DropdownButton>
              </ButtonToolbar>
            ) : ''}
          </div>
        </div>

        {deleteAllowed ? (
          <Modal show={this.state.showDeleteModal} onHide={this.hideDeleteModal}>
            <Modal.Header>
              <Modal.Title>Delete Snapshot</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p><strong>{snapshot.displayName}</strong> will be deleted and will no longer be available to other members of <strong>{org.displayName}</strong>.</p>
            </Modal.Body>
            <Modal.Footer>
              <Button onClick={this.handleDeleteModalCancel}>Cancel</Button>
              <Button bsStyle='danger'
                disabled={processing}
                onClick={processing ? null : this.handleDeleteModalOK}>
                {processing ? 'Deleting...' : 'Delete'}
              </Button>
            </Modal.Footer>
          </Modal>
        ) : ''}
      </Col>
    );
  }
}
