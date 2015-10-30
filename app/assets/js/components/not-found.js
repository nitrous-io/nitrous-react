import React, { PropTypes } from 'react';

export default class NotFound extends React.Component {
  displayName = 'NotFound';

  static contextTypes = {
    router: PropTypes.func.isRequired
  };

  componentDidMount() {
    this.context.router.transitionTo('dashboard');
  }

  render() {
    return (<div className='not-found-component'></div>);
  }
}
