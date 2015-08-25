import React from 'react';
import { Navbar, Nav, DropdownButton, MenuItem, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { RouteHandler } from 'react-router';
import tokenStore from 'stores/token-store';
import tokenActions from 'actions/token-actions';
import userStore from 'stores/user-store';
import userActions from 'actions/user-actions';
import orgActions from 'actions/org-actions';
import $ from 'jquery';

export default class Dashboard extends React.Component {
  displayName: 'Dashboard'

  static contextTypes = {
    router: React.PropTypes.func.isRequired // Router.PropTypes.router.isRequired
  };

  static willTransitionTo(transition) {
    if (!tokenStore.token) {
      transition.redirect('login');
    }
  }

  state = {
    user: userStore.user
  };

  componentDidMount() {
    userStore.onChange(this.userStoreDidChange);

    userActions.fetch();
    orgActions.fetchAll();

    // hack to dismiss dropdown menu after clicking MenuItem with href
    $(React.findDOMNode(this)).on('click', '.account-menu .dropdown-menu a[href]', function() {
      $('body').click();
    });
  }

  componentWillUnmount() {
    userStore.offChange(this.userStoreDidChange);

    $(React.findDOMNode(this)).off('click', '.account-menu .dropdown-menu a[href]');
  }

  userStoreDidChange = () => {
    this.setState({
      user: userStore.user
    });
  }

  handleLogOut = () => {
    tokenActions.invalidate();
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
                <DropdownButton className='account-menu' title={gravatar} navItem>
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
