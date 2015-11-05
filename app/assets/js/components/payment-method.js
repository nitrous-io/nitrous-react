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
    standalone: PropTypes.bool,
    onSuccess: PropTypes.func,
    onFailure: PropTypes.func,
    org: PropTypes.instanceOf(Org) // Takes precedence over this.context.org.
  };

  findBillingProfile = () => {
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
  }

  componentDidMount() {
    billingStore.onChange(this.billingStoreDidChange);
    billingStore.on('update-failed', this.onBillingUpdateFailed);

    paymentStore.on('submit-requested', this.paymentSubmitRequested);
  }

  componentWillUnmount() {
    billingStore.offChange(this.billingStoreDidChange);
    billingStore.off('update-failed', this.onBillingUpdateFailed);

    paymentStore.off('submit-requested', this.paymentSubmitRequested);
  }

  billingStoreDidChange = () => {
    this.setState({ saving: false });

    if (this.props.standalone) {
      snackbarActions.post('Payment updated successfully');
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
  }

  onBillingUpdateFailed = () => {
    this.setState({ saving: false });

    if (this.props.standalone) {
      snackbarActions.post('Payment update failed');
      return;
    }

    if (this.props.onFailure) {
      this.props.onFailure();
    }
  }

  paymentSubmitRequested = () => {
    this.updateCard();
  }

  handleChangecardholderNameField = (event) => {
    this.setState({ cardholderName: event.target.value });
  }

  handleChangeCcNumberField = (event) => {
    const num = event.target.value;
    if (num) {
      const parsed = card.parse(num);
      const cardType = card.type(parsed, true);
      this.setState({ ccNumber: parsed, cardType });
    } else {
      this.setState({ ccNumber: num, cardType: null });
    }
  }

  handleChangeCvcField = (event) => {
    this.setState({ cvc: event.target.value });
  }

  handleChangeExpirationMonthField = (event) => {
    const { value } = event.target;
    this.setState({ expirationMonth: value });

    const parsed = expiration.month.parse(value);
    if (expiration.month.isValid(parsed) && value.toString().length === 2) {
      this.refs.expirationYear.getInputDOMNode().focus();
    }
  }

  handleChangeExpirationYearField = (event) => {
    this.setState({ expirationYear: event.target.value });
  }

  handleChangeZipCodeField = (event) => {
    this.setState({ zipCode: event.target.value });
  }

  handleSubmit = (event) => {
    event.preventDefault();

    this.updateCard();
  }

  submitDisabled = () => {
    return (this.state.saving
      || !this.cardholderNameValid()
      || !this.ccNumberValid()
      || !this.cvcValid()
      || !this.expirationMonthValid()
      || !this.expirationYearValid()
      || !this.zipCodeValid());
  }

  updateCard = () => {
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

  cardholderNameValid = () => {
    return this.state.cardholderName && this.state.cardholderName.trim().length > 0;
  }

  ccNumberValid = () => {
    return card.isValid(this.state.ccNumber);
  }

  cvcValid = () => {
    return this.state.cvc && this.state.cvc.match(/\d+/);
  }

  expirationMonthValid = () => {
    const { expirationMonth } = this.state,
          parsed = expiration.month.parse(expirationMonth);

    return expiration.month.isValid(parsed) && expirationMonth.toString().length === 2;
  }

  expirationYearValid = () => {
    const { expirationYear } = this.state,
          parsed = expiration.year.parse(expirationYear);

    return expiration.year.isValid(parsed) && expirationYear.toString().length === 4;
  }

  expirationValidationMessage = () => {
    const { expirationMonth, expirationYear } = this.state;
    if ((expirationMonth || expirationYear) && !this.expirationMonthValid()) {
      return 'Please enter a valid month';
    }

    if ((expirationMonth || expirationYear) && !this.expirationYearValid()) {
      return 'Please enter a valid year';
    }

    if (expirationMonth && expirationYear
      && expiration.isPast(expirationMonth, expirationYear)) {
      return 'Please use a card that has not expired';
    }
  }

  zipCodeValid = () => {
    return this.state.zipCode && this.state.zipCode.length > 0;
  }

  validationStyle = (value, valid) => {
    if (value === null) {
      return null;
    }
    return valid ? 'success' : 'error';
  }

  validationMessage = (value, valid, failureMessage) => {
    if (value === null || valid) {
      return null;
    }
    return failureMessage;
  }

  formatCardNumber = () => {
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

    const cardholderNameValid = this.cardholderNameValid();
    const ccNumberValid = this.ccNumberValid();
    const cvcValid = this.cvcValid();
    const expirationMonthValid = this.expirationMonthValid();
    const expirationYearValid = this.expirationYearValid();
    const zipCodeValid = this.zipCodeValid();

    const expirationValidationMessage = this.expirationValidationMessage();

    const expirationClasses = classNames({
      'form-group': true,
      'has-success': expirationMonthValid && expirationYearValid,
      'has-error': !!expirationValidationMessage
    });

    return (
      <div className='payment-method-component'>
        <form onSubmit={this.handleSubmit}>
          <div className='cardholderName'>
            <Input label="Cardholder's Name"
              id='cardholder-name'
              type='text'
              placeholder='Name'
              bsStyle={this.validationStyle(cardholderName, cardholderNameValid)}
              help={this.validationMessage(cardholderName, cardholderNameValid, 'Please enter a name')}
              required
              disabled={saving}
              value={cardholderName}
              onChange={this.handleChangecardholderNameField} />
          </div>
          <div className='ccNumber'>
            <Input label='Card Number'
              id='cc-number'
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
                <Input type='text'
                  id='expiration-month'
                  placeholder='MM'
                  pattern='[0-9]{2}'
                  bsStyle={this.validationStyle(expirationMonth, expirationMonthValid)}
                  required
                  disabled={saving}
                  value={expirationMonth}
                  onChange={this.handleChangeExpirationMonthField} />
                /
                <Input type='text'
                  id='expiration-year'
                  ref='expirationYear'
                  placeholder='YYYY'
                  pattern='20[0-9]{2}'
                  bsStyle={this.validationStyle(expirationYear, expirationYearValid)}
                  required
                  disabled={saving}
                  value={expirationYear}
                  onChange={this.handleChangeExpirationYearField} />

                {expirationValidationMessage ? (
                  <span className='help-block'>{expirationValidationMessage}</span>
                 ) : ''}
              </div>
            </div>
          </div>
          <div className='zipcode'>
            <Input label='Zip/Postal Code'
              id='zip-code'
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
