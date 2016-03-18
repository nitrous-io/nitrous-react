import React, { PropTypes } from 'react';
import { Alert, Button } from 'react-bootstrap';

import Host from 'records/host';
import Org from 'records/org';
import announcementStore from 'stores/announcement-store';
import billingStore from 'stores/billing-store';
import containerStore from 'stores/container-store';
import announcementActions from 'actions/announcement-actions';
import hostStore from 'stores/host-store';
import freeUsageStore from 'stores/free-usage-store';
import containerActions from 'actions/container-actions';
import hostActions from 'actions/host-actions';
import AnnouncementAlert from 'components/announcement-alert';
import OnboardingModal from 'components/onboarding-modal';
import ContainerList from 'components/container-list';
import ContextSwitcher from 'components/context-switcher';
import HostNav from 'components/host-nav';
import LoadingIndicator from 'components/loading-indicator';
import Fa from 'components/fa';
import Mp from 'lib/mp';
import MpEvents from 'lib/mp-events';

export default class Containers extends React.Component {
  displayName = 'Containers';

  static contextTypes = {
    host: PropTypes.instanceOf(Host).isRequired,
    org: PropTypes.instanceOf(Org),
    router: PropTypes.func.isRequired
  };

  constructor(props, context) {
    super(props, context);

    this.state = {
      containers: containerStore.liveContainersByHostSlug(this.context.host.slug),
      announcements: announcementStore.announcementsByHostSlug(this.context.host.slug),
      billingProfile: this.findBillingProfile(),
      showDashboardTooltip: false,
      showContextTooltip: false,
      showSettingsTooltip: false,
      quotaReached: this.context.host.isFree && freeUsageStore.quotaReached,
      quotaRunningOut: this.isQuotaRunningOut(freeUsageStore.usageRemaining)
    };
  }

  static willTransitionTo() {
    Mp.track(MpEvents.EventDashboardViewedProjects);
  }

  componentDidMount() {
    freeUsageStore.on('usage-remaining-tick', this.onUsageRemainingTick);
    containerStore.onChange(this.containerStoreDidChange);
    containerActions.fetchAllByHostSlug(this.context.host.slug);
    announcementStore.onChange(this.announcementStoreDidChange);
    announcementActions.fetchAllByHostSlug(this.context.host.slug);
    hostStore.on('started', this.onHostStarted);
  }

  componentWillReceiveProps(nextProps, nextContext) {
    const hostSlug = nextContext.host.slug;
    if (this.context.host.slug !== hostSlug) {
      this.setState({
        containers: containerStore.liveContainersByHostSlug(hostSlug),
        announcements: announcementStore.announcementsByHostSlug(hostSlug)
      });
      containerActions.fetchAllByHostSlug(hostSlug);
      announcementActions.fetchAllByHostSlug(hostSlug);
    }
  }

  componentWillUnmount() {
    freeUsageStore.off('usage-remaining-tick', this.onUsageRemainingTick);
    containerStore.offChange(this.containerStoreDidChange);
    announcementStore.offChange(this.announcementStoreDidChange);
    hostStore.off('started', this.onHostStarted);
  }

  onUsageRemainingTick = () => {
    const { host } = this.context,
          quotaReached = host.isFree && freeUsageStore.quotaReached,
          quotaRunningOut = this.isQuotaRunningOut(freeUsageStore.usageRemaining);
    this.setState({ quotaReached, quotaRunningOut });
  };

  isQuotaRunningOut = (usageRemaining) => {
    if (usageRemaining == null) return false;
    const fiveHours = 5*60*60;
    return this.context.host.isFree && usageRemaining < fiveHours;
  };

  containerStoreDidChange = () => {
    this.setState({ containers: containerStore.liveContainersByHostSlug(this.context.host.slug) });
  };

  announcementStoreDidChange = () => {
    this.setState({ announcements: announcementStore.announcementsByHostSlug(this.context.host.slug) });
  };

  findBillingProfile = () => {
    const org = this.context.org;
    if (org) {
      return billingStore.orgBillingProfiles.get(org.id);
    }
    return billingStore.userBillingProfile;
  }

  onHostStarted = (data) => {
    const { host } = data;
    if (this.context.host.slug === host.slug) {
      containerActions.fetchAllByHostSlug(host.slug);
    }
  };

  showRelevantTooltip = (slide) => {
    let showDashboardTooltip = false,
        showContextTooltip = false,
        showSettingsTooltip = false;

    switch (slide) {
      case 'dashboard': { showDashboardTooltip = true; break; }
      case 'context': { showContextTooltip = true; break; }
      case 'settings': { showSettingsTooltip = true; break; }
      default: { break; }
    }

    this.setState({
      showDashboardTooltip,
      showContextTooltip,
      showSettingsTooltip
    });
  };

  handleStartWorkstation = () => {
    hostActions.start(this.context.host.slug);
  };

  renderAlert() {
    const { host, router } = this.context,
          { billingProfile, quotaRunningOut, quotaReached } = this.state,
          upgradeURL = (billingProfile && !billingProfile.hasCard) ?
            router.makeHref('payment-method', {}, { next: 'upgrade', subscription: host.subscriptionSlug }) :
            router.makeHref('subscriptions-upgrade', { subscriptionSlug: host.subscriptionSlug });

    if (quotaReached) {
      return (
        <Alert bsStyle='warning'>
          <Fa icon='exclamation-circle' /> You have reached the monthly quota of your plan.
          {' '}
          {host.subscriptionSlug ? (
            <span>
              <a href={upgradeURL}>Upgrade your plan</a>
              {' '}
              for unlimited usage.
            </span>
          ) : ''}
        </Alert>
      );
    } else if (host.isStopped && host.autoShutdown) {
      return (
        <Alert bsStyle='info' className='stopped-host-alert clearfix'>
          <Fa icon='exclamation-circle' /> We've shutdown your workstation and projects due to inactivity.
          <Button bsStyle='default'
            onClick={this.handleStartWorkstation}>
            <Fa icon='play' /> Start Workstation
          </Button>
        </Alert>
      );
    } else if (quotaRunningOut) {
      return (
        <Alert bsStyle='warning'>
          <Fa icon='exclamation-circle' /> You have almost reached the monthly quota of your plan.
          {' '}
          {host.subscriptionSlug ? (
            <span>
              Consider <a href={upgradeURL}>upgrading your plan</a>.
            </span>
          ) : ''}
        </Alert>
      );
    } else if (!host.isRunning && !host.isResuming) {
      return (
        <Alert bsStyle='info'>
          <Fa icon='exclamation-circle' /> It appears that your workstation is not running. If the problem persists, please visit <a href='https://community.nitrous.io/docs/troubleshooting-connection-issues' target='_blank'>Troubleshooting Connection Issues</a>.
        </Alert>
      );
    } else {
      return '';
    }
  }

  render() {
    const { host } = this.context,
          { announcements, showDashboardTooltip,
            showContextTooltip, showSettingsTooltip } = this.state,
          firstAnnouncement = announcements && announcements.size > 0 ? announcements.first() : null,
          containers = this.state.containers ? this.state.containers.toList() : null,
          loading = host.isResuming;

    if (loading) {
      return (
        <div className='containers-component container'>
          <ContextSwitcher selectedHost={host} />
          <LoadingIndicator large />
        </div>
      );
    }

    return (
      <div className='containers-component container'>
        <ContextSwitcher selectedHost={host} showTooltip={showContextTooltip} />
        {this.renderAlert()}
        <HostNav host={host} activeTab='containers' />
        {firstAnnouncement ? (
          <AnnouncementAlert announcement={firstAnnouncement} />
        ) : ''}

        {showSettingsTooltip ? (
          <div className='pin settings'></div>
        ) : ''}

        <ContainerList containers={containers} host={host} showTooltip={showDashboardTooltip} />

        <OnboardingModal activeSlide={this.showRelevantTooltip} />
      </div>
    );
  }
}
