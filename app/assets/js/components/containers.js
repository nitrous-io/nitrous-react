import React, { PropTypes } from 'react';
import Host from 'records/host';
import containerStore from 'stores/container-store';
import containerActions from 'actions/container-actions';
import ContainerList from 'components/container-list';
import WorkspaceNav from 'components/workspace-nav';

export default class Containers extends React.Component {
  displayName = 'Containers';

  static contextTypes = {
    host: PropTypes.instanceOf(Host).isRequired
  };

  state = {
    containers: containerStore.liveContainersByHostSlug(this.context.host.slug)
  };

  componentDidMount() {
    containerStore.onChange(this.containerStoreDidChange);
    containerActions.fetchAllByHostSlug(this.context.host.slug);
  }

  componentWillReceiveProps(nextProps, nextContext) {
    const hostSlug = nextContext.host.slug;
    if (this.context.host.slug !== hostSlug) {
      this.setState({ containers: containerStore.liveContainersByHostSlug(hostSlug) });
      containerActions.fetchAllByHostSlug(hostSlug);
    }
  }

  componentWillUnmount() {
    containerStore.offChange(this.containerStoreDidChange);
  }

  containerStoreDidChange = () => {
    this.setState({ containers: containerStore.liveContainersByHostSlug(this.context.host.slug) });
  };

  render() {
    const containers = this.state.containers ? this.state.containers.toList() : null;

    return (
      <div className='containers-component container'>
        <WorkspaceNav host={this.context.host} activeTab='containers' />
        <ContainerList containers={containers} />
      </div>
    );
  }
}
