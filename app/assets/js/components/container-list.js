import React, { PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { Grid, Row, Col, Button } from 'react-bootstrap';
import LoadingIndicator from 'components/loading-indicator';
import Fa from 'components/fa';
import Container from 'records/container';
import ContainerListItem from 'components/container-list-item';

export default class ContainerList extends React.Component {
  displayName = 'ContainerList';

  static propTypes = {
    containers: ImmutablePropTypes.listOf(PropTypes.instanceOf(Container))
  };

  render() {
    const containers = this.props.containers;

    return (
      <div className='container-list-component'>
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
