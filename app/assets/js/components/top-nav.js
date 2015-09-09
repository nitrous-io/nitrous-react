import React from 'react';
import { Link } from 'react-router';
import { Navbar, Nav, NavDropdown, MenuItem, OverlayTrigger, Tooltip } from 'react-bootstrap';
import userStore from 'stores/user-store';
import tokenActions from 'actions/token-actions';
import $ from 'jquery';

export default class TopNav extends React.Component {
  displayName = 'TopNav';

  state = {
    user: userStore.user
  };

  componentDidMount() {
    userStore.onChange(this.userStoreDidChange);

    // hack to dismiss overlay tooltip after clicking menu
    $(React.findDOMNode(this)).on('click', '.dropdown-menu a[href]', function() {
      window.setTimeout(function() {
        $('body').click();
      }, 1);
    });
  }

  componentWillUnmount() {
    userStore.offChange(this.userStoreDidChange);

    $(React.findDOMNode(this)).off('click', '.dropdown-menu a[href]');
  }

  userStoreDidChange = () => {
    this.setState({ user: userStore.user });
  };

  handleLogOut = () => {
    tokenActions.invalidate();
  };

  render() {
    const user = this.state.user;

    return (
      <div className='top-nav-component'>
        <Navbar brand={<Link to="application"><span>Nitrous</span></Link>} className='navbar'>
          <Nav right>
            {user ? (
              <OverlayTrigger placement='left' rootClose overlay={<Tooltip>View Account and More</Tooltip>}>
                <NavDropdown className='account-menu'
                  title={<span><img className='gravatar' src={user.gravatar(40)} /><span className='username'>{user.username}</span></span>}>
                  <MenuItem disabled>Account Settings</MenuItem>
                  <MenuItem disabled>Billing</MenuItem>
                  <MenuItem divider />
                  <MenuItem eventKey='send-feedback' disabled>Send Feedback</MenuItem>
                  <MenuItem divider />
                  <MenuItem href='https://community.nitrous.io/docs' target='_blank'>Documentation</MenuItem>
                  <MenuItem href='https://community.nitrous.io/tutorials' target='_blank'>Tutorials</MenuItem>
                  <MenuItem href='https://community.nitrous.io/posts' target='_blank'>Blog</MenuItem>
                  <MenuItem divider />
                  <MenuItem onSelect={this.handleLogOut}>Log Out</MenuItem>
                </NavDropdown>
              </OverlayTrigger>
            ) : ''}
          </Nav>
        </Navbar>
      </div>
    );
  }
}
