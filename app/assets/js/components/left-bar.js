import React from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

export default class LeftBar extends React.Component {
  displayName = 'LeftBar';

  render() {
    return (
      <div className='left-bar-component'>
        <a className='bar-btn nitrous' href="/">Nitrous</a>
        <OverlayTrigger placement='right' overlay={<Tooltip id='help-tooltip'>Learn more about Nitrous</Tooltip>}>
          <a className='bar-btn help' href="/pricing">Help</a>
        </OverlayTrigger>
      </div>
    );
  }
}
