import React, { PropTypes } from 'react';
import { Button, ButtonToolbar } from 'react-bootstrap';
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
          <ButtonToolbar className='pull-right'>
            {onRefresh ?
              <Button bsStyle='default' onClick={onRefresh}>
                <Fa icon='refresh' /> Refresh
              </Button>
            : ''}
            {onPush ?
              <Button bsStyle='default' onClick={onPush}>
                <Fa icon='cloud-upload' /> Upload
              </Button>
            : ''}
            {onDelete ?
              <Button bsStyle='default' onClick={onDelete}>
                <Fa icon='trash' /> Delete
              </Button>
            : ''}
          </ButtonToolbar>
        </td>
      </tr>
    );
  }
}
