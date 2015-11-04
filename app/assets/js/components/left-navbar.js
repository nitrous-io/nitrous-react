import React from 'react';
import { Navbar } from 'react-bootstrap';

export default class LeftNavbar extends React.Component {
  displayName = 'LeftNavbar';

  render() {
    return (
      <div className='left-navbar-component'>
        <Navbar {...this.props} />
      </div>
    );
  }
}
