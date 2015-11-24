import React, { PropTypes } from 'react';
import { Button, ButtonGroup, ButtonToolbar, Panel, Table } from 'react-bootstrap';
import Time from 'react-time';

import hostStore from 'stores/host-store';
import hostActions from 'actions/host-actions';
import billingStore from 'stores/billing-store';
import subscriptionStore from 'stores/subscription-store';
import invoiceStore from 'stores/invoice-store';
import subscriptionActions from 'actions/subscription-actions';
import invoiceActions from 'actions/invoice-actions';
import SubscriptionListItem from 'components/subscription-list-item';
import InvoiceListItem from 'components/invoice-list-item';
import HostListItem from 'components/host-list-item';
import LoadingIndicator from 'components/loading-indicator';
import Org from 'records/org';
import Fa from 'components/fa';
import Mp from 'lib/mp';
import MpEvents from 'lib/mp-events';

export default class Billing extends React.Component {
  displayName = 'Billing';

  static contextTypes = {
    org: PropTypes.instanceOf(Org),
    router: PropTypes.func.isRequired // Router.PropTypes.router.isRequired
  };

  static willTransitionTo() {
    Mp.track(MpEvents.EventDashboardViewedBilling);
  }

  findBillingProfile = () => {
    const org = this.context.org;
    if (org) {
      return billingStore.orgBillingProfiles.get(org.id);
    }
    return billingStore.userBillingProfile;
  }

  findMultiHostSubscription = () => {
    const subs = this.findSubscriptions(),
          { org } = this.context,
          multiHost = org && org.multiHost;

    if (!multiHost || !subs) {
      return;
    }

    return subs.find((s) => {
      return s.multiHost;
    });
  }

  findSubscriptions = () => {
    const org = this.context.org;
    if (org) {
      return subscriptionStore.orgSubscriptionsBySlug(org.slug);
    }
    return subscriptionStore.activeUserSubscriptions;
  }

  findInvoices = () => {
    const org = this.context.org;
    if (org) {
      return invoiceStore.orgInvoicesBySlug(org.slug);
    }
    return invoiceStore.userInvoices;
  }

  state = {
    billingProfile: this.findBillingProfile(),
    subscriptions: this.findSubscriptions(),
    invoices: this.findInvoices(),
    loadingSubscriptions: true,
    loadingInvoices: true,
    fetchingHosts: false
  };

  componentWillReceiveProps(nextProps, nextContext) {
    this.fetchObjects(nextContext);
  }

  componentWillMount() {
    const org = this.context.org;
    if (org && !org.roleAllowsBillingProfileAdmin) {
      this.context.router.transitionTo('dashboard');
    }
  }

  componentDidMount() {
    hostStore.on('fetched-sub-hosts', this.onSubHostsFetched);
    hostStore.on('terminated', this.handleHostTerminated);
    subscriptionStore.onChange(this.subscriptionStoreDidChange);
    this.fetchObjects();
  }

  componentWillUnmount() {
    subscriptionStore.offChange(this.subscriptionStoreDidChange);
    invoiceStore.offChange(this.invoiceStoreDidChange);
    hostStore.off('fetched-sub-hosts', this.onSubHostsFetched);
    hostStore.off('terminated', this.handleHostTerminated);
  }

  fetchObjects = (context=this.context) => {
    const { org } = context;
    if (org) {
      subscriptionActions.fetchAllByOrgSlug(org.slug);
    } else {
      subscriptionActions.fetchAll();
    }

    invoiceStore.onChange(this.invoiceStoreDidChange);
    if (org) {
      invoiceActions.fetchAllByOrgSlug(org.slug);
    } else {
      invoiceActions.fetchAll();
    }
  }

  subscriptionStoreDidChange = () => {
    const subs = this.findSubscriptions(),
          multiHostSub = this.findMultiHostSubscription(),
          { org } = this.context,
          multiHost = org && org.multiHost;

    if (!multiHost) {
      this.setState({ loadingSubscriptions: false, subscriptions: subs });
      return;
    }

    if (multiHostSub) {
      this.setState({ fetchingHosts: true });
      hostActions.fetchSubscriptionHosts(multiHostSub.slug);
    }
  };

  handleHostTerminated = () => {
    const multiHostSub = this.findMultiHostSubscription();

    if (multiHostSub) {
      hostActions.fetchSubscriptionHosts(multiHostSub.slug);
    }
  }

  invoiceStoreDidChange = () => {
    this.setState({ loadingInvoices: false, invoices: this.findInvoices() });
  };

  onSubHostsFetched = () => {
    this.setState({ fetchingHosts: false });
  }

  renderSubscriptions = () => {
    const { subscriptions, loadingSubscriptions } = this.state,
          showSubscriptions = subscriptions && subscriptions.count();

    if (showSubscriptions) {
      return (
        <Table responsive hover>
          <tbody>
            {subscriptions.toList().map((subscription) => {
              return (
                <SubscriptionListItem key={`subscription-${subscription.slug}`} subscription={subscription} />
              );
            })}
          </tbody>
        </Table>
      );
    }

    return (loadingSubscriptions ? (
        <LoadingIndicator />
      ) : (
        <p className="empty-state">You don&#39;t have any subscriptions.</p>
      ));
  }

  renderInvoices = () => {
    const { invoices, loadingInvoices } = this.state,
          showInvoices = invoices && invoices.count();

    if (showInvoices) {
      return (
        <Table responsive hover>
          <thead>
            <tr>
              <th>Subscription</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {invoices.slice(0, 8).toList().map((invoice) => {
              return (
                <InvoiceListItem key={`invoice-${invoice.id}`} invoice={invoice} />
              );
            })}
          </tbody>
        </Table>
      );
    }

    return (loadingInvoices ? (
        <LoadingIndicator />
      ) : (
        <p className="empty-state">You don&#39;t have any invoices.</p>
      ));
  }

  hostsTitle = () => {
    const sub = this.findMultiHostSubscription();

    if (!sub) {
      return 'Workstations';
    }

    const hosts = hostStore.hostsBySubSlug(sub.slug);
    let hostsTitle = '';
    if (hosts) {
      if (sub.plan && sub.plan.maxHosts) {
        hostsTitle = ` (using ${hosts.size} of ${sub.plan.maxHosts})`;
      } else {
        hostsTitle = ` (using ${hosts.size})`;
      }
    }

    return `Workstations${hostsTitle}`;
  }

  renderHosts = () => {
    const { fetchingHosts } = this.state;

    if (fetchingHosts) {
      return (<LoadingIndicator />);
    }

    const sub = this.findMultiHostSubscription();
    if (!sub) {
      return '';
    }

    const hosts = hostStore.hostsBySubSlug(sub.slug);
    if (!hosts || hosts.size === 0) {
      return (<p className="empty-state">You don&#39;t have any workstations.</p>);
    }

    return (
      <Table responsive hover>
        <thead>
          <tr>
            <th>Slug</th>
            <th>State</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {hosts.toList().map((host) => {
            return (
              <HostListItem key={`host-${host.id}`} host={host} />
            );
          })}
        </tbody>
      </Table>
    );
  }

  renderOrgPlanInfo = () => {
    const { org } = this.context,
          { makeHref } = this.context.router,
          multiHost = org && org.multiHost,
          sub = this.findMultiHostSubscription();

    if (!multiHost || !sub) {
      return '';
    }

    let workspaceInfo = null;
    if (sub.plan.maxHosts === 1) {
      workspaceInfo = ' 1 workstation';
    } else if (sub.plan.maxHosts > 1) {
      workspaceInfo = ` ${sub.plan.maxHosts} workstations`;
    }

    const href = makeHref('org-subscriptions-upgrade', { orgSlug: org.slug, subscriptionSlug: sub.slug });

    return (
      <Panel header={<h4>Plan</h4>}>
        <div className='org-info'>
          <p><strong>{sub.plan.name}</strong></p>
          {workspaceInfo ? (
            <p>{workspaceInfo}</p>
          ) : ''}
          {sub.currentPeriodEnd ? (
            <p>Renews on <Time value={sub.currentPeriodEnd} format="MMM DD, YYYY" /></p>
          ) : ''}
        </div>

        <div>
          <ButtonToolbar>
            <ButtonGroup>
              <Button href={href}>Change Plan</Button>
            </ButtonGroup>
          </ButtonToolbar>
        </div>
      </Panel>
    );
  }

  render() {
    const { billingProfile } = this.state,
          { org } = this.context,
          { hasCard, cardType, expMonth, expYear, lastFour } = billingProfile,
          { makeHref } = this.context.router,
          multiHost = org && org.multiHost;

    let cardTypeCssClass = cardType ? cardType.replace(/[_-\s]/g, '').toLowerCase() : '';
    if (cardType === 'americanexpress') {
      cardTypeCssClass = 'amex';
    }

    var href = makeHref('payment-method');
    if (org) {
      href = makeHref('org-payment-method', { orgSlug: org.slug });
    }

    return (
      <div className='billing-component'>
        {this.renderOrgPlanInfo()}

        <Panel header={<h4>Payment Method</h4>} className='payment-method'>
          {hasCard ? (

            <div>
              <div className='bank-card'>
                <div className='card-number'>
                  <span className='card-number-hidden'>••••</span>
                  <span className='card-number-hidden'>••••</span>
                  <span className='card-number-hidden'>••••</span>
                  <span>{lastFour}</span>
                </div>
                <div className={`card-type ${cardTypeCssClass}`}>
                  {cardType}
                </div>
                <div className='card-expiry'>
                  <span className='card-expiry-label'>Valid until</span>
                  <div className='card-expiry-date'>{expMonth}/{expYear}</div>
                </div>
              </div>

              <div>
                <ButtonToolbar>
                  <ButtonGroup>
                    <Button href={href} className='btn btn-default'><Fa icon='credit-card' /> Update Card</Button>
                  </ButtonGroup>
                </ButtonToolbar>
              </div>
            </div>

          ) : (
            <div>
              <p>No card on file.</p>
              <p><Button href={href} className='btn btn-default'><Fa icon='credit-card' /> Add Card</Button></p>
            </div>
          )}
        </Panel>

        {multiHost ? (
          <Panel header={<h4>{this.hostsTitle()}</h4>}>
            {this.renderHosts()}
          </Panel>
        ) : (
          <Panel header={<h4>Subscriptions</h4>}>
            {this.renderSubscriptions()}
          </Panel>
        )}

        <Panel header={<h4>Billing History</h4>}>
          {this.renderInvoices()}
        </Panel>
      </div>
    );
  }
}
