import React from 'react';
import { Route, IndexRoute } from 'react-router';
import Application from 'components/application';
import Login from 'components/login';
import Dashboard from 'components/dashboard';
import UserWorkspace from 'components/user-workspace';
import OrgWorkspace from 'components/org-workspace';
import NewWorkspace from 'components/new-workspace';
import Workspace from 'components/workspace';
import Containers from 'components/containers';
import NewContainer from 'components/new-container';
import ContainerCreating from 'components/container-creating';
import SharedContainers from 'components/shared-containers';

export default (
  <Route name='application' path='/' component={Application}>
    <IndexRoute component={redirectTo('dashboard')} />
    <Route name='login' component={Login} />

    <Route name='dashboard' component={Dashboard}>
      <IndexRoute component={redirectTo('user-workspace')} />

      <Route name='user-workspace' path='workspaces' component={UserWorkspace}>
        <IndexRoute component={redirectTo('new-user-workspace')} />
        <Route name='new-user-workspace' path='new' component={NewWorkspace} />
      </Route>

      <Route name='org-workspace' path='orgs/:orgSlug/workspaces' component={OrgWorkspace}>
        <IndexRoute component={redirectTo('new-org-workspace')} />
        <Route name='new-org-workspace' path='new' component={NewWorkspace} />
      </Route>

      <Route name='workspace' path='workspaces/:hostSlug' component={Workspace}>
        <IndexRoute component={redirectTo('containers')} />
        <Route name='containers' path='projects' component={Containers} />
        <Route name='new-container' path='projects/new' component={NewContainer} />
        <Route name='container-creating' path='projects/creating' component={ContainerCreating} />
      </Route>

      <Route name='shared-containers' path='shared-projects' component={SharedContainers} />
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
