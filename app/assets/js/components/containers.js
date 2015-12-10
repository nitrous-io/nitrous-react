import React, { PropTypes } from 'react';
import { Alert } from 'react-bootstrap';

import Host from 'records/host';
import announcementStore from 'stores/announcement-store';
import containerStore from 'stores/container-store';
import announcementActions from 'actions/announcement-actions';
import hostStore from 'stores/host-store';
import containerActions from 'actions/container-actions';
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
    host: PropTypes.instanceOf(Host).isRequired
  };

  constructor(props, context) {
    super(props, context);

    this.state = {
      containers: containerStore.liveContainersByHostSlug(this.context.host.slug),
      announcements: announcementStore.announcementsByHostSlug(this.context.host.slug),
      showDashboardTooltip: false,
      showContextTooltip: false,
      showSettingsTooltip: false
    };
  }

  static willTransitionTo() {
    Mp.track(MpEvents.EventDashboardViewedProjects);
  }

  componentDidMount() {
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
    containerStore.offChange(this.containerStoreDidChange);
    announcementStore.offChange(this.announcementStoreDidChange);
    hostStore.off('started', this.onHostStarted);
  }

  containerStoreDidChange = () => {
    this.setState({ containers: containerStore.liveContainersByHostSlug(this.context.host.slug) });
  };

  announcementStoreDidChange = () => {
    this.setState({ announcements: announcementStore.announcementsByHostSlug(this.context.host.slug) });
  };

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

  render() {
    const { host } = this.context,
          { announcements, showDashboardTooltip, showContextTooltip, showSettingsTooltip } = this.state,
          firstAnnouncement = announcements && announcements.size > 0 ? announcements.first() : null,
          containers = this.state.containers ? this.state.containers.toList() : null,
          loading = host.isResuming,
          troubleshootURL = 'https://community.nitrous.io/docs/troubleshooting-connection-issues';

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
        {host.isUnusable && !host.isResuming ? (
          <Alert bsStyle='info'>
            <Fa icon='exclamation-circle' /> It appears that your workstation is not running. If the problem persists, please visit <a href={troubleshootURL} target='_blank'>Troubleshooting Connection Issues</a>.
          </Alert>
        ) : ''}
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
