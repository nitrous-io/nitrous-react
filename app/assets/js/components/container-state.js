import React, { PropTypes } from 'react';
import { Label } from 'react-bootstrap';

export default class ContainerState extends React.Component {
  displayName: 'ContainerState'

  static propTypes = {
    state: PropTypes.string
  };

  render() {
    const state = this.props.state;
    let style;

    switch (state) {
      case 'running':
        style = 'success';
        break;
      case 'stopped':
        style = 'danger';
        break;
      case 'terminated':
        style = 'default';
        break;
      default:
        style = 'warning';
    }

    return (
      <div className='container-state-component'>
        <Label bsStyle={style}>
          {state}
        </Label>
      </div>
    );
  }
}
