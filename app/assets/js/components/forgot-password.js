import React from 'react';
import { Link } from 'react-router';
import { Input, ButtonInput } from 'react-bootstrap';
import classNames from 'classnames';

import LeftBar from 'components/left-bar';
import passwordStore from 'stores/password-store';
import passwordActions from 'actions/password-actions';
import snackbarActions from 'actions/snackbar-actions';

export default class ForgotPassword extends React.Component {
  displayName = 'ForgotPassword';

  static contextTypes = {
    router: React.PropTypes.func.isRequired
  };

  state = {
    email: null,
    processing: false,
    errorMessage: null
  }

  componentDidMount() {
    passwordStore.onChange(this.passwordStoreDidChange);
    this.refs.email.getInputDOMNode().focus();
  }

  componentWillUnmount() {
    passwordStore.offChange(this.passwordStoreDidChange);
  }

  passwordStoreDidChange = () => {
    if (!this.state.processing) {
      return;
    }

    if (passwordStore.sendResetSucceeded) {
      snackbarActions.post(`An email with password reset instructions has been sent to ${this.state.email}.`);
      this.setState({ processing: false });
      this.context.router.transitionTo('login');
    } else if (passwordStore.lastError) {
      this.setState({ processing: false, errorMessage: passwordStore.lastError });
    }
  }

  handleEmailChanged = (event) => {
    this.setState({ email: event.target.value });
  }

  handleSubmit = (event) => {
    event.preventDefault();
    this.setState({ processing: true });
    passwordActions.sendResetPassword(this.state.email);
  }

  render() {
    const { email, processing, errorMessage } = this.state,
          formPanelClasses = classNames('form-panel', { shake: errorMessage });

    return (
      <div className='forgot-password-component login-screen dark'>
        <LeftBar />
        <div className={formPanelClasses}>
          <h2 className='nitrous-logo'></h2>
          <form onSubmit={this.handleSubmit}>
            <Input ref='email' type='email' placeholder='Email Address' required
              disabled={processing}
              value={email}
              onChange={this.handleEmailChanged} />
            <div className='actions'>
              <ButtonInput type='submit' bsStyle='primary' disabled={processing}>
                {processing ? 'Processing...' : 'Send Reset Instructions'}
              </ButtonInput>
            </div>
          </form>
          <p>Already have an account? <Link to='login'>Log in</Link></p>
        </div>
      </div>
    );
  }
}
