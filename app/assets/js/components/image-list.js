import React, { PropTypes } from 'react';
import Host from 'records/host';
import userStore from 'stores/user-store';
import imageStore from 'stores/image-store';
import imageActions from 'actions/image-actions';
import { Table, Tabs, Tab, Modal, Input, Button, ButtonGroup } from 'react-bootstrap';
import ImageListItem from 'components/image-list-item';
import PullImage from 'components/pull-image';
import Fa from 'components/fa';
import classNames from 'classnames';

export default class ImageList extends React.Component {
  displayName = 'ImageList';

  static propTypes = {
    host: PropTypes.instanceOf(Host).isRequired,
    showSnapshots: PropTypes.bool,
    showImages: PropTypes.bool,
    selectedImage: PropTypes.string,
    onSelect: PropTypes.func,
    manageImages: PropTypes.bool
  };

  state = {
    snapshots: imageStore.snapshotsByHostSlug(this.props.host.slug),
    otherImages: imageStore.otherImagesByHostSlug(this.props.host.slug),
    showPushModal: false,
    showPullModal: false,
    pushRepository: null,
    pushing: false,
    showDeleteModal: false,
    deleting: false,
    targetImage: null
  };

  componentDidMount() {
    imageStore.onChange(this.imageStoreDidChange);
    imageStore.on('push-initiated', this.pushInitiated);
    imageStore.on('push-failed', this.pushFailed);
    imageStore.on('removed', this.imageRemoved);
    imageStore.on('remove-failed', this.removeFailed);
    imageActions.fetchAllByHostSlug(this.props.host.slug);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.host !== nextProps.host) {
      this.setState({
        snapshots: imageStore.snapshotsByHostSlug(nextProps.host.slug),
        otherImages: imageStore.otherImagesByHostSlug(nextProps.host.slug)
      });
      imageActions.fetchAllByHostSlug(nextProps.host.slug);
    }
  }

  componentWillUnmount() {
    imageStore.offChange(this.imageStoreDidChange);
  }

  imageStoreDidChange = () => {
    this.setState({
      snapshots: imageStore.snapshotsByHostSlug(this.props.host.slug),
      otherImages: imageStore.otherImagesByHostSlug(this.props.host.slug)
    });
  };

  pushInitiated = (data) => {
    const { id, repository } = data,
          { targetImage, pushRepository } = this.state;

    if (!targetImage) {
      return;
    }

    if (pushRepository === repository && targetImage.id === id) {
      this.setState({ pushing: false, showPushModal: false });
    }
  }

  pushFailed = (data) => {
    const { id, repository } = data,
          { targetImage, pushRepository } = this.state;

    if (!targetImage) {
      return;
    }

    if (pushRepository === repository && targetImage.id === id) {
      this.setState({ pushing: false });
    }
  }

  imageRemoved = (data) => {
    const { targetImage } = this.state,
          { id } = data;

    if (!targetImage) {
      return;
    }

    if (targetImage.id === id) {
      this.setState({ deleting: false, showDeleteModal: false });
    }
  }

  removeFailed = (data) => {
    const { targetImage } = this.state,
          { id } = data;

    if (!targetImage) {
      return;
    }

    if (targetImage.id === id) {
      this.setState({ deleting: false });
    }
  }

  handlePullImageButton = () => {
    this.setState({ showPullModal: true });
  }

  handlePullImageModalHide = () => {
    this.setState({ showPullModal: false });
  }

  handleRefreshButton = (image) => {
    imageActions.pull(this.props.host.slug, image.repo, true);
  }

  handlePushButton = (image) => {
    let { repo } = image;
    if (image.isSnapshot) {
      repo = repo.replace(/__snapshot__/, "");
    }

    this.setState({ showPushModal: true, targetImage: image, pushRepository: repo });
  }

  handleChangePushRepositoryField = (event) => {
    this.setState({ pushRepository: event.target.value });
  }

  handlePushSubmit = (event) => {
    event.preventDefault();

    this.setState({ pushing: true });

    const { targetImage } = this.state;
    let { pushRepository } = this.state;
    if (!pushRepository.match(/:[\w][\w.-]{0,127}$/)) {
      pushRepository = `${pushRepository}:latest`;
      this.setState({ pushRepository });
    }
    imageActions.push(this.props.host.slug, targetImage.id, pushRepository);
  }

  hidePushModal = () => {
    this.setState({ showPushModal: false });
  }

  handleDeleteButton = (image) => {
    this.setState({ showDeleteModal: true, targetImage: image });
  }

  handleDeleteSubmit = (event) => {
    event.preventDefault();

    this.setState({ deleting: true });

    const { targetImage } = this.state;
    imageActions.remove(this.props.host.slug, targetImage.id);
  }

  hideDeleteModal = () => {
    this.setState({ showDeleteModal: false });
  }

  bindToImage = (func, image) => {
    if (!func) {
      return null;
    }

    return func.bind(this, image);
  }

  render() {
    const { snapshots, otherImages, showPushModal, showPullModal, pushRepository, pushing, showDeleteModal, deleting, targetImage } = this.state,
          { host, selectedImage, showSnapshots, showImages, onSelect, manageImages } = this.props,
          { advanced } = userStore,
          canSubmitPush = !pushing && (pushRepository && pushRepository.length > 0);

    let onRefresh, onPush, onDelete = null;
    if (manageImages) {
      onRefresh = this.handleRefreshButton;
      onPush = this.handlePushButton;
      onDelete = this.handleDeleteButton;
    }

    let snapshotsContent = '',
        imagesContent = '',
        defaultActiveKey = 'other-images';

    if (showSnapshots !== false) {
      defaultActiveKey = 'snapshots';
      snapshotsContent = (
        <Tab eventKey='snapshots' title='My Snapshots'>
          <Table className='image-table' striped>
            <thead>
              <tr>
                {onSelect ? (
                  <th className='btn-column' />
                ) : ''}
                <th>Name</th>
                <th className='created-column'>Created</th>
                <th className='size-column'>Size</th>
                <th className='actions-column'></th>
              </tr>
            </thead>
            <tbody>
              {snapshots && snapshots.size > 0 ? snapshots.toList().map((snapshot) => {
                return (
                  <ImageListItem key={`snapshot-${snapshot.id}`} image={snapshot}
                    selected={selectedImage === snapshot.repo}
                    onSelect={onSelect}
                    onPush={advanced ? this.bindToImage(onPush, snapshot) : null}
                    onDelete={this.bindToImage(onDelete, snapshot)}/>
                );
              }) : (
                <tr>
                  <td className="text-center" colSpan={4}>No Snapshots</td>
                </tr>
              )}
            </tbody>
          </Table>
        </Tab>);
    }

    if (showImages !== false) {
      imagesContent = (
        <Tab eventKey='other-images' title='Other Images'>
          <Table className='image-table' striped>
            <thead>
              <tr>
                {onSelect ? (
                  <th className='btn-column' />
                ) : ''}
                <th>Name</th>
                <th className='created-column'>Created</th>
                <th className='size-column'>Size</th>
                <th className='actions-column'></th>
              </tr>
            </thead>
            <tbody>
              {otherImages && otherImages.size > 0 ? otherImages.toList().map((image) => {
                return (
                  <ImageListItem key={`image-${image.id}`} image={image}
                    selected={selectedImage === image.repo}
                    onSelect={onSelect}
                    onRefresh={this.bindToImage(onRefresh, image)}
                    onPush={this.bindToImage(onPush, image)}
                    onDelete={this.bindToImage(onDelete, image)}/>
                );
              }) : (
                <tr>
                  <td className="text-center" colSpan={4}>No Images</td>
                </tr>
              )}
            </tbody>
          </Table>

          <ButtonGroup>
            <Button onClick={this.handlePullImageButton}>
              <Fa icon='cloud-download' /> Pull Image
            </Button>
          </ButtonGroup>

        </Tab>);
    }

    const classes = classNames('ui-segmented-pill', 'images-tab', {
      'no-tabs': !advanced || snapshotsContent === '' || imagesContent === ''
    });

    return (
      <div>
        <Tabs defaultActiveKey={defaultActiveKey} bsStyle='pills' className={classes}>
          {snapshotsContent}
          {advanced ? imagesContent : ''}
        </Tabs>

        {showPushModal ?
          <Modal show={showPushModal} onHide={this.hidePushModal}>
            <Modal.Header>
              <Modal.Title>Push '{targetImage.displayName}' to a Docker Registry</Modal.Title>
            </Modal.Header>
            <form onSubmit={this.handlePushSubmit}>
              <Modal.Body>
                <Input label="Image Repository" type='text'
                  required value={pushRepository} onChange={this.handleChangePushRepositoryField} />
              </Modal.Body>
              <Modal.Footer>
                <Button ref='modalCancel' onClick={this.hidePushModal}>Cancel</Button>
                <Button type='submit' disabled={!canSubmitPush} bsStyle='primary'>{pushing ? 'Pushing' : 'Push'}</Button>
              </Modal.Footer>
            </form>
          </Modal>
        : ''}

        {showDeleteModal ?
          <Modal show={showDeleteModal} onHide={this.hidePushModal}>
            <Modal.Header>
              <Modal.Title>Delete {`\`${targetImage.displayName}\``}?</Modal.Title>
            </Modal.Header>
            <form onSubmit={this.handleDeleteSubmit}>
              <Modal.Body>
                <p>Do you want to delete the {targetImage.isSnapshot ? 'snapshot' : 'image'} {targetImage.repo}?</p>
              </Modal.Body>
              <Modal.Footer>
                <Button ref='modalCancel' onClick={this.hideDeleteModal}>Cancel</Button>
                <Button type='submit' disabled={deleting} bsStyle='danger'>{deleting ? 'Deleting' : 'Delete'}</Button>
              </Modal.Footer>
            </form>
          </Modal>
        : ''}

        <PullImage host={host} showModal={showPullModal} onHideModal={this.handlePullImageModalHide} />
      </div>
    );
  }
}
