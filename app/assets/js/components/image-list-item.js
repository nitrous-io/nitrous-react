import React, { PropTypes } from 'react';
import { Button } from 'react-bootstrap';
import Image from 'records/image';
import classNames from 'classnames';
import TimeAgo from 'react-timeago';
import prettyBytes from 'pretty-bytes';

export default class ImageListItem extends React.Component {
  displayName: 'ImageListItem'

  static propTypes = {
    image: PropTypes.instanceOf(Image).isRequired,
    selected: PropTypes.bool.isRequired,
    onSelect: PropTypes.func.isRequired
  };

  handleClick = () => {
    this.props.onSelect(this.props.image);
  };

  render() {
    const { image, selected } = this.props;

    return (
      <tr className={classNames('image-list-item-component', { selected })}>
        <td>
          <Button onClick={this.handleClick} bsStyle={selected ? 'primary' : 'default'}>Select</Button>
        </td>
        <td>{image.displayName}</td>
        <td><TimeAgo date={image.createdAt} /></td>
        <td>{prettyBytes(image.virtualSize)}</td>
      </tr>
    );
  }
}
