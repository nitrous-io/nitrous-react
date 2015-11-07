import React from 'react';
import { Link } from 'react-router';
import { Input, ButtonInput, ButtonToolbar, Panel } from 'react-bootstrap';

import passwordStore from 'stores/password-store';
import passwordActions from 'actions/password-actions';
import snackbarActions from 'actions/snackbar-actions';

export default class ForgotPassword extends React.Component {
  displayName = 'ForgotPassword';

  static contextTypes = {
    router: React.PropTypes.func.isRequired
  };

  state = {
    identifier: null,
    processing: false,
    errorMessage: null
  }

  componentDidMount() {
    passwordStore.onChange(this.passwordStoreDidChange);
    this.refs.identifier.getInputDOMNode().focus();
  }

  componentWillUnmount() {
    passwordStore.offChange(this.passwordStoreDidChange);
  }

  passwordStoreDidChange = () => {
    if (!this.state.processing) {
      return;
    }

    if (passwordStore.sendResetSucceeded) {
      const { identifier } = this.state,
            msg = identifier.includes('@') ?
              `An email with password reset instructions has been sent to ${identifier}.` :
              `An email with password reset instructions has been sent to the email address
                associated with the account "${identifier}".`;
      snackbarActions.post(msg);
      this.setState({ processing: false });
      this.context.router.transitionTo('login');
    } else if (passwordStore.lastError) {
      this.setState({ processing: false, errorMessage: passwordStore.lastError });
    }
  }

  handleIdentifierChanged = (event) => {
    this.setState({ identifier: event.target.value });
  }

  handleSubmit = (event) => {
    event.preventDefault();
    this.setState({ processing: true });
    passwordActions.sendResetPassword(this.state.identifier);
  }

  render() {
    const { identifier, processing } = this.state;

    return (
      <div className='forgot-password-component login-screen'>
        <Panel>
          <h2 className='nitrous-logo'></h2>
          <form onSubmit={this.handleSubmit}>
            <Input ref='identifier' type='text' placeholder='Email Address or Username' required
              disabled={processing}
              value={identifier}
              onChange={this.handleIdentifierChanged} />
            <ButtonToolbar>
              <ButtonInput type='submit' bsStyle='primary' disabled={processing}>
                {processing ? 'Processing...' : 'Send Reset Instructions'}
              </ButtonInput>
            </ButtonToolbar>
          </form>
        </Panel>
        <div className='misc-links'>
          <p>Already have an account? <Link to='login'>Log in</Link></p>
        </div>
      </div>
    );
  }
}
