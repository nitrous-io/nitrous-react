import React from 'react';
import { Navbar, Nav, NavDropdown, MenuItem, OverlayTrigger, Tooltip } from 'react-bootstrap';
import userStore from 'stores/user-store';
import tokenActions from 'actions/token-actions';

export default class TopNav extends React.Component {
  displayName: 'TopNav'

  state = {
    user: userStore.user
  };

  componentDidMount() {
    userStore.onChange(this.userStoreDidChange);
  }

  componentWillUnmount() {
    userStore.offChange(this.userStoreDidChange);
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
        <Navbar brand='Nitrous' className='navbar'>
          <Nav right>
            {user ? (
              <OverlayTrigger placement='left' overlay={<Tooltip>View Account and More</Tooltip>}>
                <NavDropdown className='account-menu'
                  title={<img className='gravatar' src={user.gravatar(40)} alt={user.username} />}>
                  <MenuItem disabled>Signed in as <strong>{user.username}</strong></MenuItem>
                  <MenuItem divider />
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
