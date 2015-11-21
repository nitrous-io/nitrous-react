import React, { PropTypes } from 'react';
import { Button } from 'react-bootstrap';
import classNames from 'classnames';

import Plan from 'records/plan';

export default class OrgPlanListItem extends React.Component {
  displayName = 'OrgPlanListItem';

  static propTypes = {
    plan: PropTypes.instanceOf(Plan).isRequired,
    selected: PropTypes.bool.isRequired,
    onSelect: PropTypes.func.isRequired
  };

  handleClick = () => {
    this.props.onSelect(this.props.plan);
  };

  render() {
    const { plan, selected } = this.props,
          classes = classNames({active: selected});

    return (
      <tr onClick={this.handleClick} className={classes}>
        <td>{plan.name}</td>
        <td>${plan.priceDollars}/mo</td>
        <td>Up to {plan.maxHosts}</td>
        <td><Button onClick={this.handleClick} bsStyle={selected ? 'default' : 'primary'} disabled={selected} block>{selected ? 'Selected' : 'Select'}</Button></td>
      </tr>
    );
  }
}
