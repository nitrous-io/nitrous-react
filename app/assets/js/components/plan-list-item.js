import React, { PropTypes } from 'react';
import { Col, Badge, Button, Label, OverlayTrigger, Tooltip } from 'react-bootstrap';
import TimeAgo from 'react-timeago';
import classNames from 'classnames';

import Fa from 'components/fa';
import format from 'lib/format';
import Plan from 'records/plan';
import promocodeStore from 'stores/promocode-store';

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
    numberUsedHosts: PropTypes.number,
    showHosts: PropTypes.bool
  };

  state = {
    promocode: null
  };

  componentDidMount() {
    promocodeStore.onChange(this.loadPromoCode);
    this.loadPromoCode();
  }

  componentWillUnmount() {
    promocodeStore.offChange(this.loadPromoCode);
  }

  loadPromoCode = () => {
    const { plan } = this.props,
          promocode = promocodeStore.userPromocodeForPlanId(plan.id);
    this.setState({ promocode });
  }

  handleClick = () => {
    this.props.onSelect(this.props.plan);
  };

  renderTrialInfo = () => {
    const { promocode } = this.state;

    if (!promocode) {
      return;
    }

    return (<li><Badge>{promocode.trialInfo}</Badge></li>);
  }

  renderAction() {
    const { disabled, plan, selected, currentPlan } = this.props,
          price = format.currencyPreferWholeNum(plan.priceDollars);

    if (currentPlan) {
      return (<Button disabled={disabled} onClick={this.handleClick} bsStyle={selected ? 'primary' : 'default'} block>{price}/mo</Button>);
    }

    if (!disabled) {
      return (<Button onClick={this.handleClick} bsStyle={selected ? 'primary' : 'default'} block>{price}/mo</Button>);
    }

    return '';
  }

  renderMaxHosts() {
    const { plan, numberUsedHosts, showHosts } = this.props;

    if (!plan.maxHosts || !showHosts) {
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
            <div className='features-box'>
              <ul className='features'>
                {this.renderMaxHosts()}
                <li>
                  {plan.maxContainers > 1 ? 'Up to ' : ''}
                  <span className='highlight'>{plan.maxContainers}</span>
                  {plan.maxContainers === 1 ? ' Project' : ' Projects'}
                </li>
                <li><span className='highlight'>{plan.storage}</span> Storage</li>
                {plan.price === 0 ? (<li><span className='highlight'>50 hr/mo</span> limit</li>)
                  : (<li><span className='highlight'>Unlimited</span> hours</li>)}
                {plan.memory && plan.memory.length > 0 ? (<li><span className='highlight'>{plan.memory}</span> Memory</li>)
                  : ''}
                {!plan.autoShutdown ? (<li>Always <span className='highlight'>ON</span></li>)
                  : ''}
                {this.renderTrialInfo()}
              </ul>
            </div>
            {this.renderAction()}
          </div>
        </div>
      </Col>
    );
  }
}
