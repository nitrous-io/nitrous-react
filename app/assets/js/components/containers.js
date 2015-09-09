import React, { PropTypes } from 'react';
import { Grid, Row, Col, Button } from 'react-bootstrap';
import Host from 'records/host';
import containerStore from 'stores/container-store';
import containerActions from 'actions/container-actions';
import ContainerListItem from 'components/container-list-item';
import LoadingIndicator from 'components/loading-indicator';
import Fa from 'components/fa';

export default class Containers extends React.Component {
  displayName = 'Containers';

  static contextTypes = {
    host: PropTypes.instanceOf(Host).isRequired,
    router: PropTypes.func.isRequired // Router.PropTypes.router.isRequired
  };

  state = {
    containers: containerStore.containersByHostSlug(this.context.host.slug)
  };

  componentDidMount() {
    containerStore.onChange(this.containerStoreDidChange);
    containerActions.fetchAllByHostSlug(this.context.host.slug);
  }

  componentWillReceiveProps(nextProps, nextContext) {
    const hostSlug = nextContext.host.slug;
    if (this.context.host.slug !== hostSlug) {
      this.setState({ containers: containerStore.containersByHostSlug(hostSlug) });
      containerActions.fetchAllByHostSlug(hostSlug);
    }
  }

  componentWillUnmount() {
    containerStore.offChange(this.containerStoreDidChange);
  }

  containerStoreDidChange = () => {
    this.setState({ containers: containerStore.containersByHostSlug(this.context.host.slug) });
  };

  handleClickNewContainer = () => {
    this.context.router.transitionTo('new-container', { hostSlug: this.context.host.slug });
  };

  render() {
    const containers = this.state.containers ? this.state.containers.toList() : null;

    return (
      <div className='containers-component container'>
        {containers == null ? (
          <LoadingIndicator />
        ) : (
          <Grid className='ui-card-grid'>
            <Row>
              {containers.map((container) => {
                return <ContainerListItem key={`container-${container.slug}`} container={container} />;
              })}
              <Col lg={3} md={4} sm={6} xs={12} className='new-container-btn container-list-item'>
                <Button className='ui-card' onClick={this.handleClickNewContainer}>
                  <Fa icon='plus' />
                </Button>
              </Col>
            </Row>
          </Grid>
        )}
      </div>
    );
  }
}
