import React, { PropTypes } from 'react';
import { RouteHandler } from 'react-router';
import Host from 'records/host';
import hostActions from 'actions/host-actions';
import hostStore from 'stores/host-store';

export default class Workspace extends React.Component {
  displayName = 'Workspace';

  static contextTypes = {
    router: PropTypes.func.isRequired // Router.PropTypes.router.isRequired
  };

  static childContextTypes = {
    host: PropTypes.instanceOf(Host).isRequired
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
      <div className='workspace-component'>
        <RouteHandler />
      </div>
    );
  }
}
