import React, { PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { Grid, Row, Col, Button } from 'react-bootstrap';
import Host from 'records/host';
import userStore from 'stores/user-store';
import orgStore from 'stores/org-store';
import freeUsageStore from 'stores/free-usage-store';
import templateStore from 'stores/template-store';
import snapshotStore from 'stores/snapshot-store';
import templateActions from 'actions/template-actions';
import snapshotActions from 'actions/snapshot-actions';
import Container from 'records/container';
import LoadingIndicator from 'components/loading-indicator';
import Fa from 'components/fa';
import ContainerListItem from 'components/container-list-item';

export default class ContainerList extends React.Component {
  displayName = 'ContainerList';

  static contextTypes = {
    router: PropTypes.func.isRequired // Router.PropTypes.router.isRequired
  };

  static propTypes = {
    containers: ImmutablePropTypes.listOf(PropTypes.instanceOf(Container)),
    host: PropTypes.instanceOf(Host),
    shared: PropTypes.bool,
    showTooltip: PropTypes.bool
  };

  constructor(props, context) {
    super(props, context);

    const org = (props.host && props.host.orgId) ? orgStore.orgByOrgId(props.host.orgId) : null,
          orgSlug = org ? org.slug : null;

    this.state = {
      user: userStore.user,
      quotaReached: freeUsageStore.quotaReached,
      templates: templateStore.templates,
      snapshots: snapshotStore.snapshotsByOrgSlug(orgSlug)
    };
  }

  componentDidMount() {
    userStore.onChange(this.userStoreDidChange);
    freeUsageStore.on('usage-remaining-tick', this.onUsageRemainingTick);

    templateActions.fetchAll();
    templateStore.onChange(this.templateStoreDidChange);

    if (this.getOrgId()) {
      const org = orgStore.orgByOrgId(this.getOrgId());
      snapshotActions.fetchAllByOrgSlug(org.slug);
    }
    snapshotStore.onChange(this.snapshotStoreDidChange);
  }

  componentWillUnmount() {
    userStore.offChange(this.userStoreDidChange);
    freeUsageStore.off('usage-remaining-tick', this.onUsageRemainingTick);
    templateStore.offChange(this.templateStoreDidChange);
    snapshotStore.offChange(this.snapshotStoreDidChange);
  }

  userStoreDidChange = () => {
    this.setState({ user: userStore.user });
  };

  onUsageRemainingTick = () => {
    this.setState({ quotaReached: freeUsageStore.quotaReached });
  };

  templateStoreDidChange = () => {
    this.setState({ templates: templateStore.templates });
  };

  snapshotStoreDidChange = () => {
    if (this.getOrgId()) {
      const org = orgStore.orgByOrgId(this.getOrgId());
      this.setState({ snapshots: snapshotStore.snapshotsByOrgSlug(org.slug) });
    }
  };

  getTemplate(container) {
    const { templates } = this.state;
    if (container && container.image && templates) {
      return templates.find((t) => {
        return t.image === container.image;
      });
    }
    return null;
  }

  getSnapshot(container) {
    const { snapshots } = this.state;
    if (snapshots) {
      return snapshots.find((snapshot) => {
        return snapshot.id === container.snapshotId;
      });
    }
    return null;
  }

  getOrgId() {
    if (this.props.host) {
      return this.props.host.orgId;
    }
    return null;
  }

  canCreateContainer = () => {
    const { containers, host } = this.props;

    if (!host || !containers) {
      return false;
    }

    // no limits exist
    if (host.maxContainers === null) {
      return true;
    }

    return containers.size < host.maxContainers;
  }

  handleClickNewContainer = () => {
    const host = this.props.host;
    if (!host) {
      return;
    }
    if (!this.canCreateContainer() && !host.orgId) {
      this.context.router.transitionTo('subscriptions-upgrade', { subscriptionSlug: host.subscriptionSlug }, { prev: 'container-list'});
      return;
    }
    this.context.router.transitionTo('new-container', { hostSlug: host.slug });
  };

  render() {
    const { containers, host, shared, showTooltip } = this.props,
          isOrg = host && host.orgId,
          { quotaReached } = this.state,
          // If cannot create container, hide plus sign if under org, but
          // show plus sign if individual sub to prompt upgrade.
          showAddContainer = !(!this.canCreateContainer() && isOrg) && !shared,
          isDisabled = (host && !host.isRunning) || quotaReached;

    return (
      <div className='container-list-component'>
        {containers == null ? (
          <LoadingIndicator large />
        ) : (
          <Grid className='ui-card-grid'>
            <Row>
              {containers.map((container) => {
                return (<ContainerListItem
                  key={`container-${container.slug}`}
                  container={container}
                  host={host}
                  template = {this.getTemplate(container)}
                  snapshot={this.getSnapshot(container)}
                  isDisabled={isDisabled} />);
              })}
              {showAddContainer ? (
                <Col lg={3} md={4} sm={6} xs={12} className='new-container-btn container-list-item'>
                  <Button className='ui-card' disabled={isDisabled} onClick={this.handleClickNewContainer}>
                    <Fa icon='plus' />
                    {showTooltip ? (
                      <div className='pin dashboard'></div>
                    ) : ''}
                  </Button>
                </Col>
              ) : ''}
            </Row>
          </Grid>
        )}
      </div>
    );
  }
}
