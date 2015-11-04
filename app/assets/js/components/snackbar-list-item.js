import React, { PropTypes } from 'react';
import Notification from 'lib/snackbar-notification';
import snackbarActions from 'actions/snackbar-actions';
import classNames from 'classnames';
import Fa from 'components/fa';

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
          margin = 15,
          { notification } = this.props,
          { kind } = notification;

    return (
      <li className={classNames('snackbar-list-item-component', 'popover', kind)}
        style={{ top: (itemHeight + margin) * this.props.index }}
        onClick={this.handleClick}>
        <div className='popover-content'>
          {kind === 'info' ? (
            <Fa icon='info-circle' />
          ) : ''}
          {kind === 'warning' ? (
            <Fa icon='exclamation-triangle' />
          ) : ''}
          {kind === 'error' ? (
            <Fa icon='exclamation-circle' />
          ) : ''}
          {notification.content}
        </div>
      </li>
    );
  }
}
