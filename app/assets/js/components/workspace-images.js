import React, { PropTypes } from 'react';
import ImageList from 'components/image-list';
import Host from 'records/host';

export default class WorkspaceImages extends React.Component {
  displayName = 'WorkspaceImages';

  static contextTypes = {
    router: PropTypes.func.isRequired,
    host: PropTypes.instanceOf(Host).isRequired
  };

  render() {
    return (
      <div className='workspace-images-component'>
        <div className='container'>
          <ImageList host={this.context.host} />
        </div>
      </div>
    );
  }
}
