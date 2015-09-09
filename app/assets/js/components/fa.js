import React, { PropTypes } from 'react';
import classNames from 'classnames';

export default class Fa extends React.Component {
  displayName = 'Fa';

  static propTypes = {
    icon: PropTypes.string.isRequired
  };

  render() {
    return (
      <i className={classNames('fa', `fa-${this.props.icon}`)} />
    );
  }
}
