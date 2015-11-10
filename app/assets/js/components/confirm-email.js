import React, { PropTypes } from 'react';
import { Alert, Panel } from 'react-bootstrap';
import { Link } from 'react-router';

import userActions from 'actions/user-actions';
import tokenActions from 'actions/token-actions';
import tokenStore from 'stores/token-store';
import snackbarActions from 'actions/snackbar-actions';

export default class ConfirmEmail extends React.Component {
  displayName = 'ConfirmEmail';

  static propTypes = {
    query: PropTypes.shape({
      token: PropTypes.string
    })
  }

  static contextTypes = {
    router: React.PropTypes.func.isRequired
  };

  state = {
    processing: true,
    processed: false,
    tokenIncorrect: false
  }

  componentWillReceiveProps(nextProps) {
    this.confirmEmail(nextProps.query.token);
  }

  componentWillMount() {
    tokenStore.onChange(this.tokenStoreDidChange);
    this.confirmEmail(this.props.query.token);
  }

  componentWillUnmount() {
    tokenStore.offChange(this.tokenStoreDidChange);
  }

  confirmEmail = (token) => {
    if (!token) {
      this.context.router.transitionTo('dashboard');
      return;
    }

    this.setState({ processed: false, processing: true, tokenIncorrect: false });
    userActions.confirmEmail(token).then((json) => {
      tokenActions.setToken(json.access_token);
    }).catch((jqxhr) => {
      const { responseJSON } = jqxhr;
      this.setState({ processing: false });

      if (responseJSON && responseJSON.error === 'confirmation_expired') {
        this.context.router.transitionTo('resend-confirmation', null, { confirmationToken: this.props.query.token });
        return;
      }
      this.setState({ tokenIncorrect: true });
    });
  }

  tokenStoreDidChange = () => {
    if (tokenStore.token) {
      snackbarActions.clear();
      snackbarActions.post('Your email has been confirmed!');
      this.context.router.transitionTo('dashboard');

      this.setState({ processing: false, processed: true });
    }
  }

  render() {
    const { processing, processed, tokenIncorrect } = this.state;

    return (
      <div className='confirm-email-component login-screen'>
        <Panel>
          <h2 className='nitrous-logo'></h2>
          {processing ? (
            <Alert>Confirming your account...</Alert>
          ) : ''}
          {processed ? (
            <Alert bsStyle='success'>Your account has been confirmed!</Alert>
          ) : ''}
          {tokenIncorrect ? (
            <Alert bsStyle='danger'>Your confirmation token is invalid, please check your email.</Alert>
          ) : ''}
        </Panel>
        <div className='misc-links'>
          <p>Already have an account? <Link to='login'>Log in</Link></p>
        </div>
      </div>
    );
  }
}
