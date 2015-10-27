import React, { PropTypes } from 'react';
import Host from 'records/host';
import imageStore from 'stores/image-store';
import imageActions from 'actions/image-actions';
import { Table, Tabs, Tab } from 'react-bootstrap';
import ImageListItem from 'components/image-list-item';

export default class ImageList extends React.Component {
  displayName = 'ImageList';

  static propTypes = {
    host: PropTypes.instanceOf(Host).isRequired,
    selectedImage: PropTypes.string.isOptional,
    onSelect: PropTypes.func.isOptional
  };

  componentDidMount() {
    imageStore.onChange(this.imageStoreDidChange);
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

  state = {
    snapshots: imageStore.snapshotsByHostSlug(this.props.host.slug),
    otherImages: imageStore.otherImagesByHostSlug(this.props.host.slug)
  };

  render() {
    const { snapshots, otherImages } = this.state,
          { selectedImage, onSelect } = this.props;

    return (
      <Tabs defaultActiveKey='snapshots' bsStyle='pills' className='ui-segmented-pill images-tab'>
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
              </tr>
            </thead>
            <tbody>
              {snapshots && snapshots.size > 0 ? snapshots.toList().map((snapshot) => {
                return (
                  <ImageListItem key={`snapshot-${snapshot.id}`} image={snapshot}
                    selected={selectedImage === snapshot.repo}
                    onSelect={onSelect} />
                );
              }) : (
                <tr>
                  <td colSpan={4}>&nbsp;</td>
                </tr>
              )}
            </tbody>
          </Table>
        </Tab>
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
              </tr>
            </thead>
            <tbody>
              {otherImages && otherImages.size > 0 ? otherImages.toList().map((image) => {
                return (
                  <ImageListItem key={`image-${image.id}`} image={image}
                    selected={selectedImage === image.repo}
                    onSelect={onSelect} />
                );
              }) : (
                <tr>
                  <td colSpan={4}>&nbsp;</td>
                </tr>
              )}
            </tbody>
          </Table>
        </Tab>
      </Tabs>
    );
  }
}
