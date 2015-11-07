import React, { PropTypes } from 'react';
import { Nav, NavItem } from 'react-bootstrap';
import Host from 'records/host';
import ContextSwitcher from 'components/context-switcher';

export default class HostNav extends React.Component {
  displayName = 'HostNav';

  static contextTypes = {
    router: PropTypes.func.isRequired // Router.PropTypes.router.isRequired
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

  handleSelectImagesTab = () => {
    this.context.router.transitionTo('host-images', { hostSlug: this.props.host.slug });
  }

  render() {
    const { host, activeTab } = this.props;

    return (
      <div className='host-nav-component'>
        <ContextSwitcher selectedHost={host} />
        <Nav className='ui-centered-tabs' bsStyle='tabs' activeKey={activeTab}>
          <NavItem onSelect={this.handleSelectContainersTab} eventKey='containers'>Projects</NavItem>
          <NavItem onSelect={this.handleSelectImagesTab} eventKey='images'>Images</NavItem>
          <NavItem onSelect={this.handleSelectSystemTab} eventKey='system'>System</NavItem>
        </Nav>
      </div>
    );
  }
}
