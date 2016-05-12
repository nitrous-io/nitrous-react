import React, { PropTypes } from 'react';

export default class HostImages extends React.Component {
  displayName = 'BankCard';

  static propTypes = {
    cardType: PropTypes.string.isRequired,
    lastFour: PropTypes.number.isRequired,
    expMonth: PropTypes.number.isRequired,
    expYear: PropTypes.number.isRequired
  };

  render() {
    const { lastFour, cardType, expMonth, expYear } = this.props;
    let cardTypeCssClass = cardType ? cardType.replace(/[_-\s]/g, '').toLowerCase() : '';
    if (cardType === 'americanexpress') {
      cardTypeCssClass = 'amex';
    }

    return (
      <div className='bank-card-component'>
        <div className='card-number'>
          <span className='card-number-hidden'>••••</span>
          <span className='card-number-hidden'>••••</span>
          <span className='card-number-hidden'>••••</span>
          <span>{lastFour}</span>
        </div>
        <div className={`card-type ${cardTypeCssClass}`}>
          {cardType}
        </div>
        <div className='card-expiry'>
          <span className='card-expiry-label'>Valid until</span>
          <div className='card-expiry-date'>{expMonth}/{expYear}</div>
        </div>
      </div>
    );
  }
}
