import React from 'react';
import SnackbarListItem from 'components/snackbar-list-item';
import snackbarStore from 'stores/snackbar-store';
import TimeoutTransitionGroup from 'timeout-transition-group';

export default class Snackbar extends React.Component {
  displayName = 'Snackbar';

  state = {
    notifications: snackbarStore.notifications
  };

  componentDidMount() {
    snackbarStore.onChange(this.snackbarStoreDidChange);
  }

  componentWillUnmount() {
    snackbarStore.offChange(this.snackbarStoreDidChange);
  }

  snackbarStoreDidChange = () => {
    this.setState({ notifications: snackbarStore.notifications });
  };

  render() {
    const { notifications } = this.state;

    return (
      <div className='snackbar-component'>
        <TimeoutTransitionGroup transitionName='el' enterTimeout={301} leaveTimeout={301} component='ul'>
          {notifications.map((notification, i) => {
            return (
              <SnackbarListItem key={`snackbar-list-item-${notification.id}`} notification={notification} index={i} />
            );
          })}
        </TimeoutTransitionGroup>
      </div>
    );
  }
}
