import React, { PropTypes } from 'react';

export default class Currency extends React.Component {
  displayName = 'Currency';

  static propTypes = {
    value: PropTypes.number.isRequired
  };

  render() {
    // Converts eg. { 100, 100.0, 100.00, 100.000 } to 100.00
    const decimaledValue = this.props.value.toFixed(2);

    return (
      <span>${decimaledValue}</span>
    );
  }
}
