import React from 'react';
import { Route, DefaultRoute, NotFoundRoute } from 'react-router';
import Application from 'components/application';
import Login from 'components/login';
import ForgotPassword from 'components/forgot-password';
import ResetPassword from 'components/reset-password';
import Signup from 'components/signup';
import Dashboard from 'components/dashboard';
import NewOrg from 'components/new-org';
import Orgs from 'components/orgs';
import OrgRoot from 'components/org-root';
import OrgInviteMembers from 'components/org-invite-members';
import OrgMembers from 'components/org-members';
import OrgBilling from 'components/org-billing';
import UserHost from 'components/user-host';
import OrgHost from 'components/org-host';
import NewHost from 'components/new-host';
import Host from 'components/host';
import HostCreating from 'components/host-creating';
import HostSystem from 'components/host-system';
import HostImages from 'components/host-images';
import Containers from 'components/containers';
import NewContainer from 'components/new-container';
import ContainerCollaborators from 'components/container-collaborators';
import ContainerKeys from 'components/container-keys';
import ContainerPorts from 'components/container-ports';
import ContainerCreating from 'components/container-creating';
import SharedContainers from 'components/shared-containers';
import AccountSettings from 'components/account-settings';
import Billing from 'components/billing';
import BillingPaymentMethod from 'components/billing-payment-method';
import NotFound from 'components/not-found';
import ResendConfirmation from 'components/resend-confirmation';
import ConfirmEmail from 'components/confirm-email';

import DocsUI from 'components/docs-ui';

export default (
  <Route name='application' path='/' handler={Application}>
    <DefaultRoute handler={redirectTo('dashboard')} />
    <Route name='login' handler={Login} />
    <Route name='forgot-password' handler={ForgotPassword} />
    <Route name='reset-password' handler={ResetPassword} />
    <Route name='signup' handler={Signup} />
    <Route name='confirm-email' handler={ConfirmEmail} />
    <Route name='resend-confirmation' handler={ResendConfirmation} />

    <Route name='ui' path='ui' handler={DocsUI} />

    <Route name='dashboard' handler={Dashboard}>
      <DefaultRoute handler={redirectTo('user-host')} />

      <Route name='new-user-host' path='workstations/new' handler={NewHost} />
      <Route name='host-creating' path='workstations/creating' handler={HostCreating} />
      <Route name='user-host' path='workstations' handler={UserHost}>
        <DefaultRoute handler={redirectTo('new-user-host')} />
      </Route>

      <Route name='orgs' path='orgs' handler={Orgs} />
      <Route name='new-org' path='orgs/new' handler={NewOrg} />

      <Route name='org' path='orgs/:orgSlug' handler={OrgRoot}>
        <Route name='org-host' path='workstations' handler={OrgHost}>
          <DefaultRoute handler={redirectTo('new-org-host')} />
          <Route name='new-org-host' path='new' handler={NewHost} />
        </Route>

        <Route name='org-invite-members' path='invite-members' handler={OrgInviteMembers} />
        <Route name='org-members' path='members' handler={OrgMembers} />

        <Route name='org-billing' path='billing' handler={OrgBilling} />
        <Route name='org-payment-method' path='billing/payment-method' handler={BillingPaymentMethod} />
      </Route>

      <Route name='host' path='workstations/:hostSlug' handler={Host}>
        <DefaultRoute handler={redirectTo('containers')} />
        <Route name='containers' path='projects' handler={Containers} />
        <Route name='new-container' path='projects/new' handler={NewContainer} />
        <Route name='container-creating' path='projects/creating' handler={ContainerCreating} />

        <Route name='container-collaborators' path='projects/:containerSlug/collaborators' handler={ContainerCollaborators} />
        <Route name='container-keys' path='projects/:containerSlug/keys' handler={ContainerKeys} />
        <Route name='container-ports' path='projects/:containerSlug/ports' handler={ContainerPorts} />

        <Route name='host-images' path='images' handler={HostImages} />
        <Route name='host-system' path='system' handler={HostSystem} />
      </Route>

      <Route name='shared-containers' path='shared-projects' handler={SharedContainers} />
      <Route name='shared-container-collaborators' path='shared-projects/:containerSlug/collaborators' handler={ContainerCollaborators} />
      <Route name='shared-container-keys' path='shared-projects/:containerSlug/keys' handler={ContainerKeys} />
      <Route name='shared-container-ports' path='shared-projects/:containerSlug/ports' handler={ContainerPorts} />

      <Route name='account-settings' path='settings' handler={AccountSettings} />

      <Route name='billing' path='billing' handler={Billing} />
      <Route name='payment-method' path='billing/payment-method' handler={BillingPaymentMethod} />

      <NotFoundRoute handler={NotFound} />
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
