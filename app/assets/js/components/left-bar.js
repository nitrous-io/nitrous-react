import React from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

export default class LeftBar extends React.Component {
  displayName = 'LeftBar';

  render() {
    return (
      <div className='left-bar-component'>
        <a className='bar-btn nitrous' href="https://nitrous.io/">Nitrous</a>
        <OverlayTrigger placement='right' overlay={<Tooltip>Learn more about Nitrous</Tooltip>}>
          <a className='bar-btn help' href="https://nitrous.io/pricing">Help</a>
        </OverlayTrigger>
      </div>
    );
  }
}
