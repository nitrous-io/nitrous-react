import React, { PropTypes } from 'react';
import { Alert } from 'react-bootstrap';

import Announcement from 'records/announcement';

export default class AnnouncementAlert extends React.Component {
  displayName = 'AnnouncementAlert';

  static propTypes = {
    announcement: PropTypes.instanceOf(Announcement),
    showFirst: PropTypes.bool
  };

  render() {
    const { announcement } = this.props;

    return (
      <div className='announcement-alert-component'>
        <Alert bsStyle="info">
          <h4>{announcement.subject}</h4>
          {announcement.messageLines.map((line) => {
            return (<p>{line}</p>);
          })}
        </Alert>
      </div>
    );
  }
}
