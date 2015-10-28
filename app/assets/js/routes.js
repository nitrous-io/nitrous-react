import React from 'react';
import { Route, DefaultRoute } from 'react-router';
import Application from 'components/application';
import Login from 'components/login';
import ForgotPassword from 'components/forgot-password';
import Dashboard from 'components/dashboard';
import OrgRoot from 'components/org-root';
import UserWorkspace from 'components/user-workspace';
import OrgWorkspace from 'components/org-workspace';
import NewWorkspace from 'components/new-workspace';
import Workspace from 'components/workspace';
import WorkspaceSystem from 'components/workspace-system';
import Containers from 'components/containers';
import NewContainer from 'components/new-container';
import ContainerKeys from 'components/container-keys';
import ContainerCollaborators from 'components/container-collaborators';
import ContainerCreating from 'components/container-creating';
import SharedContainers from 'components/shared-containers';
import AccountSettings from 'components/account-settings';
import Billing from 'components/billing';
import BillingPaymentMethod from 'components/billing-payment-method';

export default (
  <Route name='application' path='/' handler={Application}>
    <DefaultRoute handler={redirectTo('dashboard')} />
    <Route name='login' handler={Login} />
    <Route name='forgot-password' handler={ForgotPassword} />

    <Route name='dashboard' handler={Dashboard}>
      <DefaultRoute handler={redirectTo('user-workspace')} />

      <Route name='new-user-workspace' path='workspaces/new' handler={NewWorkspace} />
      <Route name='user-workspace' path='workspaces' handler={UserWorkspace}>
        <DefaultRoute handler={redirectTo('new-user-workspace')} />
      </Route>

      <Route name='org' path='orgs/:orgSlug' handler={OrgRoot}>
        <Route name='org-workspace' path='workspaces' handler={OrgWorkspace}>
          <DefaultRoute handler={redirectTo('new-org-workspace')} />
          <Route name='new-org-workspace' path='new' handler={NewWorkspace} />
        </Route>

        <Route name='org-billing' path='billing' handler={Billing} />
        <Route name='org-payment-method' path='billing/payment-method' handler={BillingPaymentMethod} />
      </Route>

      <Route name='workspace' path='workspaces/:hostSlug' handler={Workspace}>
        <DefaultRoute handler={redirectTo('containers')} />
        <Route name='containers' path='projects' handler={Containers} />
        <Route name='new-container' path='projects/new' handler={NewContainer} />
        <Route name='container-creating' path='projects/creating' handler={ContainerCreating} />

        <Route name='container-collaborators' path='projects/:containerSlug/collaborators' handler={ContainerCollaborators} />
        <Route name='container-keys' path='projects/:containerSlug/keys' handler={ContainerKeys} />

        <Route name='workspace-system' path='system' handler={WorkspaceSystem} />
      </Route>

      <Route name='shared-containers' path='shared-projects' handler={SharedContainers} />
      <Route name='shared-container-collaborators' path='shared-projects/:containerSlug/collaborators' handler={ContainerCollaborators} />
      <Route name='shared-container-keys' path='shared-projects/:containerSlug/keys' handler={ContainerKeys} />

      <Route name='account-settings' path='settings' handler={AccountSettings} />

      <Route name='billing' path='billing' handler={Billing} />
      <Route name='payment-method' path='billing/payment-method' handler={BillingPaymentMethod} />
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
