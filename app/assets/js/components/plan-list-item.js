import React, { PropTypes } from 'react';
import { Col, Button, Label, OverlayTrigger, Tooltip } from 'react-bootstrap';
import TimeAgo from 'react-timeago';
import classNames from 'classnames';

import Fa from 'components/fa';
import Currency from 'components/currency';
import Plan from 'records/plan';

export default class PlanListItem extends React.Component {
  displayName = 'PlanListItem';

  static propTypes = {
    plan: PropTypes.instanceOf(Plan).isRequired,
    selected: PropTypes.bool.isRequired,
    onSelect: PropTypes.func.isRequired,
    trialEligible: PropTypes.bool.isRequired,
    activeTrialEnd: PropTypes.instanceOf(Date),
    currentPlan: PropTypes.bool,
    disabled: PropTypes.bool,
    numberUsedHosts: PropTypes.number
  };

  handleClick = () => {
    this.props.onSelect(this.props.plan);
  };

  renderAction() {
    const { disabled, plan, selected, currentPlan } = this.props,
          price = <Currency value={plan.priceDollars} wholeNumPreferred />;

    if (currentPlan) {
      return (<Button disabled={disabled} onClick={this.handleClick} bsStyle={selected ? 'primary' : 'default'} block>{price}/mo</Button>);
    }

    if (!disabled) {
      return (<Button onClick={this.handleClick} bsStyle={selected ? 'primary' : 'default'} block>{price}/mo</Button>);
    }

    if (plan.org) {
      return (<p>Need more? Contact your Org Owner.</p>);
    }

    return '';
  }

  renderMaxHosts() {
    const { plan, numberUsedHosts } = this.props;

    if (!plan.maxHosts) {
      return '';
    }

    let usedTitle = '';
    if (numberUsedHosts !== null && numberUsedHosts !== undefined) {
      usedTitle = `Using ${numberUsedHosts} of `;
    }

    return (
      <li><span className='highlight'>{usedTitle}{plan.maxHosts}</span> Workstations</li>
    );
  }

  render() {
    const { plan, selected, activeTrialEnd } = this.props,
          isTrialPlan = this.props.trialEligible && plan.trialPeriodDays > 0;

    const timeAgoFormatter = (value, unit) => {
      if (value !== 1) {
        unit += 's';
      }
      return value + ' ' + unit;
    };

    return (
      <Col lg={3} md={4} sm={6} xs={12} className='plan-list-item-component'>
        <div className={classNames('ui-card', { selected })}>
          <div className='ui-card-body'>
            <h4>
              {plan.name}
              {isTrialPlan ? (
                <OverlayTrigger placement='top' overlay={<Tooltip id='free-trial-tooltip'>Try for free for first {plan.trialPeriodDays} days.</Tooltip>}>
                  <Label className='trial-label' bsStyle="success"><Fa icon="info-circle" /> Free Trial</Label>
                </OverlayTrigger>
              ) : ''}
              {activeTrialEnd ? (
                <Label className='trial-label' bsStyle="success">Trial: <TimeAgo date={activeTrialEnd} formatter={timeAgoFormatter} /> Left</Label>
              ) : ''}
            </h4>
            <div className='description'>{plan.description}</div>
            <ul className='features'>
              {this.renderMaxHosts()}
              <li>
                {plan.maxContainers > 1 ? 'Up to ' : ''}
                <span className='highlight'>{plan.maxContainers}</span>
                {plan.maxContainers === 1 ? ' Project' : ' Projects'}
              </li>
              <li><span className='highlight'>{plan.memory}</span> Memory</li>
              <li><span className='highlight'>{plan.storage}</span> Storage</li>
            </ul>
            {this.renderAction()}
          </div>
        </div>
      </Col>
    );
  }
}
