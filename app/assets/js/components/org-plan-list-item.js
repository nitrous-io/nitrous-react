import React, { PropTypes } from 'react';
import { Button, Badge } from 'react-bootstrap';
import classNames from 'classnames';

import Plan from 'records/plan';
import Fa from 'components/fa';
import promocodeStore from 'stores/promocode-store';
import Promocode from 'records/promocode';

export default class OrgPlanListItem extends React.Component {
  displayName = 'OrgPlanListItem';

  static propTypes = {
    plan: PropTypes.instanceOf(Plan).isRequired,
    selected: PropTypes.bool.isRequired,
    onSelect: PropTypes.func.isRequired,
    providedPromocode: PropTypes.instanceOf(Promocode)
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

  workstationsTitle = () => {
    const { plan } = this.props;

    if (plan.maxHosts === 1) {
      return "1 workstation";
    }

    return `Up to ${plan.maxHosts} workstations`;
  }

  renderTrialInfo = () => {
    const { providedPromocode, plan } = this.props;

    let { promocode } = this.state;

    if (!promocode && providedPromocode && providedPromocode.planIDs.has(plan.id)) {
      promocode = providedPromocode;
    }

    if (!promocode) {
      return;
    }

    return (<Badge>{promocode.trialInfo}</Badge>);
  }

  renderActionButton = () => {
    const { selected } = this.props;

    if (selected) {
      return (<div className='vertical-align'><Fa icon='check' /></div>);
    }

    return (<Button onClick={this.handleClick} bsStyle={selected ? 'default' : 'primary'} disabled={selected} block>{selected ? 'Selected' : 'Select'}</Button>);
  }

  render() {
    const { plan, selected } = this.props,
          trClasses = classNames('org-plan-list-item-componnent', {active: selected}),
          actionClasses = classNames('col-md-2', {'text-center': selected});

    return (
      <tr onClick={this.handleClick} className={trClasses}>
        <td><strong>{plan.name}</strong></td>
        <td>${plan.priceDollars}/mo</td>
        <td>{this.renderTrialInfo()}</td>
        <td>{this.workstationsTitle()}</td>
        <td className={actionClasses}>{this.renderActionButton()}</td>
      </tr>
    );
  }
}
