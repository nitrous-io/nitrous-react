import React from 'react';
import { Navbar, Nav, DropdownButton, MenuItem, OverlayTrigger, Tooltip, Badge } from 'react-bootstrap';
import { RouteHandler } from 'react-router';
import currentUser from 'models/current-user';
import token from 'models/token';

export default class Dashboard extends React.Component {
  displayName: 'Dashboard'

  constructor(props) {
    super(props);
    this.state = {
      userFetched: false
    };
  }

  componentWillMount() {
    currentUser.fetch().then(() => {
      this.setState({userFetched: true});
    });
  }

  handleSwitcherMenu = () => {
  };

  handleAccountMenu = (key) => {
    switch (key) {
      case 'account-settings':
        break;
      case 'billing':
        break;
      case 'send-feedback':
        break;
      case 'logout':
        token.invalidate();
        location.href = '/';
        break;
    }
  };

  render() {
    const username = currentUser.username;
    const switcherTooltip = (
      <Tooltip>Switch Dashboard Context</Tooltip>
    );
    const accountTooltip = (
      <Tooltip>View Account and More</Tooltip>
    );
    const gravatar = (
      <img className='gravatar' src={currentUser.gravatar(40)} alt={username} />
    );

    return (
      <div className='dashboard-component'>
        <Navbar brand='Nitrous'>
          <Nav>
            {this.state.userFetched ? (
              <OverlayTrigger placement='right' overlay={switcherTooltip}>
                <DropdownButton title={username} navItem onSelect={this.handleSwitcherMenu}>
                  <MenuItem header>Personal</MenuItem>
                  <MenuItem>{username}</MenuItem>
                  <MenuItem divider />
                  <MenuItem header>Organization</MenuItem>
                  <MenuItem disabled>Nitrous</MenuItem>
                  <MenuItem divider />
                  <MenuItem disabled>
                    Shared
                    <Badge eventKey='shared' pullRight>1</Badge>
                  </MenuItem>
                  <MenuItem divider />
                  <MenuItem eventKey='manage-orgs' disabled>Manage Organizations...</MenuItem>
                  <MenuItem eventKey='create-org' disabled>Create Organization...</MenuItem>
                </DropdownButton>
              </OverlayTrigger>
            ) : ''}
          </Nav>

          <Nav right>
            <OverlayTrigger placement='left' overlay={accountTooltip}>
              <DropdownButton title={gravatar} navItem onSelect={this.handleAccountMenu}>
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
          </Nav>
        </Navbar>

        <RouteHandler />
      </div>
    );
  }
}
