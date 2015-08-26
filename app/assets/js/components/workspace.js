import React, { PropTypes } from 'react';
import { RouteHandler } from 'react-router';
import { Nav, NavItem } from 'react-bootstrap';
import hostActions from 'actions/host-actions';
import hostStore from 'stores/host-store';
import ContextSwitcher from 'components/context-switcher';

export default class Workspace extends React.Component {
  displayName: 'Workspace'

  static contextTypes = {
    router: PropTypes.func.isRequired // Router.PropTypes.router.isRequired
  };

  static propTypes = {
    params: PropTypes.shape({
      hostSlug: PropTypes.string.isRequired
    }),

    query: PropTypes.object
  };

  state = {
    host: hostStore.liveHosts ? hostStore.liveHosts.get(this.props.params.hostSlug) : null
  }

  componentDidMount() {
    hostStore.onChange(this.hostStoreDidChange);
    hostActions.fetchOne(this.props.params.hostSlug);
  }

  componentWillReceiveProps(nextProps) {
    hostActions.fetchOne(nextProps.params.hostSlug);
  }

  componentWillUnmount() {
    hostStore.offChange(this.hostStoreDidChange);
  }

  hostStoreDidChange = () => {
    if (hostStore.liveHosts) {
      this.setState({ host: hostStore.liveHosts.get(this.props.params.hostSlug) });
    }
  };

  render() {
    const host = this.state.host,
          makeHref = this.context.router.makeHref;

    return (
      <div className='workspace-component'>
        {host ? (
          <div className='container'>
            <ContextSwitcher selectedHost={host} />
            <Nav className='tabs' bsStyle='tabs' activeKey='containers'>
              <NavItem href={makeHref('containers', { hostSlug: host.slug })} eventKey='containers'>Boxes</NavItem>
              <NavItem href={makeHref('images', { hostSlug: host.slug })} eventKey='images'>Images</NavItem>
              <NavItem href={makeHref('system', { hostSlug: host.slug })} eventKey='system'>System</NavItem>
            </Nav>
          </div>
        ) : ''}
        <RouteHandler />
      </div>
    );
  }
}
