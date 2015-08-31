import React, { PropTypes } from 'react';
import { Grid, Row, Col, Button } from 'react-bootstrap';
import Host from 'records/host';
import containerStore from 'stores/container-store';
import containerActions from 'actions/container-actions';
import ContainerListItem from 'components/container-list-item';

export default class Containers extends React.Component {
  displayName: 'Containers'

  static contextTypes = {
    host: PropTypes.instanceOf(Host).isRequired
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

  render() {
    const containers = this.state.containers;

    return (
      <div className='containers-component container'>
        {containers == null ? (
          <p>Loading...</p>
        ) : (
          <Grid className='ui-card-grid'>
            <Row>
              {containers.map((container) => {
                return <ContainerListItem key={`container-${container.slug}`} container={container} />;
              })}
              <Col lg={3} md={4} sm={6} xs={12} className='new-container-btn container-list-item'>
                <Button className='ui-card'>
                  <span>New</span>
                </Button>
              </Col>
            </Row>
          </Grid>
        )}
      </div>
    );
  }
}
