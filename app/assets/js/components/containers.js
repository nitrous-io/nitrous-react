import React, { PropTypes } from 'react';
import Host from 'records/host';
import containerStore from 'stores/container-store';
import containerActions from 'actions/container-actions';

export default class Containers extends React.Component {
  displayName: 'Containers'

  static contextTypes = {
    host: PropTypes.instanceOf(Host).isRequired
  };

  state = {
    containers: containerStore.containersByHostSlug(this.context.host.slug)
  }

  componentDidMount() {
    containerStore.onChange(this.containerStoreDidChange);
    containerActions.fetchAllByHostSlug(this.context.host.slug);
  }

  componentWillReceiveProps(nextProps, nextContext) {
    const hostSlug = nextContext.host.slug;
    if (this.context.host.slug !== hostSlug) {
      this.setState({ containers: containerStore.containersByHostSlug(hostSlug) });
      containerActions.fetchAllByHostSlug(hostSlug);
    }
  }

  componentWillUnmount() {
    containerStore.offChange(this.containerStoreDidChange);
  }

  containerStoreDidChange = () => {
    this.setState({ containers: containerStore.containersByHostSlug(this.context.host.slug) });
  };

  render() {
    const containers = this.state.containers;

    return (
      <div className='containers-component'>
        <div className='container'>
          {containers == null ? (
            <p>Loading...</p>
          ) : (
            <div>
              {containers.map((container) => {
                return <p>{container.name}</p>;
              })}
            </div>
          )}
        </div>
      </div>
    );
  }
}
