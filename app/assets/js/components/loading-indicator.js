import React, { PropTypes } from 'react';
import classNames from 'classnames';

export default class LoadingIndicator extends React.Component {
  displayName = 'LoadingIndicator';

  static propTypes = {
    large: PropTypes.bool
  };

  render() {
    return (
      <div className={classNames('loading-indicator-component', { large: this.props.large })}>
        <div className='graphic'></div>
      </div>
    );
  }
}
