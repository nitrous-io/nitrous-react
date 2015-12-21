import React, { PropTypes } from 'react';
import { Button, Col } from 'react-bootstrap';
import TimeAgo from 'react-timeago';
import prettyBytes from 'pretty-bytes';
import classNames from 'classnames';

import Host from 'records/host';
import Image from 'records/image';

export default class SelectableLocalSnapshot extends React.Component {
  displayName = 'SelectableLocalSnapshot';

  static contextTypes = {
    router: PropTypes.func.isRequired
  };

  static propTypes = {
    host: PropTypes.instanceOf(Host).isRequired,
    snapshot: PropTypes.instanceOf(Image).isRequired,
    selected: PropTypes.bool,
    onSelect: PropTypes.func
  };

  handleSelect = () => {
    this.props.onSelect(this.props.snapshot);
  }

  render() {
    const { snapshot, selected } = this.props;

    return (
      <Col lg={3} md={4} sm={6} xs={12} className='selectable-local-snapshot-component snapshot-list-item'>
        <Button className={classNames('ui-card', { selected })} onClick={this.handleSelect}>
          <div className='ui-card-body'>
            <div className='snapshot-header'>
              <div className='stack-icon' style={{ backgroundImage: `url(${Image.defaultStackIconUrl})` }}>
                <div style={{ backgroundImage: `url(${snapshot.stackIconUrl})` }}></div>
              </div>

              <div className='info'>
                <h4>{snapshot.displayName}</h4>
                <span>created <TimeAgo date={snapshot.createdAt} /></span>
              </div>
            </div>

            <div className='aux-info'>
              {prettyBytes(snapshot.virtualSize)}
            </div>
          </div>
        </Button>
      </Col>
    );
  }
}
