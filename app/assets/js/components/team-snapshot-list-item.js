import React, { PropTypes } from 'react';
import { ButtonToolbar, Col, DropdownButton, MenuItem } from 'react-bootstrap';
import TimeAgo from 'react-timeago';
import prettyBytes from 'pretty-bytes';

import Host from 'records/host';
import Snapshot from 'records/snapshot';
import Fa from 'components/fa';

export default class TeamSnapshotListItem extends React.Component {
  displayName = 'TeamSnapshotListItem';

  static propTypes = {
    host: PropTypes.instanceOf(Host).isRequired,
    snapshot: PropTypes.instanceOf(Snapshot).isRequired
  }

  handleDelete = () => {
    console.log('implement deleting of snapshot from Docker registry');
  }

  render() {
    const { snapshot } = this.props;

    return (
      <Col lg={3} md={4} sm={6} xs={12} className='team-snapshot-list-item-component snapshot-list-item'>
        <div className='ui-card'>
          <div className='ui-card-body'>
            <div className='snapshot-header'>
              <div className='stack-icon' style={{ backgroundImage: `url(${Snapshot.defaultStackIconUrl})` }}>
                <div style={{ backgroundImage: `url(${snapshot.stackIconUrl})` }}></div>
              </div>

              <div className='info'>
                <h4>{snapshot.displayName}</h4>
                <span>created <TimeAgo date={snapshot.createdAt} /></span>
              </div>
            </div>

            <div className='aux-info'>
              {prettyBytes(snapshot.size)}
            </div>

            <ButtonToolbar className='buttons'>
              <DropdownButton noCaret className='borderless' id={`snapshot-actions-${snapshot.id}`}
                title={<Fa icon='ellipsis-v' />}>
                <MenuItem onSelect={this.handleDelete}>
                  <Fa icon='trash' /> Delete
                </MenuItem>
              </DropdownButton>
            </ButtonToolbar>
          </div>
        </div>
      </Col>
    );
  }
}
