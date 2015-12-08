import React, { PropTypes } from 'react';
import { Button, Col, OverlayTrigger, Tooltip } from 'react-bootstrap';
import TimeAgo from 'react-timeago';
import prettyBytes from 'pretty-bytes';
import classNames from 'classnames';

import Snapshot from 'records/snapshot';
import userStore from 'stores/user-store';

export default class SelectableTeamSnapshot extends React.Component {
  displayName = 'SelectableTeamSnapshot';

  static propTypes = {
    snapshot: PropTypes.instanceOf(Snapshot).isRequired,
    selected: PropTypes.bool,
    onSelect: PropTypes.func
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

  handleSelect = () => {
    this.props.onSelect(this.props.snapshot);
  }

  render() {
    const { snapshot, selected } = this.props,
          { user } = this.state,
          isSelf = snapshot.ownerUsername === user.username;

    return (
      <Col lg={3} md={4} sm={6} xs={12}
        className='selectable-team-snapshot-component snapshot-list-item'>
        <Button className={classNames('ui-card', { selected })} onClick={this.handleSelect}>
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
                overlay={<Tooltip id={`snapshot-${snapshot.id}-owner-tooltip`}>
                  Created by {isSelf ? 'you' : snapshot.ownerDisplayName}</Tooltip>}>
                <img className='gravatar' src={snapshot.ownerGravatar(40)} />
              </OverlayTrigger>
            </div>

            {snapshot.filesize ? (
              <div className='aux-info'>
                {prettyBytes(snapshot.filesize)}
              </div>
            ) : ''}
          </div>
        </Button>
      </Col>
    );
  }
}
