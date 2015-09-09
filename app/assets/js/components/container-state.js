import React, { PropTypes } from 'react';
import classNames from 'classnames';

export default class ContainerState extends React.Component {
  displayName = 'ContainerState';

  static propTypes = {
    state: PropTypes.string
  };

  render() {
    const state = this.props.state;

    return (
      <div className={classNames('container-state-component', state)} title={state} />
    );
  }
}
