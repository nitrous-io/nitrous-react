import React, { PropTypes } from 'react';

import Host from 'records/host';
import userStore from 'stores/user-store';
import ContextSwitcher from 'components/context-switcher';
import HostNav from 'components/host-nav';
import ImageList from 'components/image-list';
import LoadingIndicator from 'components/loading-indicator';
import Registries from 'components/registries';
import Mp from 'lib/mp';
import MpEvents from 'lib/mp-events';

export default class HostImages extends React.Component {
  displayName = 'HostImages';

  static contextTypes = {
    router: PropTypes.func.isRequired,
    host: PropTypes.instanceOf(Host).isRequired
  };

  static willTransitionTo() {
    Mp.track(MpEvents.EventDashboardViewedHostImages);
  }

  render() {
    const { host } = this.context,
          { advanced } = userStore,
          loading = host.isResuming;

    if (loading) {
      return (
        <div className='host-images-component container'>
          <ContextSwitcher selectedHost={host} />
          <LoadingIndicator large />
        </div>
      );
    }

    return (
      <div className='host-images-component container'>
        <ContextSwitcher selectedHost={host} />
        <HostNav host={host} activeTab='images' />
        <div className='inner-container'>
          <ImageList manageImages host={host} />

          {advanced ? (
            <div className='inner-container'>
              <h4>Docker Registries</h4>
              <Registries showDisconnect host={host} />
            </div>
          ) : ''}
        </div>
      </div>
    );
  }
}
