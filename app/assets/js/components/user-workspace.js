import React from 'react';
import hostStore from 'stores/host-store';
import ContextSwitcher from 'components/context-switcher';

export default class UserWorkspace extends React.Component {
  displayName: 'UserWorkspace'

  static willTransitionTo(transition) {
    const userHosts = hostStore.userHosts;

    if (userHosts.size > 0) {
      transition.redirect('workspace', { hostSlug: userHosts.first().slug });
      return;
    }
  }

  render() {
    return (
      <div className='user-workspace-component workspace-component'>
        <div className='container'>
          <ContextSwitcher />
          <p>no workspace created</p>
        </div>
      </div>
    );
  }
}
