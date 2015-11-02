import React, { PropTypes } from 'react';
import { Button } from 'react-bootstrap';
import Image from 'records/image';
import classNames from 'classnames';
import TimeAgo from 'react-timeago';
import prettyBytes from 'pretty-bytes';
import Fa from 'components/fa';

export default class ImageListItem extends React.Component {
  displayName = 'ImageListItem';

  static propTypes = {
    image: PropTypes.instanceOf(Image).isRequired,
    selected: PropTypes.bool.isRequired,
    onSelect: PropTypes.func,
    onRefresh: PropTypes.func,
    onPush: PropTypes.func,
    onDelete: PropTypes.func
  };

  handleClick = () => {
    this.props.onSelect(this.props.image);
  };

  render() {
    const { image, selected, onSelect, onRefresh, onPush, onDelete } = this.props;

    return (
      <tr className={classNames('image-list-item-component', { selected })}>
        {onSelect ? (
          <td>
            <Button onClick={this.handleClick} bsStyle={selected ? 'primary' : 'default'}>Select</Button>
          </td>
        ) : ''}
        <td>{image.displayName}</td>
        <td><TimeAgo date={image.createdAt} /></td>
        <td>{prettyBytes(image.virtualSize)}</td>
        <td>
          {onRefresh ?
            <Button bsStyle='link' onClick={onRefresh}>
              <Fa icon='refresh' />
            </Button>
          : ''}
          &nbsp;
          {onPush ?
            <Button bsStyle='link' onClick={onPush}>
              <Fa icon='cloud-upload' />
            </Button>
          : ''}
          &nbsp;
          {onDelete ?
            <Button bsStyle='link' onClick={onDelete}>
              <Fa icon='trash' />
            </Button>
          : ''}
        </td>
      </tr>
    );
  }
}
