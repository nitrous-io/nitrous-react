import React, { PropTypes } from 'react';

export default class Currency extends React.Component {
  displayName = 'Currency';

  static propTypes = {
    value: PropTypes.number.isRequired,
    wholeNumPreferred: PropTypes.bool
  };

  render() {
    const { value, wholeNumPreferred } = this.props;

    let sanitizedValue = value.toFixed(2);

    if (wholeNumPreferred && (value % 1 === 0)) {
      sanitizedValue = value.toFixed(0);
    }

    return (
      <span>${sanitizedValue}</span>
    );
  }
}
