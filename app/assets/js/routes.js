import React from 'react';
import { Route, DefaultRoute } from 'react-router';
import Application from 'components/application';
import Login from 'components/login';
import Dashboard from 'components/dashboard';
import UserWorkspace from 'components/user-workspace';
import OrgWorkspace from 'components/org-workspace';
import Workspace from 'components/workspace';
import Containers from 'components/containers';

export default (
  <Route name='application' path='/' handler={Application}>
    <DefaultRoute handler={redirectTo('dashboard')} />
    <Route name='login' handler={Login} />

    <Route name='dashboard' handler={Dashboard}>
      <DefaultRoute handler={redirectTo('user-workspace')} />

      <Route name='user-workspace' path='workspace' handler={UserWorkspace} />
      <Route name='org-workspace' path='orgs/:orgSlug/workspace' handler={OrgWorkspace} />

      <Route name='workspace' path='workspaces/:hostSlug' handler={Workspace}>
        <DefaultRoute handler={redirectTo('containers')} />

        <Route name='containers' path='boxes' handler={Containers} />
        <Route name='images' handler={Containers} />
        <Route name='system' handler={Containers} />
      </Route>
    </Route>
  </Route>
);

function redirectTo(route) {
  return class extends React.Component {
    static willTransitionTo(transition, params, query) {
      transition.redirect(route, params, query);
    }
  };
}
