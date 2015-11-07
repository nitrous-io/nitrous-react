import React, { PropTypes } from 'react';
import Host from 'records/host';
import userStore from 'stores/user-store';
import ImageList from 'components/image-list';
import HostNav from 'components/host-nav';
import Registries from 'components/registries';

export default class HostImages extends React.Component {
  displayName = 'HostImages';

  static contextTypes = {
    router: PropTypes.func.isRequired,
    host: PropTypes.instanceOf(Host).isRequired
  };

  render() {
    const { host } = this.context,
          advanced = userStore.userProfile && userStore.userProfile.advanced;

    return (
      <div className='host-images-component container'>
        <HostNav host={host} activeTab='images' />
        <div className='container'>
          <ImageList manageImages host={host} />

          {advanced ? (
            <div>
              <h4>Docker Registries</h4>
              <Registries showDisconnect host={host} />
            </div>
          ) : ''}
        </div>
      </div>
    );
  }
}
