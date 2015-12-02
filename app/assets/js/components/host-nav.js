import React, { PropTypes } from 'react';
import { Nav, NavItem } from 'react-bootstrap';
import Host from 'records/host';

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
    const { activeTab, host } = this.props;

    return (
      <div className='host-nav-component'>
        <Nav className='ui-centered-tabs' bsStyle='tabs' activeKey={activeTab}>
          <NavItem disabled={host.isUnusable} onSelect={this.handleSelectContainersTab} eventKey='containers'>Projects</NavItem>
          <NavItem disabled={host.isUnusable} onSelect={this.handleSelectMySnapshotsTab} eventKey='local-snapshots'>My Snapshots</NavItem>
          {host.orgId ? (
            <NavItem disabled={host.isUnusable} onSelect={this.handleSelectTeamSnapshotsTab} eventKey='team-snapshots'>Team Snapshots</NavItem>
          ) : ''}
          <NavItem disabled={host.isUnusable} onSelect={this.handleSelectSystemTab} eventKey='system'>System</NavItem>
        </Nav>
      </div>
    );
  }
}
