import React, { PropTypes } from 'react';
import { RouteHandler } from 'react-router';
import HostRecord from 'records/host';
import hostActions from 'actions/host-actions';
import hostStore from 'stores/host-store';

export default class Host extends React.Component {
  displayName = 'Host';

  static contextTypes = {
    router: PropTypes.func.isRequired // Router.PropTypes.router.isRequired
  };

  static childContextTypes = {
    host: PropTypes.instanceOf(HostRecord).isRequired
  };

  static propTypes = {
    params: PropTypes.shape({
      hostSlug: PropTypes.string.isRequired
    }),

    query: PropTypes.object
  };

  state = {
    host: hostStore.liveHosts.get(this.props.params.hostSlug)
  };

  static willTransitionTo(transition, params) {
    const host = hostStore.liveHosts.get(params.hostSlug);
    if (!host) {
      transition.redirect('dashboard');
      return;
    }

    if (host.state === 'born') {
      transition.redirect('host-creating', null, {hostSlug: params.hostSlug});
      return;
    }
  }

  componentDidMount() {
    hostStore.onChange(this.hostStoreDidChange);
    hostActions.fetchOne(this.props.params.hostSlug);
  }

  componentWillReceiveProps(nextProps) {
    const hostSlug = nextProps.params.hostSlug;
    if (this.props.params.hostSlug !== hostSlug) {
      this.setState({ host: hostStore.liveHosts.get(hostSlug) });
      hostActions.fetchOne(hostSlug);
    }
  }

  componentWillUnmount() {
    hostStore.offChange(this.hostStoreDidChange);
  }

  hostStoreDidChange = () => {
    if (hostStore.liveHosts) {
      this.setState({ host: hostStore.liveHosts.get(this.props.params.hostSlug) });
    }
  };

  getChildContext() {
    return { host: this.state.host };
  }

  render() {
    return (
      <div className='host-component'>
        <RouteHandler />
      </div>
    );
  }
}
