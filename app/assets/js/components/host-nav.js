import React, { PropTypes } from 'react';
import { Nav, NavItem } from 'react-bootstrap';

import Host from 'records/host';
import orgActions from 'actions/org-actions';
import orgStore from 'stores/org-store';
import userStore from 'stores/user-store';

export default class HostNav extends React.Component {
  displayName = 'HostNav';

  static contextTypes = {
    router: PropTypes.func.isRequired
  };

  static propTypes = {
    host: PropTypes.instanceOf(Host).isRequired,
    activeTab: PropTypes.string
  };

  static defaultProps = {
    activeTab: 'containers'
  };

  state = {
    org: this.props.host.orgId ? orgStore.orgByOrgId(this.props.host.orgId) : null,
    quotaReached: userStore.usageRemaining <= 0
  };

  componentDidMount() {
    userStore.onChange(this.userStoreDidChange);
    if (this.props.host.orgId) {
      orgStore.onChange(this.orgStoreDidChange);
      orgActions.fetchAll();
    }
  }

  componentWillUnmount() {
    userStore.offChange(this.userStoreDidChange);
    if (this.props.host.orgId) {
      orgStore.offChange(this.orgStoreDidChange);
    }
  }

  userStoreDidChange = () => {
    this.setState({
      user: userStore.user,
      quotaReached: userStore.usageRemaining <= 0
    });
  }

  orgStoreDidChange = () => {
    this.setState({ org: orgStore.orgByOrgId(this.props.host.orgId) });
  }

  handleSelectContainersTab = () => {
    this.context.router.transitionTo('containers', { hostSlug: this.props.host.slug });
  }

  handleSelectSystemTab = () => {
    this.context.router.transitionTo('host-system', { hostSlug: this.props.host.slug });
  }

  handleSelectMySnapshotsTab = () => {
    this.context.router.transitionTo('host-snapshots', { hostSlug: this.props.host.slug });
  }

  handleSelectTeamSnapshotsTab = () => {
    this.context.router.transitionTo('team-snapshots', { hostSlug: this.props.host.slug });
  }

  render() {
    const { activeTab, host } = this.props,
          { org, quotaReached } = this.state,
          disableTab = host.isUnusable || quotaReached;

    return (
      <div className='host-nav-component'>
        <Nav className='ui-centered-tabs' bsStyle='tabs' activeKey={activeTab}>
          <NavItem disabled={disableTab} onSelect={this.handleSelectContainersTab} eventKey='containers'>Projects</NavItem>
          <NavItem disabled={disableTab} onSelect={this.handleSelectMySnapshotsTab} eventKey='local-snapshots'>My Snapshots</NavItem>
          {org && org.roleAllowsSnapshotRead ? (
            <NavItem disabled={disableTab} onSelect={this.handleSelectTeamSnapshotsTab} eventKey='team-snapshots'>Team Snapshots</NavItem>
          ) : ''}
          <NavItem disabled={disableTab} onSelect={this.handleSelectSystemTab} eventKey='system'>System</NavItem>
        </Nav>
      </div>
    );
  }
}
