import React, { PropTypes } from 'react';
import { Col, Button } from 'react-bootstrap';
import Plan from 'records/plan';
import classNames from 'classnames';

export default class PlanListItem extends React.Component {
  displayName = 'PlanListItem';

  static propTypes = {
    plan: PropTypes.instanceOf(Plan).isRequired,
    selected: PropTypes.bool.isRequired,
    onSelect: PropTypes.func.isRequired
  };

  handleClick = () => {
    this.props.onSelect(this.props.plan);
  };

  render() {
    const plan = this.props.plan,
          selected = this.props.selected,
          price = (plan.price / 100).toFixed(2);

    return (
      <Col lg={3} md={4} sm={6} xs={12} className='plan-list-item-component'>
        <div className={classNames('ui-card', { selected })}>
          <div className='ui-card-body'>
            <h4>{plan.name}</h4>
            <div className='description'>{plan.description}</div>
            <ul className='features'>
              <li>
                {plan.maxContainers > 1 ? 'Up to ' : ''}
                <span className='highlight'>{plan.maxContainers}</span>
                {plan.maxContainers === 1 ? ' Project' : ' Projects'}
              </li>
              <li><span className='highlight'>{plan.memory}</span> Memory</li>
              <li><span className='highlight'>{plan.storage}</span> Storage</li>
            </ul>
            <Button onClick={this.handleClick} bsStyle={selected ? 'primary' : 'default'} block>${price}/mo</Button>
          </div>
        </div>
      </Col>
    );
  }
}
