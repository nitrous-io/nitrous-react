import React, { PropTypes } from 'react';
import { Input, Button } from 'react-bootstrap';
import { card, expiration } from 'creditcards';
import classNames from 'classnames';

import Org from 'records/org';
import billingStore from 'stores/billing-store';
import billingActions from 'actions/billing-actions';
import paymentStore from 'stores/payment-store';
import snackbarActions from 'actions/snackbar-actions';

export default class PaymentMethod extends React.Component {
  displayName = 'PaymentMethod';

  static contextTypes = {
    org: PropTypes.instanceOf(Org),
    router: PropTypes.func.isRequired
  }

  static propTypes = {
    nextURLHint: PropTypes.string,
    subscriptionSlug: PropTypes.string,
    standalone: PropTypes.bool,
    onSuccess: PropTypes.func,
    onFailure: PropTypes.func,
    onChange: PropTypes.func,
    org: PropTypes.instanceOf(Org) // Takes precedence over this.context.org.
  };

  findBillingProfile() {
    const org = this.props.org || this.context.org;
    if (org) {
      return billingStore.orgBillingProfiles.get(org.id);
    }
    return billingStore.userBillingProfile;
  }

  state = {
    billingProfile: this.findBillingProfile(),
    saving: false,
    cardholderName: null,
    ccNumber: null,
    cardType: null,
    cvc: null,
    expirationMonth: null,
    expirationYear: null,
    zipCode: null
  };

  componentDidMount() {
    billingStore.onChange(this.billingStoreDidChange);
    billingStore.on('update-failed', this.onBillingUpdateFailed);

    paymentStore.on('submit-requested', this.onPaymentSubmitRequested);
  }

  componentWillUnmount() {
    billingStore.offChange(this.billingStoreDidChange);
    billingStore.off('update-failed', this.onBillingUpdateFailed);

    paymentStore.off('submit-requested', this.onPaymentSubmitRequested);
  }

  billingStoreDidChange = () => {
    this.setState({ saving: false });

    if (this.props.standalone) {
      snackbarActions.post('Payment details updated successfully');

      if (this.props.nextURLHint === 'upgrade' && this.props.subscriptionSlug) {
        this.context.router.transitionTo('subscriptions-upgrade', { subscriptionSlug: this.props.subscriptionSlug }, { prev: 'billing' });
        return;
      }

      const org = this.props.org || this.context.org;
      if (org) {
        this.context.router.transitionTo('org-billing', { orgSlug: org.slug });
      } else {
        this.context.router.transitionTo('billing');
      }
      return;
    }

    if (this.props.onSuccess) {
      this.props.onSuccess();
    }
  };

  onBillingUpdateFailed = () => {
    this.setState({ saving: false });

    if (this.props.standalone) {
      snackbarActions.post('Payment update failed');
      return;
    }

    if (this.props.onFailure) {
      this.props.onFailure();
    }
  };

  onPaymentSubmitRequested = () => {
    this.updateCard();
  };

  bubbleChange = () => {
    if (this.props.onChange) {
      this.props.onChange();
    }
  }

  handleChangeCardholderNameField = () => {
    const value = this.refs.cardholderName.getValue();
    this.setState({ cardholderName: value }, () => {
      this.bubbleChange();
    });
  };

  handleChangeCcNumberField = () => {
    const num = this.refs.ccNumber.getValue();
    if (num) {
      const parsed = card.parse(num);
      const cardType = card.type(parsed, true);
      this.setState({ ccNumber: parsed, cardType }, () => {
        this.bubbleChange();
      });
    } else {
      this.setState({ ccNumber: num, cardType: null }, () => {
        this.bubbleChange();
      });
    }
  };

  handleChangeCvcField = () => {
    const value = this.refs.cvc.getValue();
    this.setState({ cvc: value }, () => {
      this.bubbleChange();
    });
  };

  handleChangeExpirationMonthField = () => {
    const value = this.refs.expirationMonth.getValue();
    this.setState({ expirationMonth: value }, () => {
      this.bubbleChange();
    });
  };

  handleChangeExpirationYearField = () => {
    const value = this.refs.expirationYear.getValue();
    this.setState({ expirationYear: value }, () => {
      this.bubbleChange();
    });
  };

  handleChangeZipCodeField = () => {
    const value = this.refs.zipCode.getValue();
    this.setState({ zipCode: value }, () => {
      this.bubbleChange();
    });
  };

  handleSubmit = (event) => {
    event.preventDefault();

    this.updateCard();
  };

  fieldsInvalid = () => {
    return (!this.cardholderNameValid()
          || !this.ccNumberValid()
          || !this.cvcValid()
          || !this.expirationMonthValid()
          || !this.expirationYearValid()
          || !this.zipCodeValid());
  }

  submitDisabled() {
    return (this.state.saving || this.fieldsInvalid());
  }

  updateCard() {
    if (this.submitDisabled()) {
      if (!this.props.standalone && this.props.onFailure) {
        this.props.onFailure();
      }
      return;
    }

    this.setState({ saving: true });

    const { cardholderName, ccNumber, cvc, expirationMonth, expirationYear, zipCode } = this.state,
          org = this.props.org || this.context.org;

    billingActions.updateCard({
      cardholderName,
      ccNumber,
      cvc,
      expirationMonth,
      expirationYear,
      zipCode,
      orgSlug: org && org.slug
    });
  }

  cardholderNameValid() {
    return this.state.cardholderName && this.state.cardholderName.trim().length > 0;
  }

  ccNumberValid() {
    return card.isValid(this.state.ccNumber);
  }

  cvcValid() {
    return this.state.cvc && this.state.cvc.match(/\d+/);
  }

  expirationMonthValid() {
    const { expirationMonth } = this.state,
          parsed = expiration.month.parse(expirationMonth);

    return expiration.month.isValid(parsed) && expirationMonth.toString().length === 2;
  }

  expirationYearValid() {
    const { expirationYear } = this.state,
          parsed = expiration.year.parse(expirationYear);

    return expiration.year.isValid(parsed) && expirationYear.toString().length === 4;
  }

  expirationValidationMessage() {
    const { expirationMonth, expirationYear } = this.state;
    if ((expirationMonth && expirationYear) && !this.expirationMonthValid()) {
      return 'Please enter a valid month';
    }

    if ((expirationMonth && expirationYear) && !this.expirationYearValid()) {
      return 'Please enter a valid year';
    }

    if (expirationMonth && expirationYear
      && expiration.isPast(expirationMonth, expirationYear)) {
      return 'Please use a card that has not expired';
    }
  }

  zipCodeValid() {
    return this.state.zipCode && this.state.zipCode.length > 0;
  }

  validationStyle(value, valid) {
    if (value === null) {
      return null;
    }
    return valid ? 'success' : 'error';
  }

  validationMessage(value, valid, failureMessage) {
    if (value === null || valid) {
      return null;
    }
    return failureMessage;
  }

  formatCardNumber() {
    const { ccNumber } = this.state;
    let formatted = card.format(ccNumber);
    // if people type longer than format displays, don't try to format
    if (formatted && formatted.replace(/\s+/g, "") !== ccNumber) {
      formatted = ccNumber;
    }
    return formatted;
  }

  render() {
    const { standalone } = this.props,
          { billingProfile, saving, cardholderName, ccNumber, cvc,
          expirationMonth, expirationYear, zipCode } = this.state;

    const cardholderNameValid = this.cardholderNameValid(),
          ccNumberValid = this.ccNumberValid(),
          cvcValid = this.cvcValid(),
          expirationMonthValid = this.expirationMonthValid(),
          expirationYearValid = this.expirationYearValid(),
          zipCodeValid = this.zipCodeValid();

    const expirationValidationMessage = this.expirationValidationMessage();

    const expirationClasses = classNames({
      'form-group': true,
      'has-success': expirationMonthValid && expirationYearValid,
      'has-error': !!expirationValidationMessage
    });

    const mm = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'],
          currentYear = new Date().getFullYear(),
          yyyy = Array.from(new Array(11), (_, i) => (currentYear + i).toString());

    return (
      <div className='payment-method-component'>
        <form onSubmit={this.handleSubmit}>
          <div className='cardholderName'>
            <Input label="Cardholder's Name"
              id='cardholder-name'
              ref='cardholderName'
              type='text'
              placeholder='Name'
              bsStyle={this.validationStyle(cardholderName, cardholderNameValid)}
              help={this.validationMessage(cardholderName, cardholderNameValid, 'Please enter a name')}
              required
              disabled={saving}
              value={cardholderName}
              onChange={this.handleChangeCardholderNameField} />
          </div>
          <div className='ccNumber'>
            <Input label='Card Number'
              id='cc-number'
              ref='ccNumber'
              type='text'
              placeholder='Number'
              bsStyle={this.validationStyle(ccNumber, ccNumberValid)}
              help={this.validationMessage(ccNumber, ccNumberValid, 'Please enter a valid number')}
              required
              disabled={saving}
              value={this.formatCardNumber()}
              onChange={this.handleChangeCcNumberField} />
          </div>
          <div className='cvc'>
            <Input label='CVC'
              id='cvc'
              ref='cvc'
              type='password'
              placeholder='CVC'
              bsStyle={this.validationStyle(cvc, cvcValid)}
              help={this.validationMessage(cvc, cvcValid, 'Please enter your CVC')}
              required
              disabled={saving}
              value={cvc}
              onChange={this.handleChangeCvcField} />
          </div>
          <div className='expiration'>
            <div className={expirationClasses}>
              <label className='control-label' htmlFor='expiration-month'>Expiration (MM/YYYY)</label>
              <div className='form-inline'>
                <Input type='select'
                  id='expiration-month'
                  ref='expirationMonth'
                  bsStyle={this.validationStyle(expirationMonth, expirationMonthValid)}
                  required
                  disabled={saving}
                  value={expirationMonth}
                  onChange={this.handleChangeExpirationMonthField}>
                  <option></option>
                  {mm.map((m) => {
                    return (
                      <option value={m} key={`mm-${m}`}>{m}</option>
                    );
                  })}
                </Input>
                <span className='mm-yy-divider'>/</span>
                <Input type='select'
                  id='expiration-year'
                  ref='expirationYear'
                  bsStyle={this.validationStyle(expirationYear, expirationYearValid)}
                  required
                  disabled={saving}
                  value={expirationYear}
                  onChange={this.handleChangeExpirationYearField}>
                  <option></option>
                  {yyyy.map((y) => {
                    return (
                      <option value={y} key={`yyyy-${y}`}>{y}</option>
                    );
                  })}
                </Input>

                {expirationValidationMessage ? (
                  <span className='help-block'>{expirationValidationMessage}</span>
                 ) : ''}
              </div>
            </div>
          </div>
          <div className='zipcode'>
            <Input label='Zip/Postal Code'
              id='zip-code'
              ref='zipCode'
              type='text'
              placeholder='Code'
              bsStyle={this.validationStyle(zipCode, zipCodeValid)}
              help={this.validationMessage(zipCode, zipCodeValid, 'Please enter a zip/postal code')}
              required
              disabled={saving}
              value={zipCode}
              onChange={this.handleChangeZipCodeField} />
          </div>

          {standalone ? (
            <Button disabled={this.submitDisabled()} type='submit' bsStyle='primary'>
              {billingProfile.hasCard ? (
                saving ? 'Updating...' : 'Update'
              ) : (
                saving ? 'Saving...' : 'Save'
              )}
            </Button>
          ) : ''}
        </form>
       </div>
    );
  }
}
