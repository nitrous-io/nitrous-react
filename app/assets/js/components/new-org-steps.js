import React, { PropTypes } from 'react';
import { Grid, Row, Col, Panel } from 'react-bootstrap';
import Fa from 'components/fa';

export default class NewOrgSteps extends React.Component {
  displayName = 'NewOrgSteps';

  static propTypes = {
    step: PropTypes.number.isRequired
  };

  static defaultProps = {
    step: 2
  };

  render() {
    const { step } = this.props;

    return (
      <Grid className='new-org-steps-component ui-card-grid'>
        <Row>
          <Col lg={4} md={4} sm={4} xs={12}>
            <Panel bsStyle='success'>
              <Fa icon='check' />
              <em>Completed</em>
              Create a personal account
            </Panel>
          </Col>
          <Col lg={4} md={4} sm={4} xs={12}>
            <Panel bsStyle={step === 3 ? 'success' : 'primary'}>
              <Fa icon={step === 3 ? 'check' : 'building'} />
              <em>{step === 3 ? 'Completed' : 'Step 2:'}</em>
              Add organization info
            </Panel>
          </Col>
          <Col lg={4} md={4} sm={4} xs={12}>
            <Panel bsStyle={step === 3 ? 'primary' : 'default'}>
              <Fa icon='users' />
              <em>Step 3:</em>
              Invite members
            </Panel>
          </Col>
        </Row>
      </Grid>
    );
  }
}
