import React from 'react';
import { Navbar, Nav, DropdownButton, MenuItem, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { RouteHandler } from 'react-router';
import tokenStore from 'stores/token-store';
import tokenActions from 'actions/token-actions';
import userStore from 'stores/user-store';
import userActions from 'actions/user-actions';
import orgActions from 'actions/org-actions';

export default class Dashboard extends React.Component {
  displayName: 'Dashboard'

  static willTransitionTo(transition) {
    if (!tokenStore.token) {
      transition.redirect('login');
    }
  }

  constructor(props) {
    super(props);
    this.state = {
      user: userStore.user
    };
  }

  componentDidMount() {
    userStore.onChange(this.userStoreDidChange);
    userActions.fetch();
    orgActions.fetchAll();
  }

  componentWillUnmount() {
    userStore.offChange(this.userStoreDidChange);
  }

  userStoreDidChange = () => {
    this.setState({
      user: userStore.user
    });
  }

  handleAccountMenu = (key) => {
    switch (key) {
      case 'account-settings':
        break;
      case 'billing':
        break;
      case 'send-feedback':
        break;
      case 'logout':
        tokenActions.invalidate();
        break;
    }
  };

  render() {
    const user = this.state.user;
    const accountTooltip = (
      <Tooltip>View Account and More</Tooltip>
    );
    const gravatar = user ? (
      <img className='gravatar' src={user.gravatar(40)} alt={user.username} />
    ) : '';

    return (
      <div className='dashboard-component'>
        <Navbar brand='Nitrous' className='navbar'>
          <Nav right>
            {user ? (
              <OverlayTrigger placement='left' overlay={accountTooltip}>
                <DropdownButton title={gravatar} navItem onSelect={this.handleAccountMenu}>
                  <MenuItem disabled>Signed in as <strong>{user.username}</strong></MenuItem>
                  <MenuItem divider />
                  <MenuItem eventKey='account-settings' disabled>Account Settings</MenuItem>
                  <MenuItem eventKey='billing' disabled>Billing</MenuItem>
                  <MenuItem divider />
                  <MenuItem eventKey='send-feedback' disabled>Send Feedback</MenuItem>
                  <MenuItem divider />
                  <MenuItem href='https://community.nitrous.io/docs' target='_blank'>Documentation</MenuItem>
                  <MenuItem href='https://community.nitrous.io/tutorials' target='_blank'>Tutorials</MenuItem>
                  <MenuItem href='https://community.nitrous.io/posts' target='_blank'>Blog</MenuItem>
                  <MenuItem divider />
                  <MenuItem eventKey='logout'>Log Out</MenuItem>
                </DropdownButton>
              </OverlayTrigger>
            ) : ''}
          </Nav>
        </Navbar>

        <RouteHandler />
      </div>
    );
  }
}
