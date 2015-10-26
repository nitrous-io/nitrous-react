import React, { PropTypes } from 'react';
import { ButtonGroup, DropdownButton, MenuItem, OverlayTrigger, Tooltip, Badge } from 'react-bootstrap';
import Host from 'records/host';
import Org from 'records/org';
import userStore from 'stores/user-store';
import orgStore from 'stores/org-store';
import hostStore from 'stores/host-store';
import containerStore from 'stores/container-store';
import $ from 'jquery';
import { notImplementedFn } from 'lib/not-implemented';

export default class ContextSwitcher extends React.Component {
  displayName = 'ContextSwitcher';

  static contextTypes = {
    router: PropTypes.func.isRequired // Router.PropTypes.router.isRequired
  };

  static propTypes = {
    selectedHost: PropTypes.instanceOf(Host),
    selectedOrg: PropTypes.instanceOf(Org),
    shared: PropTypes.bool
  }

  state = {
    user: userStore.user,
    orgs: orgStore.orgs,
    hosts: hostStore.hosts,
    sharedContainerCount: containerStore.sharedContainers.size
  };

  componentDidMount() {
    userStore.onChange(this.userStoreDidChange);
    orgStore.onChange(this.orgStoreDidChange);
    hostStore.onChange(this.hostStoreDidChange);
    containerStore.onChange(this.containerStoreDidChange);

    // hack to dismiss overlay tooltip after clicking menu
    $(React.findDOMNode(this)).on('click', '.dropdown-menu a[href]', function() {
      window.setTimeout(function() {
        $('body').click();
      }, 1);
    });
  }

  componentWillUnmount() {
    userStore.offChange(this.userStoreDidChange);
    orgStore.offChange(this.orgStoreDidChange);
    hostStore.offChange(this.hostStoreDidChange);
    containerStore.offChange(this.containerStoreDidChange);

    $(React.findDOMNode(this)).off('click', '.dropdown-menu a[href]');
  }

  userStoreDidChange = () => {
    this.setState({ user: userStore.user });
  };

  orgStoreDidChange = () => {
    this.setState({ orgs: orgStore.orgs });
  };

  hostStoreDidChange = () => {
    this.setState({ hosts: hostStore.liveHosts });
  };

  containerStoreDidChange = () => {
    this.setState({ sharedContainerCount: containerStore.sharedContainers.size });
  };

  render() {
    const { selectedHost } = this.props,
          { user, sharedContainerCount } = this.state,
          orgs = this.state.orgs.toList(),
          { makeHref } = this.context.router;

    let { selectedOrg } = this.props,
        hosts;

    if (selectedHost) {
      const orgId = selectedHost.orgId;

      hosts = hostStore.hostsByOrgId(orgId).toList();
      selectedOrg = orgs.find((o) => o.id === orgId);
    } else {
      hosts = hostStore.userHosts.toList();
    }

    const withGravatar = function(obj) {
      return obj ? (
        <span>
          <img className='gravatar' src={obj.gravatar(40)} />
          {obj.displayName}
        </span>
      ) : '';
    };

    let buttonTitle;
    if (this.props.shared) {
      buttonTitle = 'Shared With Me';
    } else {
      buttonTitle = withGravatar(selectedOrg || user);
    }

    const contextMenu = (
      <OverlayTrigger placement='top' rootClose overlay={(<Tooltip id='context-switcher-tooltip'>Switch Dashboard Context</Tooltip>)}>
        <DropdownButton title={buttonTitle} id='context-switcher-dropdown'>
          <MenuItem header>Personal</MenuItem>
          <MenuItem href={makeHref('user-workspace')}>{withGravatar(user)}</MenuItem>
          <MenuItem divider />
          {orgs ? <MenuItem header>Organization</MenuItem> : ''}
          {orgs ? orgs.map((org) => {
            return (
              <MenuItem key={`org-${org.id}`} href={makeHref('org-workspace', { orgSlug: org.slug })}>
                <img className='gravatar' src={org.gravatar(40)} />
                {org.displayName}
              </MenuItem>
            );
          }) : ''}
          {orgs ? <MenuItem divider /> : ''}
          <MenuItem href={makeHref('shared-containers')}>
            Shared With Me
            {sharedContainerCount > 0 ? (
              <Badge eventKey='shared' pullRight>1</Badge>
            ) : ''}
          </MenuItem>
          <MenuItem divider />
          <MenuItem onSelect={notImplementedFn('Manage Orgs', 'GitHub-like org management interface')} eventKey='manage-orgs'>Manage Organizations...</MenuItem>
          <MenuItem onSelect={notImplementedFn('Create Org')} eventKey='create-org'>Create Organization...</MenuItem>
        </DropdownButton>
      </OverlayTrigger>
    );

    const buildHostsMenu = () => {
      return (
        <OverlayTrigger placement='top' rootClose overlay={(<Tooltip id='workspace-switcher-tooltip'>Switch Workspace</Tooltip>)}>
          <DropdownButton title={selectedHost.name} id='workspace-switcher-dropdown'>
            <MenuItem header>Workspaces</MenuItem>
            {hosts.size > 1 ? hosts.map((host) => {
              return (
                <MenuItem key={`host-${host.slug}`} eventKey={host.slug}
                  href={makeHref('workspace', { hostSlug: host.slug })}>
                  {host.displayName}
                </MenuItem>
              );
            }) : ''}
          </DropdownButton>
        </OverlayTrigger>
      );
    };

    return (
      <div className='context-switcher-component'>
        {selectedHost && hosts.size > 1 ? (
          <ButtonGroup>
            {contextMenu}
            {buildHostsMenu()}
          </ButtonGroup>
        ) : (
          contextMenu
        )}
      </div>
    );
  }
}
