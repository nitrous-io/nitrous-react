import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import { Navbar, Nav, NavDropdown, MenuItem, OverlayTrigger, Tooltip } from 'react-bootstrap';
import userStore from 'stores/user-store';
import billingStore from 'stores/billing-store';
import User from 'records/user';
import tokenActions from 'actions/token-actions';
import $ from 'jquery';

export default class TopNav extends React.Component {
  displayName = 'TopNav';

  static contextTypes = {
    user: PropTypes.instanceOf(User),
    router: PropTypes.func.isRequired // Router.PropTypes.router.isRequired
  };

  state = {
    user: userStore.user,
    billingProfile: billingStore.userBillingProfile
  };

  componentDidMount() {
    userStore.onChange(this.userStoreDidChange);
    billingStore.onChange(this.billingStoreDidChange);

    // hack to dismiss overlay tooltip after clicking menu
    $(React.findDOMNode(this)).on('click', '.dropdown-menu a[href]', function() {
      window.setTimeout(function() {
        $('body').click();
      }, 1);
    });
  }

  componentWillUnmount() {
    userStore.offChange(this.userStoreDidChange);
    billingStore.offChange(this.billingStoreDidChange);

    $(React.findDOMNode(this)).off('click', '.dropdown-menu a[href]');
  }

  userStoreDidChange = () => {
    this.setState({ user: userStore.user });
  };

  billingStoreDidChange = () => {
    this.setState({ billingProfile: billingStore.userBillingProfile });
  };

  handleLogOut = () => {
    tokenActions.invalidate();
  };

  render() {
    const user = this.state.user,
          free = this.state.billingProfile.free,
          { makeHref } = this.context.router;

    return (
      <div className='top-nav-component'>
        <Navbar brand={<Link to="application"><span>Nitrous</span></Link>} className='navbar'>
          <Nav right>
            {user ? (
              <OverlayTrigger placement='left' rootClose overlay={<Tooltip id='account-menu-tooltip'>View Account and More</Tooltip>}>
                <NavDropdown className='account-menu' id='account-menu-nav'
                  title={<span><img className='gravatar' src={user.gravatar(40)} /><span className='username'>{user.username}{free ? '(free)' : ''}</span></span>}>
                  <MenuItem href={makeHref('account-settings')}>Account Settings</MenuItem>
                  <MenuItem href={makeHref('billing')}>Billing</MenuItem>
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
