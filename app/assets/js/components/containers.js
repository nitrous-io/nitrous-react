import React, { PropTypes } from 'react';
import { Carousel, CarouselItem, Modal } from 'react-bootstrap';
import $ from 'jquery';

import Host from 'records/host';
import announcementStore from 'stores/announcement-store';
import containerStore from 'stores/container-store';
import userStore from 'stores/user-store';
import userActions from 'actions/user-actions';
import announcementActions from 'actions/announcement-actions';
import hostStore from 'stores/host-store';
import containerActions from 'actions/container-actions';
import AnnouncementAlert from 'components/announcement-alert';
import ContainerList from 'components/container-list';
import ContextSwitcher from 'components/context-switcher';
import HostNav from 'components/host-nav';
import LoadingIndicator from 'components/loading-indicator';
import Mp from 'lib/mp';
import MpEvents from 'lib/mp-events';

export default class Containers extends React.Component {
  displayName = 'Containers';

  static contextTypes = {
    host: PropTypes.instanceOf(Host).isRequired
  };

  constructor(props, context) {
    super(props, context);

    const user = userStore.user,
          showOnboardingModal = user && user.firstTime;

    this.state = {
      containers: containerStore.liveContainersByHostSlug(this.context.host.slug),
      announcements: announcementStore.announcementsByHostSlug(this.context.host.slug),
      user,
      showDashboardTooltip: false,
      showContextTooltip: false,
      showSettingsTooltip: false,
      showOnboardingModal
    };
  }

  static willTransitionTo() {
    Mp.track(MpEvents.EventDashboardViewedProjects);
  }

  componentDidMount() {
    userStore.onChange(this.userStoreDidChange);
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
    userStore.offChange(this.userStoreDidChange);
    containerStore.offChange(this.containerStoreDidChange);
    announcementStore.offChange(this.announcementStoreDidChange);
    hostStore.off('started', this.onHostStarted);
  }

  userStoreDidChange = () => {
    const user = userStore.user;
    this.setState({ user });
    if (user && user.firstTime) {
      this.setState({ showOnboardingModal: true });
    }
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

  hideOnboardingModal = () => {
    this.setState({ showOnboardingModal: false });
    this.showRelevantTooltip('');
    userActions.dismissFirstTime();
  };

  handleSlideTransition = () => {
    const slides = {
      dashboard: 1,
      context: 2,
      settings: 3
    };

    var activeIndex = $('.carousel-inner .active').index('.carousel-inner .item');
    switch (activeIndex) {
      case slides.dashboard: {
        this.showRelevantTooltip('dashboard');
        return;
      }
      case slides.context: {
        this.showRelevantTooltip('context');
        return;
      }
      case slides.settings: {
        this.showRelevantTooltip('settings');
        return;
      }
      default: {
        this.showRelevantTooltip('');
      }
    }
  };

  showRelevantTooltip(slide) {
    let dashboardTooltip = false,
        contextTooltip = false,
        settingsTooltip = false;

    switch (slide) {
      case 'dashboard': { dashboardTooltip = true; break; }
      case 'context': { contextTooltip = true; break; }
      case 'settings': { settingsTooltip = true; break; }
      default: { break; }
    }

    this.setState({
      showDashboardTooltip: dashboardTooltip,
      showContextTooltip: contextTooltip,
      showSettingsTooltip: settingsTooltip
    });
  }

  render() {
    const { host } = this.context,
          { announcements, showDashboardTooltip, showContextTooltip, showSettingsTooltip } = this.state,
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
        <HostNav host={host} activeTab='containers' />
        {firstAnnouncement ? (
          <AnnouncementAlert announcement={firstAnnouncement} />
        ) : ''}

        {showSettingsTooltip ? (
          <div className='pin settings'></div>
        ) : ''}

        <ContainerList containers={containers} host={host} showTooltip={showDashboardTooltip} />

        <Modal show={this.state.showOnboardingModal} onHide={this.hideOnboardingModal} dialogClassName='onboarding-modal'>
          <Modal.Header closeButton backdrop='false'>
            <Modal.Title>Quick Tour</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Carousel prevIcon ='< Back' nextIcon='Next >' interval={0} onSlideEnd={this.handleSlideTransition}>
              <CarouselItem>
                <h2>Welcome to the new Nitrous</h2>
                <p className='hint'>We&#39;ve made Nitrous even better and simpler</p>
                <div className='logo-image'></div>
              </CarouselItem>
              <CarouselItem>
                <h2>A whole new Dashboard</h2>
                <p className='hint'>Simpler, faster, with access to your projects in one click</p>
                <div className='dashboard-image'></div>
              </CarouselItem>
              <CarouselItem>
                <h2>Quick access to Shared Projects</h2>
                <p className='hint'>Switch between your projects, your team&#39;s, and the ones shared with you</p>
                <div className='context-image'></div>
              </CarouselItem>
              <CarouselItem>
                <h2>All your settings in one place</h2>
                <p className='hint'>No more hunting around&mdash; everything is where it should be</p>
                <div className='settings-image'></div>
              </CarouselItem>
            </Carousel>
          </Modal.Body>
        </Modal>
      </div>
    );
  }
}
