import React, { PropTypes } from 'react';
import { ButtonToolbar, Col, DropdownButton, MenuItem, OverlayTrigger, Tooltip } from 'react-bootstrap';
import TimeAgo from 'react-timeago';
import prettyBytes from 'pretty-bytes';

import Host from 'records/host';
import Snapshot from 'records/snapshot';
import userStore from 'stores/user-store';
import Fa from 'components/fa';

export default class TeamSnapshotListItem extends React.Component {
  displayName = 'TeamSnapshotListItem';

  static propTypes = {
    host: PropTypes.instanceOf(Host).isRequired,
    snapshot: PropTypes.instanceOf(Snapshot).isRequired
  }

  state = {
    user: userStore.user
  };

  componentDidMount() {
    userStore.onChange(this.userStoreDidChange);
  }

  componentWillUnmount() {
    userStore.offChange(this.userStoreDidChange);
  }

  userStoreDidChange = () => {
    this.setState({ user: userStore.user });
  }

  handleDelete = () => {
    console.log('implement deleting of snapshot from Docker registry');
  }

  render() {
    const { snapshot } = this.props,
          { user } = this.state,
          isSelf = snapshot.ownerUsername === user.username;

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

            <div className='owner'>
              <OverlayTrigger placement='top'
                overlay={isSelf ? (
                  <Tooltip id={`snapshot-${snapshot.id}-owner-tooltip`}>Created by you</Tooltip>
                ) : (
                  <Tooltip id={`snapshot-${snapshot.id}-owner-tooltip`}>Created by {snapshot.ownerDisplayName}</Tooltip>
                )}>
                <img className='gravatar' src={snapshot.ownerGravatar(40)} />
              </OverlayTrigger>
            </div>

            {snapshot.filesize ? (
              <div className='aux-info'>
                {prettyBytes(snapshot.filesize)}
              </div>
            ) : ''}

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
