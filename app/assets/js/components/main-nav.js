import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import { Nav, Navbar, NavDropdown, MenuItem, Label, OverlayTrigger, Tooltip } from 'react-bootstrap';
import userStore from 'stores/user-store';
import billingStore from 'stores/billing-store';
import tokenActions from 'actions/token-actions';
import Mp from 'lib/mp';
import MpEvents from 'lib/mp-events';
import $ from 'jquery';

export default class MainNav extends React.Component {
  displayName = 'MainNav';

  static contextTypes = {
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
    Mp.track(MpEvents.EventUserLoggedOut);
    tokenActions.invalidate();
  };

  render() {
    const user = this.state.user,
          free = this.state.billingProfile.free,
          { makeHref } = this.context.router;

    return (
      <div className='main-nav-component'>
        <Navbar brand={<Link to="application"><span>Nitrous</span></Link>}>
          <Nav right>
            {user ? (
              <OverlayTrigger placement='left' rootClose overlay={(<Tooltip id='account-settings-tooltip'>View account, billing and more</Tooltip>)}>
                <NavDropdown className='account-menu' id='account-menu-nav' fixedTop
                  title={<img className='gravatar' src={user.gravatar(40)} />}>
                  <MenuItem disabled>
                    Signed in as <strong>{user.username}</strong>
                    {free ? (
                      <Label className='free' bsStyle='primary'>free</Label>
                    ) : ''}
                  </MenuItem>
                  <MenuItem divider />
                  <MenuItem href={makeHref('account-settings')}>Account Settings</MenuItem>
                  <MenuItem href={makeHref('billing')}>Billing</MenuItem>
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
