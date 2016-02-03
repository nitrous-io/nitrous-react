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
import SendFeedback from 'components/send-feedback';
import format from 'lib/format';
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
    showTooltip: PropTypes.bool,
    shared: PropTypes.bool
  }

  state = {
    user: userStore.user,
    usageRemaining: userStore.usageRemaining,
    orgs: orgStore.orgs,
    hosts: hostStore.hosts,
    sharedContainerCount: containerStore.sharedContainers.size,
    showSendFeedback: false
  };

  componentDidMount() {
    userStore.onChange(this.userStoreDidChange);
    userStore.on('usage-remaining.tick', this.usageRemainingDidChange);
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
    userStore.off('usage-remaining.tick', this.usageRemainingDidChange);
    orgStore.offChange(this.orgStoreDidChange);
    hostStore.offChange(this.hostStoreDidChange);
    containerStore.offChange(this.containerStoreDidChange);
    subscriptionStore.offChange(this.subscriptionStoreDidChange);

    $(React.findDOMNode(this)).off('click', '.dropdown-menu a[href]');
  }

  userStoreDidChange = () => {
    this.setState({ user: userStore.user });
  };

  usageRemainingDidChange = () => {
    this.setState({ usageRemaining: userStore.usageRemaining });
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

  handleShowSendFeedback = () => {
    this.setState({ showSendFeedback: true });
  };

  handleHideSendFeedback = () => {
    this.setState({ showSendFeedback: false });
  }

  freeUsageBadgeText = () => {
    const { user, usageRemaining } = this.state,
          nextReset = format.nextUsageQuota(user.nextUsageQuotaAt);
    if (usageRemaining > 0) {
      return `${format.usageRemaining(usageRemaining)} remaining for this month`;
    }
    var msg = 'You have used up your free hours.';
    if (nextReset) {
      msg += ' Your quota will reset in ' + nextReset;
    }
    return msg;
  }

  render() {
    const { selectedHost, showTooltip } = this.props,
          { user, sharedContainerCount, showSendFeedback, usageRemaining } = this.state,
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
          {showTooltip ? (
            <div className='pin context'></div>
          ) : ''}
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
      <OverlayTrigger placement='left' rootClose overlay={(<Tooltip id='context-switcher-tooltip'>Switch Dashboard Context</Tooltip>)}>
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
          <MenuItem divider />
          <MenuItem onSelect={this.handleShowSendFeedback}>Send Feedback</MenuItem>
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

        {selectedHost && selectedHost.free && usageRemaining <= 5*60*60 ? (
          <Badge>
            {this.freeUsageBadgeText()}
          </Badge>
        ) : ''}

        {currentSubscription && currentSubscription.activeTrialEnd ? (
          <Badge>Trial ends in <TimeAgo date={currentSubscription.activeTrialEnd} formatter={timeAgoFormatter} /></Badge>
        ) : ''}

        <SendFeedback show={showSendFeedback} onHide={this.handleHideSendFeedback} />
      </Navbar>
    );
  }
}
