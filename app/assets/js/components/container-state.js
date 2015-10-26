import React, { PropTypes } from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import classNames from 'classnames';

export default class ContainerState extends React.Component {
  displayName = 'ContainerState';

  static propTypes = {
    state: PropTypes.string
  };

  render() {
    const state = this.props.state;

    return (
      <OverlayTrigger placement='top' overlay={<Tooltip id='container-state-tooltip'>{state}</Tooltip>}>
        <div className={classNames('container-state-component', state)} />
      </OverlayTrigger>
    );
  }
}
