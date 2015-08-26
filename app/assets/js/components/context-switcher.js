import React, { PropTypes } from 'react';
import { ButtonGroup, DropdownButton, MenuItem, OverlayTrigger, Tooltip, Badge } from 'react-bootstrap';
import Host from 'records/host';
import userStore from 'stores/user-store';
import orgStore from 'stores/org-store';
import hostStore from 'stores/host-store';

export default class ContextSwitcher extends React.Component {
  displayName: 'ContextSwitcher'

  static contextTypes = {
    router: PropTypes.func.isRequired // Router.PropTypes.router.isRequired
  };

  static propTypes = {
    selectedHost: PropTypes.instanceOf(Host).isRequired
  }

  state = {
    user: userStore.user,
    orgs: orgStore.orgs,
    hosts: hostStore.hosts
  };

  componentDidMount() {
    userStore.onChange(this.userStoreDidChange);
    orgStore.onChange(this.orgStoreDidChange);
    hostStore.onChange(this.hostStoreDidChange);
  }

  componentWillUnmount() {
    userStore.offChange(this.userStoreDidChange);
    orgStore.offChange(this.orgStoreDidChange);
    hostStore.offChange(this.hostStoreDidChange);
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

  render() {
    const selectedHost = this.props.selectedHost,
          orgId = selectedHost.orgId,
          orgs = this.state.orgs.toList(),
          selectedOrg = orgs.find((o) => o.id === orgId),
          user = this.state.user,
          hosts = (orgId ? hostStore.hostsWithOrgId(orgId) : hostStore.userHosts).toList(),
          makeHref = this.context.router.makeHref;

    const withGravatar = function(obj) {
      return (
        <span>
          <img className='gravatar' src={obj.gravatar(40)} />
          {obj.displayName}
        </span>
      );
    };

    const buttonTitle = withGravatar(selectedOrg || user);

    const contextMenu = (
      <OverlayTrigger placement='top' overlay={(<Tooltip>Switch Dashboard Context</Tooltip>)}>
        <DropdownButton title={buttonTitle}>
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
          <MenuItem href={makeHref('user-workspace')}>
            Shared With Me
            <Badge eventKey='shared' pullRight>1</Badge>
          </MenuItem>
          <MenuItem divider />
          <MenuItem eventKey='manage-orgs' disabled>Manage Organizations...</MenuItem>
          <MenuItem eventKey='create-org' disabled>Create Organization...</MenuItem>
        </DropdownButton>
      </OverlayTrigger>
    );

    const buildHostsMenu = () => {
      return (
        <OverlayTrigger placement='top' overlay={(<Tooltip>Switch Workspace</Tooltip>)}>
          <DropdownButton title={selectedHost.name}>
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
      <div className='context-switcher'>
        {hosts.size > 1 ? (
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
