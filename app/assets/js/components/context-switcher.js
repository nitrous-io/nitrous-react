import React, { PropTypes } from 'react';
import { ButtonGroup, DropdownButton, MenuItem, OverlayTrigger, Tooltip, Badge, Navbar } from 'react-bootstrap';
import Host from 'records/host';
import Org from 'records/org';
import userStore from 'stores/user-store';
import orgStore from 'stores/org-store';
import hostStore from 'stores/host-store';
import subscriptionStore from 'stores/subscription-store';
import containerStore from 'stores/container-store';
import subscriptionActions from 'actions/subscription-actions';
import TimeAgo from 'react-timeago';
import $ from 'jquery';

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
    subscriptionStore.onChange(this.subscriptionStoreDidChange);
    subscriptionActions.fetchAll();

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
    subscriptionStore.offChange(this.subscriptionStoreDidChange);

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

  subscriptionStoreDidChange = () => {
    this.setState({ trialSubscription: subscriptionStore.trialSubscription });
  };

  render() {
    const { selectedHost } = this.props,
          { user, sharedContainerCount } = this.state,
          orgs = this.state.orgs.toList(),
          showOrgs = orgs && orgs.size > 0,
          { makeHref } = this.context.router;

    let { selectedOrg } = this.props,
        hosts,
        currentSubscription;

    if (selectedHost) {
      const orgId = selectedHost.orgId;
      hosts = hostStore.hostsByOrgId(orgId).toList();
      selectedOrg = orgs.find((o) => o.id === orgId);
      currentSubscription = subscriptionStore.findBySlug(selectedHost.subscriptionSlug);
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

    const timeAgoFormatter = (value, unit) => {
      if (value !== 1) {
        unit += 's';
      }
      return value + ' ' + unit;
    };

    const contextMenu = (
      <OverlayTrigger placement='top' rootClose overlay={(<Tooltip id='context-switcher-tooltip'>Switch Dashboard Context</Tooltip>)}>
        <DropdownButton title={buttonTitle} id='context-switcher-dropdown' bsStyle='link'>
          <MenuItem header>Personal</MenuItem>
          <MenuItem href={makeHref('user-host')}>{withGravatar(user)}</MenuItem>
          <MenuItem divider />
          {showOrgs ? <MenuItem header>Organization</MenuItem> : ''}
          {showOrgs ? orgs.map((org) => {
            return (
              <MenuItem key={`org-${org.id}`} href={makeHref('org', { orgSlug: org.slug })}>
                <img className='gravatar' src={org.gravatar(40)} />
                {org.displayName}
              </MenuItem>
            );
          }) : ''}
          {showOrgs ? <MenuItem divider /> : ''}
          <MenuItem href={makeHref('shared-containers')} eventKey='shared'>
            Shared With Me
            {sharedContainerCount > 0 ? (
              <Badge>{sharedContainerCount}</Badge>
            ) : ''}
          </MenuItem>
          <MenuItem divider />
          {showOrgs ? (
            <MenuItem href={makeHref('orgs')} eventKey='manage-orgs'>Manage Organizations...</MenuItem>
          ) : ''}
          <MenuItem href={makeHref('new-org')} eventKey='create-org'>Create Organization...</MenuItem>
        </DropdownButton>
      </OverlayTrigger>
    );

    const buildHostsMenu = () => {
      return (
        <OverlayTrigger placement='top' rootClose overlay={(<Tooltip id='host-switcher-tooltip'>Switch Workstation</Tooltip>)}>
          <DropdownButton title={selectedHost.name} id='host-switcher-dropdown' bsStyle='link'>
            <MenuItem header>Workstations</MenuItem>
            {hosts.size > 1 ? hosts.map((host) => {
              return (
                <MenuItem key={`host-${host.slug}`} eventKey={host.slug}
                  href={makeHref('host', { hostSlug: host.slug })}>
                  {host.displayName}
                </MenuItem>
              );
            }) : ''}
          </DropdownButton>
        </OverlayTrigger>
      );
    };

    return (
      <Navbar className="context-switcher-component" fixedTop>
        {selectedHost && hosts.size > 1 ? (
          <ButtonGroup>
            {contextMenu}
            {buildHostsMenu()}
          </ButtonGroup>
        ) : (
          <ButtonGroup>
            {contextMenu}
          </ButtonGroup>
        )}

        {currentSubscription && currentSubscription.activeTrialEnd ? (
          <Badge>Trial ends in <TimeAgo date={currentSubscription.activeTrialEnd} formatter={timeAgoFormatter} /></Badge>
        ) : ''}
      </Navbar>
    );
  }
}
