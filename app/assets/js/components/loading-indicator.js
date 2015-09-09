import React from 'react';

export default class LoadingIndicator extends React.Component {
  displayName = 'LoadingIndicator';

  render() {
    return (
      <div className='loading-indicator-component'>
        <div className='graphic'></div>
      </div>
    );
  }
}
