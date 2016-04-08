import React, { PropTypes } from 'react';
import { RouteHandler } from 'react-router';
import HostRecord from 'records/host';
import Org from 'records/org';
import hostActions from 'actions/host-actions';
import taskActions from 'actions/task-actions';
import hostStore from 'stores/host-store';
import freeUsageStore from 'stores/free-usage-store';
import billingStore from 'stores/billing-store';

export default class Host extends React.Component {
  displayName = 'Host';

  static contextTypes = {
    router: PropTypes.func.isRequired, // Router.PropTypes.router.isRequired
    org: PropTypes.instanceOf(Org)
  };

  static childContextTypes = {
    host: PropTypes.instanceOf(HostRecord).isRequired
  };

  static propTypes = {
    params: PropTypes.shape({
      hostSlug: PropTypes.string.isRequired
    }),

    query: PropTypes.object
  };

  state = {
    host: hostStore.liveHosts.get(this.props.params.hostSlug)
  };

  static willTransitionTo(transition, params) {
    const host = hostStore.liveHosts.get(params.hostSlug);
    if (!host) {
      transition.redirect('dashboard');
      return;
    }

    if (host.state === 'born') {
      transition.redirect('host-creating', null, { hostSlug: params.hostSlug });
      return;
    }
  }

  componentDidMount() {
    hostStore.onChange(this.hostStoreDidChange);
    hostStore.on('started', this.onHostStarted);
    hostActions.fetchOne(this.props.params.hostSlug);

    const host = hostStore.liveHosts.get(this.props.params.hostSlug);
    if (this.shouldResumeHost(host)) {
      this.resumeHost(host);
    }
  }

  componentWillReceiveProps(nextProps) {
    const hostSlug = nextProps.params.hostSlug;
    if (this.props.params.hostSlug !== hostSlug) {
      const host = hostStore.liveHosts.get(hostSlug);
      this.setState({ host });
      hostActions.fetchOne(hostSlug);

      if (this.shouldResumeHost(host)) {
        this.resumeHost(host);
      }
    }
  }

  componentWillUnmount() {
    hostStore.offChange(this.hostStoreDidChange);
  }

  hostStoreDidChange = () => {
    if (hostStore.liveHosts) {
      this.setState({ host: hostStore.liveHosts.get(this.props.params.hostSlug) });
    }
  };

  onHostStarted = (data) => {
    const { host } = data;
    if (this.props.params.hostSlug === host.slug) {
      taskActions.done(`host-starting-${host.slug}`);
    }
  };

  getChildContext() {
    return { host: this.state.host };
  }

  findBillingProfile = () => {
    const org = this.context.org;
    if (org) {
      return billingStore.orgBillingProfiles.get(org.id);
    }
    return billingStore.userBillingProfile;
  }

  shouldResumeHost(host) {
    if (!host || host.state !== 'stopped') return false;

    // Don't resume free host if user has no more usage remaining.
    if (host.free && freeUsageStore.quotaReached) return false;

    return true;
  }

  resumeHost(host) {
    const { makeHref } = this.context.router,
          billingProfile = this.findBillingProfile(),
          upgradeURL = (billingProfile && !billingProfile.hasCard) ?
            makeHref('payment-method', {}, { next: 'upgrade', subscription: host.subscriptionSlug }) :
            makeHref('subscriptions-upgrade', { subscriptionSlug: host.subscriptionSlug }),
          readMoreURL = "https://community.nitrous.io/docs/nitrous-free-tier-faq";

    const resumingJSX = (
      <span>
        Resuming {host.free ? 'free' : ''} workstation&hellip;
        <span className='links'>
          <a href={readMoreURL}>Read more</a>
          &nbsp;|&nbsp;
          <a href={upgradeURL}>Upgrade</a>
        </span>
      </span>
    );

    // re-queue host-start-action at the end of the execution queue
    // so that it will start the host after event socket is connected.
    setTimeout(() => {
      hostActions.start(host.slug);
    }, 0);

    taskActions.update(`host-starting-${host.slug}`, resumingJSX);
  }

  render() {
    return (
      <div className='host-component'>
        <RouteHandler />
      </div>
    );
  }
}
