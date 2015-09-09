import React from 'react';
import { Route, DefaultRoute } from 'react-router';
import Application from 'components/application';
import Login from 'components/login';
import Dashboard from 'components/dashboard';
import UserWorkspace from 'components/user-workspace';
import OrgWorkspace from 'components/org-workspace';
import NewWorkspace from 'components/new-workspace';
import Workspace from 'components/workspace';
import Containers from 'components/containers';
import NewContainer from 'components/new-container';

export default (
  <Route name='application' path='/' handler={Application}>
    <DefaultRoute handler={redirectTo('dashboard')} />
    <Route name='login' handler={Login} />

    <Route name='dashboard' handler={Dashboard}>
      <DefaultRoute handler={redirectTo('user-workspace')} />

      <Route name='user-workspace' path='workspaces' handler={UserWorkspace}>
        <DefaultRoute handler={redirectTo('new-user-workspace')} />
        <Route name='new-user-workspace' path='new' handler={NewWorkspace} />
      </Route>

      <Route name='org-workspace' path='orgs/:orgSlug/workspaces' handler={OrgWorkspace}>
        <DefaultRoute handler={redirectTo('new-org-workspace')} />
        <Route name='new-org-workspace' path='new' handler={NewWorkspace} />
      </Route>

      <Route name='workspace' path='workspaces/:hostSlug' handler={Workspace}>
        <DefaultRoute handler={redirectTo('containers')} />
        <Route name='containers' path='projects' handler={Containers} />
        <Route name='images' handler={Containers} />
        <Route name='system' handler={Containers} />
        <Route name='new-container' path='projects/new' handler={NewContainer} />
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
