import React, { PropTypes } from 'react';
import { Alert, Button, ButtonToolbar, Col, DropdownButton, MenuItem, Modal } from 'react-bootstrap';
import TimeAgo from 'react-timeago';
import prettyBytes from 'pretty-bytes';

import Host from 'records/host';
import Org from 'records/org';
import Image from 'records/image';
import imageActions from 'actions/image-actions';
import snackbarActions from 'actions/snackbar-actions';
import snapshotActions from 'actions/snapshot-actions';
import imageStore from 'stores/image-store';
import snapshotStore from 'stores/snapshot-store';
import Fa from 'components/fa';
import Mp from 'lib/mp';

export default class LocalSnapshotListItem extends React.Component {
  displayName = 'LocalSnapshotListItem';

  static contextTypes = {
    router: PropTypes.func.isRequired
  };

  static propTypes = {
    host: PropTypes.instanceOf(Host).isRequired,
    org: PropTypes.instanceOf(Org),
    snapshot: PropTypes.instanceOf(Image).isRequired
  };

  state = {
    showDeleteModal: false,
    showShareModal: false,
    processing: false,
    publishError: null
  };

  componentDidMount() {
    imageStore.on('removed', this.onImageRemoved);
    imageStore.on('remove-failed', this.onImageRemoveFailed);

    snapshotStore.on('published', this.onSnapshotPublished);
    snapshotStore.on('publish-failed', this.onSnapshotPublishFailed);
  }

  componentWillUnmount() {
    imageStore.off('removed', this.onImageRemoved);
    imageStore.off('remove-failed', this.onImageRemoveFailed);

    snapshotStore.off('published', this.onSnapshotPublished);
    snapshotStore.off('publish-failed', this.onSnapshotPublishFailed);
  }

  onImageRemoved = (data) => {
    const { id } = data;
    if (this.props.snapshot.id !== id) {
      return;
    }

    this.hideDeleteModal();
    this.setState({ processing: false });
  }

  onImageRemoveFailed = (data) => {
    const { id } = data;
    if (this.props.snapshot.id !== id) {
      return;
    }

    this.setState({ processing: false });
  }

  onSnapshotPublished = (data) => {
    const { snapshot } = data;
    if (snapshot.imageId !== this.props.snapshot.id) {
      return;
    }

    this.setState({ processing: false, showShareModal: false });
    snackbarActions.post(`Snapshot published!`);

    Mp.increment('snapshots-published');

    this.context.router.transitionTo('team-snapshots',
      { hostSlug: this.props.host.slug },
      { snapshotId: snapshot.id });
  }

  onSnapshotPublishFailed = (data) => {
    const { orgSlug, hostId, imageId } = data;
    if (this.props.org && orgSlug !== this.props.org.slug
      || hostId !== this.props.host.id
      || imageId !== this.props.snapshot.id) {
      return;
    }

    this.setState({ processing: false, publishError: snapshotStore.lastError });
  }

  handleShare = () => {
    this.setState({ showShareModal: true, publishError: null });
  }

  hideShareModal = () => {
    this.setState({ showShareModal: false });
  }

  handleShareModalCancel = () => {
    this.hideShareModal();
  }

  handleShareModalOK = () => {
    this.setState({ processing: true, publishError: null });
    if (!this.props.org) {
      snackbarActions.post("You cannot share a snapshot from a workstation that does not belong to an organization.");
      this.setState({ processing: false });
      return;
    }
    snapshotActions.publish(this.props.org.slug, this.props.host.id, this.props.snapshot.id);
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
    imageActions.remove(this.props.host.slug, this.props.snapshot.id);
  }

  renderShareModal() {
    const { org, snapshot } = this.props,
          { processing, publishError } = this.state;

    return (
      <Modal show={this.state.showShareModal} onHide={this.hideShareModal}>
        <Modal.Header>
          <Modal.Title>Share Snapshot with Team</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {publishError ? (
            <Alert bsStyle='danger'>There was an error trying to publish your snapshot: {publishError}.</Alert>
          ) : ''}

          <p><strong>{snapshot.displayName}</strong> will be shared with members of your team in <strong>{org.name}</strong>.</p>
        </Modal.Body>

        <Modal.Footer>
          <Button
            onClick={this.handleShareModalCancel}
            disabled={processing}>Cancel</Button>
          <Button bsStyle='primary'
            disabled={processing}
            onClick={processing ? null : this.handleShareModalOK}>
            {processing ? 'Sharing...' : 'Share with Team'}
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }

  render() {
    const { org, snapshot } = this.props,
          { processing } = this.state,
          shareAllowed = org && org.roleAllowsSnapshotPublish;

    return (
      <Col lg={3} md={4} sm={6} xs={12} className='local-snapshot-list-item-component snapshot-list-item'>
        <div className='ui-card'>
          <div className='ui-card-body'>
            <div className='snapshot-header'>
              <div className='stack-icon' style={{ backgroundImage: `url(${Image.defaultStackIconUrl})` }}>
                <div style={{ backgroundImage: `url(${snapshot.stackIconUrl})` }}></div>
              </div>

              <div className='info'>
                <h4>{snapshot.displayName}</h4>
                <span>created <TimeAgo date={snapshot.createdAt} /></span>
              </div>
            </div>

            <div className='aux-info'>
              {prettyBytes(snapshot.virtualSize)}
            </div>

            <ButtonToolbar className='buttons'>
              <DropdownButton noCaret className='borderless' id={`snapshot-actions-${snapshot.id}`}
                title={<Fa icon='ellipsis-v' />}>
                {shareAllowed ? (
                  <MenuItem onSelect={this.handleShare}>
                    <Fa icon='cloud-upload' /> Share with Team
                  </MenuItem>
                ) : ''}
                <MenuItem onSelect={this.handleDelete}>
                  <Fa icon='trash' /> Delete
                </MenuItem>
              </DropdownButton>
            </ButtonToolbar>
          </div>
        </div>

        {shareAllowed ? this.renderShareModal() : ''}

        <Modal show={this.state.showDeleteModal} onHide={this.hideDeleteModal}>
          <Modal.Header>
            <Modal.Title>Delete Snapshot</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p><strong>{snapshot.displayName}</strong> will be deleted.</p>
            <p><em>A deleted snapshot cannot be recovered.</em></p>
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
      </Col>
    );
  }
}
