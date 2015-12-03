import React, { PropTypes } from 'react';
import { Button, ButtonToolbar, Col, DropdownButton, MenuItem, Modal } from 'react-bootstrap';
import TimeAgo from 'react-timeago';
import prettyBytes from 'pretty-bytes';

import Host from 'records/host';
import Image from 'records/image';
import imageActions from 'actions/image-actions';
import orgActions from 'actions/org-actions';
import imageStore from 'stores/image-store';
import orgStore from 'stores/org-store';
import Fa from 'components/fa';

export default class LocalSnapshotListItem extends React.Component {
  displayName = 'LocalSnapshotListItem';

  static propTypes = {
    host: PropTypes.instanceOf(Host).isRequired,
    snapshot: PropTypes.instanceOf(Image).isRequired
  }

  constructor(props, context) {
    super(props, context);

    let org = null;
    if (this.props.host.orgId) {
      org = orgStore.orgByOrgId(this.props.host.orgId);
    }

    this.state = {
      org,
      showDeleteModal: false,
      showShareModal: false,
      processing: false
    };
  }

  componentDidMount() {
    orgStore.onChange(this.orgStoreDidChange);
    orgActions.fetchAll();
    imageStore.on('removed', this.onImageRemoved);
    imageStore.on('remove-failed', this.onImageRemoveFailed);
  }

  componentWillUnmount() {
    orgStore.offChange(this.orgStoreDidChange);
    imageStore.off('removed', this.onImageRemoved);
    imageStore.off('remove-failed', this.onImageRemoveFailed);
  }

  orgStoreDidChange = () => {
    if (!this.props.host.orgId) {
      return;
    }
    const org = orgStore.orgByOrgId(this.props.host.orgId);
    this.setState({ org });
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

  handleShare = () => {
    this.setState({ showShareModal: true });
  }

  hideShareModal = () => {
    this.setState({ showShareModal: false });
  }

  handleShareModalCancel = () => {
    this.hideShareModal();
  }

  handleShareModalOK = () => {
    this.setState({ processing: true });
    // TODO snapshotActions.share(this.props.snapshot.id);
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

  render() {
    const { snapshot } = this.props,
          { org, processing } = this.state;

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
                {org ? (
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

        {org ? (
          <Modal show={this.state.showShareModal} onHide={this.hideShareModal}>
            <Modal.Header>
              <Modal.Title>Share Snapshot with Team</Modal.Title>
            </Modal.Header>

            <Modal.Body>
              <p><strong>{snapshot.displayName}</strong> will be shared with members of your team in <strong>{org.name}</strong>.</p>
            </Modal.Body>

            <Modal.Footer>
              <Button onClick={this.handleShareModalCancel}>Cancel</Button>
              <Button bsStyle='primary'
                disabled={processing}
                onClick={processing ? null : this.handleShareModalOK}>
                {processing ? 'Sharing...' : 'Share with Team'}
              </Button>
            </Modal.Footer>
          </Modal>
        ) : ''}

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
