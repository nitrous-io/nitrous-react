import React, { PropTypes } from 'react';
import Notification from 'lib/snackbar-notification';
import snackbarActions from 'actions/snackbar-actions';

export default class SnackbarListItem extends React.Component {
  displayName = 'SnackbarListItem';

  static propTypes = {
    notification: PropTypes.instanceOf(Notification).isRequired,
    index: PropTypes.number.isRequired
  };

  handleClick = () => {
    snackbarActions.remove(this.props.notification.id);
  };

  render() {
    const itemHeight = 42,
          margin = 15;

    return (
      <li className='snackbar-list-item-component popover'
        style={{ top: (itemHeight + margin) * this.props.index }}
        onClick={this.handleClick}>
        <div className='popover-content'>
          {this.props.notification.content}
        </div>
      </li>
    );
  }
}
