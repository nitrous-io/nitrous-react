import React, { PropTypes } from 'react';
import { Nav, NavItem } from 'react-bootstrap';
import Host from 'records/host';
import ContextSwitcher from 'components/context-switcher';
import { notImplementedFn } from 'lib/not-implemented';

export default class WorkspaceNav extends React.Component {
  displayName = 'WorkspaceNav';

  static contextTypes = {
    router: PropTypes.func.isRequired // Router.PropTypes.router.isRequired
  };

  static propTypes = {
    host: PropTypes.instanceOf(Host).isRequired,
    activeTab: 'containers'
  };

  handleSelectContainersTab = () => {
    this.context.router.transitionTo('containers', { hostSlug: this.props.host.slug });
  }

  handleSelectSystemTab = () => {
    this.context.router.transitionTo('workspace-system', { hostSlug: this.props.host.slug });
  }

  render() {
    const { host, activeTab } = this.props;

    return (
      <div className='workspace-nav-component'>
        <div className='container'>
          <ContextSwitcher selectedHost={host} />
          <Nav className='ui-centered-tabs' bsStyle='tabs' activeKey={activeTab}>
            <NavItem onSelect={this.handleSelectContainersTab} eventKey='containers'>Projects</NavItem>
            <NavItem onSelect={notImplementedFn('Images Tab', 'image/snapshots management: push, pull, delete etc.')} eventKey='images'>Images</NavItem>
            <NavItem onSelect={this.handleSelectSystemTab} eventKey='system'>System</NavItem>
          </Nav>
        </div>
      </div>
    );
  }
}
