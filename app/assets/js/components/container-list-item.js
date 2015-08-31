import React, { PropTypes } from 'react';
import { Col, ButtonToolbar, Button } from 'react-bootstrap';
import Container from 'records/container';
import ContainerState from 'components/container-state';

export default class ContainerListItem extends React.Component {
  displayName: 'ContainerListItem'

  static propTypes = {
    container: PropTypes.instanceOf(Container).isRequired
  };

  render() {
    const container = this.props.container;

    return (
      <Col lg={3} md={4} sm={6} xs={12} className='container-list-item-component container-list-item'>
        <div className='ui-card'>
          <div className='ui-card-body'>
            <h4>{container.displayName}</h4>
            <div className='info'>
              <ContainerState state={container.state} />
              <span className='slug'>{container.slug}</span>
            </div>
            <ButtonToolbar className='buttons'>
              <Button>Settings</Button>
              <Button>Open IDE</Button>
            </ButtonToolbar>
          </div>
        </div>
      </Col>
    );
  }
}
