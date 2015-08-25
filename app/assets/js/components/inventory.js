import React from 'react';
import { ButtonGroup, DropdownButton, MenuItem, OverlayTrigger, Tooltip, Badge, Nav, NavItem } from 'react-bootstrap';
import userStore from 'stores/user-store';
import orgStore from 'stores/org-store';
import hostActions from 'actions/host-actions';
import hostStore from 'stores/host-store';
import $ from 'jquery';

export default class Inventory extends React.Component {
  displayName: 'Inventory'

  static contextTypes = {
    router: React.PropTypes.func.isRequired // Router.PropTypes.router.isRequired
  };

  static propTypes = {
    query: React.PropTypes.object
  };

  state = {
    context: 'user',
    user: userStore.user,
    orgs: orgStore.orgs,
    hosts: hostStore.userHosts
  };

  componentDidMount() {
    userStore.onChange(this.userStoreDidChange);
    orgStore.onChange(this.orgStoreDidChange);
    hostStore.onChange(this.hostStoreDidChange);

    hostActions.fetchAll();

    // hack to dismiss dropdown menu after clicking MenuItem with href
    $(React.findDOMNode(this)).on('click', '.switcher-menu .dropdown-menu a[href]', function() {
      $('body').click();
    });
  }

  componentWillUnmount() {
    userStore.offChange(this.userStoreDidChange);
    orgStore.offChange(this.orgStoreDidChange);
    hostStore.offChange(this.hostStoreDidChange);

    $(React.findDOMNode(this)).off('click', '.switcher-menu .dropdown-menu a[href]');
  }

  userStoreDidChange = () => {
    this.setState({ user: userStore.user });
  };

  orgStoreDidChange = () => {
    this.setState({ orgs: orgStore.orgs });
  };

  hostStoreDidChange = () => {
    this.setState({ hosts: hostStore.userHosts });
  };

  render() {
    const user = this.state.user,
          orgs = this.state.orgs ? this.state.orgs.toArray() : [],
          hosts = this.state.hosts ? this.state.hosts.toArray() : [],
          makeHref= this.context.router.makeHref,
          orgSlug = this.props.query.org;

    const usernameWithGravatar = user ? (
      <span>
        <img className='gravatar' src={user.gravatar(40)} />
        {user.displayName}
      </span>
    ) : '';

    return (
      <div className='inventory-component'>
        <div className='container'>
          <ButtonGroup>
            {user ? (
              <OverlayTrigger placement='top' overlay={(<Tooltip>Switch Dashboard Context</Tooltip>)}>
                <DropdownButton className='context-switcher switcher-menu' title={usernameWithGravatar}>
                  <MenuItem header>Personal</MenuItem>
                  <MenuItem href={makeHref('inventory')}>{usernameWithGravatar}</MenuItem>
                  <MenuItem divider />
                  {orgs ? <MenuItem header>Organization</MenuItem> : ''}
                  {orgs ? orgs.map((org) => {
                    return (
                      <MenuItem key={`org-${org.id}`} href={makeHref('inventory', {}, { org: org.slug })}>
                        <img className='gravatar' src={org.gravatar(40)} />
                        {org.displayName}
                      </MenuItem>
                    );
                  }) : ''}
                  {orgs ? <MenuItem divider /> : ''}
                  <MenuItem href={makeHref('inventory', {}, { shared: true })}>
                    Shared
                    <Badge eventKey='shared' pullRight>1</Badge>
                  </MenuItem>
                  <MenuItem divider />
                  <MenuItem eventKey='manage-orgs' disabled>Manage Organizations...</MenuItem>
                  <MenuItem eventKey='create-org' disabled>Create Organization...</MenuItem>
                </DropdownButton>
              </OverlayTrigger>
            ) : ''}
            {hosts.length > 1 ? (
              <OverlayTrigger placement='top' overlay={(<Tooltip>Switch Workspace</Tooltip>)}>
                <DropdownButton className='host-switcher switcher-menu' title={hosts[0].name}>
                  <MenuItem header>Workspaces</MenuItem>
                  {hosts ? hosts.map((host) => {
                    return (
                      <MenuItem key={`host-${host.slug}`} eventKey={host.slug} href={makeHref('inventory', {}, { org: orgSlug, host: host.slug })}>
                        {host.displayName}
                      </MenuItem>
                    );
                  }) : ''}
                </DropdownButton>
              </OverlayTrigger>
            ) : ''}
          </ButtonGroup>
          <Nav className='tabs' bsStyle='tabs' activeKey='containers'>
            <NavItem eventKey='containers'>Boxes</NavItem>
            <NavItem eventKey='images'>Images</NavItem>
            <NavItem eventKey='system'>System</NavItem>
          </Nav>
        </div>
      </div>
    );
  }
}
