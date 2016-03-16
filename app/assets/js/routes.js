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
import OrgBillingPaymentMethod from 'components/org-billing-payment-method';
import UserHost from 'components/user-host';
import OrgHost from 'components/org-host';
import NewHost from 'components/new-host';
import Quickstart from 'components/quickstart';
import Host from 'components/host';
import HostCreating from 'components/host-creating';
import HostSystem from 'components/host-system';
import HostImages from 'components/host-images';
import HostSnapshots from 'components/host-snapshots';
import TeamSnapshots from 'components/team-snapshots';
import Containers from 'components/containers';
import NewContainer from 'components/new-container';
import ContainerCollaborators from 'components/container-collaborators';
import ContainerKeys from 'components/container-keys';
import ContainerPorts from 'components/container-ports';
import ContainerCreating from 'components/container-creating';
import SharedContainers from 'components/shared-containers';
import AccountSettings from 'components/account-settings';
import UserBilling from 'components/user-billing';
import UserBillingPaymentMethod from 'components/user-billing-payment-method';
import SubscriptionsUpgrade from 'components/subscriptions-upgrade';
import NotFound from 'components/not-found';
import ResendConfirmation from 'components/resend-confirmation';
import ConfirmEmail from 'components/confirm-email';
import FirstStart from 'components/first-start';
import EarnBonuses from 'components/earn-bonuses';

// import DocsUI from 'components/docs-ui';
// use <Route name='ui' path='ui' handler={DocsUI} /> when you need it

export default (
  <Route name='application' path='/' handler={Application}>
    // temporary routes
    <Route name='temp-billing' path='billing' handler={redirectTo('billing')} />
    <Route name='temp-workspaces' path='workspaces/:slug' handler={redirectTo('dashboard')} />
    <Route name='temp-containers' path='containers/:slug' handler={redirectTo('dashboard')} />
    <Route name='temp-containers-ports' path='containers/:slug/ports' handler={redirectTo('dashboard')} />
    <Route name='temp-account' path='account' handler={redirectTo('account-settings')} />
    <Route name='temp-subscriptions' path='subscriptions' handler={redirectTo('billing')} />

    <DefaultRoute handler={redirectTo('dashboard')} />
    <Route name='login' handler={Login} />
    <Route name='forgot-password' handler={ForgotPassword} />
    <Route name='reset-password' handler={ResetPassword} />
    <Route name='signup' handler={Signup} />
    <Route name='confirm-email' handler={ConfirmEmail} />
    <Route name='resend-confirmation' handler={ResendConfirmation} />

    <Route name='dashboard' handler={Dashboard}>
      <DefaultRoute handler={FirstStart} />

      <Route name='quickstart' path='quickstart' handler={Quickstart} />
      <Route name='new-user-host' path='workstations/new' handler={NewHost} />
      <Route name='host-creating' path='workstations/creating' handler={HostCreating} />
      <Route name='user-host' path='workstations' handler={UserHost}>
        <DefaultRoute handler={redirectTo('new-user-host')} />
      </Route>

      <Route name='orgs' path='orgs' handler={Orgs} />
      <Route name='new-org' path='orgs/new' handler={NewOrg} />

      <Route name='org' path='orgs/:orgSlug' handler={OrgRoot}>
        <DefaultRoute handler={redirectTo('org-host')} />

        <Route name='org-host' path='workstations' handler={OrgHost} />
        <Route name='new-org-host' path='workstations/new' handler={NewHost} />

        <Route name='org-invite-members' path='invite-members' handler={OrgInviteMembers} />
        <Route name='org-members' path='members' handler={OrgMembers} />

        <Route name='org-billing' path='billing' handler={OrgBilling} />
        <Route name='org-payment-method' path='billing/payment-method' handler={OrgBillingPaymentMethod} />

        <Route name='org-subscriptions-upgrade' path='subscriptions/:subscriptionSlug/upgrade' handler={SubscriptionsUpgrade} />
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

        <Route name='host-snapshots' path='snapshots' handler={HostSnapshots} />
        <Route name='team-snapshots' path='team-snapshots' handler={TeamSnapshots} />
      </Route>

      <Route name='shared-containers' path='shared-projects' handler={SharedContainers} />
      <Route name='shared-container-collaborators' path='shared-projects/:containerSlug/collaborators' handler={ContainerCollaborators} />
      <Route name='shared-container-keys' path='shared-projects/:containerSlug/keys' handler={ContainerKeys} />
      <Route name='shared-container-ports' path='shared-projects/:containerSlug/ports' handler={ContainerPorts} />

      <Route name='account-settings' path='account' handler={AccountSettings} />

      <Route name='earn-bonuses' path='earn-bonuses' handler={EarnBonuses} />

      <Route name='billing' path='billing' handler={UserBilling} />
      <Route name='payment-method' path='billing/payment-method' handler={UserBillingPaymentMethod} />

      <Route name='subscriptions-upgrade' path='subscriptions/:subscriptionSlug/upgrade' handler={SubscriptionsUpgrade} />

    </Route>

    <NotFoundRoute handler={NotFound} />
  </Route>
);

function redirectTo(route) {
  return class extends React.Component {
    static willTransitionTo(transition, params, query) {
      transition.redirect(route, params, query);
    }
  };
}
