import React, { PropTypes } from 'react';
import { ButtonGroup, Button } from 'react-bootstrap';
import ImageList from 'components/image-list';
import Host from 'records/host';
import HostNav from 'components/host-nav';
import Fa from 'components/fa';
import PullImage from 'components/pull-image';
import Registries from 'components/registries';

export default class HostImages extends React.Component {
  displayName = 'HostImages';

  static contextTypes = {
    router: PropTypes.func.isRequired,
    host: PropTypes.instanceOf(Host).isRequired
  };

  state = {
    showModal: false
  }

  handlePullImageButton = () => {
    this.setState({ showModal: true });
  }

  handlePullImageModalHide = () => {
    this.setState({ showModal: false });
  }

  render() {
    const { host } = this.context,
          { showModal } = this.state;
    return (
      <div className='host-images-component container'>
        <HostNav host={host} activeTab='images' />
        <div className='container'>
          <ButtonGroup>
            <Button onClick={this.handlePullImageButton}>
              <Fa icon='cloud-download' /> Pull Image
            </Button>
          </ButtonGroup>
          <ImageList manageImages host={host} />

          <h4>Docker Registries</h4>
          <Registries showDisconnect host={host} />
        </div>

        <PullImage host={host} showModal={showModal} onHideModal={this.handlePullImageModalHide} />
      </div>
    );
  }
}
