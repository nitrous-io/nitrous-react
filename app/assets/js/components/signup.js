import React from 'react';
import { Link } from 'react-router';
import { ButtonInput, Input } from 'react-bootstrap';
import classNames from 'classnames';

import LeftBar from 'components/left-bar';
import tokenActions from 'actions/token-actions';
import userActions from 'actions/user-actions';
import tokenStore from 'stores/token-store';
import userStore from 'stores/user-store';

export default class Signup extends React.Component {
  displayName = 'Signup';

  static contextTypes = {
    router: React.PropTypes.func.isRequired
  };

  state = {
    username: null,
    email: null,
    password: null,
    passwordConfirmation: null,
    processing: false,
    errorMessage: null
  };

  componentDidMount() {
    userStore.on('created', this.onUserCreated);
    userStore.on('create-failed', this.onUserCreateFailed);
    tokenStore.onChange(this.tokenStoreDidChange);
  }

  componentWillUnmount() {
    userStore.off('created', this.onUserCreated);
    userStore.off('create-failed', this.onUserCreateFailed);
    tokenStore.offChange(this.tokenStoreDidChange);
  }

  onUserCreated = (data) => {
    const { username } = data;
    tokenActions.fetch(username, this.state.password);
  }

  onUserCreateFailed = () => {
    this.setState({ processing: false, errorMessage: userStore.lastError });
  }

  tokenStoreDidChange = () => {
    if (tokenStore.token) {
      this.context.router.transitionTo('dashboard');
    }
    // Ignore failure to get token because we assume that we are able to login
    // with the newly created account.
  }

  handleUsernameChanged = (event) => {
    this.setState({ username: event.target.value });
  }

  handleEmailChanged = (event) => {
    this.setState({ email: event.target.value });
  }

  handlePasswordChanged = (event) => {
    this.setState({ password: event.target.value });
  }

  handlePasswordConfirmationChanged = (event) => {
    this.setState({ passwordConfirmation: event.target.value });
  }

  handleSubmit = (event) => {
    event.preventDefault();
    if (this.submitDisabled()) {
      return;
    }

    this.setState({ processing: true });

    const { username, email, password } = this.state;
    userActions.create({ username, email, password });
  }

  submitDisabled = () => {
    const { processing, username, email, password, passwordConfirmation } = this.state;
    const missing = ![username, email, password, passwordConfirmation].every((elem) => {
      return elem;
    });
    return missing || processing || (password !== passwordConfirmation);
  }

  render() {
    const { username, email, password, passwordConfirmation, processing, errorMessage } = this.state,
          showPasswordConfirmError = passwordConfirmation && (password !== passwordConfirmation),
          formPanelClasses = classNames('form-panel', { shake: errorMessage });

    return (
      <div className='signup-component login-screen dark'>
        <LeftBar />
        <div className={formPanelClasses}>
          <h2 className='nitrous-logo'></h2>
          <form onSubmit={this.handleSubmit}>
            <Input type='text' placeholder='Username' required
              value={username}
              onChange={this.handleUsernameChanged} />
            <Input type='email' placeholder='Email' required
              value={email}
              onChange={this.handleEmailChanged} />
            <Input type='password' placeholder='Password' required
              value={password}
              onChange={this.handlePasswordChanged} />
            <Input type='password' placeholder='Password, again' required
              value={passwordConfirmation}
              help={showPasswordConfirmError ? 'Passwords do not match' : null}
              onChange={this.handlePasswordConfirmationChanged} />

            <div className='actions'>
              <ButtonInput type='submit' bsStyle='primary'
                disabled={this.submitDisabled()}>
                {processing ? 'Creating...' : 'Create Account'}
              </ButtonInput>
            </div>
          </form>

          <p>By creating an account, you agree to the Nitrous <a href='https://community.nitrous.io/docs/terms-of-use'>Terms of Service</a> and <a href='https://community.nitrous.io/docs/privacy-policy'>Privacy Policy</a>.</p>
          <p>Already have an account? <Link to='login'>Log in</Link></p>
        </div>
      </div>
    );
  }

}
