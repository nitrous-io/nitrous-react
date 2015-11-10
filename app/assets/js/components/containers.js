import React, { PropTypes } from 'react';

import Host from 'records/host';
import announcementStore from 'stores/announcement-store';
import containerStore from 'stores/container-store';
import announcementActions from 'actions/announcement-actions';
import hostStore from 'stores/host-store';
import containerActions from 'actions/container-actions';
import AnnouncementAlert from 'components/announcement-alert';
import ContainerList from 'components/container-list';
import HostNav from 'components/host-nav';
import Mp from 'lib/mp';
import MpEvents from 'lib/mp-events';

export default class Containers extends React.Component {
  displayName = 'Containers';

  static contextTypes = {
    host: PropTypes.instanceOf(Host).isRequired
  };

  state = {
    containers: containerStore.liveContainersByHostSlug(this.context.host.slug),
    announcements: announcementStore.announcementsByHostSlug(this.context.host.slug)
  };

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

  render() {
    const { host } = this.context,
          { announcements } = this.state,
          firstAnnouncement = announcements && announcements.size > 0 ? announcements.first() : null,
          containers = this.state.containers ? this.state.containers.toList() : null;

    return (
      <div className='containers-component container'>
        <HostNav host={host} activeTab='containers' />
        {firstAnnouncement ? (
          <AnnouncementAlert announcement={firstAnnouncement} />
        ) : ''}
        <ContainerList containers={containers} host={host} />
      </div>
    );
  }
}
